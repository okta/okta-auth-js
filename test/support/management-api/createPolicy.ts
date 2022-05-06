import { randomStr } from '../util/random';
import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

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

const getGlobalSessionPolicy = (options: Options) => {
  return { 
    type: 'OKTA_SIGN_ON',
    conditions: {
      people: {
        groups: {
          include: [options.groupId]
        }
      }
    }
  };
};

export default async function(config: OktaClientConfig, options: Options) {
  const oktaClient = getOktaClient(config);

  let policyObject;
  const { policyDescription } = options;
  if (policyDescription === 'Authentication') {
    policyObject = getAuthenticationPolicy();
  } else if (policyDescription === 'MFA Enrollment') {
    policyObject = getMFAEnrollmentPolicy(options);
  } else if (policyDescription === 'Profile Enrollment') {
    policyObject = getProfileEnrollmentPolicy();
  } else if (policyDescription === 'Global Session') {
    policyObject = getGlobalSessionPolicy(options);
  } else {
    throw new Error(`Unknow policy ${policyDescription}`);
  }

  const policy = await oktaClient.createPolicy({
    ...policyObject,
    name: `${policyObject.type}-${randomStr(6)}`
  });
  return policy;
}
