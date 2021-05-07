/**
 * Focus the last opened window
 */
/* eslint-disable no-unused-vars */
export default () => {
/* eslint-enable no-unused-vars */
    /**
     * The last opened window
     * @type {Object}
     */
    const lastWindowHandle = browser.getWindowHandles().slice(-1)[0];

    browser.switchToWindow(lastWindowHandle);
};
