import { Nav } from  '../selectors';
import waitForDisplayed from '../wait/waitForDisplayed';
import clickElement from '../action/clickElement';

export default async () => {
  await waitForDisplayed(Nav.returnHome, false);
  await clickElement('click', 'selector', Nav.returnHome);
};
