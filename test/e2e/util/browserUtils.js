function switchToPopupWindow() {
  browser.waitUntil(() => browser.getWindowHandles().length > 1);
  browser.switchToWindow(browser.getWindowHandles()[1]);
}

function switchToMainWindow() {
  browser.switchToWindow(browser.getWindowHandles()[0]);
}

export { switchToMainWindow, switchToPopupWindow };
  