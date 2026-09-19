# AxyPly

Lightweight Chrome/Edge Manifest V3 extension that automatically clicks
YouTube's visible **Continue watching?** confirmation dialog.

## Install

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select this repository folder.
5. Open/reload YouTube.

## What it does

- Detects YouTube's continue-watching confirmation.
- Supports Indonesian and English button text.
- Watches YouTube's dynamic UI with a MutationObserver.
- Periodically checks as a fallback.
- Does not modify video requests or bypass Premium/paywalls.

## Project

AxyPly — YouTube Auto Continue
