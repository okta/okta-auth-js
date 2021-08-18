import { Client, PolicyRule } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util/configUtils';

interface ProfileEnrollmentPolicyRule extends PolicyRule {
  requirement: Record<string, unknown>;
  _links: Record<string, Record<string, string>>;
}

function addCustomProfileAttribute(policyRule: ProfileEnrollmentPolicyRule,
  profileAttribute: {name: string; label: string; required: boolean}) {
 policyRule.requirement = {
   ...policyRule.requirement,
   profileAttributes: [
     ...(policyRule.requirement.profileAttributes) as Record<string, string>[],
     profileAttribute
   ]
 };
}

export default async function(policyId: string, profileAttribute: {name: string; label: string; required: boolean}) {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  try {
    let policyRules = [];
    for await(let rule of oktaClient.listPolicyRules(policyId)) {
      policyRules.push(rule);
    }

    let defaultRule = policyRules.pop() as ProfileEnrollmentPolicyRule;
    addCustomProfileAttribute(defaultRule, profileAttribute);

    const url = defaultRule._links.self.href;
    await oktaClient.http.putJson(url, {body: defaultRule as any});
  } catch (err) {
    console.warn('Unable to update Profile Enrollment policy default rule.');
    throw err;
  }
}