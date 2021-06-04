import type { Selector } from 'webdriverio';

/**
 * Wait for the given element to become visible
 * @param  {String}   selector      Element selector
 * @param  {String}   falseCase     Whether or not to expect a visible or hidden state
 *
 * @todo  merge with waitfor
 */
export default async (selector: Selector, falseCase: any = false) => {
    /**
     * Maximum number of milliseconds to wait for
     * @type {Int}
     */
    const ms = 10000;

    const el = await $(selector);

    let body = null;
    try {
        await browser.waitUntil(async () => {
            const isDisplayed = await el.isDisplayed();
            const isOk = falseCase ? !isDisplayed : isDisplayed;
            if (!isOk) {
                body = await (await $('body')).getHTML();
            }
            return isOk;
        }, {
            timeout: ms,
        });
    } catch (err) {
        console.error(`element ${selector} still not displayed after ${ms}ms`);
        console.log('Body for debug: ', body);
        throw err;
    }

    return el;
};
