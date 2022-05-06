import { clickElement } from './clickElement';
import links from '../selectors/maps/links';
import { camelize } from '@okta/test.support/util';

export const clickLink = async (linkName: string) => {
  linkName = camelize(linkName);
  const name = (links as any)[linkName] || linkName;
  if (!name) {
    throw new Error(`No link can match name ${linkName}`);
  }
  await clickElement('click', 'selector', `a[name=${name}]`);
};
