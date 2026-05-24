chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generatePassword',
    title: 'Generate password',
    contexts: ['editable']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generatePassword') {
    chrome.action.openPopup();
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === 'openPopup') {
    chrome.action.openPopup();
  }
  if (msg.action === 'passwordFieldDetected') {
    chrome.action.setBadgeText({ text: 'PW', tabId: sender.tab?.id });
    chrome.action.setBadgeBackgroundColor({ color: '#00d4ff', tabId: sender.tab?.id });
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.action.setBadgeText({ text: '', tabId });
});
