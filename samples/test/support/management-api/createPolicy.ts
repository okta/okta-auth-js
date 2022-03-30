import { Client } from '@okta/okta-sdk-nodejs';
import { randomStr, getConfig } from '../../util';

type Options = {
  policyDescription: string;
  groupId?: string;
  dataTable?: {
    rawTable: string[][];
  }; 
}

const getAuthenticationPolicy = () => {
  return { type: 'ACCESS_POLICY' };
};

const getProfileEnrollmentPolicy = () => {
  return { type: 'PROFILE_ENROLLMENT' };
};

const getMFAEnrollmentPolicy = (options: Options) => {
  const authenticators = options.dataTable?.rawTable
    .reduce((acc: any, [key, value]) => {
      acc.push({
        key,
        enroll: { self: value }
      });
      return acc;
    }, []);
  return {
    type: 'MFA_ENROLL',
    settings: {
      type: 'AUTHENTICATORS',
      authenticators
    },
    conditions: {
      people: {
        groups: {
          include: [options.groupId]
        }
      }
    }
  };
};

export default async function(options: Options) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  let policyObject;
  const { policyDescription } = options;
  if (policyDescription === 'Authentication') {
    policyObject = getAuthenticationPolicy();
  } else if (policyDescription === 'MFA Enrollment') {
    policyObject = getMFAEnrollmentPolicy(options);
  } else if (policyDescription === 'Profile Enrollment') {
    policyObject = getProfileEnrollmentPolicy();
  } else {
    throw new Error(`Unknow policy ${policyDescription}`);
  }

  const policy = await oktaClient.createPolicy({
    ...policyObject,
    name: `${policyObject.type}-${randomStr(6)}`
  });
  return policy;
}
