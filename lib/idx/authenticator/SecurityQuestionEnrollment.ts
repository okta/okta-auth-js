import { Authenticator, Credentials } from './Authenticator';

export interface SecurityQuestionEnrollValues {
  questionKey?: string;
  question?: string;
  answer?: string;
}

export class SecurityQuestionEnrollment extends Authenticator<SecurityQuestionEnrollValues> {
  canVerify(values: SecurityQuestionEnrollValues) {
    const { questionKey, question, answer } = values;
    return !!(questionKey && answer) || !!(question && answer);
  }

  mapCredentials(values: SecurityQuestionEnrollValues): Credentials {
    const { questionKey, question, answer } = values;
    return {
      questionKey: question ? 'custom' : questionKey,
      question,
      answer
    };
  }

  getInputs() {
    return [
      { name: 'questionKey', type: 'string', required: true },
      { name: 'question', type: 'string', label: 'Create a security question' },
      { name: 'answer', type: 'string', label: 'Answer', required: true },
    ];
  }
}
