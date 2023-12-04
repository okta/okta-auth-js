import { randomStr } from '../../util';
import getOktaClient, { OktaClientConfig } from './util/getOktaClient';
import merge from 'deepmerge';
import { Client } from '@okta/okta-sdk-nodejs';

type Options = {
  policyId: string;
  policyType: string;
  policyRuleDescription: string;
  groupId?: string;
};

const getAccessPolicyActions = (description: string) => {
  return ({
    'Password as the only factor': {
      'actions': {
        'appSignOn': {
          'access': 'ALLOW',
          'verificationMethod': {
            'factorMode': '1FA',
            'reauthenticateIn': 'PT2H',
            'constraints': [
              {
                'knowledge': {
                  'types': [
                    'password'
                  ]
                }
              }
            ],
            'type': 'ASSURANCE'
          }
        }
      }
    },

    'Password + Another Factor': {
      'actions': {
        'appSignOn': {
          'access': 'ALLOW',
          'verificationMethod': {
            'factorMode': '2FA',
            'type': 'ASSURANCE',
            'reauthenticateIn': 'PT2H',
            'constraints': [
              {
                'knowledge': {
                  'types': [
                    'password'
                  ],
                  'reauthenticateIn': 'PT2H'
                }
              }
            ]
          }
        }
      },


    },
    'Any one factor': {
      'status': 'ACTIVE',
      'actions': {
        'appSignOn': {
          'access': 'ALLOW',
          'verificationMethod': {
            'factorMode': '1FA',
            'type': 'ASSURANCE',
            'reauthenticateIn': 'PT2H',
            'constraints': [
              {
                'possession':{}
             },
             {
                'knowledge':{}
             }
            ]
          }
        }
      },

    }
  } as any)[description];
};

const getMFAEnrollPolicyActions = (description: string) => {
  return ({
    'MFA Enrollment Challenge': {
      'actions': {
        'enroll': {
          'self': 'CHALLENGE'
        }
      }
    }
  } as any)[description];
};

const getProfileEnrollmentPolicyActions = (description: string) => {
  return ({
    'collecting default attributes': {
      'actions': {
        'profileEnrollment': {
          'access': 'ALLOW',
          'unknownUserAction': 'REGISTER',
          'activationRequirements': {
            'emailVerification': true
          },
          'profileAttributes': [
            {
              'name': 'email',
              'label': 'Email',
              'required': true
            }
          ],
        }
      }
    },
    'collecting default attributes and emailVerification is not required': {
      'actions': {
        'profileEnrollment': {
          'access': 'ALLOW',
          'unknownUserAction': 'REGISTER',
          'activationRequirements': {
            'emailVerification': false
          },
          'profileAttributes': [
            {
              'name': 'email',
              'label': 'Email',
              'required': true
            }
          ],
        }
      }
    },
    'collecting default attributes and a required "customAttribute"': {
      'actions': {
        'profileEnrollment': {
          'access': 'ALLOW',
          'unknownUserAction': 'REGISTER',
          'activationRequirements': {
            'emailVerification': true
          },
          'profileAttributes': [
            {
              'name': 'email',
              'label': 'Email',
              'required': true
            },
            {
              'name': 'customAttribute',
              'label': 'Custom Attribute',
              'required': true
            },
          ]
        }
      }
    }
  } as any)[description];
};

const getGlobalSessionPolicyActions = (description: string) => {
  return ({
    'Primary factor as Password / IDP / any factor allowed by app sign on rules': {
      'type': 'SIGN_ON',
      'status': 'ACTIVE',
      'actions': {
        'signon': {
          'access': 'ALLOW',
          'requireFactor': false,
          'primaryFactor': 'PASSWORD_IDP_ANY_FACTOR',
          'rememberDeviceByDefault': false,
          'session': {
            'usePersistentCookie': false,
            'maxSessionIdleMinutes': 120,
            'maxSessionLifetimeMinutes': 0
          }
        }
      }
    },

  } as any)[description];
};

const getPasswordPolicyActions = (description: string) => {
  return ({
    '"Users can perform self-service" has "Unlock Account" checked': {
      'type': 'PASSWORD',
      'status': 'ACTIVE',
      'conditions': {
        'people': { 'users': { 'exclude': [] } },
        'network': { 'connection': 'ANYWHERE' }
      },
      'actions': {
        'passwordChange': {
          'access': 'ALLOW'
        },
        'selfServicePasswordReset': {
          'access': 'ALLOW',
        },
        'selfServiceUnlock': {
          'access': 'ALLOW',
        }
      }
    },
    '"Users can initiate Recovery with" has "Phone (SMS / Voice Call)" and "Email" checked': {
      'actions': {
        'selfServicePasswordReset': {
          'requirement': {
            'stepUp': {
              'required': true
            },
            'primary': {
              'methods': [
                'email',
                'sms'
              ]
            }
          }
        },
      }
    },
    '"Additional Verification is" has "Not Required" checked': {
      'actions': {
        'selfServicePasswordReset': {
          'requirement': {
            'stepUp': {
              'required': false
            }
          }
        },
      }
    },
  } as any)[description];
};

async function addCustomAttributeToDefaultUserType(oktaClient: Client) {
  await oktaClient.updateUserProfile('default', {
    definitions: {
      custom: {
        id: '#custom',
        type: 'object',
        properties: {
          customAttribute: {
            title: 'Custom Attribute',
            description: 'Custom Attribute',
            type: 'string',
            required: false,
            minLength: 1,
            maxLength: 20,
            permissions: [
              {
                principal: 'SELF',
                action: 'READ_WRITE'
              }
            ]
          }
        }
      }
    }
  });
}

/* eslint-disable complexity */
export default async function (config: OktaClientConfig, {
  policyId,
  policyType,
  policyRuleDescription,
  groupId
}: Options) {
  const oktaClient = getOktaClient(config);

  let actions;
  switch (policyType) {
    case 'ACCESS_POLICY':
      actions = getAccessPolicyActions(policyRuleDescription);
      break;
    case 'MFA_ENROLL':
      actions = getMFAEnrollPolicyActions(policyRuleDescription);
      break;
    case 'PROFILE_ENROLLMENT':
      actions = getProfileEnrollmentPolicyActions(policyRuleDescription);
      if (groupId) {
        actions.actions.profileEnrollment.targetGroupIds = [groupId];
      }
      break;
    case 'OKTA_SIGN_ON':
      actions = getGlobalSessionPolicyActions(policyRuleDescription);
      break;
    case 'PASSWORD':
      actions = getPasswordPolicyActions(policyRuleDescription);
      break;
    default:
      throw new Error(`No actions is found with ${policyType} ${policyRuleDescription}`);
  }

  let res;
  const { value: existingRule } = await oktaClient.listPolicyRules(policyId).next();
  if (existingRule) {
    if (policyType === 'PROFILE_ENROLLMENT') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingAttributes: { name: string }[] = (existingRule.actions as any).profileEnrollment?.profileAttributes;
      // Exclude existing attributes (like 'email') to prevent API error
      const profileAttributes: { name: string }[] = actions.actions.profileEnrollment.profileAttributes
        .filter((attr: { name: string }) => {
          return !existingAttributes.find((existingAttr) => (existingAttr.name === attr.name));
        });
      const customAttribute = profileAttributes.find((existingAttr) => (existingAttr.name === 'customAttribute'));
      if (customAttribute) {
        // Need to add custom attribute to default user schema
        await addCustomAttributeToDefaultUserType(oktaClient);
      }
      actions.actions.profileEnrollment.profileAttributes = profileAttributes;
    }
    res = await oktaClient.updatePolicyRule(policyId, existingRule.id, merge(existingRule, actions));
  } else {
    res = await oktaClient.createPolicyRule(policyId, {
      name: `Test-Policy-Rule-${randomStr(6)}`,
      type: policyType,
      ...actions
    });
  }
  return res;
}
