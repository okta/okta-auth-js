const compose = (...functions) => args => functions.reduceRight((arg, fn) => fn(arg), args);

const getInputTypeFromMeta = meta => {
  const { secret, type } = meta;
  let res = 'text';
  if (secret) {
    res = 'password';
  } else if (type === 'boolean') {
    res = 'checkbox';
  }
  return res;
};

const inputTransformer = ({ inputs = [] }) => form => {
  return { 
    ...form,
    inputs: inputs.reduce((acc, input) => {
      let { label, name, value, type, required } = input;
      if (Array.isArray(value)) {
        for (const val of value) {
          const type = getInputTypeFromMeta(val);
          if (type) {
            acc.push({
              ...input,
              ...val,
              name: `${name}.${val.name}`,
              type
            });
          }
        }
      } else if (type === 'object') {
        // cannot be handle as input, wait for later transform to process
        // do nothing
      } else {
        const type = getInputTypeFromMeta(input);
        if (type) {
          acc.push({ label, name, type, required });
        }
      }

      return acc;
    }, [])
  };
};

const selectTransformer = nextStep => form => {
  const { inputs } = nextStep;
  
  return inputs.reduce((acc, { name, options }) => {
    if (!options) {
      return acc;
    }
    if (!acc.selects) {
      acc.selects = [];
    }
    acc.selects.push({ name, options });
    return acc;
  }, form);
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
