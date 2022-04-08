import React from 'react';

export const Transaction = React.createContext({});
export const useTransaction = () => React.useContext(Transaction);
