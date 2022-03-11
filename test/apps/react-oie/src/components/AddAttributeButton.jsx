import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextInput, 
  Modal, 
  Form, 
  Infobox,
  Text
} from '@okta/odyssey-react';
import LinkButton from './LinkButton';
import { useTransaction } from '../TransactionContext';

const AddAttributeButton = ({ 
  heading, 
  inputLabel,
  onStartTransaction, 
  onFinishTransaction,
  onClick,
  children
}) => {
  const { myAccountTransaction, setMyAccountTransaction } = useTransaction();
  const [inputLabelState, setInputLabelState] = useState(inputLabel);
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (myAccountTransaction?.status === 'VERIFIED') {
      handleFinishTransaction();
    }
    if (myAccountTransaction?.status === 'UNVERIFIED') {
      setInputLabelState('Verification Code');
    }
  }, [myAccountTransaction]);

  const handleFinishTransaction = () => {
    onFinishTransaction();
    setAdding(false);
    setValue('');
    setMyAccountTransaction(null);
  };

  const handleButtonClick = async () => {
    if (onClick) {
      try {
        const transaction = await onClick();
        setMyAccountTransaction(transaction);
      } catch (err) {
        setError(err);
      }
    }
    setAdding(true);
  };

  const handleChange = (e, v) => {
    setValue(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let transaction;
    try {
      if (!myAccountTransaction) {
        transaction = await onStartTransaction(value);
      } else if (myAccountTransaction.status === 'UNVERIFIED') {
        const data = { verificationCode: value };
        transaction = await myAccountTransaction.verify({ data });
        // no transaction update, trigger states update here
        handleFinishTransaction();
      }
      if (transaction) {
        setMyAccountTransaction(transaction);
      }
      setValue('');
      setError(null);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
    <Modal open={adding} onClose={handleFinishTransaction}>
      <Form heading={heading} onSubmit={handleSubmit}>
        <Form.Error>
          {error && (
            <Infobox 
              variant="danger" 
              content={error.errorCauses.map(({errorSummary}) => 
                <Text key={errorSummary}>{errorSummary}</Text>)} 
            />
          )}
        </Form.Error>
        <Form.Main>
          <TextInput 
            type="text" 
            label={inputLabelState} 
            value={value} 
            onChange={handleChange} 
          />
        </Form.Main>
        <Form.Actions>
          <Button variant="clear" onClick={handleFinishTransaction}>Cancel</Button>
          <Button type="submit">Continue</Button> 
        </Form.Actions>
      </Form>
    </Modal>
    <Box>
      <LinkButton onClick={handleButtonClick}>
        {children}
      </LinkButton>
    </Box>
    </>
  );
};

export default AddAttributeButton;
