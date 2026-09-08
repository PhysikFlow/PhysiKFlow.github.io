/**
 * FlowFace PWA — Supabase Integration Layer
 * Cadastro de pessoas, sincronização de embeddings e registro de acessos
 */

import db from './db.js';

class SupabaseClient {
  constructor() {
    this.url = null;
    this.key = null;
    this.initialized = false;
  }

  async init(url, key) {
    this.url = url;
    this.key = key;
    
    // Try to load from config if not provided
    if (!url || !key) {
      this.url = await db.getConfig('supabase_url');
      this.key = await db.getConfig('supabase_key');
    }

    if (this.url && this.key) {
      this.initialized = true;
      // Sync in background
      this.syncInBackground();
    }
  }

  isConfigured() {
    return this.initialized;
  }

  // ============================================
  // API Helpers
  // ============================================

  async _fetch(endpoint, options = {}) {
    if (!this.initialized) {
      throw new Error('Supabase not configured');
    }

    const url = `${this.url}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }
  }

  // ============================================
  // Users CRUD
  // ============================================

  async createUser(userData) {
    const result = await this._fetch('users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    // Cache locally
    if (result && result[0]) {
      await db.addEmbedding({
        ...result[0],
        synced: true
      });
    }

    return result[0];
  }

  async getUsers() {
    return this._fetch('users?select=*');
  }

  async getUser(id) {
    const result = await this._fetch(`users?id=eq.${id}&select=*`);
    return result[0];
  }

  // ============================================
  // Embeddings Sync
  // ============================================

  async syncEmbeddings() {
    try {
      // Get remote embeddings
      const remoteEmbeddings = await this._fetch('embeddings?select=*');
      
      // Get local embeddings
      const localEmbeddings = await db.getAllEmbeddings();
      const localMap = new Map(localEmbeddings.map(e => [e.id, e]));

      // Merge: remote takes precedence, add new local ones
      for (const remote of remoteEmbeddings) {
        const local = localMap.get(remote.id);
        if (!local || new Date(remote.updatedAt) > new Date(local.updatedAt)) {
          await db.addEmbedding({ ...remote, synced: true });
        }
        localMap.delete(remote.id);
      }

      // Upload new local embeddings
      for (const [id, local] of localMap) {
        if (!local.synced) {
          try {
            await this._fetch('embeddings', {
              method: 'POST',
              body: JSON.stringify(local)
            });
            await db.updateEmbedding(id, { synced: true });
          } catch (e) {
            console.warn('Failed to sync embedding:', id, e);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }

  // ============================================
  // Access Log Sync
  // ============================================

  async syncAccessLog() {
    try {
      // Get unsynced local logs
      const allLogs = await db.getAccessLog(1000);
      const unsyncedLogs = allLogs.filter(log => !log.synced);

      for (const log of unsyncedLogs) {
        try {
          await this._fetch('access_log', {
            method: 'POST',
            body: JSON.stringify(log)
          });
          await db.logAccess({ ...log, synced: true });
        } catch (e) {
          console.warn('Failed to sync log:', log.id, e);
        }
      }

      return true;
    } catch (error) {
      console.error('Log sync failed:', error);
      return false;
    }
  }

  // ============================================
  // Background Sync
  // ============================================

  async syncInBackground() {
    if (!this.initialized) return;

    // Run sync periodically
    setInterval(async () => {
      try {
        await this.syncEmbeddings();
        await this.syncAccessLog();
        await db.setConfig('last_sync', new Date().toISOString());
      } catch (e) {
        console.warn('Background sync error:', e);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    // Also try to sync on visibility change
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        try {
          await this.syncEmbeddings();
          await this.syncAccessLog();
        } catch (e) {
          console.warn('Sync on visibility change failed:', e);
        }
      }
    });
  }

  // ============================================
  // Configuration
  // ============================================

  async saveConfig(url, key) {
    this.url = url;
    this.key = key;
    this.initialized = true;

    await db.setConfig('supabase_url', url);
    await db.setConfig('supabase_key', key);

    // Initial sync
    await this.syncInBackground();
  }
}

const supabase = new SupabaseClient();
export default supabase;
