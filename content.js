(() => {
  "use strict";

  const DEFAULTS = { enabled: true, delay: 500, count: 0 };
  let settings = { ...DEFAULTS };
  let lastClick = 0;
  let pendingTimer = null;

  const normalize = (v) => (v || "").replace(/\s+/g, " ").trim().toLowerCase();
  const visible = (el) => {
    if (!el) return false;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && r.height > 0;
  };

  const isContinueText = (text) =>
    text === "continue watching" ||
    text === "yes, continue watching" ||
    text === "lanjut menonton" ||
    text === "ya, lanjut menonton" ||
    text.includes("continue watching") ||
    text.includes("lanjut menonton");

  function showToast() {
    const old = document.getElementById("axy-ply-toast");
    if (old) old.remove();
    const el = document.createElement("div");
    el.id = "axy-ply-toast";
    el.textContent = "AxyPly ✓ Video dilanjutkan";
    Object.assign(el.style, {
      position:"fixed", top:"18px", right:"18px", zIndex:"2147483647",
      padding:"10px 14px", borderRadius:"12px", background:"rgba(15,15,15,.94)",
      color:"#fff", font:"600 13px system-ui,sans-serif",
      boxShadow:"0 6px 24px rgba(0,0,0,.3)", opacity:"0",
      transform:"translateY(-6px)", transition:"all .2s ease"
    });
    document.documentElement.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity="1"; el.style.transform="translateY(0)"; });
    setTimeout(() => { el.style.opacity="0"; el.style.transform="translateY(-6px)"; setTimeout(()=>el.remove(),220); }, 1500);
  }

  function clickButton(button) {
    if (!settings.enabled || !visible(button)) return;
    const now = Date.now();
    if (now - lastClick < 1800) return;
    lastClick = now;
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => {
      if (!visible(button)) return;
      button.click();
      try {
        ["mousedown","mouseup","click"].forEach(type =>
          button.dispatchEvent(new MouseEvent(type, { bubbles:true, cancelable:true, view:window }))
        );
      } catch (_) {}
      settings.count++;
      chrome.storage.local.set({ count: settings.count });
      showToast();
    }, Math.max(0, Number(settings.delay) || 0));
  }

  function check() {
    if (!settings.enabled) return;
    const selectors = [
      "yt-confirm-dialog-renderer button",
      "tp-yt-paper-dialog button",
      "[role='dialog'] button",
      "yt-confirm-dialog-renderer [role='button']",
      "tp-yt-paper-dialog [role='button']",
      "[role='dialog'] [role='button']"
    ].join(",");
    for (const el of document.querySelectorAll(selectors)) {
      if (!visible(el)) continue;
      const text = normalize(el.innerText || el.textContent);
      const dialog = el.closest("yt-confirm-dialog-renderer,tp-yt-paper-dialog,[role='dialog']");
      if (isContinueText(text) || (dialog && /^(yes|ya)$/i.test(text))) {
        clickButton(el);
        return;
      }
    }
  }

  chrome.storage.local.get(DEFAULTS, (data) => { settings = { ...DEFAULTS, ...data }; check(); });
  chrome.storage.onChanged.addListener((changes) => {
    for (const [key, change] of Object.entries(changes)) settings[key] = change.newValue;
  });

  const observer = new MutationObserver(check);
  observer.observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:["hidden","aria-hidden","style","class"] });
  setInterval(check, 2500);
  setTimeout(check, 1000);
  setTimeout(check, 3000);
  console.log("[AxyPly] v2 active.");
})();