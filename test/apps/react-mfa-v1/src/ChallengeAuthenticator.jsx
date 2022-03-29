import React, { useContext, useState } from 'react';
import OktaContext from './OktaContext';

const components = {
  question: transaction => (
    <>
      <h3 id="page-title-header">Challenge Security Question</h3>
      <p>Question: {transaction.factor?.profile.questionText}</p>
    </>
  ),
  email: () => (<h3 id="page-title-header">Enter Code</h3>)
};

const ChallengeAuthenticator = () => {
  const { transaction, handleTransaction, setError } = useContext(OktaContext);
  const [answer, setAnswer] = useState('');

  const handleAnwserChange = e => setAnswer(e.target.value);

  const handleSubmit = async e => {
    e.preventDefault();

    let newTransaction;
    try {
      newTransaction = await transaction.verify({ answer });
      handleTransaction(newTransaction);
    } catch (error) {
      setError(error);
      setAnswer('');
    }
  };

  return (
    <form id="challenge-authenticator-form" onSubmit={handleSubmit}>
      {transaction.factor && React.createElement(components[transaction.factor.factorType], transaction)}
      <label htmlFor="answer">Answer:</label><br/>
      <input type="text" name="answer" value={answer} onChange={handleAnwserChange} /><br/>
      <button type="submit">Verify</button>
    </form>
  );
};

export default ChallengeAuthenticator;
