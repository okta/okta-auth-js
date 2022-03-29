import React, { useState } from 'react';
import { 
  Box,
  Form,
  Heading,
  Button,
  Infobox,
  Text
} from '@okta/odyssey-react';
import { useMyAccountContext } from '../../contexts';

const ConfirmationForm = ({
  action,
  factor,
  onStart,
  onFinish
}) => {
  const [error, setError] = useState(null);
  const { startReAuthentication } = useMyAccountContext();

  const handleCancel = (e) => {
    e.preventDefault();
    onFinish();
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      await onStart();
      onFinish();
    } catch (err) {
      if (err.errorSummary === 'insufficient_authentication_context') {
        onFinish();
        startReAuthentication(err);
      } else {
        setError(err);
      }
    }
  };

  return (
    <Form>
      {!!error && (
        <Box id={`${action}-${factor}-messages-container`} paddingTop="m" paddingBottom="m">
          {error && (
            <Infobox
              variant="danger"
              content={error.errorCauses?.map(({ errorSummary }) =>
                <Text key={errorSummary}>{errorSummary}</Text>)}
            />)}
        </Box>
      )}
      <Heading level="1" visualLevel="4">
        Are you sure you want to {action} this {factor}?
      </Heading>
      <Form.Actions>
        <Button variant="clear" name="cancel" onClick={handleCancel}>
          Cancel
        </Button>
        <Button name="remove" variant="danger" onClick={handleConfirm}>
          Remove
        </Button>
      </Form.Actions>
    </Form>
  );
}

export default ConfirmationForm;
