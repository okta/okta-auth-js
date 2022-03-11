import { useState } from 'react';
import { Box, Button, TextInput, Modal, Heading } from '@okta/odyssey-react';
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
  const { myAccountTransaction } = useTransaction();
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleButtonClick = async () => {
    if (onClick) {
      await onClick();
    }
    setAdding(true);
  };

  const handleChange = (e, v) => {
    setValue(v);
  };

  const handleVerificationCodeChange = (e, v) => {
    setVerificationCode(v);
  };

  const handleStartTransaction = async () => {
    if (onStartTransaction) {
      await onStartTransaction(value);
    }
  };

  const handleFinishTransaction = async () => {
    await onFinishTransaction();
    setAdding(false);
    setValue('');
    setVerificationCode('');
  };

  const handleVerification = async () => {
    await myAccountTransaction.verify({ data: { verificationCode } });
    await handleFinishTransaction();
  };

  const handleCancel = async () => {
    await onFinishTransaction();
    await handleFinishTransaction();
  };

  return (
    <>
    <Modal open={adding} onClose={handleCancel}>
      <Box display="flex" flexDirection="column" padding="m">
        {!myAccountTransaction && (
          <>
          <Heading level="1" visualLevel="4">{heading}</Heading>
          <TextInput label={inputLabel} type="text" value={value} onChange={handleChange} />
          <Box display="flex" justifyContent="flex-end">
            <Button variant="clear" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleStartTransaction}>Continue</Button> 
          </Box>
          </>
        )}
        {myAccountTransaction?.status === 'UNVERIFIED' && (
          <>
          <Heading level="1" visualLevel="4">{heading}</Heading>
          <TextInput 
            type="text" 
            label="Verification Code" 
            name="verificationCode" 
            autoComplete="off"
            value={verificationCode} 
            onChange={handleVerificationCodeChange} 
          />
          <Box display="flex" justifyContent="flex-end">
            <Button variant="clear" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleVerification}>Verify</Button> 
          </Box>
          </>
        )}
      </Box>
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
