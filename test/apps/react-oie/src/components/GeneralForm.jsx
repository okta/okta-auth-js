import { useState } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { 
  Form, 
  Heading,
  Button, 
  TextInput, 
  Checkbox, 
  Select, 
  Infobox,
  Link,
  Box,
} from '@okta/odyssey-react';
import { useTransaction } from '../TransactionContext';
import { formTransformer } from '../formTransformer';
import { capitalizeFirstLetter, getMessageVariant } from '../util';
import Spinner from './Spinner';

export function mapInputValuesToPayload(inputs, values) {
  const fn = (inputs, values, nameTracker) => {
    const res = {};
    for (const input of inputs) {
      const { name, value, options } = input;
      
      if (name === 'authenticator') {
        const key = values.authenticator;
        res[name] = options
          .find(({ relatesTo }) => relatesTo.key === key)
          .value
          .reduce((acc, { name, value }) => {
            acc[name] = value;
            return acc;
          }, {});
        continue;
      }

      const combinedName = nameTracker ? `${nameTracker}.${name}` : name;
      if (Array.isArray(value)) {
        res[name] = fn(value, values, combinedName);
      } else {
        res[name] = values[combinedName];
      }
    }
    return res;
  };

  return fn(inputs, values, '');
}

const GeneralForm = () => {
  const { oktaAuth } = useOktaAuth();
  const { transaction, setTransaction } = useTransaction();
  const [inputValues, setInputValues] = useState({});
  const [processing, setProcessing] = useState(false);

  const handleChange = ({ target: { name, value, checked } }) => {
    return setInputValues({
      ...inputValues,
      [name]: value || checked
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    setProcessing(true);
    const payload = mapInputValuesToPayload(transaction.nextStep.inputs, inputValues);
    const newTransaction = await oktaAuth.idx.proceed(payload);
    setTransaction(newTransaction);
    setInputValues({});
    setProcessing(false);
  };

  const handleSkip = async () => {
    const newTransaction = await oktaAuth.idx.proceed({ skip: true });
    setTransaction(newTransaction);
  };

  const handleRecoverPassword = recoverPasswordFn => async (e) => {
    e.preventDefault();
    setProcessing(true);
    const newTransaction = await recoverPasswordFn();
    setTransaction(newTransaction);
    setProcessing(false);
  };

  if (!transaction || !transaction.nextStep) {
    return <Spinner />;
  }

  const { nextStep, messages, availableSteps } = transaction;
  const { name, canSkip } = nextStep;
  const recoverPasswordFn = availableSteps.find(step => step.name === 'currentAuthenticator-recover')?.action;
  const idps = availableSteps.filter(step => step.name === 'redirect-idp');
  const form = formTransformer(nextStep)({} /* initial form value */);
  const { inputs, selects, text, image } = form;

  return (
    <Box padding="m">
      <Form onSubmit={handleSubmit}>
        <Heading id="page-title-header" level="1" visualLevel="4">
          {name.split('-').map(str => capitalizeFirstLetter(str)).join(' ')}
        </Heading>
        <Form.Error>
          <Box id="form-messages">
          {messages && messages.map(message => 
            <Infobox 
              key={message.message} 
              variant={getMessageVariant(message.class)}
              content={message.message} 
            />)}
          </Box>
        </Form.Error>
        <Form.Main>
          {text && <div>{text.value}</div>}
          {image && <img src={image.src} />}
          {selects && selects.map(select => (
            <Select key={select.name} label={select.label} name={select.name} onChange={handleChange}>
              <Select.Option key="" value="">---</Select.Option>
              {select.options.map(({ relatesTo, label }) => (
                <Select.Option key={relatesTo.key} value={relatesTo.key}>{label}</Select.Option>
              ))}
            </Select>
          ))}
          {inputs && inputs.map((input) => {
            const { label, name, type, required } = input;
            const Comp = type === 'checkbox' ? Checkbox : TextInput;
            return (
              <Comp 
                key={name}
                name={name}
                label={label}
                type={type} 
                value={inputValues[name] || ''} 
                required={required} 
                onChange={handleChange} 
              />
            );
          })}
        </Form.Main>
        <Box display="flex" flexDirection="column">
          {canSkip && <Button variant="secondary" type="button" onClick={handleSkip}>Skip</Button>}
          <Box paddingTop="s" paddingBottom="s">
            <Button wide type="submit" disabled={processing}>Submit</Button>
          </Box>
          {!!recoverPasswordFn && (
            <Box paddingTop="s" paddingBottom="s">
              <Link href="#" name="forgotPassword" onClick={handleRecoverPassword(recoverPasswordFn)}>Forgot password</Link>
            </Box>
          )}
          {idps.length > 0 && (
            <Box>
              <Box borderColor="display" marginTop="s" marginBottom="s"></Box>
              {idps.map(step => (
                <Box key={step.idp.id} paddingTop="s">
                  <Link variant="dismiss" href={step.href}>{step.idp.name}</Link>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Form>
    </Box>
  );
};

export default GeneralForm;
