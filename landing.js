// PhysikFlow Landing Page JavaScript
// Ready for dynamic content, analytics, and interactions

(function() {
  'use strict';

  const LandingApp = {
    version: '1.0.0',

    init() {
      this.checkMobile();
      this.bindEvents();
      this.initAnimations();
      this.loadDynamicContent();
    },

    bindEvents() {
      // Smooth scroll for nav links
      document.querySelectorAll('[data-nav-link]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.querySelector(link.getAttribute('href'));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      // Download buttons tracking
      document.querySelectorAll('[data-download]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const type = btn.dataset.download;
          console.log(`[Analytics] Download clicked: ${type}`);
          // TODO: Implement actual download or redirect
          // e.preventDefault();
        });
      });
    },

    initAnimations() {
      // Simple intersection observer for fade-in animations
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        }, { threshold: 0.1 });

        document.querySelectorAll('[data-animate]').forEach(el => {
          observer.observe(el);
        });
      }
    },

    loadDynamicContent() {
      // Fetch latest version from API or config
      this.updateVersion('1.0.0');

      // Could load stats, testimonials, or changelog dynamically
      console.log('[Landing] Loaded version:', this.version);
    },

    updateVersion(version) {
      this.version = version;
      const versionEl = document.querySelector('[data-version]');
      if (versionEl) {
        versionEl.textContent = version;
      }
    },

    checkMobile() {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      window.innerWidth <= 768;
      
      if (isMobile) {
        this.showMobileMessage();
        this.disableDownloadButtons();
      }
    },

    showMobileMessage() {
      const heroCopy = document.querySelector('.hero-copy');
      if (heroCopy) {
        const mobileAlert = document.createElement('div');
        mobileAlert.className = 'mobile-alert';
        mobileAlert.innerHTML = `
          <div class="alert-content">
            <div class="alert-icon">📱</div>
            <div class="alert-text">
              <strong>Para melhor experiência</strong><br>
              Acesse este site pelo computador para baixar o PhysikFlow
            </div>
          </div>
        `;
        
        // Insert after the eyebrow element
        const eyebrow = heroCopy.querySelector('.eyebrow');
        if (eyebrow) {
          eyebrow.parentNode.insertBefore(mobileAlert, eyebrow.nextSibling);
        } else {
          heroCopy.insertBefore(mobileAlert, heroCopy.firstChild);
        }
      }
    },

    disableDownloadButtons() {
      // Disable all download buttons
      document.querySelectorAll('[data-download]').forEach(btn => {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
        btn.style.cursor = 'not-allowed';
        
        // Add tooltip
        btn.title = 'Acesse pelo computador para baixar';
      });

      // Disable main CTA button
      const mainCTA = document.querySelector('.btn-primary[href="#download"]');
      if (mainCTA) {
        mainCTA.style.opacity = '0.5';
        mainCTA.style.pointerEvents = 'none';
        mainCTA.style.cursor = 'not-allowed';
        mainCTA.title = 'Acesse pelo computador para baixar';
      }
    },

    // Analytics placeholder
    track(event, data = {}) {
      console.log('[Analytics]', event, data);
      // TODO: Send to analytics service
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LandingApp.init());
  } else {
    LandingApp.init();
  }

  // Expose for global access
  window.PhysikFlowLanding = LandingApp;
})();
