const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

const inputTransformer = nextStep => form => {
  // only process UI inputs
  const inputs = nextStep.inputs?.filter(input => !!input.label);
  
  if (!inputs?.length) {
    return form;
  }

  return { 
    ...form,
    inputs: inputs.map(({ label, name, type, secret, required }) => {
      if (secret) {
        type = 'password';
      } else if (type === 'string') {
        type = 'text';
      } else if (type === 'boolean') {
        type = 'checkbox';
      }
      return { label, name, type, required };
    })
  };
};

const selectTransformer = nextStep => form => {
  const { inputs, options } = nextStep;
  
  if (!options) {
    return form;
  }

  return {
    ...form,
    select: {
      name: inputs[0].name,
      options: options.map(({ label, value }) => ({ key: value, value, label }))
    }
  };
};

const securityQuestionTransformer = nextStep => form => {
  const { 
    authenticator: { 
      contextualData: { questionKeys, questions, enrolledQuestion } = {}
    } = {} 
  } = nextStep;

  if (enrolledQuestion) {
    // verification form
    return {
      ...form,
      text: { value: enrolledQuestion.question }
    };
  } else if (questions && questionKeys) {
    // enrollment form
    return {
      ...form,
      select: {
        label: 'Choose a security question',
        name: 'questionKey',
        options: questions.map(({ questionKey, question }) => ({ 
          key: questionKey,
          label: question,
          value: question
        }))
      }
    };
  } else {
    return form;
  }
};

const googleAuthenticatorTransformer = nextStep => form => {
  const { 
    authenticator: { 
      contextualData: { qrcode, sharedSecret } = {}
    } = {} 
  } = nextStep;
  
  if (!qrcode && !sharedSecret) {
    return form;
  }

  return {
    ...form,
    text: { value: sharedSecret },
    image: { src: qrcode.href }
  };
};

export const formTransformer = nextStep => compose(
  googleAuthenticatorTransformer(nextStep),
  securityQuestionTransformer(nextStep),
  selectTransformer(nextStep),
  inputTransformer(nextStep)
);
