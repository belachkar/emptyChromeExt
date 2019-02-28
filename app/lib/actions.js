const actions= {};

actions.enableIcon = (tabId, badgeText) => {
  chrome.browserAction.enable(tabId);
  chrome.browserAction.setBadgeText({
    text: badgeText,
    tabId: tabId
  });
};

actions.disableIcon = (tabId) => {
  chrome.browserAction.disable(tabId);
  chrome.browserAction.setBadgeText({
    text: '',
    tabId: tabId
  });
};

module.exports = actions;
