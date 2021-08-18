import { useEffect, useState } from 'react';
import { OktaAuth, IdxStatus } from '@okta/okta-auth-js';
import oidcConfig from './config';

const oktaAuth = new OktaAuth(oidcConfig);

const formMetaMapper = ({ name, inputs, options }) => ({
  name,
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
  }
});

function App() {
  const [transaction, setTransaction] = useState(null);
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    (async () => {
      const newTransaction = await oktaAuth.idx.authenticate();
      setTransaction(newTransaction);
    })();
  }, []);

  const handleChange = ({ target: { name, value } }) => setInputValues({
    ...inputValues,
    [name]: value
  });

  const handleSubmit = async e => {
    e.preventDefault();
    
    // reset states
    setInputValues({});
    setTransaction(null);

    const newTransaction = await oktaAuth.idx.authenticate(inputValues);
    setTransaction(newTransaction);
  };

  if (!transaction) {
    return <div>loading...</div>;
  }

  const { status, tokens, nextStep } = transaction;
  
  if (status === IdxStatus.SUCCESS) {
    return (
      <>
        <h3>ID Token</h3>
        <pre>{JSON.stringify(tokens.idToken, undefined, 2)}</pre>
      </>
    );
  }

  const { name, inputs, select } = formMetaMapper(nextStep);
  return (
    <form onSubmit={handleSubmit}>
      <h3>{name}</h3>
      {inputs && inputs.map(({ label, name, type, required }) => (
        <>
          <label>{label}&nbsp;
            <input name={name} type={type} required={required} onChange={handleChange} />
          </label>
          <br/>
        </>
      ))}
      {select && (
        <select name={select.name} onChange={handleChange}>
          <option value="">---</option>
          {select.options.map(({ label, value }) => (
            <option key={value}  value={value}>{label}</option>
          ))}
        </select>
      )}
      <button type="submit">Submit</button>
    </form>
  );
}

export default App;
