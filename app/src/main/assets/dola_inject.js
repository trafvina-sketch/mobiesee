// ============================================================================
// 🛡️ DOLA HARDENED ACCOUNT & ANTI-LOGOUT PROTECTION SHIELD
// ============================================================================
(() => {
  'use strict';
  if (typeof window !== 'undefined') {
    if (window.location && (window.location.hostname.includes('google.com') || window.location.hostname.includes('accounts.google'))) {
      return;
    }
    if (window.__channaInjectScriptLoaded) {
      if (typeof window.duongThoRefreshUI === 'function') window.duongThoRefreshUI();
      return;
    }
    window.__channaInjectScriptLoaded = true;
  }
  try {
    if (typeof window === 'undefined') return;


    // 🛡️ React DOM Reconciler Immunity Shield: Prevents "NotFoundError: Failed to execute 'removeChild' on 'Node'"
    // when React unmounts components, transitions pages, or reconciles modified nodes
    if (typeof Node === 'function' && Node.prototype) {
      const origRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function(child) {
        if (child && child.parentNode !== this) {
          if (child.parentNode) {
            try { return child.parentNode.removeChild(child); } catch(e) { return child; }
          }
          return child;
        }
        return origRemoveChild.apply(this, arguments);
      };

      const origInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function(newNode, refNode) {
        if (refNode && refNode.parentNode !== this) {
          if (refNode.parentNode) {
            try { return refNode.parentNode.insertBefore(newNode, refNode); } catch(e) { return newNode; }
          }
          return newNode;
        }
        return origInsertBefore.apply(this, arguments);
      };
    }

    // 🛡️ Global Unhandled Rejection & Network Error Immunity Shield (Prevents React "Temporarily Unavailable" Crash)
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        try {
          const reason = event.reason;
          const msg = String((reason && (reason.message || reason.stack || reason)) || '');
          if (
            msg.includes('Network request failed') ||
            msg.includes('status: 0') ||
            msg.includes('Failed to fetch') ||
            msg.includes('CERT_AUTHORITY') ||
            msg.includes('zijieapi') ||
            msg.includes('53687') ||
            msg.includes('slardar')
          ) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        } catch (e) {}
      }, true);

      window.addEventListener('error', (event) => {
        try {
          const msg = String(event.message || '');
          if (
            msg.includes('removeChild') ||
            msg.includes('insertBefore') ||
            msg.includes('Network request failed') ||
            msg.includes('status: 0') ||
            msg.includes('zijieapi')
          ) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        } catch (e) {}
      }, true);
    }



    // 🛡️ Ultra-Clean Floating Notification Banner (Unobtrusive status feedback with interactive actions)
    window.__showChannaNotice = function(msg, duration = 4500, hasSwitchBtn = false) {
      console.warn('[ChannaTheBrand Pro Notice]:', msg);
      try {
        let toast = document.getElementById('ctb-global-notice');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'ctb-global-notice';
          (document.body || document.documentElement).appendChild(toast);
        }

        const isSharkNotice = msg.includes('Shark block') || hasSwitchBtn === true;
        const finalDuration = isSharkNotice ? 30000 : duration;

        toast.style.cssText = 'position:fixed;top:120px;left:50%;bottom:auto;right:auto;transform:translateX(-50%) translateY(-10px);z-index:9999999;background:rgba(15,23,42,0.96);color:#f8fafc;padding:9px 16px;border-radius:14px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:12px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.65),0 0 20px rgba(124,58,237,0.35);border:1px solid rgba(168,85,247,0.45);display:flex;align-items:center;gap:10px;pointer-events:auto;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);opacity:0;max-width:580px;';

        let actionBtnHtml = '';
        if (isSharkNotice) {
          actionBtnHtml = `
            <button id="ctb-btn-switch-account" style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;border:none;border-radius:999px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer;box-shadow:0 0 10px rgba(16,185,129,0.4);transition:all 0.2s ease;white-space:nowrap;flex-shrink:0;">
              🔄 Switch Account
            </button>
            <button id="ctb-btn-dismiss-notice" style="background:transparent;border:none;color:#94a3b8;font-size:13px;cursor:pointer;padding:2px 5px;line-height:1;margin-left:2px;flex-shrink:0;" title="Dismiss">✕</button>
          `;
        }

        toast.innerHTML = `<span style="line-height:1.4;flex-grow:1;">${msg}</span>${actionBtnHtml}`;

        const btnSwitch = toast.querySelector('#ctb-btn-switch-account');
        if (btnSwitch) {
          btnSwitch.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            btnSwitch.textContent = '⏳ Switching...';
            btnSwitch.disabled = true;
            btnSwitch.style.opacity = '0.75';
            btnSwitch.style.cursor = 'wait';
            window.postMessage({ type: 'CHANNA_MANUAL_SWITCH_ACCOUNT' }, '*');
          };
        }

        const btnDismiss = toast.querySelector('#ctb-btn-dismiss-notice');
        if (btnDismiss) {
          btnDismiss.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-10px)';
          };
        }

        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
          if (toast) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-10px)';
          }
        }, finalDuration);
      } catch (e) {}
    };

    // ⚡ Autonomous Daily Limit Notification (Notice Only, NEVER auto-reloads page)
    function notifyDailyLimitReached(source = 'unknown') {
      const now = Date.now();
      if (now - (window.__ctbLastLimitNoticeTime || 0) < 60000) return;
      window.__ctbLastLimitNoticeTime = now;
      console.warn('[ChannaTheBrand Pro] ⚠️ Daily generation limit reached (' + source + '). Displaying notice without reload.');
      if (typeof window.__showChannaNotice === 'function') {
        window.__showChannaNotice('⚠️ Daily generation limit reached. You can switch accounts anytime from the side panel.', 6000);
      }
    }
    window.__notifyDailyLimitReached = notifyDailyLimitReached;

    // 👻 GHOST WORKER: Anti-Throttle & Never-Sleep Mode (Destroys Background Throttling)
    let isGhostWorkerActive = true;
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'CTB_SET_GHOST_WORKER') {
        isGhostWorkerActive = e.data.enabled !== false;
      }
    });

    try {
      const origHiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden') ||
                             Object.getOwnPropertyDescriptor(document, 'hidden');
      const origVisDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState') ||
                          Object.getOwnPropertyDescriptor(document, 'visibilityState');

      Object.defineProperty(document, 'hidden', {
        get: function() {
          if (isGhostWorkerActive) return false;
          return origHiddenDesc ? origHiddenDesc.get.call(this) : false;
        },
        configurable: true
      });

      Object.defineProperty(document, 'visibilityState', {
        get: function() {
          if (isGhostWorkerActive) return 'visible';
          return origVisDesc ? origVisDesc.get.call(this) : 'visible';
        },
        configurable: true
      });
    } catch (e) {}

    // Web Worker high-precision heartbeat to bypass Chromium background timer throttling
    try {
      const ghostBlob = new Blob([`
        setInterval(function() {
          postMessage('ghost_heartbeat');
        }, 1000);
      `], { type: 'application/javascript' });
      const ghostWorker = new Worker(URL.createObjectURL(ghostBlob));
      ghostWorker.onmessage = function() {};
    } catch (e) {}

    // 🛡️ Safe DOM Daily Limit Observer (Monitors both active popup modals/toasts and recent chat message rows)
    (() => {
      let lastDomLimitCheck = 0;
      const pageInitTime = Date.now();
      const seenLimitMessageIds = new Set();
      const limitPhrases = [
        "reached the daily limit for video generation",
        "daily limit for video generation",
        "reached the daily limit",
        "reached daily limit",
        "daily video generation limit",
        "limit for video generation",
        "please try again tomorrow",
        "try again tomorrow",
        "达到今日视频生成上限",
        "今日视频生成上限",
        "今日生成上限"
      ];

      function checkDomDailyLimit() {
        if (Date.now() - lastDomLimitCheck < 4000) return;
        lastDomLimitCheck = Date.now();

        try {
          const now = Date.now();
          // Startup immunity: During first 25 seconds after page load, seed all existing messages into seenLimitMessageIds so historical messages never trigger auto-switch!
          const isStartup = (now - pageInitTime < 25000);

          // Cooldown check: If account was switched within last 60s, do not scan or switch!
          const switchCooldown = parseInt(sessionStorage.getItem('__ctb_switch_cooldown') || '0', 10);
          if (now < switchCooldown) return;

          // 1. Check active floating dialogs/modals/toasts
          const activeDialogs = Array.from(document.querySelectorAll('[role="dialog"], [role="alert"], .semi-modal, .semi-toast, .semi-notification, [class*="toast" i], [class*="alert" i], [class*="modal" i]'));
          if (activeDialogs.length > 0) {
            const dialogText = activeDialogs.map(el => el.innerText || el.textContent || '').join(' ').toLowerCase();
            if (dialogText && limitPhrases.some(p => dialogText.includes(p.toLowerCase()))) {
              const key = 'dialog_' + dialogText.slice(0, 40);
              if (!seenLimitMessageIds.has(key)) {
                seenLimitMessageIds.add(key);
                if (!isStartup) {
                  notifyDailyLimitReached('active_modal_dialog');
                  return;
                }
              }
            }
          }

          // 2. Check recent assistant chat message rows
          const messageRows = Array.from(document.querySelectorAll('[data-observe-row], .v_list_row, [data-message-id], [data-container-type="block-v2"], [data-render-engine="node"]'));
          if (messageRows.length > 0) {
            const recentRows = messageRows.slice(-3);
            for (const row of recentRows) {
              const text = (row.innerText || row.textContent || '').toLowerCase();
              if (text && limitPhrases.some(p => text.includes(p.toLowerCase()))) {
                const msgId = row.getAttribute('data-message-id') || row.getAttribute('data-observe-row') || text.slice(0, 40);
                if (seenLimitMessageIds.has(msgId)) continue;
                seenLimitMessageIds.add(msgId);
                if (!isStartup) {
                  notifyDailyLimitReached('chat_message_daily_limit');
                  return;
                }
              }
            }
          }
        } catch(e) {}
      }

      setInterval(checkDomDailyLimit, 4000);
    })();

    // 🛡️ Auto-dismiss guest login prompt modal if user is chatting in clean/guest mode
    setInterval(() => {
      try {
        const modal = document.querySelector('.semi-modal-wrap, .semi-modal');
        if (modal && (modal.innerText || '').includes('Log In to Unlock More Features')) {
          const closeBtn = modal.querySelector('button[aria-label="close"], .semi-modal-close, [aria-label="close"]');
          if (closeBtn) closeBtn.click();
        }
      } catch (e) {}
    }, 1200);


    // 2. XHR Hard Logout Blocker
    if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest.prototype) {
      const origXhrOpen = XMLHttpRequest.prototype.open;
      const origXhrSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (typeof transformUrl === 'function') url = transformUrl(url);
        this._ctbUrl = typeof url === 'string' ? url : String(url);
        try {
          this.addEventListener('load', function() {
            try {
              if (this.responseText && (
                this.responseText.includes('用户不存在') || 
                this.responseText.includes('User does not exist') || 
                this.responseText.includes('Account session expired') ||
                this.responseText.includes('"error_code":1011') ||
                this.responseText.includes('"error_code": 1011')
              )) {
                if (typeof window !== 'undefined' && typeof window.__showChannaNotice === 'function') {
                  window.__showChannaNotice('This account session has expired or user does not exist on ByteDance server (用户不存在 / User does not exist). Please switch to an active account in the extension.');
                }
              }
            } catch (e) {}
          });
        } catch (e) {}
        return origXhrOpen.call(this, method, url, ...rest);
      };
      XMLHttpRequest.prototype.send = function(...args) {
        try {
          if (args[0] && typeof args[0] === 'string') {
            args[0] = enforceChannaVideoSettings(args[0], this._ctbUrl);
          }
        } catch (e) {}
        // XHR send hook for video settings
        return origXhrSend.apply(this, args);
        // 🛡️ TELEMETRY NETWORK FAILURE IMMUNITY (Prevents TypeError: Network request failed, status: 0)
        if (this._ctbUrl && (
          this._ctbUrl.includes('zijieapi.com') || 
          this._ctbUrl.includes('/monitor_web/') || 
          this._ctbUrl.includes('/slardar/')
        )) {
          try {
            Object.defineProperty(this, 'status', { value: 200, writable: false });
            Object.defineProperty(this, 'responseText', { value: JSON.stringify({ code: 0, message: 'success', data: {} }), writable: false });
            Object.defineProperty(this, 'response', { value: JSON.stringify({ code: 0, message: 'success', data: {} }), writable: false });
            Object.defineProperty(this, 'readyState', { value: 4, writable: false });
            setTimeout(() => {
              this.dispatchEvent(new Event('readystatechange'));
              this.dispatchEvent(new Event('load'));
              this.dispatchEvent(new Event('loadend'));
            }, 0);
          } catch (e) {}
          return;
        }
        return origXhrSend.apply(this, args);
      };
    }

    // 3. Fast DOM MutationObserver for High Demand Toasts and Alert Icons (Silently suppressed)
    const killToastsAndIcons = () => {
      try {
        const banners = document.querySelectorAll('.semi-toast, [role="alert"], .semi-banner, [class*="toast" i], [class*="banner" i], [class*="notice" i]');
        banners.forEach(el => {
          const txt = (el.innerText || el.textContent || '').trim();
          if (txt.includes('high demand') || txt.includes('experiencing high demand') || txt.includes('try again later')) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            try { el.remove(); } catch (e) {}
          }
        });
        const alertIcons = document.querySelectorAll('svg.text-s-color-alert, .text-s-color-alert');
        alertIcons.forEach(svg => {
          svg.style.setProperty('display', 'none', 'important');
          svg.style.setProperty('visibility', 'hidden', 'important');
          try { svg.remove(); } catch (e) {}
        });
      } catch (e) {}
    };
    const toastObs = new MutationObserver(killToastsAndIcons);
    if (document.documentElement) {
      toastObs.observe(document.documentElement, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        toastObs.observe(document.documentElement, { childList: true, subtree: true });
      });
    }
  } catch (err) {}
})();

(() => {
  try {
    if (!document.getElementById('ctb-early-dock-style')) {
      const s = document.createElement('style');
      s.id = 'ctb-early-dock-style';
      s.textContent = `
        /* Top Minimal Capsule */
        #channa-top-center-capsule {
          position: fixed !important;
          top: 10px !important;
          left: 360px !important;
          transform: none !important;
          right: auto !important;
          margin: 0 !important;
          z-index: 999998 !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          height: 24px !important;
          padding: 2px 8px 2px 3px !important;
          background: rgba(18, 14, 28, 0.88) !important;
          border: 1px solid rgba(168, 85, 247, 0.3) !important;
          border-radius: 999px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
          backdrop-filter: blur(8px) !important;
          white-space: nowrap !important;
          user-select: none !important;
        }
        @media (max-width: 768px) {
          #channa-top-center-capsule {
            left: 50% !important;
            transform: translateX(-50%) !important;
            top: 4px !important;
            max-width: 90vw !important;
            font-size: 10px !important;
            height: 22px !important;
          }
          #channa-dock-toggle-btn, #channa-actor-dock-btn, #channa-accounts-dock-btn {
            transform: scale(0.8) translateY(-50%) !important;
            transform-origin: right center !important;
          }
        }
        /* Hide separate/raw Dola container to avoid duplicate box */
        #channa-dock-badge,
        .channa-dock-badge {
          display: none !important;
        }
        /* Instant suppression of alert error icon */
        svg.text-s-color-alert,
        .text-s-color-alert {
          display: none !important;
          visibility: hidden !important;
        }
      `;
      (document.head || document.documentElement).appendChild(s);
    }
  } catch (e) {}
})();

// ============================================================================
// 🎭 HARDWARE CANVAS & FINGERPRINT JITTER (ANTI-TRACKING & NOISE MASKING)
// ============================================================================
(() => {
  'use strict';
  try {
    if (typeof window === 'undefined' || !window.HTMLCanvasElement) return;

    // 🛡️ Dola AI ByteDance Shark Security Compliance: Preserves 100% native WebGL & Canvas on Dola
    if (typeof window !== 'undefined' && window.location && window.location.hostname.includes('dola.com')) {
      return;
    }

    // Generate random session seed per tab
    const sessionJitterSeed = Math.floor(Math.random() * 10) + 1;

    // 1. Safety Guard: Identify tracking/fingerprinting probe canvases ONLY
    // NEVER touch video canvases (width > 280, height > 280, or marked clean)
    function isFingerprintProbeCanvas(canvas) {
      if (!canvas) return false;
      // Probing canvases are small offscreen text test canvases (16x16 up to 250x70)
      if (canvas.width > 280 || canvas.height > 280) return false;
      if (canvas._isOmniRef || canvas._isChannaClean) return false;
      return true;
    }

    // 2. Safe Canvas getImageData jitter (subtle 1-bit shift on 1 single pixel)
    if (typeof CanvasRenderingContext2D !== 'undefined') {
      const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
      CanvasRenderingContext2D.prototype.getImageData = function(...args) {
        const imgData = origGetImageData.apply(this, args);
        try {
          if (isFingerprintProbeCanvas(this.canvas) && imgData && imgData.data && imgData.data.length > 4) {
            // Apply 1-bit noise to only the first pixel byte (imperceptible, but completely breaks bot hashing)
            imgData.data[0] = (imgData.data[0] ^ sessionJitterSeed) & 0xff;
          }
        } catch (e) {}
        return imgData;
      };
    }

    // 3. Canvas toDataURL operates in clean passthrough mode

    // 4. WebGL Vendor & Renderer stealth masking
    const patchWebGL = (proto) => {
      if (!proto || !proto.getParameter) return;
      const origGetParam = proto.getParameter;
      proto.getParameter = function(param) {
        // UNMASKED_VENDOR_WEBGL = 0x9245
        if (param === 0x9245) return 'Google Inc. (NVIDIA)';
        // UNMASKED_RENDERER_WEBGL = 0x9246
        if (param === 0x9246) return 'ANGLE (NVIDIA, NVIDIA GeForce RTX Direct3D11 vs_5_0 ps_5_0, D3D11)';
        return origGetParam.apply(this, arguments);
      };
    };

    if (typeof WebGLRenderingContext !== 'undefined') patchWebGL(WebGLRenderingContext.prototype);
    if (typeof WebGL2RenderingContext !== 'undefined') patchWebGL(WebGL2RenderingContext.prototype);

    console.log('[ChannaTheBrand Pro] 🎭 Anti-Fingerprint Hardware Jitter Active (Video Track 100% Protected).');
  } catch (err) {}
})();

// ============================================================================
// DOLA STUDIORAY DUAL-MODE CONTROLLER (PRO MODE = 100% BYPASS / DOWNLOAD ONLY)
// ============================================================================

var __ctbIsProMode = window.__ctbIsProMode || false;

function __isDolaProModeInDom() {
  try {
    if (typeof document === 'undefined') return false;
    
    // 1. Check if model variable is explicitly set
    if (typeof window !== 'undefined' && window.__dolaActiveModel) {
      return window.__dolaActiveModel === 'pro';
    }

    // 2. Fast targeted search for model selector / pills (only checks interactive controls)
    const pills = document.querySelectorAll('button, [role="button"], [class*="model" i], [class*="pill" i], [class*="selector" i], [class*="mode" i], [class*="badge" i]');
    for (let i = 0; i < pills.length; i++) {
      const text = (pills[i].textContent || '').trim().toLowerCase();
      if ((text === 'pro' || text === '✨ pro' || text === 'pro >' || text === '✨ pro >' || text.startsWith('pro ') || text.includes('✨ pro')) && !text.includes('fast') && !text.includes('upgrade') && !text.includes('buy')) {
        __ctbIsProMode = true;
        return true;
      }
      if (text === 'fast' || text === '⚡ fast' || text === 'fast >' || text === '⚡ fast >' || text.startsWith('fast ') || text.includes('⚡ fast')) {
        __ctbIsProMode = false;
        return false;
      }
    }
  } catch (e) {}
  return __ctbIsProMode;
}

function __isCtbProModeActive() {
  return typeof __isDolaProModeInDom === 'function' ? __isDolaProModeInDom() : false;
}

function __isCtbUploadRequest(url, body, options) {
  try {
    const strUrl = typeof url === 'string' ? url : (url && url.url ? url.url : '');
    if (strUrl && /ibytedtos\.com|byteintl\.com|s3\.amazonaws\.com|volces\.com|upload|attachment|file_upload|image_upload|tos|tos-upload/i.test(strUrl)) return true;
    const method = String((options && options.method) || (url && url.method) || '').toUpperCase();
    if (method === 'PUT') return true;
    if (typeof FormData !== 'undefined' && body instanceof FormData) return true;
    if (typeof Blob !== 'undefined' && body instanceof Blob) return true;
    if (typeof File !== 'undefined' && body instanceof File) return true;
    if (typeof ArrayBuffer !== 'undefined' && (body instanceof ArrayBuffer || ArrayBuffer.isView(body))) return true;
    if (typeof body === 'object' && body !== null) {
      if (body.file_name || body.file_type || body.image_uri || body.image_raw || body.attachment || body.tos_key || body.upload_token || body.chunk_size || body.file_size || body.mime_type) return true;
      if (body.action && /upload|attachment|file/i.test(String(body.action))) return true;
    }
    if (typeof body === 'string' && (/["'](?:file_name|file_type|image_uri|image_raw|upload_token|attachment|tos_key|chunk_size|file_size|mime_type)["']/i.test(body) || body.includes('data:image/'))) return true;
  } catch (e) {}
  return false;
}

function __isCtbProOrChatRequest(url, body, options) {
  try {
    if (__isCtbProModeActive()) return true;
    const strUrl = typeof url === 'string' ? url : (url && url.url ? url.url : '');
    if (strUrl && /\/chat|\/conversation|\/message|\/samantha|\/im\/chain|\/bot\/chat|\/agent|\/stream|generate_chat/i.test(strUrl)) {
      if (!/\/video\/(?:generate|create|task|submit)/i.test(strUrl) && !/\/generate_video/i.test(strUrl)) {
        return true;
      }
    }
    if (typeof body === 'string' && body.length > 0) {
      if (body.includes('"model":"pro"') || body.includes('"model": "pro"') || body.includes('"mode":"pro"') || body.includes('"chat_mode":"pro"') || body.includes('"doubao-pro"') || body.includes('"deepseek"') || body.includes('"reasoner"') || body.includes('"thinking"')) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function __isCtbBypassRequest(url, body, options) {
  if (typeof window !== 'undefined' && window.location && window.location.hostname.includes('dola.com')) {
    return true;
  }
  return __isCtbUploadRequest(url, body, options) || __isCtbProOrChatRequest(url, body, options);
}

if (typeof window !== 'undefined') {
  window.__isCtbUploadRequest = __isCtbUploadRequest;
  window.__isCtbProModeActive = __isCtbProModeActive;
  window.__isCtbProOrChatRequest = __isCtbProOrChatRequest;
  window.__isCtbBypassRequest = __isCtbBypassRequest;
  window.__ctbIsProMode = __ctbIsProMode;
  window.__isDolaProModeInDom = __isDolaProModeInDom;
}

// ============================================================================
// ⚡ CHANNA DURATION, RATIO & CREDIT POINTS BYPASS SUITE (Clean Deobfuscated)
// ============================================================================
  // Active Override State
  window.CHANNA_TARGET_DURATION = window.CHANNA_TARGET_DURATION || 30;
  window.CHANNA_TARGET_RATIO = window.CHANNA_TARGET_RATIO || '9:16';
  window.CHANNA_MAX_CREDITS_LIMIT = window.CHANNA_MAX_CREDITS_LIMIT || 20;

  const SUPPORTED_RATIOS = ['9:16', '16:9', '1:1', '4:3', '3:4', '21:9'];
  const RATIO_KEYS = ['ratio', 'aspect_ratio', 'aspectRatio', 'ratio_type', 'ar'];

  function getActiveAccountName() {
    try {
      // 1. Live captured nickname from ByteDance API (/alice/profile/self_brief or /passport/)
      if (window.CHANNA_DOM_USER_NAME && typeof window.CHANNA_DOM_USER_NAME === 'string') {
        const nick = window.CHANNA_DOM_USER_NAME.trim();
        if (nick && !nick.includes('Sohail') && nick !== 'Active Account' && nick !== 'Default') {
          return nick;
        }
      }

      // 2. Read directly from Dola's DOM (sidebar profile element / student text)
      const sidebarEls = document.querySelectorAll('aside [class*="user"], aside [class*="profile"], aside [class*="name"], aside button, [class*="sidebar"] button, footer button, [class*="avatar"] + span, aside span');
      for (const el of sidebarEls) {
        if (el.id === 'ctb-acc-name' || el.id === 'ctb-acc-dur') continue;
        const t = (el.innerText || el.textContent || '').trim();
        const m = t.match(/\b(student\s+[a-z0-9_]{3,}|user_[a-z0-9_]{3,})\b/i);
        if (m) {
          window.CHANNA_DOM_USER_NAME = m[1];
          return m[1];
        }
      }

      // Scan all text nodes / spans for student dcXXXXXX
      const allSpans = document.querySelectorAll('span, p, div');
      for (const el of allSpans) {
        if (el.id === 'ctb-acc-name' || el.id === 'ctb-acc-dur' || el.children.length > 2) continue;
        const t = (el.innerText || el.textContent || '').trim();
        const m = t.match(/\b(student\s+[a-z0-9_]{3,})\b/i);
        if (m) {
          window.CHANNA_DOM_USER_NAME = m[1];
          return m[1];
        }
      }

      // 3. Check active profile name from extension storage (e.g. Account 1, Account 4, Student 1)
      if (window.CHANNA_ACTIVE_ACCOUNT_NAME && typeof window.CHANNA_ACTIVE_ACCOUNT_NAME === 'string') {
        const storedName = window.CHANNA_ACTIVE_ACCOUNT_NAME.replace(/\s*Active\.*/i, '').trim();
        if (storedName && !storedName.includes('Sohail') && storedName !== 'Active Account' && storedName !== 'Default') {
          return storedName;
        }
      }

      // 4. Try bottom-left user button text if logged in
      const userBtn = document.querySelector('aside > div:last-child button, nav > div:last-child button, [class*="user-entry"], [class*="user-profile"]');
      if (userBtn) {
        const btnText = (userBtn.innerText || userBtn.textContent || '').trim().replace(/\s*[>›»▼⌄^]+\s*$/, '').trim();
        if (btnText && !btnText.toLowerCase().includes('about') && !btnText.toLowerCase().includes('log in') && !btnText.toLowerCase().includes('sign in') && btnText.length < 35) {
          return btnText;
        }
      }

      // 5. Fallback: If extension profile is set, return it
      if (window.CHANNA_ACTIVE_ACCOUNT_NAME && window.CHANNA_ACTIVE_ACCOUNT_NAME.trim()) {
        const name = window.CHANNA_ACTIVE_ACCOUNT_NAME.trim();
        if (name !== 'Active Account') return name;
      }
    } catch (e) {}

    return 'Account #01';
  }
  window.getActiveAccountName = getActiveAccountName;

  // 🛡️ Proactively query Dola profile to extract live logged in student/user nickname
  if (typeof window !== 'undefined') {
    setTimeout(async () => {
      try {
        if (!window.CHANNA_DOM_USER_NAME) {
          const res = await (window.__nativeFetch || window.fetch)('/alice/profile/self_brief', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{}'
          });
          if (res && res.ok) {
            const data = await res.json();
            const nick = data?.data?.profile_brief?.nickname || data?.data?.user_info?.name || data?.data?.user_info?.screen_name;
            if (nick && typeof nick === 'string' && nick.trim()) {
              window.CHANNA_DOM_USER_NAME = nick.trim();
              if (typeof syncBadgesFast === 'function') syncBadgesFast();
            }
          }
        }
      } catch (e) {}
    }, 1200);
  }

  // ============================================================================
  // 1. Cross-World Message Listener (receives config from content.js)
  // ============================================================================
  window.addEventListener('message', (event) => {
    if (!event.data) return;

    // ⚡ Synchronize active account name from extension storage
    if (event.data.activeAccountName || event.data.accountName) {
      const acc = (event.data.activeAccountName || event.data.accountName || '').trim();
      if (acc && acc !== 'Default' && acc !== 'Active Account') {
        window.CHANNA_ACTIVE_ACCOUNT_NAME = acc;
        if (typeof syncBadgesFast === 'function') syncBadgesFast();
      }
    }

    if (event.data.type === 'SET_RATIO_OVERRIDE' || event.data.type === 'DURATION_OVERRIDE') {
      if (event.data.duration) {
        window.CHANNA_TARGET_DURATION = parseInt(event.data.duration, 10) || 30;
        try {
          localStorage.setItem('__dolaTargetDur', String(window.CHANNA_TARGET_DURATION));
          localStorage.setItem('durationOverride', String(window.CHANNA_TARGET_DURATION));
          localStorage.setItem('seedance_bypass_duration', String(window.CHANNA_TARGET_DURATION));
        } catch(e) {}
      }
      if (event.data.ratio) {
        window.CHANNA_TARGET_RATIO = event.data.ratio;
      }
      if (event.data.maxCredits) {
        window.CHANNA_MAX_CREDITS_LIMIT = parseInt(event.data.maxCredits, 10) || 20;
      }
      if (event.data.activeAccountName) {
        const acc = event.data.activeAccountName.trim();
        if (acc && acc !== 'Default' && acc !== 'Active Account') {
          window.CHANNA_ACTIVE_ACCOUNT_NAME = acc;
        }
      }
      if (typeof syncBadgesFast === 'function') syncBadgesFast();
    }
    if (event.data.type === 'SET_MODEL_MODE') {
      if (event.data.modelMode) {
        window.CHANNA_TARGET_MODEL_MODE = event.data.modelMode;
      }
    }
    if (event.data.type === 'DUONG_THO_TRIGGER_CREATE_VIDEO') {
      if (typeof window.__duongThoTriggerCreateVideo === 'function') {
        window.__duongThoTriggerCreateVideo(event.data.prompt, event.data.duration, event.data.mode || 'fast');
      }
    }
    if (event.data.type === 'SET_MAX_CREDITS_LIMIT') {
      if (event.data.maxCredits) {
        window.CHANNA_MAX_CREDITS_LIMIT = parseInt(event.data.maxCredits, 10) || 20;
      }
    }
    if (event.data.type === 'SET_ACTIVE_ACCOUNT_NAME') {
      if (event.data.activeAccountName) {
        const acc = event.data.activeAccountName.trim();
        if (acc && acc !== 'Default' && acc !== 'Active Account') {
          window.CHANNA_ACTIVE_ACCOUNT_NAME = acc;
          if (typeof syncBadgesFast === 'function') syncBadgesFast();
        }
      }
    }
  }, { passive: true });

  // ============================================================================
  // 2. Request Payload Rewriters (Duration, Ratio, Credit Points)
  // ============================================================================
  function isHistoryOrListUrl(url) {
    if (typeof url !== 'string') return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('/rooms') || 
           lowerUrl.includes('/user/history') ||
           lowerUrl.includes('/history') ||
           lowerUrl.includes('/messages') ||
           lowerUrl.includes('/conversations') ||
           lowerUrl.includes('/detail') ||
           lowerUrl.includes('/topics') ||
           lowerUrl.includes('/chat/list');
  }

  // 🛡️ ACCURATE VIDEO INTENT DETECTION: Gold Standard logic
  function isActualVideoRequest(bodyText, url) {
    if (!bodyText || typeof bodyText !== 'string') return false;
    if (url && isHistoryOrListUrl(url)) return false;
    
    // Explicit video endpoints
    if (url && (url.includes('/video/create') || url.includes('/video/generate') || url.includes('/creation/video') || url.includes('/video/task'))) {
      return true;
    }

    if (url && (url.includes('/chat') || url.includes('/im/') || url.includes('/creation/') || url.includes('/video/') || url.includes('/alice/'))) {
      return bodyText.includes('duration') || bodyText.includes('ability_param') || bodyText.includes('chat_ability') || bodyText.includes('seedance');
    }

    // ability_param / chat_ability is present ONLY when Dola's video creation tool is active
    return (bodyText.includes('duration') && (bodyText.includes('prompt') || bodyText.includes('model'))) || bodyText.includes('ability_param') || bodyText.includes('chat_ability') || bodyText.includes('video_duration') || (bodyText.includes('seedance') && bodyText.includes('duration'));
  }

  function transformPayloadBody(bodyText, url) {
    if (!bodyText || typeof bodyText !== 'string') return bodyText;

    if (!isActualVideoRequest(bodyText, url)) {
      return bodyText;
    }

    let rawTarget = 30;
    try {
      const stored = localStorage.getItem('__dolaTargetDur') || 
                     localStorage.getItem('durationOverride') || 
                     localStorage.getItem('seedance_bypass_duration');
      if (stored) rawTarget = parseInt(stored, 10);
      else if (window.CHANNA_TARGET_DURATION) rawTarget = parseInt(window.CHANNA_TARGET_DURATION, 10);
    } catch(e) {
      rawTarget = parseInt(window.CHANNA_TARGET_DURATION, 10) || 30;
    }
    const currentTargetDur = (rawTarget === 30 || rawTarget === 31) ? 31 : rawTarget;

    let body = bodyText;

    // --- DURATION BYPASS (10s, 15s, 20s, 30s) ---
    // Matches: "duration": 10, \"duration\": 10, \\\"duration\\\": 10, \"duration\":10
    const durationRegex = /(\\*"?duration\\*"?\s*:\s*\\*"?\s*)(\d+)/g;
    durationRegex.lastIndex = 0;
    let matched = false;

    if (durationRegex.test(body)) {
      durationRegex.lastIndex = 0;
      body = body.replace(durationRegex, (match, p1, p2) => {
        matched = true;
        return p1 + currentTargetDur;
      });
    }

    if (!matched && body.includes('ability_param')) {
      body = body.replace(
        /(ability_param[\s\S]*?duration\\*"\s*:\s*)(\d+)/g,
        `$1${currentTargetDur}`
      );
      matched = true;
    }

    // Khi duration > 10 (15s, 20s, 30s/31s), BẮT BUỘC upgrade lên Seedance 2.5 vì Seedance 2.0 chỉ hỗ trợ tối đa 10s
    if (currentTargetDur > 10) {
      body = body.replace(/(\\*"?model\\*"?\s*:\s*\\*"?)([^"\\]*?)2\.0([^"\\]*?)(\\*"?)/g, '$1$22.5$3$4');
      body = body.replace(/(\\*"?model_version\\*"?\s*:\s*\\*"?)([^"\\]*?)2\.0([^"\\]*?)(\\*"?)/g, '$1$22.5$3$4');
      body = body.replace(/(\\*"?model_name\\*"?\s*:\s*\\*"?)([^"\\]*?)2\.0([^"\\]*?)(\\*"?)/g, '$1$22.5$3$4');
      body = body.replace(/seedance[-_]2\.0/gi, 'seedance-2.5');
      console.log(`[Seedance Bypass] ✅ Ép duration=${currentTargetDur}s + model=2.5 gửi lên Dola API!`);
    } else {
      console.log(`[Seedance Bypass] ✅ Ép duration thành ${currentTargetDur}s gửi lên Dola API!`);
    }

    return body;
  }

  // ==========================================
  // HÀM TỰ ĐỘNG BẤM TẠO VIDEO (CREATE VIDEO FAST)
  // ==========================================
  window.__duongThoTriggerCreateVideo = function(promptText, duration = 15, mode = 'fast') {
    window.CHANNA_TARGET_DURATION = parseInt(duration, 10) || 15;
    window.CHANNA_TARGET_MODEL_MODE = mode || 'fast';

    console.log(`🚀 [Đường Thọ PC Studio] Kích hoạt tạo video: ${duration}s | Mode: ${mode}`);

    // 1. Tìm ô nhập prompt
    const editor = document.querySelector('#input-engine-container .tiptap, #input-engine-container [role="textbox"], .tiptap, .ProseMirror, textarea, [contenteditable="true"]');
    if (editor) {
      editor.focus();
      if (editor.tagName === 'TEXTAREA') {
        editor.value = promptText;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        try {
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, promptText);
        } catch (e) {
          editor.textContent = promptText;
        }
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // 2. Tìm và click nút chọn "Fast"
    const allButtons = Array.from(document.querySelectorAll('button, div[role="button"], span, div'));
    const fastBtn = allButtons.find(b => /\bFast\b/i.test((b.textContent || '').trim()) && !(b.textContent || '').includes('Fast action'));
    if (fastBtn) {
      fastBtn.click();
      console.log('⚡ Đã chọn chế độ Fast');
    }

    // 3. Tìm và click nút thời lượng (15s hoặc 30s)
    setTimeout(() => {
      const durBtn = allButtons.find(b => new RegExp(`\\b${duration}s?\\b`, 'i').test((b.textContent || '').trim()));
      if (durBtn) {
        durBtn.click();
        console.log(`⏱️ Đã chọn nút thời lượng ${duration}s`);
      }

      // 4. Kích hoạt nút Create Video / Send
      setTimeout(() => {
        const createBtn = document.querySelector('button[type="submit"], [class*="send-btn"], [aria-label*="Create"], [aria-label*="Send"], #input-engine-container button:last-child') ||
                          allButtons.find(b => /Create Video|Tạo video|Generate|Create/i.test((b.textContent || '').trim()));
        if (createBtn) {
          createBtn.click();
          console.log('🚀 Đã click nút Create Video!');
        } else {
          const form = editor?.closest('form');
          if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }, 350);
    }, 350);

    return true;
  };

  function transformUrl(url) {
    if (!url || typeof url !== 'string') return url;

    const targetRatio = window.CHANNA_TARGET_RATIO || '9:16';
    if (/(ratio|aspect_ratio|ar)=/i.test(url)) {
      return url.replace(/([?&](ratio|aspect_ratio|ar)=)([^&]+)/gi, `$1${encodeURIComponent(targetRatio)}`);
    }
    return url;
  }

  function transformFormData(formData) {
    if (!formData || typeof formData.has !== 'function') return;
    if (formData.has('file') || formData.has('image') || formData.has('attachment') || formData.has('tos_key')) return;

    const targetRatio = window.CHANNA_TARGET_RATIO || '9:16';
    for (const key of RATIO_KEYS) {
      if (formData.has(key)) {
        formData.set(key, targetRatio);
      }
    }
  }

  // Make globally available
  window.isActualVideoRequest = isActualVideoRequest;
  window.transformPayloadBody = transformPayloadBody;
  window.transformUrl = transformUrl;
  window.transformFormData = transformFormData;

  // ============================================================================
  // 3. JSON.stringify Hook (Intercepts Objects before serialization)
  // ============================================================================
  const originalJsonStringify = JSON.stringify;
  JSON.stringify = function(...args) {
    try {
      const obj = args[0];
      if (obj && typeof obj === 'object') {
        // 🛡️ CRITICAL GUARD: Only intercept video creation objects!
        // Regular chat messages, auth tokens, and DOM states remain 100% UNTOUCHED!
        const isVideoObj = ('chat_ability' in obj) ||
                           ('ability_param' in obj) || 
                           ('video_duration' in obj) || 
                           ('motion_seconds' in obj) || 
                           ('video_length' in obj) || 
                           (obj.model && /seedance/i.test(String(obj.model))) ||
                           (obj.generate_type === 'video');

        if (!isVideoObj) {
          return originalJsonStringify.apply(this, args);
        }

        const targetDuration = parseInt(window.CHANNA_TARGET_DURATION, 10) || 30;
        const targetRatio = window.CHANNA_TARGET_RATIO || '9:16';

        if ('duration' in obj) obj.duration = targetDuration;
        if ('video_duration' in obj) obj.video_duration = targetDuration;
        if ('motion_seconds' in obj) obj.motion_seconds = targetDuration;
        if ('video_length' in obj) obj.video_length = targetDuration;
        if ('seconds' in obj) obj.seconds = targetDuration;

        if (obj.ability_param && typeof obj.ability_param === 'object') {
          if ('duration' in obj.ability_param) obj.ability_param.duration = targetDuration;
          if ('video_duration' in obj.ability_param) obj.ability_param.video_duration = targetDuration;
        } else if (typeof obj.ability_param === 'string') {
          try {
            const parsed = JSON.parse(obj.ability_param);
            if (parsed && typeof parsed === 'object') {
              if ('duration' in parsed) parsed.duration = targetDuration;
              if ('video_duration' in parsed) parsed.video_duration = targetDuration;
              obj.ability_param = JSON.stringify(parsed);
            }
          } catch(e) {}
        }

        if ('ratio' in obj) obj.ratio = targetRatio;
        if ('aspect_ratio' in obj) obj.aspect_ratio = targetRatio;
        if ('aspectRatio' in obj) obj.aspectRatio = targetRatio;
      }
    } catch (e) {}
    return originalJsonStringify.apply(this, args);
  };
  // ============================================================================
  // 4. Native WebSocket Hook
  // ============================================================================
  if (typeof WebSocket !== 'undefined' && WebSocket.prototype) {
    const originalWSSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function(data) {
      try {
        if (typeof data === 'string') {
          data = transformPayloadBody(data);
        }
      } catch (e) {}
      return originalWSSend.apply(this, [data]);
    };
  }

  // ============================================================================
  // 5. In-Page UI Badge & Toolbar Synchronizer (Delegated to Master Engine)
  // ============================================================================
  const syncBadgesFast = () => {
    if (typeof window.syncBadgesFast === 'function') {
      window.syncBadgesFast();
    }
  };

  const existingNotice = document.getElementById('channa-shark-notice');
  if (existingNotice) existingNotice.remove();
  console.log('[AI Bypass Suite] Duration (10s–60s), Aspect Ratio & Dynamic Account Name active.');


// ==========================================================================
// 📥 COMPLETE AUTO-DOWNLOAD & DECRYPTION ENGINE (SSE Stream & qAAB AES-CBC)
// ==========================================================================
(() => {
    const QAAB_SALT_HEX = '4dd4c2e6b83162090e52b3c7a6733ba4'
        + '1cb2462b829ab58a196b39db57177524'
        + 'f49baf7f08e8d68d26a72e37c1a95a2f'
        + '1f05a51892aef2949732b62a38aadd58';

    const processedFallbackApis = new Set();

    function decodeBase64Loose(input) {
        try {
            if (!input || typeof input !== 'string') return null;
            let norm = input.replace(/[$@#]/g, c => ({ '$': '+', '@': '/', '#': '=' }[c]));
            const pad = (4 - (norm.length % 4)) % 4;
            norm += '='.repeat(pad);
            const bin = atob(norm.replace(/-/g, '+').replace(/_/g, '/'));
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            return bytes;
        } catch {
            return null;
        }
    }

    async function decryptQaabToken(token, keySeed) {
        const data = decodeBase64Loose(token);
        const seed = decodeBase64Loose(keySeed);
        if (!data || !seed) return '';
        
        // Derive AES key & IV via double SHA-512 digest
        const digest1 = await crypto.subtle.digest('SHA-512', seed.slice(0, 32));
        
        // Hex salt to byte array
        const salt = new Uint8Array(QAAB_SALT_HEX.length / 2);
        for (let i = 0; i < salt.length; i++) {
            salt[i] = parseInt(QAAB_SALT_HEX.slice(i * 2, i * 2 + 2), 16);
        }
        const digest2Input = new Uint8Array(digest1.byteLength + salt.length);
        digest2Input.set(new Uint8Array(digest1), 0);
        digest2Input.set(salt, digest1.byteLength);
        const digest2 = new Uint8Array(await crypto.subtle.digest('SHA-512', digest2Input));
        const keyBytes = digest2.slice(0, 16);
        const ivBytes = digest2.slice(16, 32);
        let payload = data;
        if (data.length >= 4 && data[0] === 0xa8 && data[1] === 0x00 && data[2] === 0x01 && data[3] === 0x00) {
            payload = data.slice(4);
        }
        try {
            const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, 'AES-CBC', false, ['decrypt']);
            const decrypted = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-CBC', iv: ivBytes }, cryptoKey, payload));
            
            // Strip PKCS#7 padding
            const padLen = decrypted[decrypted.length - 1];
            const unpadded = (padLen >= 1 && padLen <= 16) ? decrypted.slice(0, decrypted.length - padLen) : decrypted;
            
            const plainUrl = new TextDecoder().decode(unpadded);
            return (plainUrl.startsWith('http://') || plainUrl.startsWith('https://')) ? plainUrl : '';
        } catch (e) {
            return '';
        }
    }

    // 🎯 Universal ByteDance TOS Video Fingerprint Extractor
    function extractVideoFingerprint(url) {
        if (!url || typeof url !== 'string') return '';
        const clean = url.trim();
        if (clean.startsWith('blob:')) {
            const parts = clean.split('/');
            return 'blob_' + parts[parts.length - 1].toLowerCase();
        }
        const md5Match = clean.match(/\/([a-f0-9]{32})(?:[~.]|$)/i) || clean.match(/(?:^|[^a-f0-9])([a-f0-9]{32})(?:[^a-f0-9]|$)/i);
        if (md5Match && md5Match[1]) {
            return 'hash_' + md5Match[1].toLowerCase();
        }
        const tosMatch = clean.match(/(tos-[a-z0-9-]+(?:\/[^/?#~]+)+)/i);
        if (tosMatch && tosMatch[1]) {
            return 'tos_' + tosMatch[1].replace(/~tplv-[^/?#]+/g, '').replace(/\.(mp4|webm|mov|mkv)$/i, '').toLowerCase();
        }
        try {
            const u = new URL(clean);
            let p = u.pathname.replace(/~tplv-[^/?#]+/g, '').replace(/\.(mp4|webm|mov|mkv)$/i, '');
            return 'path_' + p.toLowerCase();
        } catch (e) {
            return 'raw_' + clean.split('?')[0].replace(/~tplv-[^/?#]+/g, '').toLowerCase();
        }
    }

    function getChatScopeKey(url, title) {
        const cleanUrl = String(url || (typeof window !== 'undefined' ? window.location.href : '') || '').split('#')[0];
        const pathMatch = cleanUrl.match(/\/(?:chat|c|conversation)\/([a-zA-Z0-9_-]+)/i);
        if (pathMatch && pathMatch[1] && pathMatch[1] !== 'new') {
            return 'chat_' + pathMatch[1];
        }
        try {
            const u = new URL(cleanUrl);
            const qId = u.searchParams.get('conversation_id') || u.searchParams.get('id') || u.searchParams.get('chat_id');
            if (qId) return 'chat_' + qId;
            if (u.pathname && u.pathname !== '/' && u.pathname !== '/chat') {
                return 'path_' + u.pathname.replace(/\/$/, '').toLowerCase();
            }
        } catch (e) {}
        const cleanTitle = String(title || (typeof document !== 'undefined' ? document.title : '') || '').trim();
        if (cleanTitle && !cleanTitle.includes('Dola AI -') && cleanTitle !== 'Dola' && cleanTitle !== 'Dola AI') {
            return 'title_' + cleanTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 50);
        }
        return 'chat_current';
    }

    async function decodeOrDecryptVideoUrl(token, keySeed = '') {
        if (!token) return '';
        if (token.startsWith('http://') || token.startsWith('https://')) {
            return token;
        }
        // Attempt standard loose base64 decoding
        const b64Bytes = decodeBase64Loose(token);
        if (b64Bytes) {
            try {
                const ascii = new TextDecoder().decode(b64Bytes);
                if (ascii.startsWith('http://') || ascii.startsWith('https://')) {
                    return ascii;
                }
            } catch (e) {}
        }
        // Decrypt qAAB AES-CBC token
        if (token.startsWith('qAAB') && keySeed) {
            return await decryptQaabToken(token, keySeed);
        }
        return '';
    }

    function findKeySeed(obj, depth = 0) {
        if (!obj || depth > 10) return '';
        if (typeof obj === 'string') {
            const m = obj.match(/[?&]key_seed=([^&"'\s]+)/i);
            return m ? decodeURIComponent(m[1]) : '';
        }
        if (typeof obj === 'object') {
            if (obj.key_seed) return String(obj.key_seed).trim();
            for (const val of Object.values(obj)) {
                const hit = findKeySeed(val, depth + 1);
                if (hit) return hit;
            }
        }
        return '';
    }

    function findFallbackApis(json, rawBody = '') {
        const apis = new Set();
        const regex = /"fallback_api"\s*:\s*"([^"]+)"/g;
        let match = regex.exec(rawBody);
        while (match) {
            let clean = match[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
            if (clean.startsWith('http')) apis.add(clean);
            match = regex.exec(rawBody);
        }
        return Array.from(apis);
    }

    async function extractUnwatermarkedVideo(fallbackApi) {
        try {
            // Force unwatermarked logo type and high quality codec
            const parsedUrl = new URL(fallbackApi);
            parsedUrl.searchParams.set('channel', 'no');
            parsedUrl.searchParams.set('codec_type', '8');
            parsedUrl.searchParams.set('logo_type', 'unwatermarked');
            const apiUrl = parsedUrl.toString();
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json,text/plain,*/*' }
            });
            
            const payload = await response.json();
            const videoData = payload?.video_info?.data || payload?.data || payload;
            const entries = videoData?.video_list ? Object.values(videoData.video_list) : [videoData];
            
            // Pick highest bitrate / resolution entry
            let best = null;
            for (const entry of entries) {
                const token = entry?.main_url || entry?.play_url || '';
                if (!token) continue;
                const score = Number(entry.bitrate || 0) + Number(entry.vwidth || 0) * Number(entry.vheight || 0);
                if (!best || score > best.score) {
                    best = { token: String(token).trim(), entry, score };
                }
            }
            if (!best) return;
            
            // Decode or Decrypt the token to get the raw MP4 URL
            const keySeed = findKeySeed(payload);
            const directDownloadUrl = await decodeOrDecryptVideoUrl(best.token, keySeed);
            if (directDownloadUrl) {
                console.log('%c[ZDola Decryptor] ⚡ Unwatermarked Master Stream Decrypted:', 'color: #a855f7; font-weight: bold;', directDownloadUrl);
                
                const promptText = document.querySelector('textarea, div[contenteditable="true"]')?.value || document.querySelector('textarea, div[contenteditable="true"]')?.innerText || 'Dola Video';
                const currentScopeKey = getChatScopeKey(window.location.href, document.title);
                const videoEntry = {
                    vid: videoData.vid || videoData.video_id || apiUrl,
                    url: directDownloadUrl,
                    source: 'fallback_api',
                    width: best.entry?.vwidth || 1920,
                    height: best.entry?.vheight || 1080,
                    prompt: promptText,
                    pageUrl: window.location.href,
                    chatScopeKey: currentScopeKey,
                    timestamp: Date.now()
                };

                // Extract immutable TOS object fingerprint
                const fp = extractVideoFingerprint(directDownloadUrl);
                videoEntry.fingerprint = fp;

                // Store in memory master vault
                window.__ctbExtractedVideos = window.__ctbExtractedVideos || [];
                if (!window.__ctbExtractedVideos.some(v => (v.fingerprint === fp || (v.url && extractVideoFingerprint(v.url) === fp)))) {
                    window.__ctbExtractedVideos.push(videoEntry);
                }

                // Persist in sessionStorage & Shared DOM Bridge for Content Script & Batch ZIP
                try {
                    const stored = JSON.parse(sessionStorage.getItem('__CTB_MASTER_VIDEOS__') || '[]');
                    if (!stored.some(v => (v.fingerprint === fp || (v.url && extractVideoFingerprint(v.url) === fp)))) {
                        stored.push(videoEntry);
                        sessionStorage.setItem('__CTB_MASTER_VIDEOS__', JSON.stringify(stored));
                    }
                    let bridge = document.getElementById('__ctb_vault__');
                    if (!bridge) {
                        bridge = document.createElement('div');
                        bridge.id = '__ctb_vault__';
                        bridge.style.display = 'none';
                        document.documentElement.appendChild(bridge);
                    }
                    bridge.setAttribute('data-videos', JSON.stringify(window.__ctbExtractedVideos || []));
                } catch (e) {}

                // Dispatch event for content script
                window.dispatchEvent(new CustomEvent('DOLA_VIDEO_EXTRACTED', { detail: videoEntry }));
            }
        } catch (e) {
            console.warn('[ZDola Decryptor] Extract notice:', e);
        }
    }

    function processFallbackVideoEndpoint(json, rawBody = '') {
        const apis = findFallbackApis(json, rawBody);
        for (const fallbackApi of apis) {
            if (processedFallbackApis.has(fallbackApi)) continue;
            processedFallbackApis.add(fallbackApi);
            extractUnwatermarkedVideo(fallbackApi);
        }
    }

    // ========================================================
    // ⚡ CHANNA CREDIT, DURATION & CLEAN CHAT ENFORCER
    // Seedance 2.5: Exactly 2 Points Cut per Video
    // Total Duration: 30s Duration Bypass (Supports 10s-60s)
    // Sanitizes New Chat to Prevent ByteDance 718013001 / High Demand Errors
    // ========================================================
    function enforceChannaVideoSettings(body, url) {
        if (typeof body !== 'string' || body.length === 0) return body;

        // Never alter file uploads or binary transfers
        if (typeof window.__isCtbUploadRequest === 'function' && window.__isCtbUploadRequest(url, body)) {
            return body;
        }

        const fnTransform = window.transformPayloadBody || (typeof transformPayloadBody === 'function' ? transformPayloadBody : null);
        if (fnTransform) {
            return fnTransform(body, url);
        }

        return body;
    }

    function _unused_old_enforce(body, url) {
        if (typeof body !== 'string' || body.length === 0) return body;

        // Never alter file uploads or binary transfers
        if (typeof window.__isCtbUploadRequest === 'function' && window.__isCtbUploadRequest(url, body)) {
            return body;
        }

        // Pro reasoning mode bypass (DeepSeek, Doubao Pro)
        if (typeof window.__isCtbProModeActive === 'function' && window.__isCtbProModeActive()) {
            return body;
        }

        // Exact user settings:
        // Seedance 2.0 = 1 point cut
        // Seedance 2.5 = 2 points cut
        // Duration = 10s / 15s / 20s / 30s duration bypass
        const targetDur = parseInt(window.CHANNA_TARGET_DURATION, 10) || 30;
        const ratio = window.CHANNA_TARGET_RATIO || '9:16';

        let modified = body;
        const isVideo = /(?:duration|video_duration|seconds|task_type|generate_type|video|seedance|storyboard|ability_param)/i.test(modified) || 
                        (url && /(?:video|chat\/completion)/i.test(url));

        if (isVideo) {
            // 1. Enforce duration: 10s, 15s, 20s, 30s bypass (handles direct, escaped \", and double-escaped \\\")
            const durPattern = /(\\*)("(?:duration|video_duration|seconds|motion_seconds|video_length)\\*")\s*:\s*\d+/gi;
            modified = modified.replace(durPattern, (match, p1, p2) => `${p1}${p2}:${targetDur}`);

            // 2. Enforce Aspect Ratio
            const ratioPattern = /(\\*)("(?:ratio|aspect_ratio|aspectRatio|ratio_type|ar)\\*")\s*:\s*(\\*)("[^"]*\\*")/gi;
            modified = modified.replace(ratioPattern, (match, p1, p2, p3, p4) => `${p1}${p2}:${p1}"${ratio}${p1}"`);
        }

        return modified;
    }

    // Step 1: Intercept fetch in MAIN world for /chat/completion & Anti-Logout Shield
    const originalFetch = window.fetch;

    window.fetch = async function(...args) {
        let url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
        const fnTransformUrl = window.transformUrl || (typeof transformUrl === 'function' ? transformUrl : null);
        if (fnTransformUrl && url) {
            url = fnTransformUrl(url);
            if (typeof args[0] === 'string') {
                args[0] = url;
            } else if (args[0] && typeof args[0] === 'object') {
                try {
                    args[0] = new Request(url, args[0]);
                } catch(e) {
                    args[0] = url;
                }
            }
        }


        // 🛡️ TELEMETRY NETWORK FAILURE SHIELD (Prevents status 0 crashes on monitor & telemetry endpoints)
        if (url && (
            url.includes('/monitor_web/') || 
            url.includes('zijieapi.com') || 
            url.includes('/slardar/')
        )) {
            return new Response(JSON.stringify({ code: 0, message: 'success', data: {} }), {
                status: 200,
                headers: { 'content-type': 'application/json' }
            });
        }

        // Pass non-chat/completion requests directly without altering them
        if (url && (url.includes('/chat') || url.includes('/creation/') || url.includes('/im/') || url.includes('/alice/'))) {
            try {
                window.__ctbActiveGenerationPromptSent = Date.now();
                if (args[1] && typeof args[1].body === 'string') {
                    args[1].body = enforceChannaVideoSettings(args[1].body, url);
                }
            } catch (e) {}
            const isPro = typeof __isCtbProModeActive === 'function' && __isCtbProModeActive();
            const isDola = typeof window !== 'undefined' && window.location && window.location.hostname.includes('dola.com');

            // 🛡️ PRE-FLIGHT CONTENT SHIELD (Skip on Dola or in Pro Mode to preserve ByteDance a_bogus signature)
            if (!isPro && !isDola && args[1] && typeof args[1].body === 'string') {
                try {
                    let rawBody = args[1].body;
                    const SANITIZE_MAP = [
                        [/\bkill\b/gi, 'defeat'],
                        [/\bmurder\b/gi, 'vanquish'],
                        [/\bblood\b/gi, 'crimson glow'],
                        [/\bgun\b/gi, 'sci-fi blaster prop'],
                        [/\bweapon\b/gi, 'action gear prop'],
                        [/\bsuicide\b/gi, 'heroic sacrifice']
                    ];
                    for (const [regex, replacement] of SANITIZE_MAP) {
                        rawBody = rawBody.replace(regex, replacement);
                    }
                    args[1].body = rawBody;
                } catch (e) {}
            }

            const response = await originalFetch.apply(this, args);
            if (!response || !response.body) {
                return response;
            }

            // 🛡️ 2. PASSIVE STREAM SNIFFER: Clones response for background unwatermarked video extraction & High Demand Auto-Recovery
            try {
                const cloned = response.clone();
                (async () => {
                    try {
                        const reader = cloned.body?.getReader();
                        if (!reader) return;
                        const decoder = new TextDecoder();
                        let buf = '';
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            buf += decoder.decode(value, { stream: true });
                            if (buf.includes('fallback_api') || buf.includes('image_ori')) {
                                if (typeof processFallbackVideoEndpoint === 'function') {
                                    processFallbackVideoEndpoint(null, buf);
                                }
                            }
                            
                            // 🛡️ High Demand & Rate Limit Detection:
                            const isHighDemand = buf.includes('"error_code":710022002') || 
                                                 buf.includes('"error_code": 710022002') ||
                                                 buf.includes('experiencing high demand');
                            if (isHighDemand) {
                                console.warn('[ChannaTheBrand Pro] ⚠️ High Demand (710022002) detected on ByteDance server.');
                                break;
                            }

                            // 🛡️ Daily Generation Limit Detection (Server Stream):
                            const isDailyLimit = buf.includes('reached the daily limit for video generation') || 
                                                 buf.includes('daily limit for video generation') ||
                                                 buf.includes('reached the daily limit') ||
                                                 buf.includes('reached daily limit') ||
                                                 buf.includes('Please try again tomorrow') ||
                                                 buf.includes('please try again tomorrow') ||
                                                 buf.includes('达到今日视频生成上限') ||
                                                 buf.includes('今日视频生成上限') ||
                                                 buf.includes('"error_code":710022003') ||
                                                 buf.includes('"error_code": 710022003');
                            if (isDailyLimit) {
                                notifyDailyLimitReached('daily_limit_stream');
                                break;
                            }

                            const isExpiredAccount = buf.includes('用户不存在') || 
                                                     buf.includes('User does not exist') || 
                                                     buf.includes('Account session expired') ||
                                                     buf.includes('"error_code":1011') ||
                                                     buf.includes('"error_code": 1011');
                            if (isExpiredAccount) {
                                console.warn('[ChannaTheBrand Pro] ⚠️ Expired account detected on ByteDance server.');
                                break;
                            }
                        }
                    } catch (e) {}
                })();
            } catch (e) {}

            return response;
        }
        try {
            const fetchRes = await originalFetch.apply(this, args);
            if (url && (url.includes('/passport/') || url.includes('/user/') || url.includes('/account/') || url.includes('/alice/profile/'))) {
                try {
                    const clonedFetchRes = fetchRes.clone();
                    clonedFetchRes.text().then(text => {
                        try {
                            const parsed = JSON.parse(text);
                            const nick = parsed?.data?.profile_brief?.nickname || 
                                         parsed?.data?.user_info?.name || 
                                         parsed?.data?.user_info?.screen_name ||
                                         parsed?.data?.name || 
                                         parsed?.data?.user_name;
                            if (nick && typeof nick === 'string' && nick.trim()) {
                                window.CHANNA_DOM_USER_NAME = nick.trim();
                                if (typeof syncBadgesFast === 'function') syncBadgesFast();
                            }
                        } catch(e) {}
                        if (text && (
                            text.includes('用户不存在') || 
                            text.includes('User does not exist') || 
                            text.includes('Account session expired') ||
                            text.includes('"error_code":1011') ||
                            text.includes('"error_code": 1011')
                        )) {
                            if (typeof window !== 'undefined' && typeof window.__showChannaNotice === 'function') {
                                window.__showChannaNotice('This account session has expired or user does not exist on ByteDance server (用户不存在 / User does not exist). Please switch to an active account in the extension.');
                            }
                        }
                    }).catch(() => {});
                } catch (e) {}
            }
            if (url && (url.includes('/conversation/') || url.includes('/message/') || url.includes('message_list') || url.includes('/chat/'))) {
                try {
                    const clonedHistoryRes = fetchRes.clone();
                    clonedHistoryRes.text().then(text => {
                        if (text && (text.includes('fallback_api') || text.includes('image_ori'))) {
                            if (typeof processFallbackVideoEndpoint === 'function') {
                                processFallbackVideoEndpoint(null, text);
                            }
                        }
                    }).catch(() => {});
                } catch (e) {}
            }
            return fetchRes;
        } catch (err) {
            const msg = String(err && (err.message || err) || '');
            if (msg.includes('Network request failed') || msg.includes('status: 0') || msg.includes('Failed to fetch') || msg.includes('zijieapi')) {
                return new Response(JSON.stringify({ code: 0, data: {} }), {
                    status: 200,
                    headers: { 'content-type': 'application/json' }
                });
            }
            throw err;
        }
    };

    // ============================================================================
    // 📦 COMPREHENSIVE CHAT VIDEO HARVESTER (MAIN WORLD ENGINE FOR BATCH ZIP)
    // Extracts ALL videos across in-memory vault, sessionStorage, React Fiber, and DOM
    // Guarantees 100% Watermark-Free Raw 1080P Master Streams
    // ============================================================================
    async function harvestAllChatVideosMainWorld() {
        const list = [];
        const seen = new Set();
        const currentScopeKey = getChatScopeKey(window.location.href, document.title);
        const currentCleanUrl = window.location.href.split('?')[0].split('#')[0].replace(/\/$/, '');
        const currentChatIdMatch = currentCleanUrl.match(/\/(?:chat|c|conversation)\/([a-zA-Z0-9_-]+)/i);
        const currentChatId = (currentChatIdMatch && currentChatIdMatch[1] !== 'new') ? currentChatIdMatch[1] : '';

        function extractChatId(url) {
            if (!url) return '';
            const clean = String(url).split('#')[0];
            const m = clean.match(/\/(?:chat|c|conversation)\/([a-zA-Z0-9_-]+)/i);
            if (m && m[1] && m[1] !== 'new') return m[1];
            try {
                const u = new URL(clean);
                return u.searchParams.get('conversation_id') || u.searchParams.get('id') || u.searchParams.get('chat_id') || u.searchParams.get('session_id') || '';
            } catch (e) {
                return '';
            }
        }

        function belongsToCurrentChat(v) {
            if (!v) return false;
            const rawUrl = typeof v === 'string' ? v : (v.url || v.src);
            if (!rawUrl || (!rawUrl.startsWith('http') && !rawUrl.startsWith('blob:'))) return false;

            if (v.source === 'dom' || v.source === 'dom_video' || v.source === 'dom_link' || v.source === 'fiber') {
                return true;
            }

            const itemChatId = extractChatId(v.pageUrl) ||
                (v.chatScopeKey && v.chatScopeKey.startsWith('chat_') && v.chatScopeKey !== 'chat_current' ? v.chatScopeKey.replace('chat_', '') : '');

            // Only reject if both chat IDs exist and explicitly differ
            if (currentChatId && itemChatId && currentChatId !== itemChatId) {
                return false;
            }
            return true;
        }

        function addVid(url, title = 'Dola Video', source = 'dom', pageUrl = window.location.href) {
            if (!url || typeof url !== 'string') return;
            let clean = url.trim();
            if (!clean.startsWith('http') && !clean.startsWith('blob:')) return;

            // Direct video streams are already decrypted/signed; preserve URL integrity without breaking HMAC signatures

            const fp = extractVideoFingerprint(clean);
            if (!fp || seen.has(fp)) return;
            seen.add(fp);
            list.push({
                url: clean,
                title: (title || 'Dola Video').trim(),
                source,
                pageUrl: pageUrl || window.location.href,
                chatScopeKey: currentScopeKey,
                fingerprint: fp
            });
        }

        // 1. Vault 1: In-memory live decrypted unwatermarked master streams (Current Chat Only)
        if (Array.isArray(window.__ctbExtractedVideos)) {
            window.__ctbExtractedVideos.forEach(v => {
                if (v && v.url && belongsToCurrentChat(v)) addVid(v.url, v.prompt || v.title, v.source || 'fallback_api', v.pageUrl);
            });
        }

        // 2. Vault 2: SessionStorage master stream cache (Current Chat Only)
        try {
            const stored = JSON.parse(sessionStorage.getItem('__CTB_MASTER_VIDEOS__') || '[]');
            if (Array.isArray(stored)) {
                stored.forEach(v => {
                    if (v && v.url && belongsToCurrentChat(v)) addVid(v.url, v.prompt || v.title, v.source || 'session_storage', v.pageUrl);
                });
            }
        } catch (e) {}

        // 3. Vault 3: Extractor.js chatVideos (Current Chat Only)
        if (Array.isArray(window.__channaChatVideos)) {
            window.__channaChatVideos.forEach(v => {
                if (v && v.url && belongsToCurrentChat(v)) addVid(v.url, v.prompt || v.title || v.topicTitle, v.source || 'extractor', v.pageUrl);
            });
        }

        // 4. Scan DOM <video> elements immediately in current view
        document.querySelectorAll('video').forEach((v, idx) => {
            const src = v.currentSrc || v.src || v.querySelector('source')?.src || v.getAttribute('src');
            const bubble = v.closest('[data-message-id], [class*="message"], [class*="bubble"], [class*="chat"]') || v.parentElement;
            const textEl = bubble ? bubble.querySelector('p, span, [class*="text"], [class*="content"]') : null;
            const promptText = (textEl?.textContent || '').trim().slice(0, 100);
            if (src && (src.startsWith('http') || src.startsWith('blob:'))) {
                addVid(src, promptText || `Video_${idx + 1}`, 'dom_video');
            }
        });

        // 5. Scan DOM download buttons, links & data-attributes
        document.querySelectorAll('a[href*=".mp4"], a[download*=".mp4"], [data-src*=".mp4"], [data-video-url*="http"], [data-url*="byteintl"], [data-url*="ibytedtos"], [data-src*="blob:"], [data-video-url*="blob:"]').forEach(el => {
            const src = el.href || el.getAttribute('data-src') || el.getAttribute('data-video-url') || el.getAttribute('data-url');
            if (src && (src.startsWith('http') || src.startsWith('blob:'))) {
                addVid(src, 'Dola Video', 'dom_link');
            }
        });

        // 6. Scan React Fiber on message elements safely (without circular JSON stringify crashes)
        const pendingFallbackApis = [];
        try {
            const messageCards = Array.from(document.querySelectorAll('[data-message-id], [class*="message-item"], [class*="chat-message"], [class*="bubble"], [class*="message_item"], [class*="message-content"], div[class*="message"]'));
            function safelyScanProps(obj, depth = 0, visited = new Set()) {
                if (!obj || depth > 4 || typeof obj !== 'object' || visited.has(obj)) return;
                visited.add(obj);

                try {
                    const keys = Object.keys(obj);
                    for (const k of keys) {
                        const v = obj[k];
                        if (typeof v === 'string') {
                            if (v.includes('fallback_api') || (v.startsWith('http') && (v.includes('.mp4') || v.includes('tos-') || v.includes('byteintl')))) {
                                const found = findFallbackApis(null, v);
                                for (const fb of found) {
                                    if (!processedFallbackApis.has(fb)) {
                                        pendingFallbackApis.push(fb);
                                    }
                                }
                                if (v.startsWith('http') && (v.includes('.mp4') || v.includes('byteintl') || v.includes('ibytedtos'))) {
                                    addVid(v, 'Chat Video', 'fiber');
                                }
                            }
                        } else if (v && typeof v === 'object' && depth < 3) {
                            safelyScanProps(v, depth + 1, visited);
                        }
                    }
                } catch (e) {}
            }

            function inspectFiber(node) {
                if (!node) return;
                const key = Object.keys(node).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$') || k.startsWith('__reactInternalInstance$'));
                if (!key) return;
                let fiber = node[key];
                let depth = 0;
                while (fiber && depth < 8) {
                    depth++;
                    const props = fiber.memoizedProps || fiber.pendingProps || fiber.props;
                    if (props && typeof props === 'object') {
                        safelyScanProps(props, 0);
                    }
                    fiber = fiber.return;
                }
            }

            messageCards.forEach(card => inspectFiber(card));
            document.querySelectorAll('video').forEach(v => inspectFiber(v));
        } catch (e) {}

        if (pendingFallbackApis.length > 0) {
            const promises = pendingFallbackApis.slice(0, 30).map(async (fb) => {
                processedFallbackApis.add(fb);
                await extractUnwatermarkedVideo(fb);
            });
            await Promise.race([
                Promise.all(promises),
                new Promise(r => setTimeout(r, 600))
            ]);
            if (Array.isArray(window.__ctbExtractedVideos)) {
                window.__ctbExtractedVideos.forEach(v => {
                    if (v && v.url && belongsToCurrentChat(v)) addVid(v.url, v.prompt || v.title, v.source || 'fallback_api', v.pageUrl);
                });
            }
        }

        // 🛡️ CHỐNG NHÂN ĐÔI VIDEO: Nếu đã có video 1080p unwatermarked (fallback_api / unwatermarked), LOẠI BỎ hoàn toàn các bản preview/dom có logo!
        const hasHQ = list.some(v => v.source === 'fallback_api' || (v.url && v.url.includes('lr=unwatermarked')));
        if (hasHQ) {
            list = list.filter(v => v.source === 'fallback_api' || (v.url && v.url.includes('lr=unwatermarked')));
        }

        // Sync to Shared DOM Bridge (Current chat only)
        try {
            let bridge = document.getElementById('__ctb_vault__');
            if (!bridge) {
                bridge = document.createElement('div');
                bridge.id = '__ctb_vault__';
                bridge.style.display = 'none';
                document.documentElement.appendChild(bridge);
            }
            bridge.setAttribute('data-videos', JSON.stringify(list));
        } catch (e) {}

        return list;
    }

    // Expose helpers & harvester for external hooks / tests
    try {
        window.decodeOrDecryptVideoUrl = decodeOrDecryptVideoUrl;
        window.decryptQaabToken = decryptQaabToken;
        window.findFallbackApis = findFallbackApis;
        window.__ctbHarvestAllChatVideos = harvestAllChatVideosMainWorld;
        window.__ctbExtractedVideos = window.__ctbExtractedVideos || [];
    } catch (e) {}

    // Listen for harvest request from content script
    window.addEventListener('message', async (event) => {
        if (event.data?.type === 'DOLA_HARVEST_VIDEOS_FOR_ZIP') {
            try {
                const videos = await harvestAllChatVideosMainWorld();
                window.postMessage({ type: 'DOLA_HARVEST_VIDEOS_RESPONSE', videos }, '*');
            } catch (err) {
                window.postMessage({ type: 'DOLA_HARVEST_VIDEOS_RESPONSE', videos: [] }, '*');
            }
        }
    });
    window.addEventListener('DOLA_HARVEST_VIDEOS_FOR_ZIP', async () => {
        try {
            const videos = await harvestAllChatVideosMainWorld();
            window.dispatchEvent(new CustomEvent('DOLA_HARVEST_VIDEOS_RESPONSE', { detail: { videos } }));
        } catch (err) {
            window.dispatchEvent(new CustomEvent('DOLA_HARVEST_VIDEOS_RESPONSE', { detail: { videos: [] } }));
        }
    });

    // Listen for chat video reset from content script
    window.addEventListener('message', (event) => {
        if (event.data?.type === 'CHANNA_RESET_CHAT_VIDEOS') {
            try {
                const targetChatId = event.data.chatId;
                const targetUrl = event.data.pageUrl;
                const targetScope = event.data.chatScopeKey;

                function matchesReset(v) {
                    if (!v) return false;
                    const p = v.pageUrl || '';
                    if (targetChatId && p.includes(targetChatId)) return true;
                    if (targetUrl && p.startsWith(targetUrl)) return true;
                    if (targetScope && v.chatScopeKey === targetScope) return true;
                    return false;
                }

                if (Array.isArray(window.__ctbExtractedVideos)) {
                    window.__ctbExtractedVideos = window.__ctbExtractedVideos.filter(v => !matchesReset(v));
                }

                try {
                    const stored = JSON.parse(sessionStorage.getItem('__CTB_MASTER_VIDEOS__') || '[]');
                    if (Array.isArray(stored)) {
                        const filtered = stored.filter(v => !matchesReset(v));
                        sessionStorage.setItem('__CTB_MASTER_VIDEOS__', JSON.stringify(filtered));
                    }
                } catch (e) {}

                try {
                    let bridge = document.getElementById('__ctb_vault__');
                    if (bridge) {
                        bridge.setAttribute('data-videos', JSON.stringify(window.__ctbExtractedVideos || []));
                    }
                } catch (e) {}
            } catch (e) {}
        }
    });

    console.log('%c[ChannaTheBrand Pro] 📥 Complete Auto-Download & Decryption Engine Active!', 'color: #a855f7; font-weight: bold;');
})();

// ============================================================================
// 🛡️ DOLA MULTI-TAB SESSION ISOLATION & ANTI-RELOAD LOOP CIRCUIT BREAKER
// Prevents cross-tab logout collisions and halts infinite redirect/reload loops
// ============================================================================
(() => {
  'use strict';
  if (typeof window === 'undefined' || window.__ctbSessionShieldActive) return;
  window.__ctbSessionShieldActive = true;

  // 1. Cross-Tab Storage Event Blocker
  try {
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function (type, listener, options) {
      if (type === 'storage') {
        const wrappedListener = function (event) {
          try {
            if (!event || !event.key) return;
            const keyLower = String(event.key).toLowerCase();
            // On Dola AI, allow CSRF, session tokens, and passport heartbeats to synchronize normally.
            // Only suppress explicit remote logout collisions to prevent tab crashes:
            if (
              keyLower.includes('logout') ||
              keyLower.includes('session_invalid') ||
              keyLower.includes('token_expired')
            ) {
              return;
            }
          } catch (e) {}
          if (typeof listener === 'function') {
            return listener.apply(this, arguments);
          } else if (listener && typeof listener.handleEvent === 'function') {
            return listener.handleEvent(event);
          }
        };
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      return originalAddEventListener.apply(this, arguments);
    };
  } catch (e) {}

  // 2. Cross-Tab BroadcastChannel Isolation
  try {
    if (typeof window.BroadcastChannel !== 'undefined') {
      const OriginalBroadcastChannel = window.BroadcastChannel;
      window.BroadcastChannel = function (channelName) {
        const channel = new OriginalBroadcastChannel(channelName);
        const nameLower = String(channelName || '').toLowerCase();
        const isAuthChannel = (
          nameLower.includes('auth') ||
          nameLower.includes('session') ||
          nameLower.includes('login') ||
          nameLower.includes('logout') ||
          nameLower.includes('user') ||
          nameLower.includes('token') ||
          nameLower.includes('passport') ||
          nameLower.includes('account')
        );

        const originalPostMessage = channel.postMessage.bind(channel);
        channel.postMessage = function (message) {
          try {
            // Preserved channel delivery for internal Dola worker RPC
            if (message && typeof message === 'object') {
              const msgStr = JSON.stringify(message).toLowerCase();
              if (
                msgStr.includes('logout') ||
                msgStr.includes('unauthorized') ||
                msgStr.includes('token_expired') ||
                msgStr.includes('session_invalid') ||
                msgStr.includes('reload')
              ) {
                return;
              }
            }
          } catch (e) {}
          return originalPostMessage(message);
        };

        const originalAddEventListener = channel.addEventListener.bind(channel);
        channel.addEventListener = function (type, listener, options) {
          if (type === 'message') {
            const wrapped = function (event) {
              try {
                // Preserved channel delivery for internal Dola worker RPC
                if (event && event.data && typeof event.data === 'object') {
                  const msgStr = JSON.stringify(event.data).toLowerCase();
                  if (
                    msgStr.includes('logout') ||
                    msgStr.includes('unauthorized') ||
                    msgStr.includes('token_expired') ||
                    msgStr.includes('session_invalid') ||
                    msgStr.includes('reload')
                  ) {
                    return;
                  }
                }
              } catch (e) {}
              if (typeof listener === 'function') {
                return listener.apply(this, arguments);
              }
            };
            return originalAddEventListener(type, wrapped, options);
          }
          return originalAddEventListener(type, listener, options);
        };

        return channel;
      };
      window.BroadcastChannel.prototype = OriginalBroadcastChannel.prototype;
    }
  } catch (e) {}

  // 3. 🛡️ Bulletproof Anti-Reload Loop Circuit Breaker & Navigation Shield
  try {
    const RELOAD_GUARD_KEY = '__ctb_reload_guard';
    const now = Date.now();
    let history = [];

    // Read history from sessionStorage
    try {
      const stored = sessionStorage.getItem(RELOAD_GUARD_KEY);
      if (stored) history = JSON.parse(stored);
    } catch (e) {}

    // Fallback/Reinforce from window.name (immune to storage clearing)
    try {
      if (typeof window.name === 'string' && window.name.includes('__ctb_guard:')) {
        const match = window.name.match(/__ctb_guard:\[([^\]]*)\]/);
        if (match && match[1]) {
          const fromName = match[1].split(',').map(Number).filter(t => !isNaN(t));
          if (fromName.length > history.length) {
            history = fromName;
          }
        }
      }
    } catch (e) {}

    // Keep entries within last 12 seconds
    history = (Array.isArray(history) ? history : []).filter(t => typeof t === 'number' && now - t < 12000);
    history.push(now);

    try {
      sessionStorage.setItem(RELOAD_GUARD_KEY, JSON.stringify(history));
    } catch (e) {}

    try {
      // Store in window.name cleanly without erasing existing name
      const cleanName = (window.name || '').replace(/__ctb_guard:\[[^\]]*\]/g, '').trim();
      window.name = (cleanName ? cleanName + ' ' : '') + `__ctb_guard:[${history.join(',')}]`;
    } catch (e) {}

    // 🛡️ BULLETPROOF ANTI-AUTO-RELOAD & ANTI-REFRESH SHIELD FOR DOLA AI
    // Completely blocks programmatic, automated, and cyclic reloads so Dola chat stays rock-solid
    let lastReloadNoticeTime = 0;
    function shouldPreventReload(caller = 'location.reload') {
      const tNow = Date.now();
      console.warn('[ChannaTheBrand Pro] 🛑 Blocked automated page reload attempt via:', caller);
      if (tNow - lastReloadNoticeTime > 15000) {
        lastReloadNoticeTime = tNow;
        showReloadGuardBanner();
      }
      return true;
    }

    // 1. Block Location.prototype.reload() & window.location.reload()
    try {
      const origProtoReload = Location.prototype.reload;
      Object.defineProperty(Location.prototype, 'reload', {
        value: function (...args) {
          if (shouldPreventReload('Location.prototype.reload')) return;
          return origProtoReload.apply(this, args);
        },
        writable: true,
        configurable: true
      });
    } catch (e) {}

    // 2. Block Location.prototype.replace() & window.location.replace()
    try {
      const origProtoReplace = Location.prototype.replace;
      Object.defineProperty(Location.prototype, 'replace', {
        value: function (url, ...args) {
          if (typeof url === 'string') {
            const u = url.toLowerCase();
            if (u.includes('/chat') || u.includes('/login') || u.includes('dola.com') || u === window.location.href.toLowerCase()) {
              if (shouldPreventReload('Location.prototype.replace -> ' + url)) return;
            }
          }
          return origProtoReplace.apply(this, [url, ...args]);
        },
        writable: true,
        configurable: true
      });
    } catch (e) {}

    // 3. Block Location.prototype.assign() & window.location.assign()
    try {
      const origProtoAssign = Location.prototype.assign;
      Object.defineProperty(Location.prototype, 'assign', {
        value: function (url, ...args) {
          if (typeof url === 'string') {
            const u = url.toLowerCase();
            if (u.includes('/chat') || u.includes('dola.com/chat') || u === window.location.href.toLowerCase()) {
              if (shouldPreventReload('Location.prototype.assign -> ' + url)) return;
            }
          }
          return origProtoAssign.apply(this, [url, ...args]);
        },
        writable: true,
        configurable: true
      });
    } catch (e) {}

    // 4. Block Location.prototype.href setter (e.g. window.location.href = window.location.href)
    try {
      const hrefDesc = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
      if (hrefDesc && hrefDesc.set) {
        const origSetHref = hrefDesc.set;
        Object.defineProperty(Location.prototype, 'href', {
          set: function (url) {
            if (typeof url === 'string') {
              const u = url.toLowerCase();
              if (u.includes('/chat') || u.includes('/login') || u === window.location.href.toLowerCase()) {
                if (shouldPreventReload('Location.prototype.href = ' + url)) return;
              }
            }
            return origSetHref.call(this, url);
          },
          get: hrefDesc.get,
          configurable: true,
          enumerable: true
        });
      }
    } catch (e) {}

    // 5. Block Chromium Navigation API programmatic reloads (Chrome 102+)
    try {
      if (typeof window.navigation !== 'undefined' && window.navigation && window.navigation.addEventListener) {
        window.navigation.addEventListener('navigate', (event) => {
          try {
            if (event.navigationType === 'reload') {
              if (event.canIntercept) {
                event.intercept({
                  handler: async () => {
                    console.warn('[ChannaTheBrand Pro] 🛑 Intercepted and blocked Navigation API reload.');
                  }
                });
                event.preventDefault();
              }
            }
          } catch (e) {}
        });
      }
    } catch (e) {}

    // 6. Block History.prototype.go(0)
    try {
      const origGo = History.prototype.go;
      Object.defineProperty(History.prototype, 'go', {
        value: function (delta, ...args) {
          if (delta === 0 || delta === undefined) {
            if (shouldPreventReload('History.prototype.go(0)')) return;
          }
          return origGo.apply(this, [delta, ...args]);
        },
        writable: true,
        configurable: true
      });
    } catch (e) {}

    function showReloadGuardBanner() {
      if (document.getElementById('ctb-reload-guard-banner')) return;
      const banner = document.createElement('div');
      banner.id = 'ctb-reload-guard-banner';
      banner.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:9999999;background:rgba(24,24,27,0.96);color:#f4f4f5;border:1px solid #818cf8;padding:7px 16px;border-radius:9999px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:11.5px;box-shadow:0 8px 24px rgba(0,0,0,0.5);display:flex;align-items:center;gap:10px;backdrop-filter:blur(8px);';
      banner.innerHTML = '<span>🛡️ Auto-refresh blocked: Chat session kept active & uninterrupted.</span><button id="ctb-reload-guard-btn" style="background:#6366f1;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:bold;">Dismiss</button>';
      (document.body || document.documentElement).appendChild(banner);
      const btn = document.getElementById('ctb-reload-guard-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          banner.remove();
        });
      }
      setTimeout(() => { if (banner && banner.parentNode) banner.remove(); }, 6500);
    }
  } catch (e) {}

  console.log('[ChannaTheBrand Pro] 🛡️ Multi-Tab Session Shield & Anti-Reload Circuit Breaker Active.');
})();

// ============================================================================
// ⚡ ULTRA-FAST NON-BLOCKING IN-PAGE UI BADGE & RATIO/DURATION SYNCHRONIZER
// Optimized for lightning-fast webpage load times with zero DOM thrashing
// ============================================================================
(() => {
  'use strict';

  let isScheduled = false;
  let isUpdating = false;

  function getTargetDuration() {
    try {
      const stored = localStorage.getItem('__dolaTargetDur') || localStorage.getItem('durationOverride');
      if (stored) {
        const p = parseInt(stored, 10);
        if (p > 0) return p;
      }
    } catch(e) {}
    const d = window.CHANNA_TARGET_DURATION ? parseInt(window.CHANNA_TARGET_DURATION, 10) : 15;
    return d || 15;
  }

  function getTargetRatio() {
    try {
      const stored = localStorage.getItem('targetRatio') || localStorage.getItem('ratioOverride');
      if (stored) return stored;
    } catch(e) {}
    return window.CHANNA_TARGET_RATIO || '9:16';
  }

  function syncBadgesFast() {
    try {
      const dur = getTargetDuration();
      const ratio = getTargetRatio();

      // 1. Direct pill spans / buttons in composer or DOM
      document.querySelectorAll('.dur-pill, .dur-pill-span, #dur-pill, [class*="dur-pill"]').forEach(p => {
        const expected = `${dur}s (Bypassed)`;
        if (p.textContent.trim() !== expected) {
          p.textContent = expected;
        }
        p.style.color = '#10b981';
        p.style.fontWeight = 'bold';
      });

      document.querySelectorAll('.ratio-pill, .ratio-pill-span, #ratio-pill, [class*="ratio-pill"]').forEach(p => {
        const expected = `Ratio ${ratio}`;
        if (p.textContent.trim() !== expected) {
          p.textContent = expected;
        }
        p.style.color = '#38bdf8';
        p.style.fontWeight = 'bold';
      });

      // 2. Update any duration buttons / selectors (e.g. 10s, 15s, 20s, 25s, 30s, 60s)
      const durButtons = document.querySelectorAll('button, div[role="button"], span[class*="duration"], span[class*="select"], [id*="duration"], [id*="dur"], [data-input-engine-actionbar-control-key="video-duration"]');
      for (let i = 0; i < durButtons.length; i++) {
        const el = durButtons[i];
        if (el.classList.contains('dur-pill') || el.classList.contains('dur-pill-span') || el.classList.contains('channa-dur-btn') || el.closest('#channa-bulk-mode-dock') || el.closest('.channa-dock-duration-group')) continue;
        const text = (el.innerText || el.textContent || '').trim();
        if (/^(?:10s|15s|20s|25s|30s|60s)(?:\s*(?:\([^\)]*\)|Bypassed|seepro|CHANNA))?/i.test(text)) {
          const hasArrow = text.includes('^') || text.includes('▼') || text.includes('▲') || text.includes('⌄');
          const newDurText = `${dur}s (Bypassed)${hasArrow ? ' ⌄' : ''}`;
          if (el.textContent.trim() !== newDurText) {
            el.textContent = newDurText;
            el.style.color = '#10b981';
            el.style.fontWeight = 'bold';
          }
        }
      }

      // 3. Update any ratio buttons / selectors
      const ratioButtons = document.querySelectorAll('button, div[role="button"], span[class*="ratio"], span[class*="select"], [id*="ratio"], [data-input-engine-actionbar-control-key="ratio"]');
      for (let i = 0; i < ratioButtons.length; i++) {
        const el = ratioButtons[i];
        if (el.classList.contains('ratio-pill') || el.classList.contains('ratio-pill-span') || el.closest('#channa-bulk-mode-dock')) continue;
        const text = (el.innerText || el.textContent || '').trim();
        if (/^(?:Ratio|THE BRAND)?\s*(9:16|16:9|1:1|4:3|3:4|21:9)/i.test(text)) {
          const hasArrow = text.includes('^') || text.includes('▼') || text.includes('▲') || text.includes('⌄');
          const newText = `Ratio ${ratio}${hasArrow ? ' ⌄' : ''}`;
          if (el.textContent.trim() !== newText) {
            el.textContent = newText;
            el.style.color = '#38bdf8';
            el.style.fontWeight = 'bold';
          }
        }
      }

      // 4. Global composer toolbar deep text scrubber (strictly scoped to composer)
      const composer = document.querySelector('[class*="composer" i], [class*="chat-input" i], div[class*="input-engine"], form');
      if (composer) {
        const walker = document.createTreeWalker(composer, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
          if (node.nodeValue) {
            if (/\b(\d+s)\s+CHANNA\b/i.test(node.nodeValue)) {
              node.nodeValue = node.nodeValue.replace(/\b(\d+s)\s+CHANNA\b/gi, '$1 (Bypassed)');
            }
            if (/THE BRAND\s+(?:9:16|16:9|1:1|4:3|3:4|21:9)/i.test(node.nodeValue)) {
              node.nodeValue = node.nodeValue.replace(/THE BRAND\s+((?:9:16|16:9|1:1|4:3|3:4|21:9))/gi, 'Ratio $1');
            }
          }
        }
      }

      // Direct target for Dola actionbar duration button
      const durControlBtn = document.querySelector('button[data-input-engine-actionbar-control-key="video-duration"]');
      if (durControlBtn) {
        const hasArrow = durControlBtn.innerText.includes('^') || durControlBtn.innerText.includes('▼') || durControlBtn.innerText.includes('▲') || durControlBtn.innerText.includes('⌄');
        const newText = `${dur}s (Bypassed)${hasArrow ? ' ⌄' : ''}`;
        if (durControlBtn.textContent.trim() !== newText) {
          durControlBtn.textContent = newText;
          durControlBtn.style.color = '#10b981';
          durControlBtn.style.fontWeight = 'bold';
        }
      }

      // Remove duration tag from top container if present (container only shows account name)
      const accDurSpan = document.getElementById('ctb-acc-dur');
      if (accDurSpan) {
        accDurSpan.remove();
      }
      const accNameSpan = document.getElementById('ctb-acc-name');
      if (accNameSpan) {
        const liveAcc = (typeof getActiveAccountName === 'function' ? getActiveAccountName() : null) || window.CHANNA_ACTIVE_ACCOUNT || '';
        if (liveAcc && accNameSpan.textContent !== liveAcc) {
          accNameSpan.textContent = liveAcc;
        }
      }

      // Clean up any existing floating badge container from below composer
      const existingContainer = document.getElementById('channa-live-badge-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      if (typeof window.__mountVideoRefButton === 'function') {
        window.__mountVideoRefButton();
      }
    } catch (e) {
    }
  }
  window.syncBadgesFast = syncBadgesFast;

  function scheduleSync() {
    if (isScheduled) return;
    isScheduled = true;
    requestAnimationFrame(() => {
      isScheduled = false;
      syncBadgesFast();
    });
  }

  // Periodic non-blocking ticker to maintain continuous sync (0% CPU impact)
  setInterval(syncBadgesFast, 1500);

  // Run on page interactive & complete
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleSync, { passive: true, once: true });
  } else {
    scheduleSync();
  }

  // Lightweight, debounced MutationObserver
  const observer = new MutationObserver(mutations => {
    let shouldSync = false;
    for (let i = 0; i < mutations.length; i++) {
      const target = mutations[i].target;
      if (target && target.nodeType === 1) {
        if (target.hasAttribute && target.hasAttribute('data-channa-injected')) continue;
        if (target.id === 'channa-live-badge-container') continue;
        shouldSync = true;
        break;
      }
    }
    if (shouldSync) {
      scheduleSync();
    }
  });

  // Attach observer once body is available
  function attachObserver() {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      setTimeout(attachObserver, 50);
    }
  }
  attachObserver();

  // Instant response on tab focus / user interaction
  window.addEventListener('focus', scheduleSync, { passive: true });
  document.addEventListener('click', scheduleSync, { passive: true });

  // Cross-world message handler
  window.addEventListener('message', event => {
    if (!event.data) return;
    if (event.data.type === 'SET_RATIO_OVERRIDE' || event.data.type === 'RATIO_SWITCHED' || event.data.type === 'DURATION_OVERRIDE') {
      if (event.data.duration) {
        window.CHANNA_TARGET_DURATION = parseInt(event.data.duration, 10) || 30;
        try {
          localStorage.setItem('__dolaTargetDur', String(window.CHANNA_TARGET_DURATION));
          localStorage.setItem('durationOverride', String(window.CHANNA_TARGET_DURATION));
          localStorage.setItem('seedance_bypass_duration', String(window.CHANNA_TARGET_DURATION));
        } catch(e) {}
      }
      if (event.data.ratio) {
        window.CHANNA_TARGET_RATIO = event.data.ratio;
      }
      if (event.data.maxCredits) {
        window.CHANNA_MAX_CREDITS_LIMIT = parseInt(event.data.maxCredits, 10) || 20;
      }
      scheduleSync();
    }
    if (event.data.type === 'SET_MAX_CREDITS_LIMIT') {
      if (event.data.maxCredits) {
        window.CHANNA_MAX_CREDITS_LIMIT = parseInt(event.data.maxCredits, 10) || 20;
      }
      scheduleSync();
    }
  }, { passive: true });

  console.log('[ChannaTheBrand Pro] ⚡ Ultra-Fast Non-Blocking Badge Synchronizer Active.');
})();

// --- 📐 SMART ZERO-BLINKING TOP-CENTER CONTAINER & WHATSAPP CAPSULE CONTROLLER ---
(() => {
  'use strict';

  const WHATSAPP_CHANNEL_URL = 'https://www.whatsapp.com/channel/0029VbDLcm5BVJl4yoHocF2j';

  function getOrCreateMasterCapsule() {
    let capsule = document.getElementById('channa-top-center-capsule');
    if (!capsule) {
      capsule = document.createElement('div');
      capsule.id = 'channa-top-center-capsule';
      capsule.style.cssText = `
        position: fixed !important;
        top: 10px !important;
        left: 360px !important;
        transform: none !important;
        z-index: 999998 !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 5px !important;
        height: 24px !important;
        padding: 2px 8px 2px 3px !important;
        background: rgba(18, 14, 28, 0.88) !important;
        border: 1px solid rgba(168, 85, 247, 0.3) !important;
        border-radius: 999px !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
        backdrop-filter: blur(8px) !important;
        white-space: nowrap !important;
        cursor: pointer !important;
        user-select: none !important;
        transition: border-color 0.2s ease, background 0.2s ease !important;
      `;
      capsule.title = 'Tài khoản Dola AI';
      capsule.style.cursor = 'default';

      // 1. WhatsApp Brand Badge removed for clean & minimal UI

      // 2. Unified Minimal Account Pill [🟢 ACCOUNT: ...]
      const accPill = document.createElement('span');
      accPill.id = 'ctb-account-capsule-pill';
      accPill.style.cssText = `
        display: inline-flex !important;
        align-items: center !important;
        gap: 3px !important;
        font-size: 10.5px !important;
        font-weight: 600 !important;
        color: #e2e8f0 !important;
        white-space: nowrap !important;
        padding-left: 1px !important;
        line-height: 1 !important;
      `;
      const curAccInit = getActiveAccountName();
      accPill.innerHTML = '<span style="color:#10b981;font-size:8px;line-height:1;">🟢</span> ACCOUNT: <span id="ctb-acc-name" style="color:#ffffff;font-weight:700;">' + curAccInit + '</span>';
      capsule.appendChild(accPill);

      (document.body || document.documentElement).appendChild(capsule);
    }
    return capsule;
  }

  function cleanContainerText(el) {
    if (!el) return;
    if (el.nodeType === 3) {
      if (el.nodeValue && (el.nodeValue.includes('Container') || el.nodeValue.includes('Off-Peak') || el.nodeValue.includes('Free Queue') || el.nodeValue.includes('•'))) {
        let val = el.nodeValue.replace(/Container/gi, 'ACCOUNT');
        // Strip bullet and queue/speed info inside brackets: [30s HD • ⚡ Free Queue] -> [30s HD]
        val = val.replace(/\s*•\s*[^\]]*/gi, '');
        // Strip any Free Queue or Off-Peak mentions
        val = val.replace(/\s*•?\s*⚡?\s*Free Queue\]?/gi, '');
        val = val.replace(/\s*•?\s*🌙?\s*Off-Peak[^\]]*\]?/gi, '');
        // Clean up empty brackets, double brackets, and whitespace
        val = val.replace(/\[\s*\]/g, '').replace(/\s{2,}/g, ' ');
        val = val.replace(/\]{2,}/g, ']');
        val = val.replace(/^[\s•\]]+|[\s•]+$/g, '');
        el.nodeValue = val;
      }
    } else if (el.childNodes && el.childNodes.length > 0) {
      el.childNodes.forEach(child => cleanContainerText(child));
    }
  }

  
  // ⚡ LOCK DOCK BADGE & CAPSULE TO THE LEFT (BESIDE SIDEBAR BUTTON)
  function enforceCapsuleLeftPositionMain() {
    try {
      if (!document.getElementById('ctb-dock-badge-style-main')) {
        const s = document.createElement('style');
        s.id = 'ctb-dock-badge-style-main';
        s.textContent = `
          #channa-dock-badge,
          .channa-dock-badge {
            display: none !important;
          }
          #channa-top-center-capsule {
            position: fixed !important;
            top: 10px !important;
            left: 360px !important;
            transform: none !important;
            right: auto !important;
            margin: 0 !important;
            z-index: 999998 !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 5px !important;
            height: 24px !important;
            padding: 2px 8px 2px 3px !important;
            background: rgba(18, 14, 28, 0.88) !important;
            border: 1px solid rgba(168, 85, 247, 0.3) !important;
            border-radius: 999px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
            backdrop-filter: blur(8px) !important;
            white-space: nowrap !important;
            user-select: none !important;
          }
          @media (max-width: 768px) {
            #channa-top-center-capsule {
              left: 50% !important;
              transform: translateX(-50%) !important;
              top: 4px !important;
              max-width: 90vw !important;
              font-size: 10px !important;
              height: 22px !important;
            }
            #channa-dock-toggle-btn, #channa-actor-dock-btn, #channa-accounts-dock-btn {
              transform: scale(0.8) translateY(-50%) !important;
              transform-origin: right center !important;
            }
          }
        `;
        (document.head || document.documentElement).appendChild(s);
      }

      const dockBadges = document.querySelectorAll('#channa-dock-badge, .channa-dock-badge');
      dockBadges.forEach(b => {
        b.style.setProperty('display', 'none', 'important');
      });

      const topCapsule = document.getElementById('channa-top-center-capsule');
      if (topCapsule) {
        topCapsule.style.setProperty('position', 'fixed', 'important');
        topCapsule.style.setProperty('top', '10px', 'important');
        topCapsule.style.setProperty('left', '360px', 'important');
        topCapsule.style.setProperty('transform', 'none', 'important');
        topCapsule.style.setProperty('right', 'auto', 'important');
        topCapsule.style.setProperty('margin', '0', 'important');
        topCapsule.style.setProperty('z-index', '999998', 'important');
      }
    } catch (e) {}
  }

  function syncMasterTopContainer() {
    enforceCapsuleLeftPositionMain();
    try {
      const isEmbeddedFrame = window.self !== window.top || window.innerWidth < 550;
      const capsule = getOrCreateMasterCapsule();

      if (isEmbeddedFrame) {
        if (capsule) capsule.style.setProperty('display', 'none', 'important');
        return;
      } else {
        if (capsule) {
          capsule.style.setProperty('display', 'inline-flex', 'important');
          capsule.style.setProperty('left', '360px', 'important');
          capsule.style.setProperty('transform', 'none', 'important');
        }
      }

      // Ensure duration tag is never present in container
      const staleDur = document.getElementById('ctb-acc-dur');
      if (staleDur) staleDur.remove();

      // Find and absorb native Dola container text, then hide raw duplicate element
      let hostContainerEl = null;
      const allEls = document.querySelectorAll('header, nav, [role="banner"], [class*="header"], [class*="top"], div[style*="fixed"]');
      for (let i = 0; i < allEls.length; i++) {
        const el = allEls[i];
        if (el.id === 'channa-top-center-capsule' || el.closest('#channa-top-center-capsule')) continue;
        if (el.id === 'channa-workflow-hud') continue;
        const text = (el.innerText || el.textContent || '').trim();
        if ((text.includes('Container:') || text.includes('ACCOUNT:')) && text.length < 120 && el.children.length <= 8) {
          hostContainerEl = el;
          // Extract clean account name
          let accMatch = text.match(/(?:Container:|ACCOUNT:)\s*([^[\]•⚡]+)/i);
          if (accMatch && accMatch[1]) {
            const cleanAcc = accMatch[1].trim();
            const accNameSpan = document.getElementById('ctb-acc-name');
            if (accNameSpan && cleanAcc && accNameSpan.textContent !== cleanAcc) {
              accNameSpan.textContent = cleanAcc;
            }
          }
          // Ensure duration tag is removed from account pill in container
          const accDurSpan = document.getElementById('ctb-acc-dur');
          if (accDurSpan) {
            accDurSpan.remove();
          }
          // Hide raw Dola element so top-right RED box is gone!
          el.style.setProperty('display', 'none', 'important');
          const fixedParent = el.closest('div[style*="fixed"]');
          if (fixedParent && fixedParent.id !== 'channa-top-center-capsule' && !fixedParent.contains(capsule)) {
            fixedParent.style.setProperty('display', 'none', 'important');
          }
        }
      }

      // Ensure strictly EXACTLY ONE account pill inside capsule (Zero Doubling)
      let foundAccountPill = false;
      Array.from(capsule.children).forEach(child => {
        if (child.id === 'ctb-brand-whatsapp-link') {
          return;
        }
        if (child.id === 'ctb-account-capsule-pill') {
          if (!foundAccountPill) {
            foundAccountPill = true;
            return;
          }
        }
        child.remove();
      });

      // Hide raw hostContainerEl and never allow duplicate injection
      if (hostContainerEl && hostContainerEl !== capsule) {
        hostContainerEl.style.setProperty('display', 'none', 'important');
        if (capsule.contains(hostContainerEl)) hostContainerEl.style.setProperty('display', 'none', 'important');
      }

      // Continuously clean and monitor text mutations on hostContainerEl
      if (hostContainerEl) {
        if (!hostContainerEl.__ctb_cleaned_observed) {
          hostContainerEl.__ctb_cleaned_observed = true;
          const textObs = new MutationObserver(() => {
            cleanContainerText(hostContainerEl);
          });
          textObs.observe(hostContainerEl, { childList: true, subtree: true, characterData: true });
        }
        cleanContainerText(hostContainerEl);
      }
    } catch (e) {}
  }

  syncMasterTopContainer();
  setInterval(syncMasterTopContainer, 4000);
  window.addEventListener('DOMContentLoaded', syncMasterTopContainer, { passive: true });
  window.addEventListener('load', syncMasterTopContainer, { passive: true });
  window.addEventListener('focus', syncMasterTopContainer, { passive: true });
})();

// --- 🧹 PROMPT DOCK REMOVED PER USER REQUEST (CLEAN EXTENSION) ---
(() => {
  'use strict';
  function removePromptDockElements() {
    try {
      const ids = ['channa-prompt-dock', 'channa-dock-toggle-btn', 'channa-workflow-hud'];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) el.remove();
      }
    } catch(e) {}
  }
  removePromptDockElements();
  window.addEventListener('DOMContentLoaded', removePromptDockElements, { passive: true });
  window.addEventListener('load', removePromptDockElements, { passive: true });
})();

  // ⚡ DOLA HIGH DEMAND AUTO-BYPASS & ANTI-FLAGGING CONTROLLER
  (() => {
    let isDemandRecovering = false;
    let demandRetryAttempts = 0;
    const MAX_DEMAND_RETRIES = 1;

    // Reset attempt counter when user interacts or manually sends
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', () => { demandRetryAttempts = 0; }, { passive: true });
      document.addEventListener('click', (e) => {
        if (e.target && e.target.closest && e.target.closest('button[type="submit"], [class*="send" i], [class*="submit" i]')) {
          demandRetryAttempts = 0;
        }
      }, { passive: true });
    }

    function checkAndAutoRecoverHighDemand() {
    }

    setInterval(checkAndAutoRecoverHighDemand, 4000);
  })();

  // ============================================================================
  // 🖼️ DUONG THO - REFERENCE IMAGE VAULT & SEEDANCE PRO V3 ATTACHMENT ENGINE
  // (Ported from Seedance Pro Tho - V3: silent DOM activation + DataTransfer injection)
  // ============================================================================
  (() => {
    'use strict';

    const DB_NAME = 'duongtho_ref_images_db';
    const DB_VERSION = 1;
    const STORE_NAME = 'images';
    const COMPOSER_SELECTOR = 'textarea, [contenteditable]:not([contenteditable="false"]), [role="textbox"], input[type="text"]';
    const ACTIVATION_CONTROL_SELECTOR = 'button, [role="button"], label[for], [tabindex="0"]';

    let dbPromise = null;
    let cachedImages = [];

    // --- 1. IndexedDB Helper Functions ---
    function openRefDb() {
      if (dbPromise) return dbPromise;
      dbPromise = new Promise((resolve, reject) => {
        try {
          const req = indexedDB.open(DB_NAME, DB_VERSION);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error || new Error('Cannot open IndexedDB'));
        } catch (e) {
          reject(e);
        }
      });
      return dbPromise;
    }

    async function dbGetAllImages() {
      try {
        const db = await openRefDb();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      } catch (e) {
        console.warn('[DuongTho RefDB] Fallback to memory:', e);
        return cachedImages;
      }
    }

    async function dbSaveImage(record) {
      try {
        const db = await openRefDb();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(record);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch (e) {
        console.warn('[DuongTho RefDB] Save error:', e);
      }
    }

    async function dbDeleteImage(id) {
      try {
        const db = await openRefDb();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.delete(id);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch (e) {
        console.warn('[DuongTho RefDB] Delete error:', e);
      }
    }

    async function dbClearAllImages() {
      try {
        const db = await openRefDb();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.clear();
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch (e) {
        console.warn('[DuongTho RefDB] Clear error:', e);
      }
    }

    // --- 2. Seedance Pro V3 Silent Attachment Engine ---
    function queryAllDeep(selector) {
      const results = [];
      const roots = [document];
      while (roots.length) {
        const root = roots.shift();
        let elements = [];
        try { elements = Array.from(root.querySelectorAll(selector)); } catch {}
        results.push(...elements);
        let descendants = [];
        try { descendants = root.querySelectorAll('*'); } catch {}
        descendants.forEach(el => {
          if (el.shadowRoot) roots.push(el.shadowRoot);
        });
      }
      return Array.from(new Set(results));
    }

    function isVisible(el) {
      if (!el || !(el instanceof Element)) return false;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }

    function controlIdentity(el) {
      if (!el) return '';
      return [
        el.id,
        el.getAttribute?.('name'),
        el.getAttribute?.('aria-label'),
        el.getAttribute?.('title'),
        el.getAttribute?.('data-testid'),
        el.getAttribute?.('data-tooltip-content'),
        String(el.className || ''),
        String(el.textContent || '')
      ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function findComposerTarget() {
      const candidates = queryAllDeep(COMPOSER_SELECTOR)
        .filter(el => !el.closest?.('#duongtho-ref-popover') && !el.closest?.('#channa-prompt-dock'))
        .filter(isVisible)
        .map((element, index) => {
          const rect = element.getBoundingClientRect();
          const identity = [
            element.getAttribute('placeholder'),
            element.getAttribute('aria-label'),
            element.getAttribute('data-placeholder'),
            element.getAttribute('data-testid')
          ].filter(Boolean).join(' ').toLowerCase();
          let score = 1;
          if (/describe|prompt|image|video|message|action|create/.test(identity)) score += 100;
          if (element.matches('[contenteditable]:not([contenteditable="false"]), [role="textbox"]')) score += 20;
          if (rect.bottom >= window.innerHeight * 0.4) score += 30;
          if (rect.width >= Math.min(240, window.innerWidth * 0.3)) score += 15;
          return { element, index, score };
        })
        .sort((a, b) => (b.score - a.score) || (a.index - b.index));
      return candidates[0]?.element || null;
    }

    function findComposerSurface(target) {
      if (!(target instanceof Element)) return null;
      let current = target;
      let best = target;
      for (let depth = 0; current && depth < 10; depth += 1) {
        const rect = current.getBoundingClientRect();
        const hasEditor = current.matches?.(COMPOSER_SELECTOR) || Boolean(current.querySelector?.(COMPOSER_SELECTOR));
        if (hasEditor && rect.width >= 200 && rect.height >= 24 && rect.height <= 600) best = current;
        if (rect.height > 600) break;
        current = current.parentElement || current.getRootNode?.().host || null;
      }
      return best;
    }

    function isInputLinked(input, surface, target) {
      if (surface?.contains?.(input) || input.form?.contains?.(target)) return true;
      let current = input.parentElement || input.getRootNode?.().host || null;
      for (let depth = 0; current && depth < 8; depth += 1) {
        if (target && current.contains?.(target)) return true;
        current = current.parentElement || current.getRootNode?.().host || null;
      }
      return false;
    }

    function findBestImageInput(surface, target) {
      const candidates = queryAllDeep('input[type="file"]')
        .filter(input => !input.disabled)
        .map((input, index) => {
          const accept = String(input.getAttribute('accept') || '').toLowerCase();
          const identity = controlIdentity(input);
          const explicitImage = /image\//.test(accept) || /\.(?:avif|gif|jpe?g|png|webp)/.test(accept);
          const imageIdentity = /image|photo|picture|reference|attachment|upload/.test(identity);
          const profileIdentity = /avatar|profile|logo|cover/.test(identity);
          const linked = isInputLinked(input, surface, target);

          if (/video\//.test(accept) && !/image\//.test(accept)) return { input, index, score: -1000 };
          if (/audio\//.test(accept) && !/image\//.test(accept)) return { input, index, score: -1000 };
          if (profileIdentity) return { input, index, score: -1000 };
          if (!explicitImage && !imageIdentity && !linked) return { input, index, score: -1000 };

          let score = 0;
          if (explicitImage) score += 180;
          if (imageIdentity) score += 70;
          if (linked) score += 110;
          if (input.multiple) score += 5;
          return { input, index, score };
        })
        .filter(c => c.score >= 120)
        .sort((a, b) => (b.score - a.score) || (a.index - b.index));
      return candidates[0]?.input || null;
    }

    function findComposerAddControl(surface, target) {
      const surfaceRect = surface.getBoundingClientRect();
      const candidates = queryAllDeep('button, [role="button"], label[for]')
        .filter(el => !el.closest?.('#duongtho-ref-popover') && !el.closest?.('#channa-prompt-dock'))
        .filter(isVisible)
        .map((element, index) => {
          const identity = controlIdentity(element);
          const text = String(element.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
          if (/create\s*(?:images?|videos?)|generate|send|submit|download|model|style|template|ratio|translate|avatar|profile/.test(identity)) {
            return { element, index, score: -1000 };
          }
          const rect = element.getBoundingClientRect();
          const linked = surface.contains(element) || element.contains(target) ||
            (rect.right >= surfaceRect.left - 32 && rect.left <= surfaceRect.right + 32 &&
             rect.bottom >= surfaceRect.top - 32 && rect.top <= surfaceRect.bottom + 32);
          if (!linked) return { element, index, score: -1000 };

          let score = 0;
          if (text === '+') score += 360;
          if (/\bplus\b|(?:^|\s)add(?:\s|$)|add\s*(?:attachment|file|image|photo)|attach|upload/.test(identity)) score += 300;
          if (surface.contains(element)) score += 150;
          if (rect.width <= 72 && rect.height <= 72) score += 50;
          if (rect.left <= surfaceRect.left + surfaceRect.width * 0.35) score += 90;
          return { element, index, score };
        })
        .filter(c => c.score >= 190)
        .sort((a, b) => (b.score - a.score) || (a.index - b.index));
      return candidates[0]?.element || null;
    }

    function findUploadMenuControl(beforeControls, plusControl, surface) {
      const plusRect = plusControl.getBoundingClientRect();
      const candidates = queryAllDeep(ACTIVATION_CONTROL_SELECTOR)
        .filter(el => el !== plusControl && !el.closest?.('#duongtho-ref-popover'))
        .filter(isVisible)
        .map((element, index) => {
          const identity = controlIdentity(element);
          if (!/upload|attach|image|photo|picture|file|gallery|computer|device/.test(identity)) return { element, index, score: -1000 };
          if (/create|generate|camera|video|audio|avatar|profile|logo|send/.test(identity)) return { element, index, score: -1000 };

          let score = 0;
          if (!beforeControls.has(element)) score += 220;
          if (/upload|attach|choose\s*file|select\s*file/.test(identity)) score += 240;
          if (/image|photo|picture|file|gallery/.test(identity)) score += 150;
          if (element.matches('label[for]')) score += 80;
          if (element.querySelector?.('input[type="file"]')) score += 260;
          const rect = element.getBoundingClientRect();
          const dist = Math.hypot(rect.left - plusRect.left, rect.top - plusRect.top);
          if (dist <= 450) score += 70;
          return { element, index, score };
        })
        .filter(c => c.score >= 180)
        .sort((a, b) => (b.score - a.score) || (a.index - b.index));
      return candidates[0]?.element || null;
    }

    function installSilentFileChooserGuard() {
      let capturedInput = null;
      const inputPrototype = HTMLInputElement.prototype;
      const originalShowPicker = inputPrototype.showPicker;
      let showPickerPatched = false;

      const interceptFileClick = event => {
        const path = typeof event.composedPath === 'function' ? event.composedPath() : [event.target];
        const input = path.find(node => node instanceof HTMLInputElement && node.type === 'file');
        if (!input || event.isTrusted) return;
        capturedInput = input;
        event.preventDefault();
        event.stopImmediatePropagation();
      };
      document.addEventListener('click', interceptFileClick, true);

      if (typeof originalShowPicker === 'function') {
        try {
          inputPrototype.showPicker = function silentShowPicker() {
            if (this instanceof HTMLInputElement && this.type === 'file') {
              capturedInput = this;
              return undefined;
            }
            return originalShowPicker.call(this);
          };
          showPickerPatched = true;
        } catch {}
      }

      return {
        getCapturedInput: () => capturedInput,
        restore: () => {
          document.removeEventListener('click', interceptFileClick, true);
          if (showPickerPatched) {
            try { inputPrototype.showPicker = originalShowPicker; } catch {}
          }
        }
      };
    }

    function activateControlOnce(element) {
      if (!(element instanceof Element)) return;
      const rect = element.getBoundingClientRect();
      const clientX = Math.round(rect.left + Math.max(1, rect.width / 2));
      const clientY = Math.round(rect.top + Math.max(1, rect.height / 2));
      try { element.focus({ preventScroll: true }); } catch {}

      const shared = { bubbles: true, cancelable: true, composed: true, view: window, clientX, clientY, button: 0 };
      if (typeof PointerEvent === 'function') {
        element.dispatchEvent(new PointerEvent('pointerdown', { ...shared, buttons: 1, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
      }
      element.dispatchEvent(new MouseEvent('mousedown', { ...shared, buttons: 1 }));
      if (typeof PointerEvent === 'function') {
        element.dispatchEvent(new PointerEvent('pointerup', { ...shared, buttons: 0, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
      }
      element.dispatchEvent(new MouseEvent('mouseup', { ...shared, buttons: 0 }));

      if (typeof element.click === 'function') element.click();
      else element.dispatchEvent(new MouseEvent('click', { ...shared, buttons: 0, detail: 1 }));
    }

    async function waitForActivatedImageInput(beforeInputs, surface, target, guard, timeoutMs = 1500) {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        const captured = guard.getCapturedInput();
        if (captured) return captured;
        const candidates = queryAllDeep('input[type="file"]')
          .filter(input => !input.disabled)
          .map((input, index) => {
            const accept = String(input.getAttribute('accept') || '').toLowerCase();
            const identity = controlIdentity(input);
            const explicitImage = /image\//.test(accept) || /\.(?:avif|gif|jpe?g|png|webp)/.test(accept);
            const imageIdentity = /image|photo|picture|attachment|upload|file/.test(identity);
            let score = 0;
            if (input === captured) score += 1000;
            if (!beforeInputs.has(input)) score += 360;
            if (explicitImage) score += 220;
            if (imageIdentity) score += 120;
            return { input, index, score };
          })
          .filter(c => c.score >= 140)
          .sort((a, b) => (b.score - a.score) || (a.index - b.index));
        if (candidates[0]?.input) return candidates[0].input;
        await new Promise(r => setTimeout(r, 60));
      }
      return null;
    }

    function assignFileOnce(input, file) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      if (transfer.files.length !== 1) throw new Error('DataTransfer could not prepare file list');

      const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'files');
      if (descriptor?.set) {
        descriptor.set.call(input, transfer.files);
      } else {
        input.files = transfer.files;
      }
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }

    async function silentlyActivateAndAssign(file, surface, target) {
      const beforeInputs = new Set(queryAllDeep('input[type="file"]'));
      const beforeControls = new Set(queryAllDeep(ACTIVATION_CONTROL_SELECTOR));
      const guard = installSilentFileChooserGuard();
      const plusControl = findComposerAddControl(surface, target);

      if (!plusControl) {
        guard.restore();
        throw new Error('Dola plus/add button was not found in active composer.');
      }

      try {
        activateControlOnce(plusControl);
        let input = await waitForActivatedImageInput(beforeInputs, surface, target, guard, 700);
        if (!input) {
          const uploadControl = findUploadMenuControl(beforeControls, plusControl, surface);
          if (uploadControl) {
            activateControlOnce(uploadControl);
            input = await waitForActivatedImageInput(beforeInputs, surface, target, guard, 1200);
          }
        }

        if (!input) {
          throw new Error('Could not find Dola image upload input after activating composer menu.');
        }

        assignFileOnce(input, file);
        await new Promise(r => setTimeout(r, 200));
        return input;
      } finally {
        guard.restore();
      }
    }

    function dataUrlToFile(dataUrl, name = 'reference-image.png') {
      if (typeof dataUrl !== 'string' || !dataUrl.includes(',')) {
        throw new Error('Invalid data URL');
      }
      const parts = dataUrl.split(',');
      const match = parts[0].match(/:(.*?);/);
      const mime = match ? match[1] : 'image/png';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], name, { type: mime, lastModified: Date.now() });
    }

    /**
     * Tiền xử lý cấu trúc ảnh qua Canvas (Xóa EXIF/Metadata, thêm vi nhiễu, chống quét lọc AI)
     * @param {File} file - File ảnh gốc
     * @returns {Promise<File>} File ảnh mới đã được tái cấu trúc hoàn toàn
     */
    async function processBypassImage(file) {
      return new Promise((resolve, reject) => {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) {
                  return resolve(file); // Fallback nếu không tạo được context
                }

                // 1. Phá Perceptual Hash: Co lệch 1px nếu là số chẵn
                const w = Math.max(1, img.naturalWidth - (img.naturalWidth % 2 === 0 ? 1 : 0));
                const h = Math.max(1, img.naturalHeight - (img.naturalHeight % 2 === 0 ? 1 : 0));
                canvas.width = w;
                canvas.height = h;

                // 2. Vẽ lại ảnh (Canvas tự động triệt tiêu toàn bộ EXIF, GPS, thiết bị gốc)
                ctx.drawImage(img, 0, 0, w, h);

                // 3. Bơm Micro-Noise (nhiễu vi hạt siêu nhỏ phá vỡ mã MD5 & feature vector AI)
                try {
                  const imgData = ctx.getImageData(0, 0, w, h);
                  const data = imgData.data;
                  const totalPixels = w * h;

                  for (let i = 0; i < totalPixels; i += 3) {
                    const offset = i * 4;
                    const noise = (Math.random() - 0.5) * 4;
                    data[offset] = Math.min(255, Math.max(0, data[offset] + noise));         // R
                    data[offset + 1] = Math.min(255, Math.max(0, data[offset + 1] + noise)); // G
                    data[offset + 2] = Math.min(255, Math.max(0, data[offset + 2] + noise)); // B
                  }
                  ctx.putImageData(imgData, 0, 0);
                } catch(noiseErr) {
                  console.warn('[Bypass Process] Bỏ qua bước micro-noise (CORS/safe):', noiseErr);
                }

                // 4. Phủ 1 lớp gradient cực mỏng (alpha ~0.004)
                const gradient = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, Math.max(w, h));
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                gradient.addColorStop(1, 'rgba(240, 240, 240, 0.004)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);

                // 5. Xuất File mới với tên ngẫu nhiên
                const mimeType = (file.type === 'image/png') ? 'image/png' : 'image/jpeg';
                canvas.toBlob((blob) => {
                  if (!blob) return resolve(file);
                  const ext = (mimeType === 'image/png') ? 'png' : 'jpg';
                  const newFileName = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
                  const processedFile = new File([blob], newFileName, {
                    type: mimeType,
                    lastModified: Date.now()
                  });
                  console.log('[Bypass Process] Xử lý thành công ảnh mới:', newFileName, `(${w}x${h})`);
                  resolve(processedFile);
                }, mimeType, 0.96);
              } catch (innerErr) {
                console.warn('[Bypass Process] Lỗi xử lý canvas, dùng file gốc:', innerErr);
                resolve(file);
              }
            };
            img.onerror = () => {
              console.warn('[Bypass Process] Lỗi nạp img, dùng file gốc');
              resolve(file);
            };
            img.src = e.target.result;
          };
          reader.onerror = () => {
            console.warn('[Bypass Process] Lỗi đọc file, dùng file gốc');
            resolve(file);
          };
          reader.readAsDataURL(file);
        } catch(topErr) {
          console.warn('[Bypass Process] Exception:', topErr);
          resolve(file);
        }
      });
    }

    /**
     * Tự động gán File vào Dola mà không làm mở cửa sổ chọn file của OS
     * @param {File} file - File ảnh đã qua xử lý lách
     * @returns {Promise<boolean>}
     */
    async function injectFileIntoDola(file) {
      // 1. Quét tìm input file sẵn có trong khu vực soạn thảo của Dola
      let fileInput = document.querySelector('input[type="file"][accept*="image"]') 
                   || document.querySelector('input[type="file"]');

      // 2. Nếu Dola lazy-load (chưa render input ra DOM), kích hoạt nút "+"
      if (!fileInput) {
        const plusButton = Array.from(document.querySelectorAll('button, div[role="button"]')).find(btn => {
          const text = (btn.textContent || '').trim();
          const aria = btn.getAttribute('aria-label') || '';
          return text === '+' || aria.includes('Upload') || aria.includes('image') || (btn.querySelector('svg') && aria.includes('Add'));
        });

        if (plusButton) {
          const origShowPicker = HTMLInputElement.prototype.showPicker;
          HTMLInputElement.prototype.showPicker = function() { return; };

          plusButton.click();
          await new Promise(resolve => setTimeout(resolve, 200));

          HTMLInputElement.prototype.showPicker = origShowPicker;
          fileInput = document.querySelector('input[type="file"][accept*="image"]') || document.querySelector('input[type="file"]');
        }
      }

      if (!fileInput) {
        return false;
      }

      // 3. Cơ chế DataTransfer: Nhúng trực tiếp File vào thuộc tính files của input
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'files');
      if (descriptor?.set) {
        descriptor.set.call(fileInput, dataTransfer.files);
      } else {
        fileInput.files = dataTransfer.files;
      }

      // 4. Bắn sự kiện DOM để React / Vue của Dola cập nhật state
      fileInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      fileInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('[Dola Injector] Gắn ảnh thành công vào Dola:', file.name);
      return true;
    }

    // Master function to attach image to Dola
    async function duongThoAttachReferenceImage(fileOrBlobOrDataUrl, name = 'reference-image.png') {
      let rawFile;
      if (fileOrBlobOrDataUrl instanceof File) {
        rawFile = fileOrBlobOrDataUrl;
      } else if (fileOrBlobOrDataUrl instanceof Blob) {
        rawFile = new File([fileOrBlobOrDataUrl], name, { type: fileOrBlobOrDataUrl.type || 'image/png', lastModified: Date.now() });
      } else if (typeof fileOrBlobOrDataUrl === 'string') {
        rawFile = dataUrlToFile(fileOrBlobOrDataUrl, name);
      } else {
        throw new Error('Unsupported image payload for attachment.');
      }

      // BẮT BUỘC: Đưa file qua code tiền xử lý Canvas (Xóa EXIF, phá pHash, thêm vi nhiễu)
      let file = rawFile;
      try {
        console.log('[Dola Pipeline] Đang qua tầng xử lý lách kiểm duyệt Canvas:', rawFile.name);
        file = await processBypassImage(rawFile);
      } catch (procErr) {
        console.warn('[Dola Pipeline] Tiền xử lý thất bại, tiếp tục với file ban đầu:', procErr);
        file = rawFile;
      }

      // Chiến lược 1: Thử nghiệm injectFileIntoDola trực tiếp
      try {
        const injected = await injectFileIntoDola(file);
        if (injected) {
          return { success: true, fileName: file.name, method: 'direct-input-inject' };
        }
      } catch(injErr) {
        console.warn('[Dola Pipeline] Direct inject warning:', injErr);
      }

      // Chiến lược 2: Fallback qua cơ chế deep-surface finder
      const target = findComposerTarget();
      if (!target) throw new Error('Dola chat composer input not found. Vui lòng mở trang chat Dola.');
      const surface = findComposerSurface(target) || target;

      const existingInput = findBestImageInput(surface, target);
      if (existingInput) {
        assignFileOnce(existingInput, file);
        return { success: true, fileName: file.name, method: 'existing-input' };
      }

      await silentlyActivateAndAssign(file, surface, target);
      return { success: true, fileName: file.name, method: 'silent-plus-activation' };
    }

    window.processBypassImage = processBypassImage;
    window.injectFileIntoDola = injectFileIntoDola;
    window.duongThoAttachReferenceImage = duongThoAttachReferenceImage;

    // Global native image handler (directly invoked by Android bridge)
    window.__duongThoAddImagesFromNative = async function(imagesList) {
      if (!Array.isArray(imagesList) || !imagesList.length) return;
      console.log('[Native Image Upload] Received images:', imagesList.length);

      try {
        for (const rec of imagesList) {
          if (typeof dbSaveImage === 'function') {
            await dbSaveImage(rec);
          }
        }
      } catch(e) {}

      let attachSuccess = false;
      try {
        const first = imagesList[0];
        if (first && first.dataUrl) {
          const res = await duongThoAttachReferenceImage(first.dataUrl, first.name || 'reference.png');
          if (res && res.success) {
            attachSuccess = true;
            if (typeof window.__showChannaNotice === 'function') {
              window.__showChannaNotice(`✅ Đã gắn ảnh tham chiếu: "${first.name || 'Ảnh'}" vào Dola!`, 4000);
            }
          }
        }
      } catch(attachErr) {
        console.warn('[Auto Attach] Direct attach exception:', attachErr);
      }

      if (!attachSuccess && typeof window.__showChannaNotice === 'function') {
        window.__showChannaNotice(`📸 Đã nạp ${imagesList.length} ảnh tham chiếu từ điện thoại!`, 3500);
      }

      try {
        const listBox = document.getElementById('duongtho-ref-list');
        if (listBox && typeof renderRefList === 'function') {
          cachedImages = await dbGetAllImages();
          renderRefList(listBox, cachedImages);
        }
        if (typeof syncRefDockButton === 'function') {
          syncRefDockButton();
        }
      } catch(e) {}
    };

    // --- 3. Reference Image UI & Mobile Dock ---
    function injectRefStyles() {
      if (document.getElementById('duongtho-ref-styles')) return;
      const style = document.createElement('style');
      style.id = 'duongtho-ref-styles';
      style.textContent = `
        #duongtho-ref-dock-btn {
          position: fixed !important;
          top: 50% !important;
          right: 0px !important;
          left: auto !important;
          bottom: auto !important;
          transform: translateY(-50%) !important;
          border-radius: 14px 0 0 14px !important;
          z-index: 999999 !important;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%) !important;
          border: 1px solid rgba(244, 114, 182, 0.6) !important;
          border-right: none !important;
          color: #ffffff !important;
          padding: 8px 12px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.65), -2px 0 10px rgba(236, 72, 153, 0.5) !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          user-select: none !important;
        }
        #duongtho-ref-dock-btn:hover {
          transform: translateY(-50%) scale(1.04) !important;
          box-shadow: -6px 0 28px rgba(236, 72, 153, 0.75) !important;
        }
        #duongtho-ref-popover {
          position: fixed !important;
          background: rgba(15, 12, 27, 0.97) !important;
          border: 1px solid rgba(244, 114, 182, 0.45) !important;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.75), 0 0 15px rgba(236, 72, 153, 0.25) !important;
          border-radius: 14px !important;
          padding: 12px !important;
          width: 320px !important;
          max-width: calc(100vw - 40px) !important;
          max-height: 75vh !important;
          z-index: 2147483647 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          backdrop-filter: blur(14px) !important;
          color: #f1f5f9 !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .duongtho-ref-item {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          padding: 8px !important;
          border-radius: 9px !important;
          background: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          margin-bottom: 6px !important;
          box-sizing: border-box !important;
        }
        .duongtho-ref-thumb {
          width: 44px !important;
          height: 44px !important;
          border-radius: 8px !important;
          object-fit: cover !important;
          border: 1px solid rgba(244, 114, 182, 0.5) !important;
          flex-shrink: 0 !important;
        }
        .duongtho-ref-btn-attach {
          background: linear-gradient(135deg, #ec4899, #db2777) !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 4px 8px !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 3px !important;
          white-space: nowrap !important;
        }
        .duongtho-ref-btn-attach:active {
          transform: scale(0.96) !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    function formatBytes(bytes) {
      if (!bytes || isNaN(bytes)) return '0 B';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function renderRefList(container, images) {
      if (!container) return;
      if (!images || images.length === 0) {
        container.innerHTML = `
          <div style="padding: 24px 12px; text-align: center; color: #94a3b8; font-size: 11.5px; border: 1px dashed rgba(255,255,255,0.15); border-radius: 8px;">
            <div style="font-size: 24px; margin-bottom: 6px;">🖼️</div>
            Chưa có ảnh tham chiếu.<br>
            Bấm <span style="color: #f472b6; font-weight: 700;">➕ Thêm ảnh từ máy</span> để chọn ảnh!
          </div>
        `;
        return;
      }

      container.innerHTML = images.map(img => `
        <div class="duongtho-ref-item" data-img-id="${img.id}">
          <img src="${img.dataUrl}" class="duongtho-ref-thumb" alt="${img.name}" />
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 11.5px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${img.name}</div>
            <div style="font-size: 9.5px; color: #94a3b8;">${formatBytes(img.size)}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
            <button type="button" class="duongtho-ref-btn-attach" data-img-id="${img.id}">
              ⚡ Đính kèm
            </button>
            <button type="button" class="duongtho-ref-btn-del" data-img-id="${img.id}" style="background: none; border: none; color: #ef4444; font-size: 14px; cursor: pointer; padding: 2px 4px;" title="Xóa">✕</button>
          </div>
        </div>
      `).join('');
    }

    function openRefPopover(btn) {
      const existing = document.getElementById('duongtho-ref-popover');
      if (existing) {
        existing.remove();
        return;
      }

      const popover = document.createElement('div');
      popover.id = 'duongtho-ref-popover';

      popover.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 800; color: #f472b6;">
            <span>🖼️</span>
            <span>Kho Ảnh Tham Chiếu (V3)</span>
          </div>
          <button id="duongtho-ref-close" style="background: none; border: none; color: #94a3b8; font-size: 15px; cursor: pointer; padding: 2px 5px;">✕</button>
        </div>

        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
          <input type="file" id="duongtho-ref-native-picker" accept="image/*" multiple style="display: none;" />
          <button type="button" id="duongtho-ref-add-btn" style="flex: 1; background: rgba(236, 72, 153, 0.18); border: 1px solid #ec4899; color: #f472b6; border-radius: 7px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
            ➕ Thêm ảnh từ máy
          </button>
          <button type="button" id="duongtho-ref-clear-btn" style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.15); color: #94a3b8; border-radius: 7px; padding: 6px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">
            🗑️ Xóa hết
          </button>
        </div>

        <div id="duongtho-ref-status" style="display: none; padding: 5px 8px; border-radius: 6px; font-size: 10.5px; margin-bottom: 6px; text-align: center;"></div>

        <div id="duongtho-ref-list-box" style="flex: 1; overflow-y: auto; max-height: 280px; padding-right: 2px;">
          <div style="text-align: center; color: #94a3b8; padding: 16px; font-size: 11px;">Đang tải danh sách ảnh...</div>
        </div>

        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 9.5px; color: #94a3b8; text-align: center;">
          ⚡ Bấm <b>Đính kèm</b> để tự động đưa ảnh vào khung chat Dola
        </div>
      `;

      document.body.appendChild(popover);
      const rect = btn.getBoundingClientRect();
      popover.style.right = '60px';
      popover.style.top = `${Math.max(60, Math.min(window.innerHeight - 380, rect.top - 80))}px`;

      const listBox = popover.querySelector('#duongtho-ref-list-box');
      const statusBox = popover.querySelector('#duongtho-ref-status');
      const nativePicker = popover.querySelector('#duongtho-ref-native-picker');

      function setStatus(msg, isSuccess = true) {
        if (!statusBox) return;
        statusBox.style.display = 'block';
        statusBox.style.background = isSuccess ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
        statusBox.style.color = isSuccess ? '#34d399' : '#f87171';
        statusBox.style.border = `1px solid ${isSuccess ? '#10b981' : '#ef4444'}`;
        statusBox.textContent = msg;
        setTimeout(() => { if (statusBox) statusBox.style.display = 'none'; }, 3000);
      }

      async function refreshList() {
        cachedImages = await dbGetAllImages();
        renderRefList(listBox, cachedImages);
        syncRefDockButton();
      }
      refreshList();

      popover.querySelector('#duongtho-ref-close').onclick = (e) => {
        e.stopPropagation();
        popover.remove();
      };

      // Register global callback for Android native image picker
      window.__duongThoAddImagesFromNative = async function(imagesList) {
        if (!Array.isArray(imagesList) || !imagesList.length) return;
        setStatus(`Đang xử lý ${imagesList.length} ảnh từ máy...`, true);
        for (const rec of imagesList) {
          await dbSaveImage(rec);
        }
        await refreshList();
        setStatus(`✅ Đã thêm ${imagesList.length} ảnh tham chiếu!`, true);
      };

      popover.querySelector('#duongtho-ref-add-btn').onclick = () => {
        // Priority 1: Native Android Gallery/File Picker via bridge
        if (window.AndroidDuongTho && typeof window.AndroidDuongTho.openNativeImagePicker === 'function') {
          window.AndroidDuongTho.openNativeImagePicker();
          return;
        }
        if (window.DuongThoAndroid && typeof window.DuongThoAndroid.openNativeImagePicker === 'function') {
          window.DuongThoAndroid.openNativeImagePicker();
          return;
        }
        // Priority 2: Standard HTML5 input picker
        nativePicker.click();
      };

      nativePicker.onchange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setStatus(`Đang xử lý ${files.length} ảnh...`, true);

        for (const file of files) {
          const reader = new FileReader();
          await new Promise(res => {
            reader.onload = async () => {
              const rec = {
                id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                name: file.name,
                type: file.type || 'image/png',
                size: file.size,
                dataUrl: reader.result,
                addedAt: Date.now()
              };
              await dbSaveImage(rec);
              res();
            };
            reader.readAsDataURL(file);
          });
        }
        nativePicker.value = '';
        await refreshList();
        setStatus(`✅ Đã thêm ${files.length} ảnh tham chiếu!`, true);
      };

      popover.querySelector('#duongtho-ref-clear-btn').onclick = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ ảnh trong kho tham chiếu?')) return;
        await dbClearAllImages();
        await refreshList();
        setStatus('Đã xóa toàn bộ ảnh.', true);
      };

      listBox.onclick = async (e) => {
        const attachBtn = e.target.closest('.duongtho-ref-btn-attach');
        if (attachBtn) {
          const imgId = attachBtn.getAttribute('data-img-id');
          const targetImg = cachedImages.find(img => img.id === imgId);
          if (!targetImg) return;

          const oldText = attachBtn.innerHTML;
          attachBtn.disabled = true;
          attachBtn.innerHTML = '⏳ Đang gắn...';

          try {
            await duongThoAttachReferenceImage(targetImg.dataUrl, targetImg.name);
            attachBtn.innerHTML = '✅ Đã gắn!';
            setStatus(`✅ Đã đính kèm ${targetImg.name} vào chat!`, true);
            setTimeout(() => {
              attachBtn.disabled = false;
              attachBtn.innerHTML = oldText;
            }, 2000);
          } catch (err) {
            console.error('[DuongTho Attach Error]', err);
            attachBtn.disabled = false;
            attachBtn.innerHTML = '❌ Lỗi';
            setStatus(`Lỗi: ${err.message}`, false);
            setTimeout(() => { attachBtn.innerHTML = oldText; }, 2500);
          }
          return;
        }

        const delBtn = e.target.closest('.duongtho-ref-btn-del');
        if (delBtn) {
          const imgId = delBtn.getAttribute('data-img-id');
          await dbDeleteImage(imgId);
          await refreshList();
          setStatus('Đã xóa ảnh.', true);
        }
      };

      const onOutsideClick = (e) => {
        if (!popover.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
          popover.remove();
          document.removeEventListener('click', onOutsideClick);
        }
      };
      setTimeout(() => document.addEventListener('click', onOutsideClick), 50);
    }

    async function syncRefDockButton() {
      injectRefStyles();

      let btn = document.getElementById('duongtho-ref-dock-btn');
      if (!btn || !btn.isConnected) {
        if (btn) btn.remove();
        btn = document.createElement('button');
        btn.id = 'duongtho-ref-dock-btn';
        btn.type = 'button';
        btn.title = '🖼️ Quản lý ảnh tham chiếu (Seedance V3)';
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openRefPopover(btn);
        };
        (document.body || document.documentElement).appendChild(btn);
      }

      if (!cachedImages.length) {
        cachedImages = await dbGetAllImages();
      }

      btn.innerHTML = `
        <span style="font-size: 13px;">🖼️</span>
        <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.5px;">ẢNH MẪU</span>
        <span id="duongtho-ref-badge" style="background: rgba(255,255,255,0.25); color: #fff; font-size: 9px; font-weight: 700; border-radius: 10px; padding: 1px 5px;">${cachedImages.length}</span>
      `;
    }

    // Handle postMessage triggers
    window.addEventListener('message', async (e) => {
      if (e.data?.type === 'STAGE_CHARACTER_ACTOR' && e.data.actor) {
        const actor = e.data.actor;
        const imgUrl = actor.avatarUrl || actor.imageUrl || actor.image;
        if (imgUrl) {
          try {
            await duongThoAttachReferenceImage(imgUrl, `${actor.name || 'actor'}.png`);
          } catch (err) {
            console.warn('[DuongTho Actor Attach Error]:', err);
          }
        }
      }
      if (e.data?.type === 'DUONGTHO_ATTACH_REFERENCE' && e.data.image) {
        try {
          await duongThoAttachReferenceImage(e.data.image, e.data.name || 'reference.png');
        } catch (err) {
          console.warn('[DuongTho Ref Attach Error]:', err);
        }
      }
    });

    setInterval(syncRefDockButton, 3500);
    syncRefDockButton();
  })();


  // =========================================================================
  // 🎬 UNIVERSAL MULTI-ASPECT RATIO & CODEC VIDEO REFERENCE ENGINE
  // Pure WASM HEVC (H.265 / Seedance 2.5) Demuxer & Decoder + Native Fallback
  // Universal Aspect Ratio: 16:9, 9:16, 4:3, 1:1, 21:9, 3:4
  // =========================================================================
  (() => {
    'use strict';

    // 1. Inject Styles
    function injectStyles() {
      let style = document.getElementById('channa-ref-styles');
      if (!style) {
        style = document.createElement('style');
        style.id = 'channa-ref-styles';
        (document.head || document.documentElement || document.body).appendChild(style);
      }
      style.textContent = `
        .channa-ref-modal-overlay {
          position: fixed !important;
          inset: 0 !important;
          background: rgba(8, 6, 18, 0.88) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          z-index: 2147483647 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          padding: 14px !important;
          box-sizing: border-box !important;
        }
        .channa-ref-modal {
          position: relative !important;
          z-index: 2147483647 !important;
          background: linear-gradient(180deg, #130f24 0%, #0c0917 100%) !important;
          border: 1px solid rgba(139, 92, 246, 0.45) !important;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(139, 92, 246, 0.25) !important;
          border-radius: 18px !important;
          width: 100% !important;
          max-width: 620px !important;
          max-height: 94vh !important;
          overflow-y: auto !important;
          color: #f8fafc !important;
          padding: 18px 20px !important;
          box-sizing: border-box !important;
          animation: channaRefPop 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        @keyframes channaRefPop {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .channa-ref-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .channa-ref-title {
          font-size: 15px;
          font-weight: 800;
          background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .channa-ref-close {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #94a3b8;
          font-size: 14px;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .channa-ref-close:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        .channa-ref-dropzone {
          border: 2px dashed rgba(139, 92, 246, 0.45);
          border-radius: 14px;
          padding: 24px 16px;
          text-align: center;
          background: rgba(139, 92, 246, 0.04);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .channa-ref-dropzone:hover {
          border-color: #a78bfa;
          background: rgba(139, 92, 246, 0.08);
        }
        .channa-ref-chat-import-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          padding: 8px 12px;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 10px;
        }
        .channa-ref-import-btn {
          background: linear-gradient(135deg, #0284c7, #38bdf8);
          border: none;
          color: #fff;
          padding: 5px 12px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .channa-ref-import-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(56, 189, 248, 0.4);
        }
        .channa-ref-scrubber-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .channa-ref-pin-btn {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 10.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .channa-ref-pin-btn:hover {
          background: rgba(16, 185, 129, 0.28);
          color: #fff;
        }
        .channa-ref-change-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #cbd5e1;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 10px;
          cursor: pointer;
        }
        .channa-ref-modes {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 8px 0 10px;
        }
        .channa-ref-mode-pill {
          flex: 1 1 calc(25% - 6px);
          min-width: 95px;
          padding: 6px 6px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-size: 10.5px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }
        .channa-ref-mode-pill:hover {
          background: rgba(139, 92, 246, 0.16);
          color: #f1f5f9;
          border-color: rgba(139, 92, 246, 0.35);
        }
        .channa-ref-mode-pill.active {
          background: linear-gradient(135deg, #7c3aed, #9333ea);
          border-color: #a855f7;
          color: #ffffff;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        }
        .channa-ref-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          max-height: 200px;
          overflow-y: auto;
          padding: 6px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          box-sizing: border-box;
        }
        .channa-ref-strip::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .channa-ref-strip::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
        }
        .channa-ref-strip::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.45);
          border-radius: 4px;
        }
        .channa-ref-strip::-webkit-scrollbar-thumb:hover {
          background: #a855f7;
        }
        .channa-ref-thumb-box {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.12);
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .channa-ref-thumb-box:hover {
          border-color: #38bdf8;
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25);
        }
        .channa-ref-thumb-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          background: #05040a;
        }
        .channa-ref-thumb-badge {
          position: absolute;
          bottom: 3px;
          right: 3px;
          background: rgba(0, 0, 0, 0.82);
          color: #38bdf8;
          font-size: 8px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 4px;
          backdrop-filter: blur(4px);
          pointer-events: none;
        }
        .channa-ref-thumb-step {
          position: absolute;
          top: 3px;
          left: 3px;
          background: rgba(124, 58, 237, 0.88);
          color: #fff;
          font-size: 8px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          backdrop-filter: blur(4px);
          pointer-events: none;
        }
        .channa-ref-inject-btn {
          width: 100%;
          margin-top: 12px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border: none;
          border-radius: 10px;
          padding: 10px;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
        }
        .channa-ref-inject-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
        }
        .channa-ref-inject-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .channa-ref-prompt-analyzer-box {
          margin-top: 10px;
          padding: 10px 12px;
          background: rgba(56, 189, 248, 0.05);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 12px;
          box-sizing: border-box;
        }
        .channa-ref-prompt-textarea {
          width: 100%;
          box-sizing: border-box;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 8px;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 11px;
          line-height: 1.45;
          padding: 8px;
          resize: vertical;
          min-height: 60px;
          max-height: 140px;
        }
        .channa-ref-prompt-textarea:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
        }
        .channa-ref-tool-btn {
          background: linear-gradient(135deg, #0284c7, #38bdf8);
          border: none;
          color: #fff;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .channa-ref-tool-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(56, 189, 248, 0.4);
        }
        .channa-ref-tool-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .channa-ref-mini-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #e2e8f0;
          padding: 3px 8px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .channa-ref-mini-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #fff;
        }
        .channa-ref-mini-btn.primary {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border: none;
          color: #fff;
          font-weight: 700;
        }
        .channa-ref-mini-btn.primary:hover {
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
        }
      `;
      if (!style.parentElement) {
        (document.head || document.documentElement || document.body).appendChild(style);
      }
    }

    // 2. Pure JS MP4 Atom Demuxer
    function parseMp4Metadata(arrayBuffer) {
      try {
        const u8 = new Uint8Array(arrayBuffer);
        const dv = new DataView(arrayBuffer);

        function parseBoxes(start, end) {
          const boxes = [];
          let cur = start;
          while (cur + 8 <= end) {
            const size = dv.getUint32(cur);
            const type = String.fromCharCode(u8[cur+4], u8[cur+5], u8[cur+6], u8[cur+7]);
            if (size === 0) break;
            const boxEnd = cur + size;
            boxes.push({ type, offset: cur, size, boxEnd });
            if (boxEnd <= cur || boxEnd > end) break;
            cur = boxEnd;
          }
          return boxes;
        }

        const rootBoxes = parseBoxes(0, u8.length);
        const moov = rootBoxes.find(b => b.type === 'moov');
        if (!moov) return null;

        const moovBoxes = parseBoxes(moov.offset + 8, moov.boxEnd);
        const traks = moovBoxes.filter(b => b.type === 'trak');

        let videoTrak = null;
        for (const trak of traks) {
          const trakB = parseBoxes(trak.offset + 8, trak.boxEnd);
          const mdia = trakB.find(b => b.type === 'mdia');
          if (!mdia) continue;
          const mdiaB = parseBoxes(mdia.offset + 8, mdia.boxEnd);
          const hdlr = mdiaB.find(b => b.type === 'hdlr');
          if (hdlr) {
            const handler = String.fromCharCode(u8[hdlr.offset+16], u8[hdlr.offset+17], u8[hdlr.offset+18], u8[hdlr.offset+19]);
            if (handler === 'vide') {
              videoTrak = { trak, trakB, mdia, mdiaB };
              break;
            }
          }
        }

        if (!videoTrak) return null;

        const tkhd = videoTrak.trakB.find(b => b.type === 'tkhd');
        let width = 640, height = 360;
        if (tkhd) {
          width = dv.getUint32(tkhd.offset + tkhd.size - 8) >>> 16;
          height = dv.getUint32(tkhd.offset + tkhd.size - 4) >>> 16;
        }

        const mdhd = videoTrak.mdiaB.find(b => b.type === 'mdhd');
        let duration = 10;
        if (mdhd) {
          const version = u8[mdhd.offset + 8];
          const timescale = version === 0 ? dv.getUint32(mdhd.offset + 20) : dv.getUint32(mdhd.offset + 28);
          const durUnits = version === 0 ? dv.getUint32(mdhd.offset + 24) : Number(dv.getBigUint64(mdhd.offset + 32));
          if (timescale > 0) duration = durUnits / timescale;
        }

        const minf = videoTrak.mdiaB.find(b => b.type === 'minf');
        if (!minf) return null;
        const minfB = parseBoxes(minf.offset + 8, minf.boxEnd);
        const stbl = minfB.find(b => b.type === 'stbl');
        if (!stbl) return null;
        const stblB = parseBoxes(stbl.offset + 8, stbl.boxEnd);

        const stsz = stblB.find(b => b.type === 'stsz');
        const stco = stblB.find(b => b.type === 'stco' || b.type === 'co64');
        const stss = stblB.find(b => b.type === 'stss');

        const sampleCount = stsz ? dv.getUint32(stsz.offset + 16) : 0;
        const sampleSizes = [];
        if (stsz) {
          for (let i = 0; i < sampleCount; i++) sampleSizes.push(dv.getUint32(stsz.offset + 20 + i * 4));
        }

        const isCo64 = stco && stco.type === 'co64';
        const chunkCount = stco ? dv.getUint32(stco.offset + 12) : 0;
        const chunkOffsets = [];
        if (stco) {
          for (let i = 0; i < chunkCount; i++) {
            chunkOffsets.push(isCo64 ? Number(dv.getBigUint64(stco.offset + 16 + i * 8)) : dv.getUint32(stco.offset + 16 + i * 4));
          }
        }

        const syncSamples = [];
        if (stss) {
          const syncCount = dv.getUint32(stss.offset + 12);
          for (let i = 0; i < syncCount; i++) syncSamples.push(dv.getUint32(stss.offset + 16 + i * 4));
        }

        let hvcCOffset = -1, hvcCSize = 0;
        for (let i = stbl.offset; i < stbl.boxEnd - 8; i++) {
          if (u8[i+4] === 104 && u8[i+5] === 118 && u8[i+6] === 99 && u8[i+7] === 67) {
            hvcCOffset = i;
            hvcCSize = dv.getUint32(i);
            break;
          }
        }

        const parameterSets = [];
        let lengthSize = 4;
        if (hvcCOffset >= 0) {
          const hvcC = u8.subarray(hvcCOffset + 8, hvcCOffset + hvcCSize);
          lengthSize = (hvcC[21] & 0x03) + 1;
          const numOfArrays = hvcC[22];
          let p = 23;
          for (let i = 0; i < numOfArrays; i++) {
            p++;
            const numNalus = (hvcC[p] << 8) | hvcC[p + 1];
            p += 2;
            for (let j = 0; j < numNalus; j++) {
              const nalLen = (hvcC[p] << 8) | hvcC[p + 1];
              p += 2;
              parameterSets.push(hvcC.subarray(p, p + nalLen));
              p += nalLen;
            }
          }
        }

        return {
          width: Math.max(1, width),
          height: Math.max(1, height),
          aspectRatio: width / height,
          duration: Math.max(0.5, duration),
          sampleCount,
          chunkOffsets,
          sampleSizes,
          syncSamples,
          parameterSets,
          lengthSize,
          isHevc: hvcCOffset >= 0
        };
      } catch (err) {
        console.warn('[Video-Ref] MP4 metadata error:', err);
        return null;
      }
    }

    // 3. Layout Presets Dictionary
    const LAYOUT_PRESETS = {
      '3x4': { id: '3x4', label: '3×4 Grid', count: 12, cols: 3, rows: 4, desc: '3×4 (12F Storyboard)' },
      '4x3': { id: '4x3', label: '4×3 Sheet', count: 12, cols: 4, rows: 3, desc: '4×3 (12F Sheet)' },
      '4x4': { id: '4x4', label: '4×4 Grid', count: 16, cols: 4, rows: 4, desc: '4×4 (16F Matrix)' },
      '5x5': { id: '5x5', label: '5×5 Grid', count: 25, cols: 5, rows: 5, desc: '5×5 (25F Matrix)' },
      '3x3': { id: '3x3', label: '3×3 Matrix', count: 9, cols: 3, rows: 3, desc: '3×3 (9F Matrix)' },
      '1x6': { id: '1x6', label: '1×6 Panorama', count: 6, cols: 6, rows: 1, desc: '1×6 (6F Panorama)' },
      'hero': { id: 'hero', label: 'Hero Pose', count: 1, cols: 1, rows: 1, desc: '1F Hero Keyframe' }
    };

    // 4. Modal Open & Full Controller Engine
    let lastModalOpenTime = 0;
    function openVideoRefModal() {
      const now = Date.now();
      if (now - lastModalOpenTime < 250) return;
      lastModalOpenTime = now;

      try {
        injectStyles();
        const existing = document.getElementById('channa-ref-modal-overlay');
        if (existing) {
          try { existing.remove(); } catch (e) {}
        }

        const overlay = document.createElement('div');
        overlay.id = 'channa-ref-modal-overlay';
        overlay.className = 'channa-ref-modal-overlay';
        overlay.style.cssText = 'position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; display: flex !important; align-items: center !important; justify-content: center !important;';

        overlay.innerHTML = `
        <div class="channa-ref-modal">
          <div class="channa-ref-header">
            <div class="channa-ref-title">🎬 Video Motion Reference (Seedance 2.5)</div>
            <button class="channa-ref-close" id="channa-ref-close-btn">✕</button>
          </div>

          <div id="channa-ref-upload-section">
            <div class="channa-ref-dropzone" id="channa-ref-dropzone">
              <div style="font-size: 28px; margin-bottom: 6px;">📹</div>
              <div style="font-size: 14px; font-weight: 700; color: #c4b5fd;">Drop Reference Video Here</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Universal: 16:9, 9:16, 4:3, 1:1, 21:9 (MP4, HEVC, WebM, MOV)</div>
              <input type="file" id="channa-ref-file-input" accept="video/mp4,video/webm,video/quicktime" style="display:none;" />
            </div>

            <div class="channa-ref-chat-import-card">
              <div style="display:flex; flex-direction:column; gap:2px;">
                <span style="font-size: 11px; font-weight: 700; color: #38bdf8;">📹 Instant Chat Video Importer</span>
                <span style="font-size: 9.5px; color: #94a3b8;">Import latest video directly from active Dola chat</span>
              </div>
              <button class="channa-ref-import-btn" id="channa-ref-import-chat-btn">⚡ Grab Chat Video</button>
            </div>
          </div>

          <div id="channa-ref-player-section" style="display:none; margin-top: 10px;">
            <div style="position: relative; width: 100%; border-radius: 10px; overflow: hidden; background: #000; text-align: center;">
              <video id="channa-ref-video" style="width: 100%; max-height: 200px; border-radius: 10px; background: #000; object-fit: contain; display: block;" controls muted playsinline preload="auto"></video>
              <canvas id="channa-ref-preview-canvas" style="width: 100%; max-height: 200px; border-radius: 10px; background: #000; display: none; object-fit: contain; margin: 0 auto;"></canvas>
            </div>
            
            <div class="channa-ref-scrubber-bar">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size: 10.5px; color: #94a3b8;">⏱️ Scrubber:</span>
                <span id="channa-ref-time-display" style="font-size: 11px; font-weight: 700; color: #38bdf8;">0.0s / 0.0s</span>
                <span id="channa-ref-aspect-display" style="font-size: 9.5px; font-weight: 700; color: #a78bfa; margin-left: 4px; padding: 1px 5px; background: rgba(139,92,246,0.2); border-radius: 4px;">Universal Ratio</span>
              </div>
              <div style="display:flex; gap:6px; align-items:center;">
                <button class="channa-ref-pin-btn" id="channa-ref-pin-btn" title="Capture current paused frame">📍 Pin Scrubber Frame</button>
                <button class="channa-ref-change-btn" id="channa-ref-change-btn">🔄 Change</button>
              </div>
            </div>

            <div style="margin: 12px 0 6px;">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:700; color:#cbd5e1; margin-bottom:6px;">
                <span>📐 Matrix & Timeline Architecture:</span>
                <span id="channa-ref-layout-badge" style="color: #38bdf8;">3×4 (12F Storyboard)</span>
              </div>
              <div class="channa-ref-modes">
                <div class="channa-ref-mode-pill active" data-layout="3x4">🎬 3×4 Grid (12F)</div>
                <div class="channa-ref-mode-pill" data-layout="4x3">📱 4×3 Sheet (12F)</div>
                <div class="channa-ref-mode-pill" data-layout="4x4">🔲 4×4 Grid (16F)</div>
                <div class="channa-ref-mode-pill" data-layout="5x5">🧱 5×5 Grid (25F)</div>
                <div class="channa-ref-mode-pill" data-layout="3x3">📐 3×3 Matrix (9F)</div>
                <div class="channa-ref-mode-pill" data-layout="1x6">🦅 1×6 Panorama (6F)</div>
                <div class="channa-ref-mode-pill" data-layout="hero">🎯 Hero Pose (1F)</div>
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">Motion Keyframes:</span>
                <span id="channa-ref-status" style="font-size: 11px; color: #10b981; font-weight: 700;">Extracting...</span>
              </div>
              <div class="channa-ref-strip" id="channa-ref-strip"></div>
            </div>

            <label style="display:flex; align-items:center; gap: 8px; font-size: 11.5px; color: #cbd5e1; margin-top: 10px; cursor:pointer;">
              <input type="checkbox" id="channa-ref-auto-prompt" checked style="accent-color: #8b5cf6;" />
              Auto-inject cinematic motion choreography prompt
            </label>

            <!-- 🔍 AI PROMPT & MOTION REVERSE-ENGINEER SECTION -->
            <div class="channa-ref-prompt-analyzer-box" id="channa-ref-analyzer-box">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <div style="display:flex; align-items:center; gap:5px;">
                  <span style="font-size:13px;">🔍</span>
                  <span style="font-size:11px; font-weight:800; color:#38bdf8;">Prompt Reverse-Engineer:</span>
                </div>
                <div>
                  <button type="button" class="channa-ref-tool-btn" id="channa-ref-analyze-dola-btn" title="Reverse prompt using Dola Chat" style="background: linear-gradient(135deg, #0284c7, #38bdf8);">⚡ Via Dola</button>
                </div>
              </div>

              <!-- Prompt result box -->
              <div id="channa-ref-prompt-result-container" style="display:none; margin-top:8px;">
                <textarea id="channa-ref-extracted-prompt" class="channa-ref-prompt-textarea" rows="3" placeholder="Extracted prompt will appear here..."></textarea>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                  <span id="channa-ref-prompt-status" style="font-size:10px; color:#10b981; font-weight:700;">✓ Prompt Ready</span>
                  <div style="display:flex; gap:5px;">
                    <button type="button" class="channa-ref-mini-btn" id="channa-ref-copy-prompt-btn">📋 Copy</button>
                    <button type="button" class="channa-ref-mini-btn primary" id="channa-ref-apply-prompt-btn">✍️ Put in Composer</button>
                  </div>
                </div>
              </div>
            </div>

            <button class="channa-ref-inject-btn" id="channa-ref-inject-btn" disabled>🚀 Inject into Dola AI Composer</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const closeBtn = document.getElementById('channa-ref-close-btn');
      closeBtn.onclick = () => overlay.remove();
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

      const uploadSection = document.getElementById('channa-ref-upload-section');
      const dropzone = document.getElementById('channa-ref-dropzone');
      const fileInput = document.getElementById('channa-ref-file-input');
      const chatImportBtn = document.getElementById('channa-ref-import-chat-btn');
      const playerSection = document.getElementById('channa-ref-player-section');
      const videoEl = document.getElementById('channa-ref-video');
      const previewCanvas = document.getElementById('channa-ref-preview-canvas');
      const timeDisplay = document.getElementById('channa-ref-time-display');
      const aspectDisplay = document.getElementById('channa-ref-aspect-display');
      const pinBtn = document.getElementById('channa-ref-pin-btn');
      const changeBtn = document.getElementById('channa-ref-change-btn');
      const strip = document.getElementById('channa-ref-strip');
      const injectBtn = document.getElementById('channa-ref-inject-btn');
      const statusEl = document.getElementById('channa-ref-status');
      const layoutBadge = document.getElementById('channa-ref-layout-badge');

      const analyzeDolaBtn = document.getElementById('channa-ref-analyze-dola-btn');
      const promptResultContainer = document.getElementById('channa-ref-prompt-result-container');
      const extractedPrompt = document.getElementById('channa-ref-extracted-prompt');
      const promptStatus = document.getElementById('channa-ref-prompt-status');
      const copyPromptBtn = document.getElementById('channa-ref-copy-prompt-btn');
      const applyPromptBtn = document.getElementById('channa-ref-apply-prompt-btn');

      function findPromptForChatVideo(videoUrl) {
        try {
          const vids = Array.from(document.querySelectorAll('video')).filter(v => v.id !== 'channa-ref-video');
          const matchedVid = vids.find(v => (v.currentSrc === videoUrl || v.src === videoUrl || v.querySelector(`source[src="${videoUrl}"]`)));
          if (matchedVid) {
            const card = matchedVid.closest('[data-message-id], [class*="message"], [class*="bubble"], [class*="card"], div[role="feed"] > div, div[role="region"] > div');
            if (card) {
              const paras = Array.from(card.querySelectorAll('p, span[class*="text"], div[class*="content"]'));
              for (const p of paras) {
                const t = (p.textContent || '').trim();
                if (t && t.length > 8 && !t.includes('Create Videos') && !t.includes('Seedance') && !t.includes('Dola AI')) {
                  return t;
                }
              }
              let prev = card.previousElementSibling;
              if (prev) {
                const pt = (prev.textContent || '').trim();
                if (pt && pt.length > 5 && pt.length < 2000 && !pt.includes('Create Videos')) return pt;
              }
            }
          }
        } catch(e) {}
        return null;
      }

      async function runDolaChatAnalysis() {
        analyzeDolaBtn.disabled = true;
        analyzeDolaBtn.innerHTML = '<span>⏳ Staging...</span>';

        try {
          let masterBlob = null;
          if (extractedBlobs.length > 0) {
            masterBlob = await stitchFramesIntoGrid(extractedBlobs, currentLayout);
          }
          if (!masterBlob && extractedBlobs.length > 0) {
            masterBlob = extractedBlobs[0].blob;
          }

          if (!masterBlob) {
            alert('Please wait for video frames to extract first.');
            analyzeDolaBtn.disabled = false;
            analyzeDolaBtn.innerHTML = '⚡ Via Dola';
            return;
          }

          const file = new File([masterBlob], `storyboard_${currentLayout.id}.jpg`, { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);

          let targetInput = Array.from(document.querySelectorAll('input[type="file"]')).find(i => !i.id?.includes('channa-ref'));
          if (!targetInput) {
            const plusBtn = Array.from(document.querySelectorAll('button')).find(b => {
              return b.querySelector('path[d*="M12.0005 2.25"]') || (b.innerText || '').trim() === '+' || b.getAttribute('aria-label')?.toLowerCase().includes('upload');
            });
            if (plusBtn) {
              plusBtn.click();
              await new Promise(r => setTimeout(r, 150));
              targetInput = Array.from(document.querySelectorAll('input[type="file"]')).find(i => !i.id?.includes('channa-ref'));
            }
          }

          if (targetInput) {
            try {
              targetInput.value = '';
              const proto = HTMLInputElement.prototype;
              const desc = Object.getOwnPropertyDescriptor(proto, 'files');
              if (desc && desc.set) {
                desc.set.call(targetInput, dt.files);
              } else {
                targetInput.files = dt.files;
              }
              targetInput.dispatchEvent(new Event('change', { bubbles: true }));
            } catch(e) {}
          }

          const reverseAnalysisPrompt = 'Please analyze this video motion storyboard sequence. Reverse-engineer and generate an exact cinematic AI video generation prompt for Seedance 2.5 detailing: 1. Subject and appearance, 2. Continuous action movement, 3. Camera choreography (tracking/pan/tilt), 4. Lighting and visual textures.';

          if (typeof window.injectPromptIntoDola === 'function') {
            window.injectPromptIntoDola(reverseAnalysisPrompt, { skipDna: true });
          }

          overlay.remove();
          if (typeof window.__showChannaNotice === 'function') {
            window.__showChannaNotice('⚡ Staged Storyboard into Dola Chat for Reverse-Prompting!');
          }
        } catch (err) {
          alert('Could not stage to Dola chat: ' + err.message);
        } finally {
          analyzeDolaBtn.disabled = false;
          analyzeDolaBtn.innerHTML = '⚡ Via Dola';
        }
      }

      if (analyzeDolaBtn) analyzeDolaBtn.onclick = runDolaChatAnalysis;

      if (copyPromptBtn) {
        copyPromptBtn.onclick = () => {
          const txt = (extractedPrompt.value || '').trim();
          if (!txt) return;
          navigator.clipboard.writeText(txt).then(() => {
            const orig = copyPromptBtn.textContent;
            copyPromptBtn.textContent = '✓ Copied!';
            setTimeout(() => { copyPromptBtn.textContent = orig; }, 1500);
          });
        };
      }

      if (applyPromptBtn) {
        applyPromptBtn.onclick = () => {
          const txt = (extractedPrompt.value || '').trim();
          if (!txt) return;
          if (typeof window.injectPromptIntoDola === 'function') {
            window.injectPromptIntoDola(txt, { skipDna: true });
            const orig = applyPromptBtn.textContent;
            applyPromptBtn.textContent = '✓ Applied!';
            if (typeof window.__showChannaNotice === 'function') window.__showChannaNotice('✍️ Prompt applied to Dola AI Composer!');
            setTimeout(() => { applyPromptBtn.textContent = orig; }, 1500);
          }
        };
      }

      let currentLayout = LAYOUT_PRESETS['3x4'];
      let extractedBlobs = [];
      let currentVideoArrayBuffer = null;
      let currentVideoMeta = null;
      let currentExtractRunId = 0;

      dropzone.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleVideoSource(file);
      };

      changeBtn.onclick = () => {
        currentExtractRunId++;
        playerSection.style.display = 'none';
        uploadSection.style.display = 'block';
        fileInput.value = '';
        if (promptResultContainer) promptResultContainer.style.display = 'none';
        if (extractedPrompt) extractedPrompt.value = '';
      };

      chatImportBtn.onclick = async () => {
        const origText = chatImportBtn.innerHTML;
        chatImportBtn.disabled = true;
        chatImportBtn.innerHTML = '<span>⏳ Grabbing Video...</span>';

        function cleanUrl(raw) {
          if (!raw || typeof raw !== 'string') return null;
          let s = raw.trim();
          if (s.startsWith('//')) s = window.location.protocol + s;
          if (s.startsWith('/')) {
            try { s = new URL(s, window.location.origin).href; } catch (e) {}
          }
          if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:')) {
            return s;
          }
          return null;
        }

        function extractUrlFromItem(item) {
          if (!item) return null;
          if (typeof item === 'string') return cleanUrl(item);
          return cleanUrl(
            item.url || item.src || item.video_url || item.videoUrl || 
            item.play_url || item.download_url || item.downloadUrl || 
            item.directUrl || item.rawUrl || item.item?.url
          );
        }

        const candidateUrls = [];
        const seenUrls = new Set();
        const addCandidate = (raw) => {
          const u = extractUrlFromItem(raw);
          if (u && !seenUrls.has(u)) {
            seenUrls.add(u);
            candidateUrls.push(u);
          }
        };

        // 1. In-memory master stream vault (window.__ctbExtractedVideos)
        if (Array.isArray(window.__ctbExtractedVideos)) {
          for (let i = window.__ctbExtractedVideos.length - 1; i >= 0; i--) {
            addCandidate(window.__ctbExtractedVideos[i]);
          }
        }

        // 2. Extractor window.__channaChatVideos
        if (Array.isArray(window.__channaChatVideos)) {
          for (let i = window.__channaChatVideos.length - 1; i >= 0; i--) {
            addCandidate(window.__channaChatVideos[i]);
          }
        }

        // 3. Shared DOM Bridge (__ctb_vault__)
        try {
          const bridge = document.getElementById('__ctb_vault__');
          if (bridge) {
            const rawV = JSON.parse(bridge.getAttribute('data-videos') || '[]');
            if (Array.isArray(rawV)) {
              for (let i = rawV.length - 1; i >= 0; i--) addCandidate(rawV[i]);
            }
            const rawC = JSON.parse(bridge.getAttribute('data-content-videos') || '[]');
            if (Array.isArray(rawC)) {
              for (let i = rawC.length - 1; i >= 0; i--) addCandidate(rawC[i]);
            }
          }
        } catch (e) {}

        // 4. SessionStorage & LocalStorage master stream vaults
        try {
          const stored = JSON.parse(sessionStorage.getItem('__CTB_MASTER_VIDEOS__') || '[]');
          if (Array.isArray(stored)) {
            for (let i = stored.length - 1; i >= 0; i--) addCandidate(stored[i]);
          }
        } catch (e) {}
        try {
          const storedLocal = JSON.parse(localStorage.getItem('__CTB_MASTER_VIDEOS__') || '[]');
          if (Array.isArray(storedLocal)) {
            for (let i = storedLocal.length - 1; i >= 0; i--) addCandidate(storedLocal[i]);
          }
        } catch (e) {}

        // 5. Query content script for latest video with quick timeout
        try {
          const fromContent = await new Promise((resolve) => {
            const onResp = (e) => {
              if (e.data?.type === 'CHANNA_LATEST_CHAT_VIDEO_RESPONSE') {
                window.removeEventListener('message', onResp);
                resolve(e.data?.video);
              }
            };
            window.addEventListener('message', onResp);
            window.postMessage({ type: 'CHANNA_REQUEST_LATEST_CHAT_VIDEO' }, '*');
            setTimeout(() => {
              window.removeEventListener('message', onResp);
              resolve(null);
            }, 180);
          });
          if (fromContent) addCandidate(fromContent);
        } catch (e) {}

        // 6. Direct DOM Scan of all <video> elements
        const domVideos = Array.from(document.querySelectorAll('video')).filter(v => v.id !== 'channa-ref-video');
        for (let i = domVideos.length - 1; i >= 0; i--) {
          const v = domVideos[i];
          addCandidate(v.currentSrc);
          addCandidate(v.src);
          v.querySelectorAll('source').forEach(s => {
            addCandidate(s.src || s.getAttribute('src') || s.getAttribute('data-src'));
          });
          addCandidate(v.getAttribute('src'));
          addCandidate(v.getAttribute('data-src'));
          addCandidate(v.getAttribute('data-video-url'));
          addCandidate(v.getAttribute('data-url'));
          addCandidate(v.getAttribute('data-play-url'));
          addCandidate(v.getAttribute('data-stream-url'));
        }

        // 7. Direct DOM Scan of download links & cards
        const mediaElements = Array.from(document.querySelectorAll(
          'a[href*=".mp4"], a[download*=".mp4"], a[href*="byteintl"], a[href*="ibytedtos"], [data-src*=".mp4"], [data-video-url], [data-url*="http"], [data-url*="byteintl"], [data-url*="ibytedtos"], [data-src*="blob:"], [data-video-url*="blob:"]'
        ));
        for (let i = mediaElements.length - 1; i >= 0; i--) {
          const el = mediaElements[i];
          addCandidate(el.href || el.getAttribute('data-video-url') || el.getAttribute('data-src') || el.getAttribute('data-url'));
        }

        // 8. Direct React Fiber scan on all message cards
        try {
          const messageCards = Array.from(document.querySelectorAll('[data-message-id], [class*="message"], [class*="bubble"], [class*="card"], [class*="video"], div[role="feed"] > div, div[role="region"] > div'));
          const pendingFbs = [];
          const scanObj = (obj, depth = 0, seen = new Set()) => {
            if (!obj || depth > 4 || typeof obj !== 'object' || seen.has(obj)) return;
            seen.add(obj);
            try {
              for (const k of Object.keys(obj)) {
                const val = obj[k];
                if (typeof val === 'string') {
                  if (val.includes('fallback_api') || (val.startsWith('http') && (val.includes('.mp4') || val.includes('byteintl') || val.includes('ibytedtos') || val.includes('tos-')))) {
                    if (val.includes('fallback_api')) {
                      if (typeof findFallbackApis === 'function') {
                        const fbs = findFallbackApis(null, val);
                        for (const fb of fbs) if (!pendingFbs.includes(fb)) pendingFbs.push(fb);
                      }
                    } else {
                      addCandidate(val);
                    }
                  }
                } else if (val && typeof val === 'object' && depth < 3) {
                  scanObj(val, depth + 1, seen);
                }
              }
            } catch (e) {}
          };
          messageCards.forEach(node => {
            const fKey = Object.keys(node).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$') || k.startsWith('__reactInternalInstance$'));
            if (fKey && node[fKey]) {
              let f = node[fKey];
              let d = 0;
              while (f && d < 7) {
                d++;
                const p = f.memoizedProps || f.pendingProps || f.props;
                if (p) scanObj(p, 0);
                f = f.return;
              }
            }
          });
          if (pendingFbs.length > 0 && typeof extractUnwatermarkedVideo === 'function') {
            await Promise.all(pendingFbs.slice(0, 5).map(fb => extractUnwatermarkedVideo(fb)));
            if (Array.isArray(window.__ctbExtractedVideos)) {
              for (let i = window.__ctbExtractedVideos.length - 1; i >= 0; i--) addCandidate(window.__ctbExtractedVideos[i]);
            }
          }
        } catch (e) {}

        // If candidate found now, load it!
        if (candidateUrls.length > 0) {
          const targetUrl = candidateUrls[0];
          chatImportBtn.innerHTML = '<span>✓ Video Loaded!</span>';
          await handleVideoSource(targetUrl);
          setTimeout(() => {
            chatImportBtn.disabled = false;
            chatImportBtn.innerHTML = origText;
          }, 1600);
          return;
        }

        // 9. Comprehensive Harvester Function
        try {
          if (typeof harvestAllChatVideosMainWorld === 'function') {
            const harvested = await harvestAllChatVideosMainWorld();
            if (Array.isArray(harvested) && harvested.length > 0) {
              for (let i = harvested.length - 1; i >= 0; i--) addCandidate(harvested[i]);
            }
          }
        } catch (e) {}

        if (candidateUrls.length > 0) {
          const targetUrl = candidateUrls[0];
          chatImportBtn.innerHTML = '<span>✓ Video Loaded!</span>';
          await handleVideoSource(targetUrl);
          setTimeout(() => {
            chatImportBtn.disabled = false;
            chatImportBtn.innerHTML = origText;
          }, 1600);
          return;
        }

        // 10. Intelligent Scroller Step-Scroll for Virtualized Chats
        try {
          const scrollSelectors = [
            '[class*="v_list_scroller"]',
            '[class*="list_scroller"]',
            '[class*="chat_scroller"]',
            '.scroller',
            '[class*="message-list"]',
            '[class*="chat-content"]',
            'main [class*="overflow-y-auto"]',
            '[class*="overflow-y-auto"]',
            'main',
            'section[class*="chat"]',
            'div[role="feed"]'
          ];
          let container = null;
          for (const sel of scrollSelectors) {
            const found = document.querySelector(sel);
            if (found && found.scrollHeight > found.clientHeight + 40) {
              container = found;
              break;
            }
          }
          if (!container) {
            container = document.scrollingElement || document.documentElement || document.body;
          }

          if (container) {
            const originalScroll = container.scrollTop;
            for (let step = 0; step < 2; step++) {
              container.scrollTop = Math.max(0, container.scrollTop - 480);
              container.dispatchEvent(new Event('scroll', { bubbles: true }));
              await new Promise(r => setTimeout(r, 180));

              const stepVideos = Array.from(document.querySelectorAll('video')).filter(v => v.id !== 'channa-ref-video');
              for (let i = stepVideos.length - 1; i >= 0; i--) {
                const v = stepVideos[i];
                addCandidate(v.currentSrc || v.src || v.querySelector('source')?.src || v.getAttribute('src'));
              }
              if (candidateUrls.length > 0) break;
            }
            container.scrollTop = originalScroll;
          }
        } catch (e) {}

        if (candidateUrls.length > 0) {
          const targetUrl = candidateUrls[0];
          chatImportBtn.innerHTML = '<span>✓ Video Loaded!</span>';
          await handleVideoSource(targetUrl);
          setTimeout(() => {
            chatImportBtn.disabled = false;
            chatImportBtn.innerHTML = origText;
          }, 1600);
          return;
        }

        // If no video found, reset button and alert user gracefully
        chatImportBtn.disabled = false;
        chatImportBtn.innerHTML = origText;
        alert('No generated videos found in active chat yet.\n\nTip: Please generate a video in Dola chat first, or drag & drop any MP4 video directly into the dropzone above!');
      };

      // Scrubber update
      videoEl.ontimeupdate = () => {
        const cur = (videoEl.currentTime || 0).toFixed(1);
        const dur = (videoEl.duration || 0).toFixed(1);
        timeDisplay.textContent = `${cur}s / ${dur}s`;
      };

      // Layout pills click
      document.querySelectorAll('.channa-ref-mode-pill').forEach(pill => {
        pill.onclick = () => {
          document.querySelectorAll('.channa-ref-mode-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const key = pill.getAttribute('data-layout') || '3x4';
          currentLayout = LAYOUT_PRESETS[key] || LAYOUT_PRESETS['3x4'];
          layoutBadge.textContent = currentLayout.desc;
          if (videoEl.src || currentVideoArrayBuffer) extractFrames();
        };
      });

      // Pin Scrubber Frame
      pinBtn.onclick = async () => {
        if (!videoEl.duration) return;
        currentExtractRunId++;
        statusEl.textContent = 'Pinning frame...';

        document.querySelectorAll('.channa-ref-mode-pill').forEach(p => p.classList.remove('active'));
        const heroPill = document.querySelector('.channa-ref-mode-pill[data-layout="hero"]');
        if (heroPill) heroPill.classList.add('active');
        currentLayout = LAYOUT_PRESETS['hero'];
        layoutBadge.textContent = currentLayout.desc;

        const curTime = Math.max(0.08, Math.min(videoEl.currentTime || 0, videoEl.duration - 0.08));
        const res = await seekAndCapture(videoEl, curTime);
        if (res?.blob) {
          extractedBlobs = [{ blob: res.blob, time: curTime.toFixed(1) }];
          strip.innerHTML = '';
          strip.style.display = 'flex';
          strip.style.justifyContent = 'center';
          strip.style.alignItems = 'center';

          const aspect = (videoEl.videoWidth && videoEl.videoHeight)
            ? (videoEl.videoWidth / videoEl.videoHeight)
            : (currentVideoMeta?.aspectRatio || 16/9);

          renderThumbnail(res.blob, curTime.toFixed(1), 'Hero', true, aspect);
          statusEl.textContent = '✓ Hero Frame Pinned';
          injectBtn.disabled = false;
        }
      };

      function fetchBlobViaExtensionBridge(videoUrl, timeoutMs = 3500) {
        return new Promise((resolve) => {
          const reqId = 'ctb_blob_' + Date.now() + '_' + Math.random().toString(36).slice(2);
          const onMsg = (e) => {
            if (e.data?.type === 'CHANNA_FETCH_BLOB_RESP' && e.data?.id === reqId) {
              window.removeEventListener('message', onMsg);
              if (e.data.ok && e.data.base64) {
                try {
                  const bstr = atob(e.data.base64);
                  let n = bstr.length;
                  const u8arr = new Uint8Array(n);
                  while (n--) u8arr[n] = bstr.charCodeAt(n);
                  resolve(u8arr.buffer);
                  return;
                } catch (err) {}
              }
              resolve(null);
            }
          };
          window.addEventListener('message', onMsg);
          window.postMessage({ type: 'CHANNA_FETCH_BLOB_REQ', id: reqId, url: videoUrl }, '*');
          setTimeout(() => {
            window.removeEventListener('message', onMsg);
            resolve(null);
          }, timeoutMs);
        });
      }

      async function handleVideoSource(srcOrFile) {
        currentExtractRunId++;
        playerSection.style.display = 'block';
        uploadSection.style.display = 'none';
        statusEl.textContent = 'Analyzing video stream...';

        let url = '';
        if (srcOrFile instanceof File || srcOrFile instanceof Blob) {
          url = URL.createObjectURL(srcOrFile);
          currentVideoArrayBuffer = await srcOrFile.arrayBuffer();
        } else {
          url = srcOrFile;
          try {
            const autoPrompt = findPromptForChatVideo(url);
            if (autoPrompt && promptResultContainer && extractedPrompt) {
              promptResultContainer.style.display = 'block';
              extractedPrompt.value = autoPrompt;
              promptStatus.style.color = '#10b981';
              promptStatus.textContent = '✓ Original Dola Chat Prompt Detected';
            }
          } catch (e) {}
          let fetchedBuffer = null;
          try {
            const resp = await fetch(url, { mode: 'cors' });
            if (resp.ok) {
              fetchedBuffer = await resp.arrayBuffer();
            }
          } catch (e) {
            console.warn('[Video Ref] Direct stream CORS notice, trying extension bridge:', e);
          }

          if (!fetchedBuffer) {
            try {
              fetchedBuffer = await fetchBlobViaExtensionBridge(url);
            } catch (err) {}
          }

          if (fetchedBuffer) {
            currentVideoArrayBuffer = fetchedBuffer;
            const blob = new Blob([currentVideoArrayBuffer], { type: 'video/mp4' });
            url = URL.createObjectURL(blob);
          }
        }

        if (currentVideoArrayBuffer) {
          try {
            currentVideoMeta = parseMp4Metadata(currentVideoArrayBuffer);
            if (currentVideoMeta) {
              const r = currentVideoMeta.aspectRatio;
              aspectDisplay.textContent = Math.abs(r - (16/9)) < 0.08 ? '16:9 HD' : Math.abs(r - (9/16)) < 0.08 ? '9:16 Vertical' : `${currentVideoMeta.width}×${currentVideoMeta.height}`;
            }
          } catch (e) {}
        }

        videoEl.crossOrigin = 'anonymous';
        videoEl.src = url;

        const onReady = () => {
          if (videoEl.videoWidth && videoEl.videoHeight) {
            const r = videoEl.videoWidth / videoEl.videoHeight;
            aspectDisplay.textContent = Math.abs(r - (16/9)) < 0.08 ? '16:9 HD' : Math.abs(r - (9/16)) < 0.08 ? '9:16 Vertical' : `${videoEl.videoWidth}×${videoEl.videoHeight}`;
          }
          extractFrames();
        };

        if (videoEl.readyState >= 1) {
          onReady();
        } else {
          videoEl.onloadedmetadata = onReady;
        }

        videoEl.onerror = () => {
          if (videoEl.crossOrigin) {
            videoEl.removeAttribute('crossorigin');
            videoEl.src = url;
            return;
          }
          statusEl.textContent = '⚠️ Video stream active. Extracting keyframes...';
          extractFrames();
        };
      }

      async function extractFrames() {
        const runId = ++currentExtractRunId;
        const N = currentLayout.count;
        statusEl.textContent = `Extracting ${N} keyframes...`;
        injectBtn.disabled = true;
        strip.innerHTML = '';
        extractedBlobs = [];

        const aspect = (videoEl.videoWidth && videoEl.videoHeight)
          ? (videoEl.videoWidth / videoEl.videoHeight)
          : (currentVideoMeta?.aspectRatio || 16/9);

        if (currentLayout.id === 'hero' || N === 1) {
          strip.style.display = 'flex';
          strip.style.justifyContent = 'center';
          strip.style.alignItems = 'center';
        } else {
          strip.style.display = 'grid';
          strip.style.gridTemplateColumns = `repeat(${currentLayout.cols}, 1fr)`;
        }

        const dur = (isFinite(videoEl.duration) && videoEl.duration > 0) ? videoEl.duration : 10;
        const startT = Math.max(0.12, dur * 0.05);
        const endT = Math.max(startT + 0.2, dur * 0.92);
        const step = (N === 1) ? 0 : (endT - startT) / (N - 1);

        for (let i = 0; i < N; i++) {
          if (runId !== currentExtractRunId) return; // User switched layout, abort!

          const t = (N === 1) ? Math.min(dur - 0.1, Math.max(0.12, dur * 0.5)) : startT + i * step;
          statusEl.textContent = `Extracting frame ${i + 1}/${N}...`;

          const res = await seekAndCapture(videoEl, t);
          if (runId !== currentExtractRunId) return;

          if (res?.blob) {
            extractedBlobs.push({ blob: res.blob, time: res.time });
            renderThumbnail(res.blob, res.time, (N === 1) ? 'Hero' : `T${i + 1}`, N === 1, aspect);
          }
        }

        if (runId === currentExtractRunId) {
          statusEl.textContent = `✓ ${extractedBlobs.length} Frames Ready`;
          injectBtn.disabled = extractedBlobs.length === 0;
        }
      }

      function renderThumbnail(blob, timeStr, stepLabel, isHero = false, aspect = 16/9) {
        const thumb = document.createElement('div');
        thumb.className = 'channa-ref-thumb-box';

        const isPortrait = aspect < 0.85;
        if (isHero) {
          thumb.style.height = '175px';
          thumb.style.width = isPortrait ? `${Math.round(175 * aspect)}px` : `${Math.min(320, Math.round(175 * aspect))}px`;
          thumb.style.maxWidth = '100%';
          thumb.style.margin = '0 auto';
          thumb.style.borderColor = '#8b5cf6';
          thumb.style.boxShadow = '0 0 16px rgba(139, 92, 246, 0.35)';
          const rows = currentLayout.rows || 3;
          const h = (rows === 1) ? (isPortrait ? 130 : 95) : (rows >= 5 ? (isPortrait ? 65 : 52) : (rows === 4 ? (isPortrait ? 80 : 66) : (isPortrait ? 95 : 75)));
          thumb.style.height = `${h}px`;
          thumb.style.width = '100%';
        }

        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        img.alt = stepLabel;

        const badge = document.createElement('div');
        badge.className = 'channa-ref-thumb-badge';
        badge.textContent = `${timeStr}s`;

        const step = document.createElement('div');
        step.className = 'channa-ref-thumb-step';
        step.textContent = stepLabel;

        thumb.appendChild(img);
        thumb.appendChild(badge);
        thumb.appendChild(step);
        strip.appendChild(thumb);
      }

      // 🛡️ Zero-Black-Frame Seek & Capture (With Fallback Timeout & Exact Drawing)
      function seekAndCapture(video, time) {
        return new Promise((resolve) => {
          const dur = (isFinite(video.duration) && video.duration > 0) ? video.duration : 10;
          const safeTime = Math.max(0.08, Math.min(time, dur - 0.08));

          let resolved = false;
          let timer = null;

          const finish = () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timer);
            video.removeEventListener('seeked', onSeeked);

            try {
              const vw = video.videoWidth || 640;
              const vh = video.videoHeight || 360;
              const canvas = document.createElement('canvas');
              canvas.width = vw;
              canvas.height = vh;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(video, 0, 0, vw, vh);

              canvas.toBlob((blob) => {
                resolve({ blob: blob || null, time: safeTime.toFixed(1) });
              }, 'image/jpeg', 0.92);
            } catch (err) {
              resolve(null);
            }
          };

          const onSeeked = () => finish();
          timer = setTimeout(finish, 850); // safety fallback

          video.addEventListener('seeked', onSeeked, { once: true });
          try {
            video.currentTime = safeTime;
          } catch (e) {
            finish();
          }
        });
      }

      // 🖼️ Master Multi-Frame Storyboard Canvas Compositor
      async function stitchFramesIntoGrid(frames, layout) {
        if (!frames || frames.length === 0) return null;
        if (frames.length === 1 || layout.id === 'hero') return frames[0].blob;

        const loadedImgs = await Promise.all(frames.map(f => {
          return new Promise((res) => {
            const img = new Image();
            img.onload = () => res({ img, time: f.time });
            img.onerror = () => res(null);
            img.src = URL.createObjectURL(f.blob);
          });
        }));

        const valid = loadedImgs.filter(Boolean);
        if (valid.length === 0) return null;

        const cols = layout.cols;
        const rows = Math.ceil(valid.length / cols);
        const singleW = valid[0].img.naturalWidth || 640;
        const singleH = valid[0].img.naturalHeight || 360;
        const aspect = singleW / singleH;

        let cellW = (cols === 3) ? 480 : (cols === 4 ? 380 : (cols === 5 ? 320 : (cols === 6 ? 260 : 480)));
        let cellH = Math.round(cellW / aspect);

        const dividerW = 4;
        const totalW = (cols * cellW) + (dividerW * (cols - 1));
        const totalH = (rows * cellH) + (dividerW * (rows - 1));

        const canvas = document.createElement('canvas');
        canvas.width = totalW;
        canvas.height = totalH;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#080612';
        ctx.fillRect(0, 0, totalW, totalH);

        for (let i = 0; i < valid.length; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const x = c * (cellW + dividerW);
          const y = r * (cellH + dividerW);

          ctx.drawImage(valid[i].img, x, y, cellW, cellH);
        }

        return new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.94));
      }

      // Inject into Dola Composer
      injectBtn.onclick = async () => {
        if (extractedBlobs.length === 0) return;
        const now = Date.now();
        if (window.__CTB_LAST_STAGED_TIME__ && (now - window.__CTB_LAST_STAGED_TIME__ < 4000)) {
          return;
        }
        window.__CTB_LAST_STAGED_TIME__ = now;

        injectBtn.disabled = true;
        injectBtn.innerHTML = '⏳ Staging Master Storyboard...';

        const masterBlob = await stitchFramesIntoGrid(extractedBlobs, currentLayout);
        if (masterBlob) {
          const fileName = `motion_reference_${currentLayout.id}.jpg`;
          const file = new File([masterBlob], fileName, { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);

          function detectDolaModeForVideoRef() {
            try {
              const path = (window.location.pathname || '').toLowerCase();
              if (path.includes('create-video') || (path.includes('/video') && !path.includes('chat'))) {
                return 'CREATE_VIDEO';
              }

              const container = document.getElementById('input-engine-container') || document.querySelector('.guidance-input-surface, form, [class*="chat-input"]') || document;

              // Check Create Video pills (Ratio, Duration, Video Model)
              const hasVideoPills = !!container.querySelector('[data-input-engine-actionbar-control-key*="ratio"], [data-input-engine-actionbar-control-key*="duration"], [data-input-engine-actionbar-control-key*="video-model"]') ||
                Array.from(container.querySelectorAll('button, div[role="button"]')).some(b => {
                  const t = (b.textContent || '').trim();
                  return /^Ratio\b/i.test(t) || /\b(5s|10s|15s)\b/i.test(t) || (/^Model\b/i.test(t) && !t.includes('Pro') && !t.includes('Fast'));
                });
              if (hasVideoPills) return 'CREATE_VIDEO';

              // Check Chat mode buttons (Pro vs Fast)
              const candidates = Array.from(container.querySelectorAll('button, div[role="button"], span, div'));
              const isPro = candidates.some(el => {
                const t = (el.textContent || '').trim();
                return /\bPro\b/i.test(t) && !t.includes('Prompt') && !t.includes('Project');
              });
              if (isPro) return 'PRO';

              const isFast = candidates.some(el => {
                const t = (el.textContent || '').trim();
                return /\bFast\b/i.test(t) && !t.includes('Fast action');
              });
              if (isFast) return 'FAST';
            } catch (e) {}

            return 'PRO';
          }

          const activeMode = detectDolaModeForVideoRef();
          console.log('[Channa Video-Ref] 🎯 Staging storyboard for active mode:', activeMode);

          if (activeMode === 'PRO') {
            // 🎯 PRO CHAT MODE: Direct single non-bubbling paste on Tiptap/ProseMirror editor (Strictly 1 upload)
            const editor = document.querySelector('#input-engine-container .tiptap, #input-engine-container .ProseMirror, .tiptap, .ProseMirror, [role="textbox"], textarea');
            if (editor) {
              try {
                editor.focus();
                const pasteEvt = new ClipboardEvent('paste', {
                  bubbles: false,
                  cancelable: true,
                  composed: false,
                  clipboardData: dt
                });
                editor.dispatchEvent(pasteEvt);
              } catch (e) {
                console.warn('[Channa Video-Ref] Pro paste error:', e);
              }
            }
          } else {
            // 🎯 FAST CHAT MODE & CREATE VIDEO MODE: Native File Input (100% stable, exactly 1 card, never double-injects or self-deletes)
            let targetInput = Array.from(document.querySelectorAll('input[type="file"]')).find(i => !i.id?.includes('channa-ref'));
            if (!targetInput) {
              const plusBtn = Array.from(document.querySelectorAll('button')).find(b => {
                return b.querySelector('path[d*="M12.0005 2.25"]') || (b.innerText || '').trim() === '+' || b.getAttribute('aria-label')?.toLowerCase().includes('upload');
              });
              if (plusBtn) {
                plusBtn.click();
                await new Promise(r => setTimeout(r, 120));
                targetInput = Array.from(document.querySelectorAll('input[type="file"]')).find(i => !i.id?.includes('channa-ref'));
              }
            }

            if (targetInput) {
              try {
                targetInput.value = '';
                const proto = HTMLInputElement.prototype;
                const desc = Object.getOwnPropertyDescriptor(proto, 'files');
                if (desc && desc.set) {
                  desc.set.call(targetInput, dt.files);
                } else {
                  targetInput.files = dt.files;
                }
                targetInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
              } catch (e) {
                console.warn('[Channa Video-Ref] File input staging error:', e);
              }
            } else {
              // Fallback if file input not found: use single editor paste
              const editor = document.querySelector('#input-engine-container .tiptap, #input-engine-container .ProseMirror, .tiptap, .ProseMirror, [role="textbox"], textarea');
              if (editor) {
                try {
                  editor.focus();
                  const pasteEvt = new ClipboardEvent('paste', {
                    bubbles: false,
                    cancelable: true,
                    composed: false,
                    clipboardData: dt
                  });
                  editor.dispatchEvent(pasteEvt);
                } catch (e) {}
              }
            }
          }

          // Notify content script that image is already staged
          window.postMessage({
            type: 'STAGE_VIDEO_REF_PAYLOAD',
            alreadyStaged: true,
            promptGuide: ''
          }, '*');

          let motionGuide = '';
          const autoPrompt = document.getElementById('channa-ref-auto-prompt');
          if (autoPrompt?.checked) {
            motionGuide = (currentLayout.id === 'hero')
              ? '[Video Reference: Keyframe pose and compositional reference. Follow character posture, framing, and action state]'
              : `[Video Reference: Storyboard Matrix (${extractedBlobs.length} Frames, ${currentLayout.label}). Strictly follow the continuous chronological action progression, camera trajectory, and character motion dynamics across the sequence]`;
          }

          if (motionGuide && typeof window.injectPromptIntoDola === 'function') {
            const comp = document.querySelector('.tiptap, [role="textbox"], textarea');
            let cur = (comp?.textContent || comp?.value || '').trim();
            // Clean any accidental Character DNA tokens from composer so it never contaminates Video Ref
            cur = cur.replace(/\[Character DNA:[^\]]*\]\s*/gi, '').trim();
            if (!cur.includes(motionGuide)) {
              const combined = cur ? `${cur} ${motionGuide}` : motionGuide;
              window.injectPromptIntoDola(combined, { skipDna: true });
            }
          }

          overlay.remove();
          if (typeof window.__showChannaNotice === 'function') {
            window.__showChannaNotice(`🎬 Injected ${currentLayout.label} Storyboard into Dola AI!`);
          }
        }
      };
      } catch (err) {
        console.error('[Channa Video Ref] Error opening modal:', err);
      }
    }

    // Window Listeners
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'CHANNA_OPEN_VIDEO_REF_MODAL') openVideoRefModal();
    });
    window.addEventListener('CHANNA_OPEN_VIDEO_REF_MODAL', openVideoRefModal);
    window.openChannaVideoRefModal = openVideoRefModal;
    window.openVideoRefModal = openVideoRefModal;

    function findComposerToolbarAnchor() {
      const container = document.getElementById('input-engine-container') || document.querySelector('[class*="chat-input"]') || document.querySelector('form');
      if (!container) return null;

      const candidates = container.querySelectorAll('button, div[role="button"], span, [data-input-engine-actionbar-control-key]');
      let ratioTarget = null;
      let durTarget = null;
      let modelTarget = null;
      let fastTarget = null;
      let plusTarget = null;
      let sendTarget = null;

      for (let i = 0; i < candidates.length; i++) {
        const el = candidates[i];
        if (el.id === 'channa-actor-ref-btn' || el.id === 'channa-video-ref-btn') continue;
        if (el.closest && el.closest('#duongtho-ref-dock-btn, #duongtho-ref-popover, #channa-accounts-dock-btn, #channa-actor-dock-btn, #channa-prompt-dock, #channa-top-center-capsule, [class*="sidebar"], nav, header')) continue;

        const txt = (el.textContent || '').trim();
        const key = el.getAttribute('data-input-engine-actionbar-control-key') || '';

        if (/^Ratio\b/i.test(txt) || /^(?:9:16|16:9|1:1|3:4|4:3|21:9)$/.test(txt) || txt.includes('THE BRAND') || key.includes('ratio')) {
          ratioTarget = el.closest('button, div[role="button"]') || el;
        } else if ((/\b\d+s\b/i.test(txt) && !txt.includes('Fast')) || /\b\d+s\s+CHANNA\b/i.test(txt) || key.includes('duration')) {
          durTarget = el.closest('button, div[role="button"]') || el;
        } else if (txt.includes('Model') || key.includes('video-model')) {
          modelTarget = el.closest('button, div[role="button"]') || el;
        }
      }

      // Mount beside Video Mode active controls
      const target = ratioTarget || durTarget || modelTarget;
      if (target && target.parentElement) {
        return { parent: target.parentElement, before: target.nextSibling };
      }

      return null;
    }
    window.__findComposerToolbarAnchor = findComposerToolbarAnchor;

    function bindVideoRefButtonEvents(el) {
      if (!el) return;
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.style.position = 'relative';
      el.style.zIndex = '99999';

      const triggerOpen = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
        }
        openVideoRefModal();
      };

      el.onclick = triggerOpen;
      el.onpointerup = (e) => {
        setTimeout(() => {
          const modal = document.getElementById('channa-ref-modal-overlay');
          if (!modal) triggerOpen(e);
        }, 50);
      };
      el.onpointerdown = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation?.();
      };
      el.onmousedown = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation?.();
      };
    }

    // Mount '🎬' Icon Button in Composer Toolbar
    function mountVideoRefButton() {
      const mount = findComposerToolbarAnchor();
      let existingBtn = document.getElementById('channa-video-ref-btn');

      if (!mount || !mount.parent) {
        if (existingBtn) existingBtn.style.display = 'none';
        return;
      }

      if (existingBtn) {
        existingBtn.style.display = 'inline-flex';
        if (existingBtn.innerHTML !== '🎬') {
          existingBtn.innerHTML = '🎬';
          existingBtn.title = '🎬 Video Reference Suite (Click to open Video-to-Video Storyboard)';
        }
        bindVideoRefButtonEvents(existingBtn);
        if (existingBtn.parentElement !== mount.parent || (mount.before && existingBtn.nextSibling !== mount.before)) {
          if (mount.before) mount.parent.insertBefore(existingBtn, mount.before);
          else mount.parent.appendChild(existingBtn);
        }
        return;
      }

      const btn = document.createElement('button');
      btn.id = 'channa-video-ref-btn';
      btn.type = 'button';
      btn.innerHTML = '🎬';
      btn.title = '🎬 Video Reference Suite (Click to open Video-to-Video Storyboard)';
      bindVideoRefButtonEvents(btn);

      if (mount.before) mount.parent.insertBefore(btn, mount.before);
      else mount.parent.appendChild(btn);
    }
    window.__mountVideoRefButton = mountVideoRefButton;

    // Document Capture-Phase Fallback (Guarantees modal opens even if Dola attempts to capture or prevent clicks)
    document.addEventListener('click', (e) => {
      const btn = e.target?.closest ? e.target.closest('#channa-video-ref-btn') : null;
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        openVideoRefModal();
      }
    }, true);

    document.addEventListener('pointerdown', (e) => {
      if (e.target?.closest && e.target.closest('#channa-video-ref-btn')) {
        e.stopPropagation();
        e.stopImmediatePropagation?.();
      }
    }, true);

    document.addEventListener('mousedown', (e) => {
      if (e.target?.closest && e.target.closest('#channa-video-ref-btn')) {
        e.stopPropagation();
        e.stopImmediatePropagation?.();
      }
    }, true);

    function expandNativeFileInputAccept() {
      document.querySelectorAll('input[type="file"]:not(#channa-ref-file-input)').forEach(inp => {
        const accept = inp.getAttribute('accept') || '';
        if (!accept.includes('video')) {
          inp.setAttribute('accept', accept ? accept + ',video/mp4,video/webm,video/quicktime' : 'image/*,video/*');
        }
      });
    }

    setInterval(mountVideoRefButton, 2000);
    setInterval(expandNativeFileInputAccept, 3000);
    document.addEventListener('DOMContentLoaded', mountVideoRefButton, { passive: true });
    window.addEventListener('load', mountVideoRefButton, { passive: true });
  })();

  
// ============================================================================
// 📥 DUONG THO - PARVEEN V7.5 1080P VIDEO EXTRACTOR & ANDROID GALLERY DOWNLOADER
// ============================================================================
(function() {
  'use strict';

  // 1. Hide account & prompt floating buttons cleanly via DOM style (Never raw CSS)
  try {
    const st = document.createElement('style');
    st.id = 'duongtho-clean-dock-style';
    st.textContent = '#channa-accounts-dock-btn, #channa-accounts-quick-popover, #channa-dock-toggle-btn, #channa-prompt-dock { display: none !important; opacity: 0 !important; pointer-events: none !important; }';
    (document.head || document.documentElement).appendChild(st);
  } catch(e) {}

  if (window.duongThoExtractorActive) return;
  window.duongThoExtractorActive = true;
  console.log('[DuongTho] Parveen v7.5 1080P Extractor Active...');

  let visitedApis = new Set(),
    visitedSignatures = new Set(),
    visitedVids = new Set(),
    visitedInFlight = new Set(),
    extractedList = [];

  window.zdolaVideoMap = window.zdolaVideoMap || {};
  window.zdolaLastActiveVid = null;
  window.duongThoVideos = extractedList;
  window.__ctbExtractedVideos = extractedList;
  window.duongThoChatUrl = location.href;

  let currentChatUrl = location.href,
    isPaused = false;

  function notifyAndroidCount() {
    try {
      const count = extractedList.length;
      if (window.AndroidDuongTho && typeof window.AndroidDuongTho.updateVideoCount === 'function') {
        window.AndroidDuongTho.updateVideoCount(count);
      }
      if (window.DuongThoAndroid && typeof window.DuongThoAndroid.updateVideoCount === 'function') {
        window.DuongThoAndroid.updateVideoCount(count);
      }
      if (typeof updateExtensionBarCount === 'function') {
        updateExtensionBarCount(count);
      }
    } catch(e) {}
  }

  function syncStorage() {
    window.duongThoVideos = extractedList;
    window.__ctbExtractedVideos = extractedList;
    window.duongThoChatUrl = currentChatUrl;
    try {
      localStorage.setItem('duongtho_extracted_videos', JSON.stringify(extractedList));
    } catch(e) {}
    notifyAndroidCount();
    try {
      attachIndividualVideoDownloadButtons();
    } catch(e) {}
  }

  function addVideo(url, filename, coverUrl, vid, extra) {
    if (!url || isPaused) return false;
    let extraList = (extra || []).filter(Boolean);
    if (extraList.some(k => visitedVids.has(k))) return false;
    extraList.forEach(k => visitedVids.add(k));

    let sig = (function extractSig(u) {
      try {
        let r = new URL(u, location.origin);
        for (let n of ['video_id', 'file_id', 'item_id', 'vid']) {
          let val = r.searchParams.get(n);
          if (val && val.length >= 10) return (n + ':' + val).toLowerCase();
        }
        let p = r.pathname, l = p.match(/[a-f0-9]{24,}/gi);
        if (l && l.length) return l[l.length - 1].toLowerCase();
        let o = (p.match(/[a-zA-Z0-9_-]{16,}/g) || []).filter(e => !/^tos-/i.test(e));
        if (o.length) return o[o.length - 1].toLowerCase();
        return '';
      } catch(s) { return ''; }
    })(url);

    let cleanUrl = url.split('?')[0];
    if ((vid && visitedVids.has(vid)) || (sig && visitedSignatures.has(sig)) || (!vid && !sig && visitedSignatures.has(cleanUrl))) return false;
    if (vid) visitedVids.add(vid);
    if (sig) visitedSignatures.add(sig);
    if (!vid && !sig) visitedSignatures.add(cleanUrl);

    let finalName = filename.endsWith('.mp4') ? filename : (filename + '.mp4');
    const entry = { id: vid || sig, vid: vid || '', sig: sig, url: url, filename: finalName, coverUrl: coverUrl || '' };
    extractedList.push(entry);
    syncStorage();
    console.log('[DuongTho 1080P] + ' + finalName + ' (total: ' + extractedList.length + ')');
    return true;
  }

  function padBase64(e) {
    let t = (4 - e.length % 4) % 4;
    return e + '='.repeat(t);
  }

  function decodeBase64Bytes(e) {
    let t = String(e || '').trim(),
      candidates = [t, t.replace(/[$@#]/g, m => ({ '$': '_', '@': '/', '#': '.' })[m]), t.replace(/[$@#]/g, m => ({ '$': '+', '@': '/', '#': '=' })[m])];
    for (let c of candidates) {
      try {
        let clean = padBase64(c).replace(/-/g, '+').replace(/_/g, '/');
        let bin = atob(clean);
        let arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return arr;
      } catch(err) {}
    }
    return null;
  }

  function decodeUtf8(bytes) {
    if (!bytes || !bytes.length) return '';
    for (let b of bytes) if (b !== 9 && b !== 10 && b !== 13 && (b < 32 || b > 126)) return '';
    return new TextDecoder().decode(bytes);
  }

  async function decryptAesCbc(payload, key, iv) {
    if (!payload.length || payload.length % 16 !== 0) return '';
    try {
      let cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-CBC', false, ['decrypt']);
      let decrypted = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, cryptoKey, payload));
      let text = decodeUtf8(decrypted);
      if (/^https?:\/\//i.test(text)) return text;
      let unpad = (function(buf) {
        if (!buf || !buf.length) return new Uint8Array();
        let pad = buf[buf.length - 1];
        if (pad < 1 || pad > 16 || pad > buf.length) return buf;
        for (let i = buf.length - pad; i < buf.length; i++) if (buf[i] !== pad) return buf;
        return buf.slice(0, buf.length - pad);
      })(decrypted);
      let unpadText = decodeUtf8(unpad);
      return /^https?:\/\//i.test(unpadText) ? unpadText : '';
    } catch(e) { return ''; }
  }

  async function decryptQaab(token, keySeed) {
    let payloadBytes = decodeBase64Bytes(token);
    let seedBytes = decodeBase64Bytes(keySeed);
    if (!payloadBytes || !seedBytes) return '';

    let shaSeed = await crypto.subtle.digest('SHA-512', seedBytes.slice(0, 32));
    let salt = (function(hex) {
      let arr = new Uint8Array(hex.length / 2);
      for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.slice(2 * i, 2 * i + 2), 16);
      return arr;
    })('4dd4c2e6b83162090e52b3c7a6733ba41cb2462b829ab58a196b39db57177524f49baf7f08e8d68d26a72e37c1a95a2f1f05a51892aef2949732b62a38aadd58');

    let combined = new Uint8Array(shaSeed.byteLength + salt.length);
    combined.set(new Uint8Array(shaSeed), 0);
    combined.set(salt, shaSeed.byteLength);

    let derived = new Uint8Array(await crypto.subtle.digest('SHA-512', combined));
    let key1 = derived.slice(0, 16);
    let iv1 = derived.slice(16, 32);

    let attempts = [];
    if (payloadBytes.length >= 4 && payloadBytes[0] === 168 && payloadBytes[1] === 0 && payloadBytes[2] === 1 && payloadBytes[3] === 0) {
      attempts.push({ payload: payloadBytes.slice(4), key: key1, iv: iv1 });
      attempts.push({ payload: payloadBytes.slice(4), key: iv1, iv: key1 });
      if (payloadBytes.length > 36) {
        attempts.push({ payload: payloadBytes.slice(36), key: key1, iv: payloadBytes.slice(20, 36) });
        attempts.push({ payload: payloadBytes.slice(36), key: payloadBytes.slice(36), iv: key1 });
      }
    } else {
      attempts.push({ payload: payloadBytes, key: key1, iv: iv1 });
    }

    for (let att of attempts) {
      let dec = await decryptAesCbc(att.payload, att.key, att.iv);
      if (dec) return dec;
    }
    return '';
  }

  async function resolveVideoUrl(token, keySeed = '') {
    if (/^https?:\/\//i.test(token)) return token;
    let direct = decodeUtf8(decodeBase64Bytes(token));
    if (/^https?:\/\//i.test(direct)) return direct;
    if (token.startsWith('qAAB') && keySeed) return await decryptQaab(token, keySeed);
    return '';
  }

  let fileSeq = 0;
  function makeFilename(vid) {
    if (vid) return 'DuongTho_' + vid + '.mp4';
    let now = Date.now();
    if (now <= fileSeq) now = fileSeq + 1;
    fileSeq = now;
    return 'DuongTho_' + now + '.mp4';
  }

  async function processVideoInfoJson(jsonStr, vidHint) {
    if (isPaused) return;
    let data;
    try { data = JSON.parse(jsonStr); } catch(e) { return; }
    try {
      let info = data?.video_info || data?.data?.video_info || data?.data || data;
      let list = info?.video_list || info?.data?.video_list || data?.video_list;
      if (!list) return;

      let vid = vidHint || info?.vid || data?.data?.vid || data?.vid || '';
      let entries = Object.values(list).filter(Boolean).map(e => ({
        entry: e,
        token: String(e.main_url || e.play_url || '').trim(),
        pixels: Number(e.vwidth || e.width || 0) * Number(e.vheight || e.height || 0),
        bitrate: Number(e.bitrate || e.real_bitrate || 0)
      })).filter(e => e.token).sort((a, b) => b.pixels - a.pixels || b.bitrate - a.bitrate);

      if (!entries.length) return;

      let keySeed = (function findSeed(obj, depth = 0) {
        if (depth > 10 || !obj) return '';
        if (typeof obj === 'string') {
          let m = obj.match(/(?:^|[?&])key_seed=([^&"'<>\\s]+)/i) || obj.match(/["']key_seed["']\s*:\s*["']([^"']+)/i);
          return m ? decodeURIComponent(m[1]) : '';
        }
        if (typeof obj !== 'object') return '';
        if (typeof obj.key_seed === 'string' && obj.key_seed.trim()) return obj.key_seed.trim();
        for (let v of Object.values(obj)) {
          let res = findSeed(v, depth + 1);
          if (res) return res;
        }
        return '';
      })(data);

      for (let item of entries) {
        let url = await resolveVideoUrl(item.token, keySeed);
        if (!url) continue;

        let filename = makeFilename(vid);
        let cover = (data?.cover_url?.url_list && data.cover_url.url_list[0]) || '';
        let mediaRecord = { url: url, filename: filename };
        if (vid) window.zdolaVideoMap[vid] = mediaRecord;

        addVideo(url, filename, cover, vid);
        return;
      }
    } catch(err) {}
  }

  async function fetchPlayInfoUrl(url) {
    if (isPaused) return;
    let clean = url;
    let vid = '';
    try {
      let u = new URL(url, location.origin);
      vid = u.searchParams.get('vid') || u.searchParams.get('video_id') || '';
      u.searchParams.set('channel', 'no');
      u.searchParams.set('codec_type', '8');
      u.searchParams.set('logo_type', 'unwatermarked');
      clean = u.toString();
    } catch(e) {}

    if (vid && (visitedVids.has(vid) || visitedInFlight.has(vid))) return;
    if (vid) visitedInFlight.add(vid);

    for (let opt of [{ credentials: 'omit' }, { credentials: 'include' }]) {
      try {
        let resp = await fetch(clean, opt);
        if (!resp.ok) continue;
        let prevCount = extractedList.length;
        await processVideoInfoJson(await resp.text(), vid || null);
        if (extractedList.length > prevCount) return;
      } catch(err) {}
    }
  }

  function extractFallbackUrls(str, set) {
    if (!str || typeof str !== 'string') return;
    let patterns = [/fallback_api\\":\\"(.*?)\\"/g, /"fallback_api"\s*:\s*"([^"]+)"/g, /fallback_api&quot;:&quot;(.*?)&quot;/g];
    for (let pat of patterns) {
      let match;
      while ((match = pat.exec(str)) !== null) {
        let raw = match[1];
        for (let i = 0; i < 3; i++) {
          try { raw = JSON.parse('"' + raw.replace(/"/g, '\\"') + '"'); } catch(e) { break; }
        }
        let clean = raw.replace(/\\u0026/g, '&').replace(/&amp;/g, '&').replace(/\\\//g, '/').replace(/\\\\/g, '\\');
        if (/^https?:\/\//i.test(clean) && /get_play_info|play_info|\/video\//i.test(clean)) {
          set.add(clean);
        }
      }
    }
  }

  function scanFallbackFromText(text) {
    let set = new Set();
    extractFallbackUrls(text, set);
    set.forEach(u => fetchPlayInfoUrl(u));
  }

  function scanDom() {
    if (isPaused) return;
    let set = new Set();
    try { extractFallbackUrls(document.documentElement.innerHTML, set); } catch(e) {}
    try {
      document.querySelectorAll('script').forEach(s => {
        if (s.textContent && s.textContent.length < 6000000) extractFallbackUrls(s.textContent, set);
      });
    } catch(e) {}
    set.forEach(u => fetchPlayInfoUrl(u));
  }

  // Hook Network Requests to capture fallback_api live
  const origFetch = window.fetch;
  window.fetch = async function(...args) {
    let url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
    let res = await origFetch.apply(this, args);
    try {
      if (url.includes('/video/get_play_info')) {
        res.clone().text().then(t => processVideoInfoJson(t)).catch(() => {});
      } else if (url.includes('/chat/completion') || url.includes('/im/chain/single')) {
        res.clone().text().then(t => scanFallbackFromText(t)).catch(() => {});
      }
    } catch(e) {}
    return res;
  };

  const origXhrSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(...args) {
    this.addEventListener('load', function() {
      try {
        let u = this._url || '';
        if (u.includes('/video/get_play_info')) {
          processVideoInfoJson(this.responseText);
        } else if (u.includes('/chat/completion') || u.includes('/im/chain/single')) {
          scanFallbackFromText(this.responseText);
        }
      } catch(e) {}
    });
    return origXhrSend.apply(this, args);
  };

  // ========================================================================
  // 🔘 GẮN NÚT TẢI 1080P TRỰC TIẾP LÊN TỪNG THẺ VIDEO TRÊN GIAO DIỆN CHAT DOLA
  // ========================================================================
  function getVideoCards() {
    const rawCards = document.querySelectorAll('[class*="block-video"], [class*="block_video"], .image-box-grid-item-FTeESI, [class*="image-box-grid-item"]');
    const cards = [];
    rawCards.forEach((el) => {
      const block = el.querySelector('[class*="block-video"]') || el;
      if (!cards.includes(block)) cards.push(block);
    });

    const standalonePlayers = document.querySelectorAll('.video-player-wrapper, [class*="video-player-wrapper"], video');
    standalonePlayers.forEach((el) => {
      const card = el.closest('[class*="block-video"], [class*="block_video"], [class*="image-box-grid-item"]') || el.parentElement || el;
      if (!cards.includes(card) && !card.closest('#duongtho-ref-dock-btn, #duongtho-ref-popover, #channa-prompt-dock, .channa-prompt-dock, #channa-accounts-dock-btn, #channa-accounts-quick-popover')) {
        cards.push(card);
      }
    });
    return cards;
  }

  function findDecryptedVideoForCard(card, cardIndex, totalCards) {
    if (!extractedList.length) return null;

    const videoEl = card.querySelector('video');
    const imgEl = card.querySelector('img');

    // 1. Khớp theo poster ảnh bìa
    if (videoEl && videoEl.poster) {
      for (let v of extractedList) {
        if (v.coverUrl && (v.coverUrl === videoEl.poster || videoEl.poster.includes(v.coverUrl))) return v;
      }
    }
    if (imgEl && imgEl.src) {
      for (let v of extractedList) {
        if (v.coverUrl && (v.coverUrl === imgEl.src || imgEl.src.includes(v.coverUrl))) return v;
      }
    }

    // 2. Khớp theo src hoặc vid
    const src = videoEl ? (videoEl.currentSrc || videoEl.src || '') : '';
    if (src) {
      for (let v of extractedList) {
        if (v.url === src || (v.vid && src.includes(v.vid))) return v;
      }
    }

    // 3. Khớp theo thứ tự thời gian hiển thị (từ trên xuống dưới)
    if (cardIndex >= 0 && cardIndex < extractedList.length) {
      return extractedList[cardIndex];
    }

    return extractedList[extractedList.length - 1];
  }

  function attachIndividualVideoDownloadButtons() {
    try {
      const cards = getVideoCards();
      cards.forEach((card, index) => {
        if (card.querySelector('.duongtho-single-dl-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'duongtho-single-dl-btn';
        btn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>1080P HD</span>
        `;

        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          e.preventDefault();

          btn.style.opacity = '0.7';
          btn.innerHTML = `
            <svg class="dola-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            <span>Đang lấy link...</span>
          `;

          const matched = findDecryptedVideoForCard(card, index, cards.length);
          if (matched && matched.url) {
            const fname = matched.filename || ('DuongTho_1080P_' + (index + 1) + '_' + Date.now() + '.mp4');
            try {
              if (window.AndroidDuongTho && typeof window.AndroidDuongTho.downloadVideo === 'function') {
                window.AndroidDuongTho.downloadVideo(matched.url, fname);
              } else if (window.DuongThoAndroid && typeof window.DuongThoAndroid.downloadVideo === 'function') {
                window.DuongThoAndroid.downloadVideo(matched.url, fname);
              } else {
                const a = document.createElement('a');
                a.href = matched.url;
                a.download = fname;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }

              btn.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Đã gửi tải!</span>
              `;
              setTimeout(() => {
                btn.style.opacity = '1';
                btn.innerHTML = `
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>1080P HD</span>
                `;
              }, 3000);
            } catch(err) {
              btn.innerHTML = '<span>❌ Lỗi tải</span>';
              setTimeout(() => {
                btn.style.opacity = '1';
                btn.innerHTML = `
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>1080P HD</span>
                `;
              }, 2000);
            }
          } else {
            scanDom();
            btn.innerHTML = '<span>🔄 Đang quét...</span>';
            setTimeout(() => {
              btn.style.opacity = '1';
              btn.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>1080P HD</span>
              `;
            }, 2500);
          }
        });

        card.style.position = 'relative';
        const insertTarget = card.querySelector('video') || card.firstElementChild || card;
        if (insertTarget && insertTarget.nextSibling) {
          insertTarget.parentNode.insertBefore(btn, insertTarget.nextSibling);
        } else {
          card.appendChild(btn);
        }
      });
    } catch(e) {}
  }

  window.duongThoDownloadAll = async function() {
    if (!extractedList || !extractedList.length) {
      if (window.__showChannaNotice) window.__showChannaNotice('⚠️ Chưa phát hiện video nào để tải!');
      return;
    }
    let count = 0;
    for (let i = 0; i < extractedList.length; i++) {
      let v = extractedList[i];
      if (v && v.url) {
        let fname = v.filename || ('DuongTho_1080P_' + (i + 1) + '.mp4');
        try {
          if (window.AndroidDuongTho && typeof window.AndroidDuongTho.downloadVideo === 'function') {
            window.AndroidDuongTho.downloadVideo(v.url, fname);
            count++;
          } else if (window.DuongThoAndroid && typeof window.DuongThoAndroid.downloadVideo === 'function') {
            window.DuongThoAndroid.downloadVideo(v.url, fname);
            count++;
          }
        } catch(e) {}
        await new Promise(r => setTimeout(r, 600));
      }
    }
    if (window.__showChannaNotice) window.__showChannaNotice('🚀 Đang tải ' + count + ' video vào Thư viện Android!');
  };

  window.duongThoRefreshUI = function() {
    scanDom();
    notifyAndroidCount();
    attachIndividualVideoDownloadButtons();
  };

  window.duongThoResetCurrentChatVideos = function() {
    extractedList = [];
    window.duongThoVideos = [];
    window.__ctbExtractedVideos = [];
    try { localStorage.removeItem('duongtho_extracted_videos'); } catch(e) {}
    notifyAndroidCount();
  };

  // ============================================================================
  // 🎨 DOLA EXTENSION THEME ENGINE & SMART FLOATING TOOLBAR
  // ============================================================================
  function injectThemeStyles() {
    if (document.getElementById('dola-extension-theme-styles')) return;
    const style = document.createElement('style');
    style.id = 'dola-extension-theme-styles';
    style.textContent = `
      @keyframes dolaSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .dola-spin {
        animation: dolaSpin 0.85s linear infinite;
      }

      /* Ẩn dock cạnh màn hình */
      #duongtho-ref-dock-btn {
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* --- Single Video Download Buttons --- */
      .duongtho-single-dl-btn {
        position: relative !important;
        z-index: 99999 !important;
        margin-top: 6px !important;
        margin-bottom: 4px !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        font-size: 11.5px !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        line-height: 1 !important;
        user-select: none !important;
      }

      /* 🌟 1. CHUẨN DOLA NATIVE DARK */
      [data-dola-theme="native"] .duongtho-single-dl-btn,
      :root:not([data-dola-theme="custom"]) .duongtho-single-dl-btn {
        background: #18181b !important;
        color: #f4f4f5 !important;
        border: 1px solid rgba(255, 255, 255, 0.16) !important;
        border-radius: 8px !important;
        padding: 6px 12px !important;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35) !important;
      }
      [data-dola-theme="native"] .duongtho-single-dl-btn:hover,
      :root:not([data-dola-theme="custom"]) .duongtho-single-dl-btn:hover {
        background: #27272a !important;
        border-color: #3b82f6 !important;
        color: #60a5fa !important;
      }

      /* 💎 2. TÙY BIẾN PRO STUDIO */
      [data-dola-theme="custom"] .duongtho-single-dl-btn {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: #ffffff !important;
        border: 1px solid rgba(52, 211, 153, 0.6) !important;
        border-radius: 12px !important;
        padding: 6px 13px !important;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35), 0 0 10px rgba(124, 58, 237, 0.2) !important;
      }
      [data-dola-theme="custom"] .duongtho-single-dl-btn:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 18px rgba(16, 185, 129, 0.55), 0 0 14px rgba(168, 85, 247, 0.35) !important;
      }

      /* --- Smart In-Page Floating Toolbar --- */
      #dola-extension-top-bar {
        position: fixed !important;
        top: 8px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 999980 !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 5px 10px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 11.5px !important;
        font-weight: 600 !important;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        user-select: none !important;
        max-width: calc(100vw - 16px) !important;
        overflow-x: auto !important;
        scrollbar-width: none !important;
      }
      #dola-extension-top-bar::-webkit-scrollbar {
        display: none !important;
      }

      /* Chuẩn Dola Toolbar */
      [data-dola-theme="native"] #dola-extension-top-bar,
      :root:not([data-dola-theme="custom"]) #dola-extension-top-bar {
        background: rgba(24, 24, 27, 0.95) !important;
        color: #f4f4f5 !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        border-radius: 999px !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
        backdrop-filter: blur(10px) !important;
      }

      /* Tùy Biến Pro Toolbar */
      [data-dola-theme="custom"] #dola-extension-top-bar {
        background: rgba(15, 23, 42, 0.92) !important;
        color: #f8fafc !important;
        border: 1px solid rgba(168, 85, 247, 0.45) !important;
        border-radius: 999px !important;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.65), 0 0 20px rgba(124, 58, 237, 0.3) !important;
        backdrop-filter: blur(14px) !important;
      }

      /* Brand Tag / Logo */
      .dola-ext-brand {
        display: flex !important;
        align-items: center !important;
        gap: 5px !important;
        padding-right: 4px !important;
      }
      .dola-ext-logo-icon {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .dola-ext-brand-title {
        font-weight: 800 !important;
        font-size: 11px !important;
        letter-spacing: 0.2px !important;
      }
      [data-dola-theme="native"] .dola-ext-brand-title,
      :root:not([data-dola-theme="custom"]) .dola-ext-brand-title {
        color: #ffffff !important;
      }
      [data-dola-theme="custom"] .dola-ext-brand-title {
        background: linear-gradient(135deg, #a855f7 0%, #38bdf8 100%) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }

      .dola-ext-count-pill {
        padding: 2px 6px !important;
        border-radius: 999px !important;
        font-size: 10px !important;
        font-weight: 700 !important;
      }
      [data-dola-theme="native"] .dola-ext-count-pill,
      :root:not([data-dola-theme="custom"]) .dola-ext-count-pill {
        background: rgba(255, 255, 255, 0.12) !important;
        color: #e4e4e7 !important;
      }
      [data-dola-theme="custom"] .dola-ext-count-pill {
        background: rgba(168, 85, 247, 0.25) !important;
        color: #c084fc !important;
        border: 1px solid rgba(168, 85, 247, 0.3) !important;
      }

      /* Action Buttons */
      .dola-ext-btn {
        display: inline-flex !important;
        align-items: center !important;
        gap: 4px !important;
        padding: 4px 9px !important;
        border-radius: 999px !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        line-height: 1 !important;
        transition: all 0.2s ease !important;
        white-space: nowrap !important;
      }

      /* Nút Tải ảnh lên */
      .dola-ext-upload-btn {
        background: #0284c7 !important;
        color: #ffffff !important;
        border: 1px solid rgba(56, 189, 248, 0.4) !important;
      }
      .dola-ext-upload-btn:hover {
        background: #0369a1 !important;
      }
      [data-dola-theme="custom"] .dola-ext-upload-btn {
        background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%) !important;
        box-shadow: 0 2px 10px rgba(6, 182, 212, 0.35) !important;
      }

      /* Nút Tải tất cả */
      .dola-ext-dl-btn {
        background: #10b981 !important;
        color: #ffffff !important;
        border: none !important;
      }
      .dola-ext-dl-btn:hover {
        background: #059669 !important;
      }
      [data-dola-theme="custom"] .dola-ext-dl-btn {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35) !important;
      }

      /* Nút Đổi giao diện */
      .dola-ext-theme-btn {
        background: rgba(255, 255, 255, 0.08) !important;
        color: #e4e4e7 !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
      }
      .dola-ext-theme-btn:hover {
        background: rgba(255, 255, 255, 0.16) !important;
      }
      [data-dola-theme="custom"] .dola-ext-theme-btn {
        background: rgba(168, 85, 247, 0.18) !important;
        border-color: rgba(168, 85, 247, 0.4) !important;
        color: #e2e8f0 !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function renderFloatingExtensionBar() {
    injectThemeStyles();
    let bar = document.getElementById('dola-extension-top-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'dola-extension-top-bar';
      (document.body || document.documentElement).appendChild(bar);
    }

    const currentTheme = document.documentElement.getAttribute('data-dola-theme') || 'native';
    const isCustom = currentTheme === 'custom';
    const count = (extractedList && extractedList.length) ? extractedList.length : 0;

    // SVG Logo chú cún con kute đeo tai nghe công nghệ
    const logoSvg = `
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Vòng cung tai nghe xanh mint -->
        <path d="M 6 15 A 10 10 0 0 1 26 15" stroke="${isCustom ? '#34d399' : '#10b981'}" stroke-width="2.8" stroke-linecap="round"/>
        <!-- Tai cún mềm mại -->
        <ellipse cx="8.5" cy="14" rx="3.2" ry="5.5" fill="#f1f5f9" transform="rotate(-15 8.5 14)"/>
        <ellipse cx="8.5" cy="14" rx="1.8" ry="3.6" fill="#f472b6" opacity="0.8" transform="rotate(-15 8.5 14)"/>
        <ellipse cx="23.5" cy="14" rx="3.2" ry="5.5" fill="#f1f5f9" transform="rotate(15 23.5 14)"/>
        <ellipse cx="23.5" cy="14" rx="1.8" ry="3.6" fill="#f472b6" opacity="0.8" transform="rotate(15 23.5 14)"/>
        <!-- Đầu cún tròn xoe -->
        <circle cx="16" cy="17" r="8.2" fill="#ffffff"/>
        <!-- Má bầu bĩnh -->
        <circle cx="10.8" cy="19.5" r="3" fill="#ffffff"/>
        <circle cx="21.2" cy="19.5" r="3" fill="#ffffff"/>
        <!-- Má hồng kute -->
        <ellipse cx="11.2" cy="20.3" rx="1.8" ry="1.1" fill="#f472b6" opacity="0.65"/>
        <ellipse cx="20.8" cy="20.3" rx="1.8" ry="1.1" fill="#f472b6" opacity="0.65"/>
        <!-- Đôi mắt to tròn long lanh -->
        <circle cx="13.2" cy="16.3" r="1.7" fill="#0f172a"/>
        <circle cx="12.7" cy="15.7" r="0.65" fill="#ffffff"/>
        <circle cx="18.8" cy="16.3" r="1.7" fill="#0f172a"/>
        <circle cx="18.3" cy="15.7" r="0.65" fill="#ffffff"/>
        <!-- Mũi & miệng cười toe toét -->
        <ellipse cx="16" cy="18.7" rx="1.1" ry="0.8" fill="#334155"/>
        <path d="M 14.7 20.2 Q 16 21.4 17.3 20.2" stroke="#334155" stroke-width="0.8" fill="none" stroke-linecap="round"/>
        <!-- Lưỡi nhỏ nhí nhảnh -->
        <circle cx="16" cy="21.1" r="0.75" fill="#fb7185"/>
        <!-- Ốp tai nghe công nghệ tím pastel -->
        <rect x="4.2" y="11.8" width="3.2" height="6.8" rx="1.6" fill="${isCustom ? '#06b6d4' : '#14b8a6'}"/>
        <rect x="24.6" y="11.8" width="3.2" height="6.8" rx="1.6" fill="${isCustom ? '#06b6d4' : '#14b8a6'}"/>
        <circle cx="5.8" cy="15.2" r="1.1" fill="${isCustom ? '#c084fc' : '#a855f7'}"/>
        <circle cx="26.2" cy="15.2" r="1.1" fill="${isCustom ? '#c084fc' : '#a855f7'}"/>
      </svg>
    `;

    bar.innerHTML = `
      <div class="dola-ext-brand" title="Dola Studio Pro Extension">
        <div class="dola-ext-logo-icon">${logoSvg}</div>
        <span class="dola-ext-brand-title">Dola Puppy</span>
        <span id="dola-ext-count-pill" class="dola-ext-count-pill">${count} video</span>
      </div>

      <!-- Nút Tải ảnh lên từ máy -->
      <button id="dola-ext-upload-img-btn" class="dola-ext-btn dola-ext-upload-btn" title="Chọn ảnh từ thư viện hoặc tệp trong máy để gắn vào Dola">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Tải ảnh</span>
      </button>

      <!-- Nút Tải tất cả video đã quét -->
      <button id="dola-ext-dl-all-btn" class="dola-ext-btn dola-ext-dl-btn" style="${count > 0 ? '' : 'display:none;'}" title="Tải tất cả video đã phát hiện">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span id="dola-ext-dl-all-text">Tải (${count})</span>
      </button>

      <!-- Nút Đổi giao diện -->
      <button id="dola-ext-theme-toggle-btn" class="dola-ext-btn dola-ext-theme-btn" title="Chuyển đổi giao diện: Chuẩn Dola hoặc Tùy Biến Pro">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"/>
        </svg>
        <span>${isCustom ? '💎 Pro Studio' : '🎨 Chuẩn Dola'}</span>
      </button>

      <button id="dola-ext-close-btn" style="background:none;border:none;color:#94a3b8;font-size:12px;cursor:pointer;padding:0 3px;line-height:1;" title="Ẩn thanh">✕</button>
    `;

    // Gắn sự kiện nút Tải ảnh từ thiết bị
    const uploadBtn = bar.querySelector('#dola-ext-upload-img-btn');
    if (uploadBtn) {
      uploadBtn.onclick = (e) => {
        e.stopPropagation();
        if (window.AndroidDuongTho && typeof window.AndroidDuongTho.openNativeImagePicker === 'function') {
          window.AndroidDuongTho.openNativeImagePicker();
          return;
        }
        if (window.DuongThoAndroid && typeof window.DuongThoAndroid.openNativeImagePicker === 'function') {
          window.DuongThoAndroid.openNativeImagePicker();
          return;
        }
        const fileInput = document.querySelector('input[type="file"][accept*="image" i]') || document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.click();
        } else {
          const plusBtn = document.querySelector('button[aria-label*="add" i], button[aria-label*="attach" i], button[title*="attach" i]');
          if (plusBtn) plusBtn.click();
        }
      };
    }

    // Gắn sự kiện nút Tải tất cả
    const dlAllBtn = bar.querySelector('#dola-ext-dl-all-btn');
    if (dlAllBtn) {
      dlAllBtn.onclick = (e) => {
        e.stopPropagation();
        if (typeof window.duongThoDownloadAll === 'function') {
          window.duongThoDownloadAll();
        }
      };
    }

    // Gắn sự kiện đổi theme
    const toggleBtn = bar.querySelector('#dola-ext-theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        const nextTheme = (document.documentElement.getAttribute('data-dola-theme') === 'custom') ? 'native' : 'custom';
        window.setDolaExtensionTheme(nextTheme);
        if (window.AndroidDuongTho && typeof window.AndroidDuongTho.onThemeChanged === 'function') {
          window.AndroidDuongTho.onThemeChanged(nextTheme);
        } else if (window.DuongThoAndroid && typeof window.DuongThoAndroid.onThemeChanged === 'function') {
          window.DuongThoAndroid.onThemeChanged(nextTheme);
        }
      };
    }

    const closeBtn = bar.querySelector('#dola-ext-close-btn');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        bar.style.display = 'none';
      };
    }
  }

  function updateExtensionBarCount(count) {
    const pill = document.getElementById('dola-ext-count-pill');
    if (pill) {
      pill.textContent = count + ' video';
    }
    const dlBtn = document.getElementById('dola-ext-dl-all-btn');
    const dlText = document.getElementById('dola-ext-dl-all-text');
    if (dlBtn) {
      if (count > 0) {
        dlBtn.style.display = 'inline-flex';
        if (dlText) dlText.textContent = 'Tải (' + count + ')';
      } else {
        dlBtn.style.display = 'none';
      }
    }
  }

  window.setDolaExtensionTheme = function(theme) {
    const validTheme = (theme === 'custom') ? 'custom' : 'native';
    document.documentElement.setAttribute('data-dola-theme', validTheme);
    try {
      localStorage.setItem('dola_extension_theme', validTheme);
    } catch(e) {}
    renderFloatingExtensionBar();
    attachIndividualVideoDownloadButtons();
  };

  // Khởi tạo theme & toolbar
  try {
    const initTheme = (window.AndroidDuongTho && typeof window.AndroidDuongTho.getSavedTheme === 'function')
      ? window.AndroidDuongTho.getSavedTheme()
      : (localStorage.getItem('dola_extension_theme') || 'native');
    window.setDolaExtensionTheme(initTheme);
  } catch(e) {
    window.setDolaExtensionTheme('native');
  }

  // Initial and periodic scan
  scanDom();
  setInterval(scanDom, 3000);
  setInterval(notifyAndroidCount, 2000);
  setInterval(attachIndividualVideoDownloadButtons, 2000);
  document.addEventListener('DOMContentLoaded', () => {
    scanDom();
    renderFloatingExtensionBar();
    attachIndividualVideoDownloadButtons();
  });
  window.addEventListener('load', () => {
    scanDom();
    renderFloatingExtensionBar();
    attachIndividualVideoDownloadButtons();
  });
})();
