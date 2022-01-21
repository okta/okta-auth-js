/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Authenticator, Credentials } from './Authenticator';

export interface SecurityQuestionVerificationValues {
  answer?: string;
}

export class SecurityQuestionVerification extends Authenticator<SecurityQuestionVerificationValues> {
  canVerify(values: SecurityQuestionVerificationValues) {
    return !!values.answer;
  }

  mapCredentials(values: SecurityQuestionVerificationValues): Credentials {
    return {
      questionKey: this.meta.contextualData!.enrolledQuestion!.questionKey,
      answer: values.answer
    };
  }

  getInputs() {
    return [
      { name: 'answer', type: 'string', label: 'Answer', required: true }
    ];
  }
}
