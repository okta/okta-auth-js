import a18nClient from '../../management-api/a18nClient';
import createUser from '../../management-api/createUser';

export default async function (firstName: string, assignToGroup?: string): Promise<void> {
  const a18nProfile = this.a18nProfile || await a18nClient.createProfile();
  this.a18nProfile = a18nProfile;

  const user = await createUser(firstName, a18nProfile, assignToGroup);
  this.user = user;
}
