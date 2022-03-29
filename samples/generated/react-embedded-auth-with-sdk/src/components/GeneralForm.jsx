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
import { useIdxTransaction } from '../contexts';
import { formTransformer } from '../formTransformer';
import { capitalizeFirstLetter, getMessageVariant } from '../util';
import Spinner from './Spinner';

const GeneralForm = () => {
  const { oktaAuth } = useOktaAuth();
  const { transaction, setTransaction } = useIdxTransaction();
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
    const newTransaction = await oktaAuth.idx.proceed(inputValues);
    setTransaction(newTransaction);
    setInputValues({});
    setProcessing(false);
  };

  const handleSkip = async () => {
    const newTransaction = await oktaAuth.idx.proceed({ skip: true });
    setTransaction(newTransaction);
  };

  const handleRecoverPassword = async (e) => {
    e.preventDefault();
    setProcessing(true);
    const newTransaction = await oktaAuth.idx.recoverPassword();
    setTransaction(newTransaction);
    setProcessing(false);
  };

  if (!transaction || !transaction.nextStep) {
    return <Spinner />;
  }

  const { nextStep, messages, actions, availableSteps } = transaction;
  const { name, canSkip } = nextStep;
  const canRecoverPassword = !!actions?.['currentAuthenticator-recover'];
  const idps = availableSteps.filter(step => step.name === 'redirect-idp');
  const form = formTransformer(nextStep)({} /* initial form value */);
  const { inputs, select, text, image } = form;

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
          {select && (
            <Select label={select.label} name={select.name} onChange={handleChange}>
              <Select.Option key="" value="">---</Select.Option>
              {select.options.map(({ key, label }) => (
                <Select.Option key={key} value={key}>{label}</Select.Option>
              ))}
            </Select>
          )}
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
          {canRecoverPassword && (
            <Box paddingTop="s" paddingBottom="s">
              <Link href="#" name="forgotPassword" onClick={handleRecoverPassword}>Forgot password</Link>
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
