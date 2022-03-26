import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Infobox,
  Modal, 
  Form,
  Heading,
  TextInput,
  Text,
  Button
} from '@okta/odyssey-react';
import LinkButton from './LinkButton';
import { useTransaction } from '../TransactionContext';

const AddAttributeButton = ({ 
  heading, 
  initInputLabel,
  selectorHint,
  autoStartTransaction,
  onStartTransaction, 
  onFinishTransaction,
  children
}) => {
  const { myAccountTransaction, setMyAccountTransaction } = useTransaction();
  const [inputLabel, setInputLabel] = useState(initInputLabel);
  const [inputName, setInputName] = useState(selectorHint);
  const [headingText, setHeadingText] = useState(heading);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('Change this attribute will require additional verification');
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
      setHeadingText('Enter Code')
      setInputLabel('Verification Code');
      setInputName('verificationCode');
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
      setMessage('');
      setError(null);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
    {open && (
      <Modal id={`${selectorHint}-modal`} open={open} onClose={handleFinishTransaction}>
        <Box paddingBottom="s">
          <Form onSubmit={handleSubmit}>
            <Heading id="form-title" level="1" visualLevel="3">
              {headingText}
            </Heading>
            {!!(message || error) && (
              <Box id={`${selectorHint}-messages-container`}>
                {!!message && (
                  <Infobox
                    variant="caution" 
                    content={message}
                    />
                )}
                {error && (
                  <Infobox 
                    variant="danger" 
                    content={error.errorCauses?.map(({errorSummary}) => 
                      <Text key={errorSummary}>{errorSummary}</Text>)} 
                  />)}
              </Box>
            )}
            <Form.Main>
              <TextInput 
                type="text" 
                name={inputName}
                label={inputLabel} 
                value={value} 
                onChange={handleChange} 
              />
            </Form.Main>
            <Form.Actions>
              <Button variant="clear" name="cancel" onClick={handleCancel}>Cancel</Button>
              <Button type="submit">Continue</Button> 
            </Form.Actions>
          </Form>
        </Box>
      </Modal>
    )}
    
    <Box>
      <LinkButton name={selectorHint} onClick={handleButtonClick}>
        {children}
      </LinkButton>
    </Box>
    </>
  );
};

export default AddAttributeButton;
