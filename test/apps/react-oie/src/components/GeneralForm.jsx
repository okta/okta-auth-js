import { useState } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { 
  Form, 
  Button, 
  TextInput, 
  Checkbox, 
  Select, 
  Infobox 
} from '@okta/odyssey-react';
import { useTransaction } from '../TransactionContext';
import { formTransformer } from '../formTransformer';
import { capitalizeFirstLetter, getMessageVariant } from '../util';
import Spinner from './Spinner';

const GeneralForm = () => {
  const { oktaAuth } = useOktaAuth();
  const { transaction, setTransaction } = useTransaction();
  const [inputValues, setInputValues] = useState({});

  const handleChange = ({ target: { name, value, checked } }) => {
    return setInputValues({
      ...inputValues,
      [name]: value || checked
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const newTransaction = await oktaAuth.idx.proceed(inputValues);
    setTransaction(newTransaction);
    setInputValues({});
  };

  const handleSkip = async () => {
    const newTransaction = await oktaAuth.idx.proceed({ skip: true });
    setTransaction(newTransaction);
  };

  if (!transaction || !transaction.nextStep) {
    return <Spinner />;
  }

  const { nextStep, messages } = transaction;
  const { name, canSkip } = nextStep;
  const form = formTransformer(nextStep)({} /* initial form value */);
  const { inputs, select, text, image } = form;

  return (
    <Form 
      heading={capitalizeFirstLetter(name)} 
      onSubmit={handleSubmit}
    >
      <Form.Error>
        {messages && messages.map(message => 
          <Infobox 
            key={message.message} 
            variant={getMessageVariant(message.class)}
            content={message.message} 
          />)}
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
      <Form.Actions>
        {canSkip && <Button type="button" onClick={handleSkip}>Skip</Button>}
        <Button wide type="submit">Submit</Button>
      </Form.Actions>
    </Form>
  );
};

export default GeneralForm;
