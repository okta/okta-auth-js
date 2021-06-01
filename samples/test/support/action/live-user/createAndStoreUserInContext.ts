import createUser from '../../management-api/createUser';

export default async function (firstName: string): Promise<void> {
   const [user, a18nProfile] = await createUser(firstName);
   this.user = user;
   this.a18nProfile = a18nProfile;
}