// Store the headertray and button
let headerButtonTray = null;
let d2lbutton = null;

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  if (document.readyState === 'complete') {
    if (headerButtonTray === null || d2lbutton === null)
      setElements();
    else
      setButtonVisibility();
  }
};

// Obsere changes in the document
const observer = new MutationObserver(callback);
const config = { childList: true, subtree: true };
observer.observe(document, config);

function setElements() {
  // Everything in a try because a million things can go wrong
  try {
    // Get the html code for the button.
    fetch(chrome.runtime.getURL('openInNewTabD2LButton.html')).then(r => r.text()).then(html => {
      // Get the header tray where the 
      let headerButtonTrays = document.getElementsByClassName('header-button-tray');

      if (headerButtonTrays.length > 0) {       
        headerButtonTray = headerButtonTrays[0];

        // Safety check if it already exists.
        if (headerButtonTray.getElementsByClassName('new-tab-button-extension').length > 0)
          return;

        // Add the button to the tray
        headerButtonTray.insertAdjacentHTML('afterbegin', html);
        d2lbutton = document.getElementsByClassName('new-tab-button-extension')[0];
        d2lbutton.addEventListener('click', openFileInNewTab);
        setButtonVisibility();
      }
    });
  } catch {
    console.warn('BrightSpace PDF Viewer Error.')
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
    let docUrl = document.getElementsByTagName('d2l-iframe-wrapper-for-react')[0].getAttribute('src');
    window.open(docUrl);
  } catch {
    console.warn('BrightSpace PDF Viewer: Error retrieving document URL.')
  }
}

// Checks if the page has an content-panel with a file document that can be opened in a new tab
function pageHasDocument() {
  try {
    let contentPanels = document.getElementsByClassName('content-panel');

    if (contentPanels.length === 0)
      return false;

    let contentPanel = contentPanels[0];
    return contentPanel.getAttribute('data-attr-activity-type') === 'file';
  } catch {
    return false;
  }
}

// Checks if the page has BrightSpace's own new tab button
function pageHasNewTabIcon() {
  try {
    return document.getElementsByClassName('new-tab-button')[0] != null;
  } catch {
    return false;
  }
}