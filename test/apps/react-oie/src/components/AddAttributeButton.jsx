import { useState, useEffect, useCallback } from 'react';
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
  initInputLabel,
  autoStartTransaction,
  onStartTransaction, 
  onFinishTransaction,
  children
}) => {
  const { myAccountTransaction, setMyAccountTransaction } = useTransaction();
  const [inputLabel, setInputLabel] = useState(initInputLabel);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);

  const handleFinishTransaction = useCallback(() => {
    setValue('');
    setMyAccountTransaction(null);
    setError(null);
    setOpen(false);
    onFinishTransaction();
  }, [setValue, setError, setOpen, setMyAccountTransaction, onFinishTransaction]);

  useEffect(() => {
    if (myAccountTransaction?.status === 'VERIFIED') {
      handleFinishTransaction();
    }
    if (myAccountTransaction?.status === 'UNVERIFIED') {
      setInputLabel('Verification Code');
    }
  }, [myAccountTransaction, handleFinishTransaction]);

  const handleButtonClick = async () => {
    if (autoStartTransaction) {
      try {
        const transaction = await onStartTransaction();
        setMyAccountTransaction(transaction);
      } catch (err) {
        setError(err);
      }
    }
    setOpen(true);
  };

  const handleChange = (e, v) => {
    setValue(v);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    handleFinishTransaction();
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
    <Modal open={open} onClose={handleFinishTransaction}>
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
            label={inputLabel} 
            value={value} 
            onChange={handleChange} 
          />
        </Form.Main>
        <Form.Actions>
          <Button variant="clear" onClick={handleCancel}>Cancel</Button>
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
