import React, { useContext, useState } from 'react';
import OktaContext from './OktaContext';

const SelectAuthenticator = () => {
  const { transaction, handleTransaction, setError } = useContext(OktaContext);
  const [selectedFactor, setSelectedFactor] = useState({});

  const handleSelection = e => {
    const factor = transaction.factors.find(({ factorType }) => factorType === e.target.value) || {};
    setSelectedFactor(factor);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!selectedFactor?.id) {
      return;
    }
    // call verify method to select the MFA factor
    let newTransaction;
    try {
      newTransaction = await selectedFactor.verify();
      handleTransaction(newTransaction);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <form id="select-authenticator-form" onSubmit={handleSubmit}>
      <h2 id="select-authenticator-page-title-header">Select authenticator</h2>
      <select id="authenticator-options" value={selectedFactor.factorType} onChange={handleSelection}>
        <option value="">---</option>
        {transaction.factors?.map(({ id, factorType }) => 
          <option key={id} value={factorType}>{factorType}</option>)}
      </select><br/>
      <button type="submit">Select</button>
    </form>
  );
};

export default SelectAuthenticator;
