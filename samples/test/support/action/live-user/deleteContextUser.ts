
import deleteUser from '../../management-api/deleteUser';

export default async function(): Promise<void> {
  await deleteUser(this.user, this.a18nProfile);
}
