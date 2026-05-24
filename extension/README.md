# Vault Browser Extension

Password generator & manager extension for Chrome and Zen Browser (Firefox).

## Install (Developer Mode)

### Chrome / Chromium
1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension` folder
5. Pin the extension from the toolbar

### Zen Browser / Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `extension/manifest.json`
4. The extension appears in the toolbar

## Features
- **Generate** — random, memorable, PIN, passphrase passwords
- **Autofill** — detects password fields and fills them
- **Vault** — save passwords locally
- **Keyboard shortcut** — `Ctrl+Shift+V` (Chrome) / `Cmd+Shift+V` (Mac)
- **Right-click** — "Generate password" on any text field

## Build Icons (optional)
Run `icons/generate.ps1` in PowerShell to create PNG icons.
