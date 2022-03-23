import clickElement from './clickElement';
import buttons from '../selectors/maps/buttons';

export default async (buttonName: string) => {
  const name = (buttons as any)[buttonName] || buttonName;
  await clickElement('click', 'selector', `button[name="${name}"]`);
};
