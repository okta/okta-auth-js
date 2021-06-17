import { getCurrentUrl } from '../../util';

/**
 * Check if the current URL path matches the given path
 * @param  {Boolean}  falseCase    Whether to check if the path matches the
 *                                 expected value or not
 * @param  {String}   expectedPath The expected path to match against
 * @param  {Boolean}  removeHash Whether to strip hash before check
 */
export default async (falseCase: boolean, expectedPath: string, removeHash = false) => {
    const currentUrl = await getCurrentUrl(removeHash);

    if (falseCase) {
        expect(currentUrl)
            // @ts-expect-error
            .not.toEqual(expectedPath, `expected path not to be "${currentUrl}"`);
    } else {
        expect(currentUrl).toEqual(
            expectedPath,
            // @ts-expect-error
            `expected path to be "${expectedPath}" but found `
            + `"${currentUrl}"`
        );
    }
};
