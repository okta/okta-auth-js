import a18nClient, { A18nProfile } from './a18nClient';

export declare interface UserCredentials extends A18nProfile {
  firstName: string;
  lastName: string;
}

export default async function (firstName: string, featureName?: string): Promise<UserCredentials> {
  const a18nProfile = await a18nClient.createProfile();
  return Object.assign({}, a18nProfile, {
    firstName,
    lastName: featureName || `Mc${firstName}face`
  });
}
