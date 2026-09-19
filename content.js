(() => {
  "use strict";

  const MATCHES = [
    "continue watching",
    "yes, continue watching",
    "lanjut menonton",
    "ya, lanjut menonton"
  ];

  let lastClick = 0;

  const normalize = (value) =>
    (value || "").replace(/\\s+/g, " ").trim().toLowerCase();

  const visible = (el) => {
    if (!el) return false;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.display !== "none" &&
      s.visibility !== "hidden" &&
      r.width > 0 &&
      r.height > 0;
  };

  function isContinueButton(el) {
    if (!visible(el)) return false;

    const text = normalize(el.innerText || el.textContent);
    if (MATCHES.some(x => text === x)) return true;
    if (text.includes("continue watching")) return true;
    if (text.includes("lanjut menonton")) return true;

    const dialog = el.closest(
      "yt-confirm-dialog-renderer, tp-yt-paper-dialog, [role='dialog']"
    );

    return !!dialog && text === "ya";
  }

  function check() {
    const selectors =
      "yt-confirm-dialog-renderer button, " +
      "tp-yt-paper-dialog button, " +
      "[role='dialog'] button, " +
      "yt-confirm-dialog-renderer [role='button'], " +
      "tp-yt-paper-dialog [role='button'], " +
      "[role='dialog'] [role='button']";

    for (const button of document.querySelectorAll(selectors)) {
      if (!isContinueButton(button)) continue;

      const now = Date.now();
      if (now - lastClick < 1500) return;
      lastClick = now;

      button.click();

      try {
        button.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        button.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      } catch (_) {}

      console.log("[AxyPly] YouTube continue dialog accepted.");
      return;
    }
  }

  const observer = new MutationObserver(check);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden", "aria-hidden", "style", "class"]
  });

  setInterval(check, 2500);
  setTimeout(check, 1000);
  setTimeout(check, 3000);

  console.log("[AxyPly] Auto Continue active.");
})();