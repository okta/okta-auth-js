import clickElement from './clickElement';
import links from '../selectors/maps/links';

export default async (linkName: string) => {
  const link = (links as any)[linkName];
  if (!link) {
    throw new Error(`No link can match name ${linkName}`);
  }
  await clickElement('click', 'link', link);
};
