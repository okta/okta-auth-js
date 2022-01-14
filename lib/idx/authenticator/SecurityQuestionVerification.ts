/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Authenticator } from './Authenticator';

export class SecurityQuestionVerification extends Authenticator {
  canVerify(values) {
    return values.answer;
  }

  mapCredentials(values) {
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
