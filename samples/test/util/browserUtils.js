
async function waitForPopup(openPopupPromise) {
  // Get existing windows count
  const existingHandlesCount = (await browser.getWindowHandles()).length;

  // Open popup window
  await openPopupPromise();

  // Wait for popup window opened and switch to it
  let handles;
  await browser.waitUntil(async () => {
    handles = await browser.getWindowHandles();
    return handles.length > existingHandlesCount;
  });
  await browser.switchToWindow(handles[handles.length - 1]);

  // Close popup
  try {
    await browser.closeWindow();
  } catch(_e) {
    // Can be already closed
  }

  // Return to original window
  await browser.switchToWindow(handles[existingHandlesCount - 1]);
}

async function getCurrentUrl(removeHash = false) {
    /**
     * The URL of the current browser window
     * @type {String}
     */
    let currentUrl = await browser.getUrl();
    currentUrl = currentUrl.replace(/http(s?):\/\//, '');
    if (removeHash) {
        currentUrl = currentUrl.replace(/#(.*?)$/, '');
    }

    /**
     * The base URL of the current browser window
     * @type {Object}
     */
    const domain = `${currentUrl.split('/')[0]}`;

    currentUrl = currentUrl.replace(domain, '');

    return currentUrl;
}

export {
  waitForPopup,
  getCurrentUrl
};
