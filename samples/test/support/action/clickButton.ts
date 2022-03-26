import clickElement from './clickElement';
import buttons from '../selectors/maps/buttons';
import { camelize } from '../../util';

export default async (buttonName: string) => {
  let tag, name;
  buttonName = camelize(buttonName);
  const nameCandidates = (buttons as any)[buttonName] || [];
  nameCandidates.push(buttonName);
  for (const tagCandidate of ['button', 'input', 'a']) {
    for (const nameCandidate of nameCandidates) {
      const el = await $(`${tagCandidate}[name=${nameCandidate}]`);
      if (await el?.isClickable()) {
        tag = tagCandidate;
        name = nameCandidate;
        break;
      }
    }
  }
  await clickElement('click', 'selector', `${tag}[name="${name}"]`);
};
