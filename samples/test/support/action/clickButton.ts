import clickElement from './clickElement';
import buttons from '../selectors/maps/buttons';
import { camelize } from '../../util';

export default async (buttonName: string) => {
  let name;
  buttonName = camelize(buttonName);
  const nameCandidates = (buttons as any)[buttonName] || [];
  for (const nameCandidate of nameCandidates) {
    const isDisplayed = await (await $(`button[name=${nameCandidate}]`)).isDisplayed();
    if (isDisplayed) {
      name = nameCandidate;
      break;
    }
  }
  name = name || buttonName;
  await clickElement('click', 'selector', `button[name="${name}"]`);
};
