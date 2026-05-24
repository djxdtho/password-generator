let activeField = null;

document.addEventListener('focusin', e => {
  const el = e.target;
  if (!el) return;
  if (el.tagName === 'INPUT' && (el.type === 'password' || el.type === 'text' || el.type === 'email')) {
    activeField = el;
  } else if (el.tagName === 'TEXTAREA') {
    activeField = el;
  } else {
    activeField = null;
  }
});

document.addEventListener('focusout', () => {
  activeField = null;
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'fillPassword') {
    if (activeField && document.contains(activeField)) {
      activeField.value = msg.password;
      activeField.dispatchEvent(new Event('input', { bubbles: true }));
      activeField.dispatchEvent(new Event('change', { bubbles: true }));
      sendResponse({ success: true });
    } else {
      const pwFields = document.querySelectorAll('input[type="password"]');
      if (pwFields.length > 0) {
        pwFields[0].value = msg.password;
        pwFields[0].dispatchEvent(new Event('input', { bubbles: true }));
        pwFields[0].dispatchEvent(new Event('change', { bubbles: true }));
        sendResponse({ success: true });
      } else {
        const textFields = document.querySelectorAll('input[type="text"][name*="user"],input[type="text"][name*="email"],input[type="text"][autocomplete*="username"]');
        if (textFields.length > 0) {
          textFields[0].value = msg.password;
          textFields[0].dispatchEvent(new Event('input', { bubbles: true }));
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false });
        }
      }
    }
    return true;
  }

  if (msg.action === 'checkField') {
    sendResponse({
      hasField: activeField !== null && document.contains(activeField) &&
        (activeField.type === 'password' || activeField.type === 'text' || activeField.type === 'email' || activeField.tagName === 'TEXTAREA')
    });
    return true;
  }
});
