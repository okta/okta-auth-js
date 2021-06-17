import type { Selector } from 'webdriverio';

/**
 * Wait for the given element to become visible
 * @param  {String}   selector      Element selector
 * @param  {String}   falseCase     Whether or not to expect a visible or hidden state
 * @param  {Int}      ms            Maximum number of milliseconds to wait for
 *
 * @todo  merge with waitfor
 */
export default async (selector: Selector, falseCase: any = false, ms = 10000) => {
    // Unlike `el.waitForDisplayed` approach, this way we can catch timeout exception
    await browser.waitUntil(async () => {
        try {
            const el = await $(selector);
            const isDisplayed = await el.isDisplayed();
            return isDisplayed !== Boolean(falseCase);
        } catch(_e) {
            return false;
        }
    }, {
        timeout: ms,
    });
    return await $(selector);
};
