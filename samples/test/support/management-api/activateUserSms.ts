import { Client, User } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util';

export default async function(user: User, phoneNumber: string): Promise<boolean> {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  const smsFactor = {
    factorType: 'sms',
    provider: 'OKTA',
    profile: {
      phoneNumber: phoneNumber
    }
  };

  const res = await oktaClient.enrollFactor(user.id, smsFactor, {
    activate: true
  });
  
  return (res.status == 'ACTIVE');
}
