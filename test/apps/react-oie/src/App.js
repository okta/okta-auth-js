import { useState } from 'react';
import { OktaAuth, IdxStatus } from '@okta/okta-auth-js';
import oidcConfig from './config';
import './App.css';

const oktaAuth = new OktaAuth(oidcConfig);

const formMetaMapper = (nextStep) => {
  const { inputs, options } = nextStep;
  return {
    ...nextStep,
    inputs: !options && inputs.map(({ label, name, type, secret, required }) => {
      if (secret) {
        type = 'password';
      } else if (type === 'string') {
        type = 'text';
      }
      return { label, name, type, required };
    }),
    select: options && {
      name: inputs[0].name,
      options
    },
  };
};

export default function App() {
  const [transaction, setTransaction] = useState(null);
  const [flowMethod, setFlowMethod] = useState('');
  const [inputValues, setInputValues] = useState({});

  const handleChange = ({ target: { name, value } }) => setInputValues({
    ...inputValues,
    [name]: value
  });

  const handleSubmit = async e => {
    e.preventDefault();

    const newTransaction = await oktaAuth.idx[flowMethod](inputValues);
    console.log('Transaction:', newTransaction);
    // reset inputs and set new transaction
    setInputValues({});
    setTransaction(newTransaction);
  };

  const handleSkip = async () => {
    const newTransaction = await oktaAuth.idx[flowMethod]({ skip: true });
    setTransaction(newTransaction);
  };

  const handleCancel = async () => {
    const newTransaction = await oktaAuth.idx.cancel();
    setTransaction(newTransaction);
  };

  const handleLogoutOut = async () => {
    await oktaAuth.signOut();
  };

  const startIdxFlow = flowMethod => async () => {
    const newTransaction = await oktaAuth.idx[flowMethod]();
    setFlowMethod(flowMethod);
    setTransaction(newTransaction);
  };

  if (!transaction) {
    // initla page
    return (
      <div>
        <button onClick={startIdxFlow('authenticate')}>Login</button>
        <button onClick={startIdxFlow('recoverPassword')}>Recover Password</button>
        <button onClick={startIdxFlow('register')}>Registration</button>
      </div>
    );
  }

  const { status, tokens, nextStep, error, messages } = transaction;
  
  if (status === IdxStatus.SUCCESS) {
    return (
      <>
        <button onClick={handleLogoutOut}>Logout</button>
        <div>
          <h3>ID Token</h3>
          <pre>{JSON.stringify(tokens.idToken, undefined, 2)}</pre>
        </div>
      </>
    );
  }

  if (status === IdxStatus.FAILURE) {
    return (<div>{error.errorSummary}</div>);
  }

  if (status === IdxStatus.TERMINAL) {
    return (<div>{JSON.stringify(messages, null, 4)}</div>);
  }

  if (status === IdxStatus.CANCELED) {
    return (
      <>
        <div>Transaction has been canceled!</div>
        <button onClick={() => setTransaction(null)}>Restart</button>
      </>
    );
  }

  const { name, inputs, select, contextualData, canSkip } = formMetaMapper(nextStep);
  return (
    <form onSubmit={handleSubmit}>
      <div className="messages">
        { messages && messages.map(message => (<div key={message.message}>{message.message}</div>)) }
      </div>
      <h3 className="title">{name}</h3>
      {inputs && inputs.map(({ label, name, type, required }) => (
        <label key={name}>{label}&nbsp;
          <input 
            name={name} 
            type={type} 
            value={inputValues[name] || ''} 
            required={required} 
            onChange={handleChange} 
          />
          <br/>
        </label>
      ))}
      {select && (
        <select name={select.name} onChange={handleChange}>
          <option value="">---</option>
          {select.options.map(({ label, value }) => (
            <option key={value}  value={value}>{label}</option>
          ))}
        </select>
      )}
      {contextualData && (
        <div>
          <img src={contextualData.qrcode.href} />
          <div>{contextualData.sharedSecret}</div>
        </div>
      )}
      {canSkip && <button type="button" onClick={handleSkip}>Skip</button>}
      <button type="submit">Submit</button>
      <button type="button" onClick={handleCancel}>Cancel</button>
    </form>
  );
}
