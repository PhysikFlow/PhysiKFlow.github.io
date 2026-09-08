/**
 * FlowFace PWA — IndexedDB Database Layer
 * Armazena embeddings, configurações e logs de acesso offline
 */

const DB_NAME = 'flowface-db';
const DB_VERSION = 1;

const STORES = {
  EMBEDDINGS: 'embeddings',
  ACCESS_LOG: 'access_log',
  CONFIG: 'config',
  MODELS: 'models'
};

class FlowFaceDB {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Embeddings store
        if (!db.objectStoreNames.contains(STORES.EMBEDDINGS)) {
          const embeddingStore = db.createObjectStore(STORES.EMBEDDINGS, { keyPath: 'id' });
          embeddingStore.createIndex('by_user_id', 'userId', { unique: false });
          embeddingStore.createIndex('by_name', 'name', { unique: false });
        }

        // Access log store
        if (!db.objectStoreNames.contains(STORES.ACCESS_LOG)) {
          const logStore = db.createObjectStore(STORES.ACCESS_LOG, { keyPath: 'id', autoIncrement: true });
          logStore.createIndex('by_timestamp', 'timestamp', { unique: false });
          logStore.createIndex('by_user_id', 'userId', { unique: false });
        }

        // Config store
        if (!db.objectStoreNames.contains(STORES.CONFIG)) {
          db.createObjectStore(STORES.CONFIG, { keyPath: 'key' });
        }

        // Models cache store
        if (!db.objectStoreNames.contains(STORES.MODELS)) {
          db.createObjectStore(STORES.MODELS, { keyPath: 'name' });
        }
      };
    });
  }

  // ============================================
  // Embeddings CRUD
  // ============================================

  async addEmbedding(embedding) {
    const data = {
      ...embedding,
      id: embedding.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this._put(STORES.EMBEDDINGS, data);
  }

  async getEmbedding(id) {
    return this._get(STORES.EMBEDDINGS, id);
  }

  async getAllEmbeddings() {
    return this._getAll(STORES.EMBEDDINGS);
  }

  async getEmbeddingsByUserId(userId) {
    return this._getByIndex(STORES.EMBEDDINGS, 'by_user_id', userId);
  }

  async updateEmbedding(id, updates) {
    const existing = await this.getEmbedding(id);
    if (!existing) throw new Error('Embedding not found');

    const data = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };

    return this._put(STORES.EMBEDDINGS, data);
  }

  async deleteEmbedding(id) {
    return this._delete(STORES.EMBEDDINGS, id);
  }

  async clearEmbeddings() {
    return this._clear(STORES.EMBEDDINGS);
  }

  // ============================================
  // Access Log
  // ============================================

  async logAccess(entry) {
    const data = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    return this._add(STORES.ACCESS_LOG, data);
  }

  async getAccessLog(limit = 100) {
    const all = await this._getAll(STORES.ACCESS_LOG);
    return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  }

  async clearAccessLog() {
    return this._clear(STORES.ACCESS_LOG);
  }

  // ============================================
  // Config
  // ============================================

  async getConfig(key, defaultValue = null) {
    const result = await this._get(STORES.CONFIG, key);
    return result ? result.value : defaultValue;
  }

  async setConfig(key, value) {
    return this._put(STORES.CONFIG, { key, value });
  }

  // ============================================
  // Models Cache
  // ============================================

  async cacheModel(name, data) {
    return this._put(STORES.MODELS, {
      name,
      data,
      cachedAt: new Date().toISOString()
    });
  }

  async getCachedModel(name) {
    const result = await this._get(STORES.MODELS, name);
    return result ? result.data : null;
  }

  // ============================================
  // Private Helpers
  // ============================================

  _transaction(storeName, mode = 'readonly') {
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  _put(storeName, data) {
    return new Promise((resolve, reject) => {
      const store = this._transaction(storeName, 'readwrite');
      const request = store.put(data);
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  _add(storeName, data) {
    return new Promise((resolve, reject) => {
      const store = this._transaction(storeName, 'readwrite');
      const request = store.add(data);
      request.onsuccess = () => resolve({ ...data, id: request.result });
      request.onerror = () => reject(request.error);
    });
  }

  _get(storeName, key) {
    return new Promise((resolve, reject) => {
      const store = this._transaction(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _getAll(storeName) {
    return new Promise((resolve, reject) => {
      const store = this._transaction(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const store = this._transaction(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const store = this._transaction(storeName, 'readwrite');
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  _clear(storeName) {
    return new Promise((resolve, reject) => {
      const store = this._transaction(storeName, 'readwrite');
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton export
const db = new FlowFaceDB();
export default db;
