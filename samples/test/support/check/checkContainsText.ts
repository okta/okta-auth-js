import type { Selector } from 'webdriverio';
import waitForDisplayed from '../wait/waitForDisplayed';

/**
 * Check if the given elements contains text
 * @param  {String}   elementType   Element type (element or button)
 * @param  {String}   selector      Element selector
 * @param  {String}   falseCase     Whether to check if the content contains
 *                                  the given text or not
 * @param  {String}   expectedText  The text to check against
 */
export default async (
    elementType: 'element' | 'button',
    selector: Selector,
    falseCase: ' not',
    expectedText: string
) => {
    /**
     * The command to perform on the browser object
     * @type {String}
     */
    let command: 'getValue' | 'getText' = 'getValue';

    if (
        ['button', 'container'].includes(elementType)
        || (await $(selector)).getAttribute('value') === null
    ) {
        command = 'getText';
    }

    /**
     * False case
     * @type {Boolean}
     */
    let boolFalseCase;

    /**
     * The expected text
     * @type {String}
     */
    let stringExpectedText = expectedText;
    /**
     * The text of the element
     * @type {String}
     */
    await waitForDisplayed(selector);
    const text = (await $(selector))[command]();

    if (typeof expectedText === 'undefined') {
        stringExpectedText = falseCase;
        boolFalseCase = false;
    } else {
        boolFalseCase = (falseCase === ' not');
    }

    if (boolFalseCase) {
        expect(text).not.toContain(stringExpectedText);
    } else {
        expect(text).toContain(stringExpectedText);
    }
};
