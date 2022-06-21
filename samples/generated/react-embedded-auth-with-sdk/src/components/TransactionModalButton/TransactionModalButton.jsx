import { useState, useCallback } from 'react';
import { Box, Modal } from '@okta/odyssey-react';
import InputForm from './InputForm';
import ConfirmationForm from './ConfirmationForm';
import LinkButton from '../LinkButton';
import { camelize } from '../../util';

const TransactionModalButton = ({ 
  buttonText,
  action,
  factor,
  autoStart,
  onStart, 
  onFinish,
  ...formProps
}) => {
  const [open, setOpen] = useState(false);
  const [transactionName] = useState(() => {
    return camelize(`${action} ${factor}`);
  });

  const handleFinishTransaction = useCallback(() => {
    setOpen(false);
    onFinish();
  }, [setOpen, onFinish]);

  const handleClick = async () => {
    if (autoStart) {
      await onStart();
    }
    setOpen(true);
  };
  
  const Form = action === 'remove' ? ConfirmationForm : InputForm;
  return (
    <>
    {open && (
      <Modal 
        id={`${transactionName}-modal`} 
        open={open} 
        onClose={handleFinishTransaction}
      >
        <Box paddingBottom="s">
          <Form 
            action={action} 
            factor={factor} 
            onStart={onStart}
            onFinish={handleFinishTransaction} 
            {...formProps} 
          />
        </Box>
      </Modal>
    )}
    
    <Box>
      <LinkButton name={transactionName} onClick={handleClick}>
        {buttonText}
      </LinkButton>
    </Box>
    </>
  );
};

export default TransactionModalButton;
