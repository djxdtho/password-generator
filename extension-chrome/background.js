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
