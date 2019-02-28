import { disableIcon, enableIcon } from '../lib/actions';
import { messages } from '../lib/messages';

chrome.browserAction.disable();

chrome.runtime.onMessage.addListener(function(message, sender, response) {
  const tabId = sender.tab.id;
  const msg = message.msg;
  switch (msg) {
  case messages.gotIt:
    enableIcon(tabId, '1');
    break;
  default:
    disableIcon(tabId);
    break;
  }
});

chrome.browserAction.onClicked.addListener(function(srcTab) {
  chrome.tabs.sendMessage(srcTab.id, { msg: messages.sendLink }, function(response) {
    const { url } = response;
    if (url !== undefined) {
      chrome.tabs.create({ index: srcTab.index, url }, function(tab) {
        setTimeout(function() {
          chrome.tabs.remove(tab.id);
        }, 5000);
      });
    }
  });
});
