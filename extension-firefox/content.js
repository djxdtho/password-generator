let activeField = null;
let vaultBadge = null;

document.addEventListener('focusin', e => {
  const el = e.target;
  if (!el) return;
  if (el.tagName === 'INPUT' && (el.type === 'password' || el.type === 'text' || el.type === 'email')) {
    activeField = el;
    showBadge(el);
  } else if (el.tagName === 'TEXTAREA') {
    activeField = el;
  } else {
    activeField = null;
    hideBadge();
  }
});

document.addEventListener('focusout', () => {
  setTimeout(() => {
    if (document.activeElement !== activeField) {
      activeField = null;
      hideBadge();
    }
  }, 100);
});

function showBadge(el) {
  hideBadge();
  const rect = el.getBoundingClientRect();
  vaultBadge = document.createElement('div');
  vaultBadge.id = '__vault_badge';
  vaultBadge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  const styles = {
    position: 'fixed', zIndex: '2147483647', cursor: 'pointer',
    width: '28px', height: '28px', borderRadius: '8px',
    background: '#0a0a0a', border: '1px solid rgba(255,255,255,.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#00d4ff', transition: 'all .2s', opacity: '0',
    top: (rect.top + window.scrollY) + 'px',
    left: (rect.right + window.scrollX + 6) + 'px',
    boxShadow: '0 2px 12px rgba(0,0,0,.4)'
  };
  Object.assign(vaultBadge.style, styles);
  vaultBadge.addEventListener('mouseenter', () => { vaultBadge.style.background = 'rgba(0,212,255,.15)'; });
  vaultBadge.addEventListener('mouseleave', () => { vaultBadge.style.background = '#0a0a0a'; });
  vaultBadge.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });
  document.body.appendChild(vaultBadge);
  requestAnimationFrame(() => { vaultBadge.style.opacity = '1'; });
}

function hideBadge() {
  if (vaultBadge) { vaultBadge.remove(); vaultBadge = null; }
}

function updateBadgePosition() {
  if (!vaultBadge || !activeField || !document.contains(activeField)) return;
  const rect = activeField.getBoundingClientRect();
  vaultBadge.style.top = (rect.top + window.scrollY) + 'px';
  vaultBadge.style.left = (rect.right + window.scrollX + 6) + 'px';
}

document.addEventListener('scroll', updateBadgePosition);
window.addEventListener('resize', updateBadgePosition);

function checkExistingFields() {
  const pwFields = document.querySelectorAll('input[type="password"]');
  if (pwFields.length > 0) {
    activeField = pwFields[0];
    showBadge(pwFields[0]);
    chrome.runtime.sendMessage({ action: 'passwordFieldDetected' });
  }
}
setTimeout(checkExistingFields, 500);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'fillPassword') {
    if (activeField && document.contains(activeField) && activeField.type === 'password') {
      activeField.value = msg.password;
      activeField.dispatchEvent(new Event('input', { bubbles: true }));
      activeField.dispatchEvent(new Event('change', { bubbles: true }));
      sendResponse({ success: true });
    } else {
      const pw = document.querySelectorAll('input[type="password"]');
      if (pw.length > 0) {
        pw[0].value = msg.password;
        pw[0].dispatchEvent(new Event('input', { bubbles: true }));
        pw[0].dispatchEvent(new Event('change', { bubbles: true }));
        sendResponse({ success: true });
      } else {
        const txt = document.querySelectorAll('input[type="text"][autocomplete*="username"],input[type="text"][name*="user"],input[type="text"][name*="email"]');
        if (txt.length > 0) {
          txt[0].value = msg.password;
          txt[0].dispatchEvent(new Event('input', { bubbles: true }));
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false });
        }
      }
    }
    return true;
  }

  if (msg.action === 'checkField') {
    const has = activeField !== null && document.contains(activeField) &&
      (activeField.type === 'password' || activeField.type === 'text' || activeField.type === 'email' || activeField.tagName === 'TEXTAREA');
    sendResponse({ hasField: has });
    return true;
  }
});
