import createCredentials from '../../management-api/createCredentials';
import ActionContext from '../../context';

export default async function (this: ActionContext, firstName: string): Promise<void> {
  this.credentials = await createCredentials(firstName, this.featureName);
}
