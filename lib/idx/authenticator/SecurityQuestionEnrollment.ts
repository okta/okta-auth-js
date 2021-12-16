import { Authenticator } from './Authenticator';

export class SecurityQuestionEnrollment extends Authenticator {
  canVerify(values) {
    const { questionKey, question, answer } = values;
    return (questionKey && answer) || (question && answer);
  }

  mapCredentials(values) {
    const { questionKey, question, answer } = values;
    return {
      questionKey: question ? 'custom' : questionKey,
      question,
      answer
    };
  }

  getInputs() {
    return [
      { name: 'questionKey', type: 'string', require: true },
      { name: 'question', type: 'string', label: 'Create a security question' },
      { name: 'answer', type: 'string', label: 'Answer', required: true },
    ];
  }
}
