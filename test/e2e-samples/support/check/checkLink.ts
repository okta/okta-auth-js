import waitForDisplayed from '../wait/waitForDisplayed';
import links from '../selectors/maps/links';

export default async function checkLink(linkName: string) {
  const link = (links as any)[linkName];
  if (!link) {
    throw new Error(`No link can match name ${linkName}`);
  }
  await waitForDisplayed(`a[href="${link}"]`);
}
