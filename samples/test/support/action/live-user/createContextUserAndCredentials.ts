import createCredentials from '../../management-api/createCredentials';
import createUser from '../../management-api/createUser';
import ActionContext from '../../context';

export default async function (this: ActionContext, firstName: string, assignToGroups?: string[]): Promise<void> {
  const credentials = this.credentials || await createCredentials(firstName, this.featureName);
  this.credentials = credentials;

  const user = await createUser(credentials, assignToGroups);
  this.user = user;
} 
