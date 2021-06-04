import createUser from '../../management-api/createUser';

export default async function (assignToGroup: string | undefined, firstName: string): Promise<void> {
   const [user, a18nProfile] = await createUser(firstName, assignToGroup);
   this.user = user;
   this.a18nProfile = a18nProfile;
}
