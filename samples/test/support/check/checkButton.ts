import { UserHome } from '../selectors';
import isDisplayed from './isDisplayed';

/**
 * Check if the given element is (not) visible
 * @param  {String}  objectName as defined in bdd steps
 */
export default async(objectName: string) => {
    /**
     * Visible state of the give element
     * @type {String}
     */
    switch (objectName) {
        case 'logout': {
            await isDisplayed(UserHome.logoutButton, false);
            break;
        }

        default: {
            throw new Error(`Unknown object "${objectName}"`);
        }
    }
};
