import { randomStr } from '../../util';
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

const getPasswordPolicy = (options: Options) => {
  return {
    priority: 0,
    type: 'PASSWORD',
    conditions: {
      people: {
        groups: {
          include: [options.groupId]
        }
      },
      authProvider: {
        provider: 'OKTA'
      }
    },
    settings: {
      password: {
        complexity: {
          minLength: 8,
          minLowerCase: 0,
          minUpperCase: 0,
          minNumber: 0,
          minSymbol: 0,
          excludeUsername: true,
          dictionary: { common: { exclude: true } },
          excludeAttributes: []
        },
        age: {
          maxAgeDays: 0,
          expireWarnDays: 0,
          minAgeMinutes: 0,
          historyCount: 4
        },
        lockout:  {
          maxAttempts: 1, // important to lock user after incorrect passwod
          autoUnlockMinutes: 0,
          userLockoutNotificationChannels: [],
          showLockoutFailures: false
        }
      },
      recovery: {
        factors: {
          ['okta_email']: {
            status: 'ACTIVE',
            properties: {
              recoveryToken: {
                tokenLifetimeMinutes: 60
              }
            }
          },
          ['okta_sms']: {
            status: 'ACTIVE'
          },
        }
      },
      delegation: {
        options: { skipUnlock: false }
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
  } else if (policyDescription === 'Account Recovery') {
    policyObject = getPasswordPolicy(options);
  } else {
    throw new Error(`Unknow policy ${policyDescription}`);
  }

  const policy = await oktaClient.createPolicy({
    ...policyObject,
    name: `${policyObject.type}-${randomStr(6)}`
  });
  return policy;
}
