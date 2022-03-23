/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Authenticator, Credentials } from './Authenticator';

export interface SecurityQuestionVerificationValues {
  answer?: string;
}

export class SecurityQuestionVerification extends Authenticator<SecurityQuestionVerificationValues> {
  canVerify(values: SecurityQuestionVerificationValues) {
    return !!values.answer;
  }

  mapCredentials(values: SecurityQuestionVerificationValues): Credentials | undefined {
    const { answer } = values;
    if (!answer) {
      return;
    }
    return {
      questionKey: this.meta.contextualData!.enrolledQuestion!.questionKey,
      answer
    };
  }

  getInputs() {
    return [
      { name: 'answer', type: 'string', label: 'Answer', required: true }
    ];
  }
}
