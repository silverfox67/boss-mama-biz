(function() {
  'use strict';
  // 1. Service Worker registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').catch(function() {});
    });
  }
  // 2. Hide if already running in standalone mode (already opened as installed app)
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) return;
  
  // 3. Platform & Browser Detection
  var ua = navigator.userAgent || navigator.vendor || window.opera || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (window.innerWidth <= 768);
  var isInAppBrowser = /FBAN|FBAV|FB_IAB|FBSS|Orca|Messenger|Instagram|TikTok|musical_ly|Line|Twitter|Snapchat|Pinterest/i.test(ua) || 
                       (/\bAndroid\b/i.test(ua) && (/\bwv\b/i.test(ua) || /Version\/[0-9]/i.test(ua))) ||
                       document.documentElement.classList.contains('in-app-messenger');
  var deferredPrompt = null;
  var banner, installBtn, dismissBtn, closeBtn, iosGuide, iosGotItBtn, inAppGuide, inAppGotItBtn, desktopGuide, desktopGotItBtn;

  // 4. Dynamic Platform-Aware CTA Label
  function updateButtonLabel() {
    if (!installBtn) return;
    var label = installBtn.querySelector('span') || installBtn;
    if (isInAppBrowser) {
      label.textContent = isIOS ? 'Install App (Opens in Safari)' : 'Install App (Opens in Chrome)';
    } else if (isIOS) {
      label.textContent = 'Install App (Add to Home Screen)';
    } else if (isMobile) {
      label.textContent = 'Install Phone App';
    } else {
      label.textContent = 'Install App';
    }
  }

  function initElements() {
    banner = document.getElementById('pwaInstallBanner');
    installBtn = document.getElementById('pwaInstallBtn');
    dismissBtn = document.getElementById('pwaDismissBtn');
    closeBtn = document.getElementById('pwaCloseBtn');
    iosGuide = document.getElementById('pwaIosGuide');
    iosGotItBtn = document.getElementById('pwaIosGotItBtn');
    inAppGuide = document.getElementById('pwaInAppGuide');
    inAppGotItBtn = document.getElementById('pwaInAppGotItBtn');
    desktopGuide = document.getElementById('pwaDesktopGuide');
    desktopGotItBtn = document.getElementById('pwaDesktopGotItBtn');
    if (!banner) return;
    updateButtonLabel();

    function dismiss() {
      banner.classList.remove('pwa-visible');
      banner.style.display = 'none';
      if (inAppGuide) inAppGuide.style.display = 'none';
      if (iosGuide) iosGuide.style.display = 'none';
      if (desktopGuide) desktopGuide.style.display = 'none';
      if (installBtn) installBtn.style.display = '';
    }

    if (dismissBtn) dismissBtn.addEventListener('click', dismiss);
    if (closeBtn) closeBtn.addEventListener('click', dismiss);
    if (iosGotItBtn) iosGotItBtn.addEventListener('click', dismiss);
    if (inAppGotItBtn) inAppGotItBtn.addEventListener('click', dismiss);
    if (desktopGotItBtn) desktopGotItBtn.addEventListener('click', dismiss);

    if (installBtn) {
      installBtn.addEventListener('click', function() {
        if (deferredPrompt) {
          // Native Chromium prompt (Regular Chrome / Edge / Brave)
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function(choice) {
            if (choice.outcome === 'accepted') {
              dismiss();
            }
            deferredPrompt = null;
          }).catch(function() {
            deferredPrompt = null;
          });
        } else if (isInAppBrowser) {
          if (isIOS) {
            if (inAppGuide) inAppGuide.style.display = 'block';
            installBtn.style.display = 'none';
          } else {
            // Android In-App Browser: Force handoff to Google Chrome
            try {
              window.location.href = 'intent://' + window.location.hostname + window.location.pathname + '#Intent;scheme=https;package=com.android.chrome;end';
            } catch(e) {}
            if (inAppGuide) inAppGuide.style.display = 'block';
          }
        } else if (isIOS) {
          if (iosGuide) {
            iosGuide.style.display = 'block';
            installBtn.style.display = 'none';
          }
        } else {
          // Desktop without active deferred prompt (e.g. click address bar icon)
          if (desktopGuide) {
            desktopGuide.style.display = 'block';
            installBtn.style.display = 'none';
          }
        }
      });
    }
  }

  function showBanner() {
    if (!banner) initElements();
    if (!banner) return;
    updateButtonLabel();
    banner.classList.add('pwa-visible');
    banner.style.setProperty('display', 'block', 'important');
  }

  // Native Chrome / Edge / Android install prompt hook
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(showBanner, 1000);
  });

  // Handle both DOM ready and already-loaded states
  function start() {
    initElements();
    setTimeout(showBanner, 1500);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', start);
  } else {
    // If script ran after DOM was already parsed
    start();
  }

  // Also trigger on window load as guaranteed fallback
  window.addEventListener('load', function() {
    setTimeout(showBanner, 1500);
  });
})();
