// PWA and App Lifecycle Manager
(function () {
  // Purge any stale legacy service worker caches on load
  if ('caches' in window) {
    caches.keys().then((names) => {
      for (let name of names) {
        if (name.includes('v1.0.0')) {
          caches.delete(name);
        }
      }
    });
  }

  let deferredPrompt = null;
  const installBtn = document.getElementById('installAppBtn');
  const appModeBadge = document.getElementById('appModeBadge');
  const offlineBadge = document.getElementById('offlineBadge');

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration failed:', err);
        });
    });
  }

  // Detect standalone app mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://');

  if (isStandalone && appModeBadge) {
    appModeBadge.classList.remove('hidden');
    if (installBtn) installBtn.style.display = 'none';
  }

  // Handle PWA Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.classList.remove('hidden');
      installBtn.setAttribute('title', 'Install as Desktop / Mobile App');
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        // Fallback instructions if browser already installed or iOS
        showToast('App is already installed, or install via your browser menu (Add to Home / Install App).', 'info');
        return;
      }
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] User response to install prompt:', outcome);
      deferredPrompt = null;
      installBtn.classList.add('hidden');
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Application successfully installed');
    if (installBtn) installBtn.classList.add('hidden');
    if (appModeBadge) appModeBadge.classList.remove('hidden');
    showToast('🎉 DocuForensic installed as an App successfully!', 'success');
  });

  // Online / Offline Status Handlers
  window.addEventListener('online', () => {
    if (offlineBadge) offlineBadge.classList.add('hidden');
    showToast('🟢 Back online. Full cloud features available.', 'success');
  });

  window.addEventListener('offline', () => {
    if (offlineBadge) offlineBadge.classList.remove('hidden');
    showToast('⚡ Running in Offline App Mode. Local forensic engine active.', 'warning');
  });
})();
