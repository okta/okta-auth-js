import clickElement from './clickElement';

export default async () => {
  await clickElement('click', 'selector', '#submit-button');
};
