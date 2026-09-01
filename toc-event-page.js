/**
 * contains extension's only functionality.
 *
 * @version.last 2026.9.1.17 migrated to Manifest V3 (service worker)
 * @version.previous: 2013.9.6.10
 * @version.previous: 2013.7.28.9
 * @version.previous: 2013.7.20.8
 * @version.previous: 2013.7.1.7
 * @version.previous: 2013.6.21.5
 * @version.previous: 2013.6.20.4
 * @version.previous: 2010.12.6.3
 * @version.previous: 2010.11.14.2
 * @version.previous: 2010.10.23.1
 * @author HoKoNoUmo
 */

/* The active tab id is kept in chrome.storage.session so it survives
 * service-worker restarts (a MV3 service worker can be terminated at any time,
 * which would clear a plain global variable). */
var TOC_TAB_ID_KEY = "tocCurrent_tab_id";

function fcnGet_current_tab_id(callback) {
  chrome.storage.session.get(TOC_TAB_ID_KEY, function (items) {
    var id = items ? items[TOC_TAB_ID_KEY] : null;
    callback(typeof id === "number" ? id : null);
  });
}

function fcnSet_current_tab_id(idTab) {
  var obj = {};
  obj[TOC_TAB_ID_KEY] = idTab;
  chrome.storage.session.set(obj);
}

function fcnClear_current_tab_id() {
  chrome.storage.session.remove(TOC_TAB_ID_KEY);
}

chrome.action.setBadgeBackgroundColor({color:[0,0,255,255]});

/**
 *
 *
 * @modified 2013.06.17
 * @since 2010.10.03 (v1)
 * @author HoKoNoUmo
 */
chrome.action.onClicked.addListener(
  function(tab){
    fcnSet_current_tab_id(tab.id);
    chrome.tabs.sendMessage(tab.id, {type:"toggleState"});
  }
);

/**
 * Changes the on/off badge-text, listening from pages.
 *
 * @modified 2013.09.05
 * @since 2010.10.03 (v1)
 * @author HoKoNoUmo
 */
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (!sender.tab) {
      return;
    }
    fcnGet_current_tab_id(function (idCurrent) {
      if (idCurrent !== sender.tab.id) {
        return;
      }
      if (request.type === "setStateText") {
        fcnSet_state_text(request.value);
      }
    });
  }
);

/**
 *
 * @modified 2013.09.05
 * @since 2010.10.03 (v1)
 * @author HoKoNoUmo
 */
chrome.tabs.onRemoved.addListener(
  function(idTab){
    fcnClear_current_tab_id();
    fcnSet_state_text(0);
  }
);

/**
 * On non-current-tab, do nothing.<br/>
 * On current-tab, on "reload" set off-state. On click, set
 * the existing-state.
 *
 * @modified 2013.09.05
 * @since 2010.10.03 (v1)
 * @author HoKoNoUmo
 */
chrome.tabs.onUpdated.addListener(
  function (tabId, changeInfo, tab) {
    fcnGet_current_tab_id(function (idCurrent) {
      if (idCurrent !== tab.id) {
        return;
      }
      fcnSet_state_text(0);
      chrome.tabs.sendMessage(tabId,{type:"requestState"});
    });
  }
);


/**
 * Will display a BadgeText if we can display or no the ToC
 *
 * @modified 2013.09.05
 * @since 2010.10.03 (v1)
 * @author HoKoNoUmo
 */
function fcnSet_state_text(nPower_state) {
  switch (nPower_state) {
    case 0:
      chrome.action.setBadgeText({text: ""});//OFF STATE
      break;
    case 1:
      chrome.action.setBadgeText({text: "on"});
      break;
  }
}
