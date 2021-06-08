import createCredentials from '../../management-api/createCredentials';

export default async function (firstName: string): Promise<void> {
  this.credentials = await createCredentials(firstName, this.featureName);
}
