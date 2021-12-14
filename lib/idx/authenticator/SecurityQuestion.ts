import { Authenticator } from './Authenticator';

export type SecurityQuestionInputValues = {
  questionKey: string;
  question?: string;
  answer: string;
};

export class SecurityQuestion extends Authenticator {
  canVerify(values) {
    return values.questionKey && values.answer;
  }

  mapCredentials(values) {
    return {
      questionKey: values.questionKey,
      question: values.question,
      answer: values.answer
    };
  }

  getInputs() {
    return [
      { name: 'questionKey', type: 'string', require: true },
      { name: 'question', type: 'string' },
      { name: 'answer', type: 'string', label: 'Answer', required: true },
    ];
  }
}
