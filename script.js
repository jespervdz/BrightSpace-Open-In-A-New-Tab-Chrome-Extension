// Store the headertray, button and contentPanel
let headerButtonTray = null;
let d2lbutton = null;
let contentPanel = null;

// Obsere element changes, but not attribute changes
const config = { childList: true, subtree: true, attributes: false };

// Observer that will observe changes in the content panel
const contentPanelObserver = new MutationObserver(_ => setButtonVisibility());

// Observer until frame is loaded, will transfer to the contentPanelObserver
const docObserver = new MutationObserver((_, observer) => {
  // When there is a content panel, observe it and not the whole doc
  if (contentPanel = document.getElementsByClassName('content-panel')[0]) {
    setTrayAndButton(); // Set the header and button
    if (headerButtonTray != null && d2lbutton != null) {
      contentPanelObserver.observe(contentPanel, config);
      observer.disconnect(); // disconnect docObserver
    }
  }
});

// Observe the whole doc. Will observe only the content panel once it is loaded
docObserver.observe(document, config);

/* Funtions */

// Get the header tray, initialize and insert the d2lbutton
function setTrayAndButton() {
  // Everything in a try because a million things can go wrong
  try {
    // Get the header tray
    if (!(headerButtonTray = contentPanel.getElementsByClassName('header-button-tray')[0]))
      return;

    // Get the html code for the button and add it to the tray
    fetch(chrome.runtime.getURL('openInNewTabD2LButton.html')).then(r => r.text()).then(html => {
      // Check that the button does not exists; the observer can get called multiple times
      if (!d2lbutton) {
        headerButtonTray.insertAdjacentHTML('afterbegin', html);
        d2lbutton = contentPanel.getElementsByClassName('new-tab-button-extension')[0];
        d2lbutton.addEventListener('click', openFileInNewTab);
        setButtonVisibility();
      }
    });
  } catch {
    console.log('BrightSpace Open Content In A New Tab Error.')
  }
}

function setButtonVisibility() {
  d2lbutton.style.display = (pageHasDocument() && !pageHasNewTabIcon()) ? 'block' : 'none';
}

// Opens the file embeded in the page in a new tab
function openFileInNewTab() {
  // Everything in a try because a billion things can go wrong
  try {
    // Get the source url, open it in a new window
    let iframeWrapper = contentPanel.getElementsByTagName('d2l-iframe-wrapper-for-react')[0];
    let docUrl = iframeWrapper.getAttribute('src');
    window.open(docUrl);
  } catch {
    alert('BrightSpace Open Content In A New Tab: Error retrieving document URL.')
  }
}

// Checks if the content-panel has a file document that can be opened in a new tab
function pageHasDocument() {
  try {
    return contentPanel.getAttribute('data-attr-activity-type') === 'file';
  } catch {
    return false;
  }
}

// Checks if the page has D2L's own new tab button
function pageHasNewTabIcon() {
  try {
    return headerButtonTray.getElementsByClassName('new-tab-button').length > 0;
  } catch {
    return false;
  }
}