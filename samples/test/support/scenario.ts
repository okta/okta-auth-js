export enum Scenario {
  TOTP_ENROLL_WITH_SECRET_KEY = 'TOTP_ENROLL_WITH_SECRET_KEY',
  TOTP_SIGN_IN_REUSE_SHARED_SECRET = 'TOTP_SIGN_IN_REUSE_SHARED_SECRET'
}

export function matchScenario(scenario: Scenario, featureName?: string, scenarioName?: string) {
  switch (scenario) {
    case Scenario.TOTP_ENROLL_WITH_SECRET_KEY:
      return Boolean(featureName?.includes('Google Authenticator') && 
        scenarioName?.includes('by entering a Secret Key'));
    case Scenario.TOTP_SIGN_IN_REUSE_SHARED_SECRET:
      return Boolean(featureName?.includes('Google Authenticator') && 
        scenarioName?.includes('Signs in'));
    default:
      return false;
  }
}
