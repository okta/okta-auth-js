import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { OktaAuth, IdxStatus } from '@okta/okta-auth-js';
import { formTransformer } from './formTransformer';
import oidcConfig from './config';
import './App.css';

const oktaAuth = new OktaAuth(oidcConfig);

export default function App() {
  const history = useHistory();
  const [transaction, setTransaction] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    const parseFromUrl = async () => {
      try {
        await oktaAuth.idx.handleInteractionCodeRedirect(window.location.href);
        history.push('/');
      } catch (err) {
        console.log(err);
      }
    };

    const updateAuthState = authState => {
      setAuthState(authState)
    };

    oktaAuth.authStateManager.subscribe(updateAuthState);
    oktaAuth.start();

    if(oktaAuth.isLoginRedirect()) {
      return parseFromUrl();
    }
    
    const handleEmailVerifyCallback = async () => {
      const { state, stateTokenExternalId } = await oktaAuth.parseEmailVerifyCallback(window.location.search);
      const newTransaction = await oktaAuth.idx.authenticate({ state, stateTokenExternalId });
      setTransaction(newTransaction);
    }

    if (oktaAuth.isEmailVerifyCallback(window.location.search)) {
      return handleEmailVerifyCallback();
    }

    const resumeTransaction = async () => {
      const newTransaction = await oktaAuth.idx.proceed();
      setTransaction(newTransaction);
    }

    if (oktaAuth.idx.canProceed()) {
      resumeTransaction();
    }

  }, [history, setAuthState, setTransaction]);

  const handleChange = ({ target: { name, value, checked } }) => setInputValues({
    ...inputValues,
    [name]: value || checked
  });

  const handleSubmit = async e => {
    e.preventDefault();

    const newTransaction = await oktaAuth.idx.proceed(inputValues);
    console.log('Transaction:', newTransaction);

    setInputValues({});
    if (newTransaction.status === IdxStatus.SUCCESS) {
      oktaAuth.tokenManager.setTokens(newTransaction.tokens);
    } else {
      setTransaction(newTransaction);
    }
  };

  const handleSkip = async () => {
    const newTransaction = await oktaAuth.idx.proceed({ skip: true });
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
    const newTransaction = flowMethod === 'idp' 
      ? await oktaAuth.idx.startTransaction() 
      : await oktaAuth.idx[flowMethod]();
    console.log('Transaction:', newTransaction);
    setTransaction(newTransaction);
  };

  if (!authState) {
    return null;
  }

  if (authState?.idToken) {
    return (
      <>
        <button onClick={handleLogoutOut}>Logout</button>
        <div>
          <h3>ID Token</h3>
          <pre>{JSON.stringify(authState.idToken, undefined, 2)}</pre>
        </div>
      </>
    );
  }

  const topNav = (
    <div>
      <button onClick={startIdxFlow('authenticate')}>Login</button>
      <button onClick={startIdxFlow('recoverPassword')}>Recover Password</button>
      <button onClick={startIdxFlow('register')}>Registration</button>
      <button onClick={startIdxFlow('idp')}>IDP</button>
    </div>
  );
  if (!transaction) {
    // initial page
    return topNav;
  }

  const { status, nextStep, error, messages, availableSteps, tokens } = transaction;
  if (tokens) {
    oktaAuth.tokenManager.setTokens(tokens);
    return null;
  }

  const idpMeta = availableSteps?.find(step => step.name === 'redirect-idp');
  if (idpMeta) {
    return (
      <div>
        <div>Type: {idpMeta.type}</div>
        <a href={idpMeta.href}>Login With Google</a>
      </div>
    )
  }

  if (status === IdxStatus.FAILURE) {
    return (<div>{JSON.stringify(error, null, 4)}</div>);
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

  const form = formTransformer(nextStep)({} /* initial form value */);
  const { name, canSkip } = nextStep;
  const { inputs, select, text, image } = form;
  const meta = oktaAuth.transactionManager.load();
  return (
    <div>
    {topNav}
    <strong>{meta?.flow || 'default'}</strong>
    <form onSubmit={handleSubmit}>
      <div className="messages">
        { messages && messages.map(message => (<div key={message.message}>{message.message}</div>)) }
      </div>
      <h3 className="title">{name}</h3>
      {text && <div>{text.value}</div>}
      {image && <img src={image.src} />}
      {select && (
        <>
        <label>{select.label}</label>
        <select name={select.name} onChange={handleChange}>
          <option key="" value="">---</option>
          {select.options.map(({ key, label, value }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        </>
      )}
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
      {canSkip && <button type="button" onClick={handleSkip}>Skip</button>}
      <button type="submit">Submit</button>
      <button type="button" onClick={handleCancel}>Cancel</button>
    </form>
    </div>
  );
}
