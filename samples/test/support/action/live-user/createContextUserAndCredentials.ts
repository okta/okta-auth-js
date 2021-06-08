import createCredentials from '../../management-api/createCredentials';
import createUser from '../../management-api/createUser';

export default async function (firstName: string, assignToGroup?: string): Promise<void> {
  const credentials = this.credentials || await createCredentials(firstName, this.featureName);
  this.credentials = credentials;

  const user = await createUser(credentials, assignToGroup);
  this.user = user;
}
