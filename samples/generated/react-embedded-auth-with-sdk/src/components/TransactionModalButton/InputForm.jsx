import React, { useCallback, useEffect, useState } from 'react';
import {
  Form,
  Box,
  Infobox,
  Heading,
  TextInput,
  Text,
  Button
} from '@okta/odyssey-react';
import { useMyAccountContext } from '../../contexts';
import { capitalizeFirstLetter, camelize } from '../../util';

const InputForm = ({
  action,
  factor,
  initialInputLabel,
  challengePayload,
  onStart,
  onVerify,
  onFinish
}) => {
  const { 
    transaction, 
    setTransaction, 
    challenge, 
    setChallenge,
    startReAuthentication
  } = useMyAccountContext();

  const [inputLabel, setInputLabel] = useState(() => {
    return initialInputLabel || `${capitalizeFirstLetter(factor)}`;
  });
  const [inputName, setInputName] = useState(() => {
    return camelize(factor);
  });
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);

  const handleFinishTransaction = useCallback(() => {
    setValue('');
    setTransaction(null);
    setChallenge(null);
    setError(null);
    onFinish();
  }, [setValue, setTransaction, setChallenge, setError, onFinish]);

  useEffect(() => {
    if (transaction?.status === 'VERIFIED') {
      handleFinishTransaction();
    }
    if (transaction?.status === 'UNVERIFIED') {
      setInputLabel('Verification Code');
      setInputName('verificationCode');
    }
  }, [transaction, handleFinishTransaction]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      if (!transaction) {
        const tx = await onStart(value);
        setTransaction(tx);
      } else if (transaction.status === 'UNVERIFIED') {
        if (transaction.verify) {
          await transaction.verify({ verificationCode: value });
        } else if (challenge?.verify) {
          await challenge.verify({ verificationCode: value });
        } else if (onVerify) {
          await onVerify(value, transaction.id, challenge.id);
        } else {
          throw new Error('Unable to verify the challenge.');
        }
        
        // success verification will lead to the end state
        handleFinishTransaction();
      }
    } catch (err) {
      if (err.errorSummary === 'insufficient_authentication_context') {
        onFinish();
        startReAuthentication(err);
      } else {
        setError(err);
      }
    }

    setValue('');
  }, [
    value,
    onStart, 
    onVerify,
    onFinish, 
    transaction, 
    setTransaction, 
    challenge,
    handleFinishTransaction, 
    setError,
    startReAuthentication,
  ]);

  const handleInputChange = (e, v) => {
    setValue(v);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    handleFinishTransaction();
  };

  const handleResend = async (e) => {
    e.preventDefault();
    const tx = await transaction.challenge(challengePayload);
    setChallenge(tx);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Heading id="form-title" level="1" visualLevel="3">
        {`${capitalizeFirstLetter(action)} ${capitalizeFirstLetter(factor)}`}
      </Heading>
      {!!error && (
        <Box id={`${camelize(action + ' ' + factor)}-messages-container`} paddingTop="m" paddingBottom="m">
          {error && (
            <Infobox
              variant="danger"
              content={error.errorCauses?.map(({ errorSummary }) =>
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
          autoComplete="off"
          onChange={handleInputChange}
        />
        {!!transaction?.challenge && (
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="flex-end"
            alignItems="center"
            padding="s"
          >
            <Text>Not receive the code?</Text>
            <Button variant="clear" name="resend" onClick={handleResend}>
              Resend
            </Button>
          </Box>
        )}
      </Form.Main>
      <Form.Actions>
        <Button variant="clear" name="cancel" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Continue
        </Button>
      </Form.Actions>
    </Form>
  );

};

export default InputForm;
