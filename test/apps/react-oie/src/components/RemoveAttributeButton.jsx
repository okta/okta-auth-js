import React, { useState } from 'react';
import { Modal, Heading, Box, Button, Text } from '@okta/odyssey-react';
import LinkButton from './LinkButton';

const RemoveButton = ({ 
  selectorHint,
  heading, 
  description,
  onStartTransaction, 
  onFinishTransaction,
  children
}) => {
  const [open, setOpen] = useState(false);

  const handleButtonClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    await onStartTransaction();
    onFinishTransaction();
    setOpen(false);
  };
  
  return (
    <>
    <Modal id={`${selectorHint}-modal`} open={open} onClose={handleClose}>
      <Box display="flex" flexDirection="column" padding="m">
        <Heading>{heading}</Heading>
        <Text as="p">{description}</Text>
        <Box display="flex" justifyContent="flex-end">
          <Button name="cancel" variant="clear" onClick={handleClose}>Cancel</Button>
          <Button name="remove" variant="danger" onClick={handleConfirm}>Remove</Button>
        </Box>
      </Box>
    </Modal>
    <LinkButton name={selectorHint} onClick={handleButtonClick}>{children}</LinkButton>
    </>
  );
};

export default RemoveButton;