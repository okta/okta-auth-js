import a18nClient from '../../management-api/a18nClient';

export default async function (): Promise<void> {
   this.a18nProfile = await a18nClient.createProfile();
}
