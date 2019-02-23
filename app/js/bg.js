import { disableIcon, enableIcon } from '../lib/actions';

chrome.browserAction.disable();

chrome.runtime.onMessage.addListener (function (message, sender, response) {
  const tabId = sender.tab.id;
  const msg = message.msg;
  switch (msg) {
  case 'gotIt':
    enableIcon(tabId, '1');
    break;
  default:
    disableIcon(tabId);
    break;
  }
});

chrome.browserAction.onClicked.addListener(function (srcTab){
  chrome.tabs.sendMessage(srcTab.id, { msg: 'send the link' }, function(response) {
    const magnetUrl = response.magnet;
    if (magnetUrl !== undefined) {
      chrome.tabs.create({ index: srcTab.index,url: magnetUrl }, function(tab) {
        setTimeout(function () {
          chrome.tabs.remove(tab.id);
        }, 5000);
      });
    }
  });
});

