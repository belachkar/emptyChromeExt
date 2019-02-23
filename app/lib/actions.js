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

function getMagnetLink(){
  const block = $('div.downloadButtonGroup').find('div[data-sc-params]').attr('data-sc-params');
}

module.exports = actions;
