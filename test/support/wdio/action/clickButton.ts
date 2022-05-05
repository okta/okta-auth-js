import checkButton from '../check/checkButton';

export default async (buttonName: string, containerSelector?: string) => {
  const el = await checkButton(buttonName, containerSelector);
  await el.click();
};
