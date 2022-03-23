import { Client } from '@okta/okta-sdk-nodejs';
import { randomStr, getConfig } from '../../util';

type Options = {
  policyDescription: string;
  groupId?: string;
}

const POLICY_MAP = {
  'Authentication': {
    type: 'ACCESS_POLICY',
  },
  'Profile Enrollment': { 
    type: 'PROFILE_ENROLLMENT'
  },
  'MFA Enrollment with password and email as required authenticators and phone as optional authenticator': {
    type: 'MFA_ENROLL',
    settings: {
      type: 'AUTHENTICATORS',
      authenticators: [
        {
          key: 'okta_password',
          enroll: { self: 'REQUIRED' }
        },
        {
          key: 'okta_email',
          enroll: { self: 'REQUIRED' }
        },
        {
          key: 'phone_number',
          enroll: { self: 'OPTIONAL' }
        },
      ]
    }
  },
  'MFA Enrollment with password and phone as required authenticator': {
    type: 'MFA_ENROLL',
    settings: {
      type: 'AUTHENTICATORS',
      authenticators: [
        {
          key: 'okta_password',
          enroll: { self: 'REQUIRED' }
        },
        {
          key: 'phone_number',
          enroll: { self: 'REQUIRED' }
        },
      ]
    }
  },
  'MFA Enrollment with Password and Google Authenticator as required authenticators': {
    type: 'MFA_ENROLL',
    settings: {
      type: 'AUTHENTICATORS',
      authenticators: [
        {
          key: 'okta_password',
          enroll: { self: 'REQUIRED' }
        },
        {
          key: 'google_otp',
          enroll: { self: 'REQUIRED' }
        },
      ]
    }
  } 
};

export default async function({ 
  policyDescription,
  groupId
}: Options) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  const policyObject = (POLICY_MAP as any)[policyDescription];
  const policy = await oktaClient.createPolicy({
    ...policyObject,
    ...(groupId 
        && policyDescription.includes('MFA Enrollment')
        && {
      conditions: {
        people: {
          groups: {
            include: [groupId]
          }
        }
      }
    }),
    name: `${policyObject.type}-${randomStr(6)}`
  });
  return policy;
}
