import { getCurrentUrl } from '../../util';

/**
 * Wait for the current URL path matches the given path
 * @param  {Boolean}  falseCase    Whether to check if the path matches the
 *                                 expected value or not
 * @param  {String}   expectedPath The expected path to match against
 * @param  {Boolean}  removeHash Whether to strip hash before check
 */
export default async (falseCase: boolean, expectedPath: string, removeHash = false) => {
    /**
     * Maximum number of milliseconds to wait for
     * @type {Int}
     */
    const ms = 10000;

    await browser.waitUntil(async () => {
      const currentUrl = await getCurrentUrl(removeHash);
      const isExpected = expectedPath === currentUrl;
      return isExpected !== Boolean(falseCase);
    }, {
      timeout: ms,
    });
};