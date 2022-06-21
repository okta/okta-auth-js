import React from 'react';

export const IdxTransaction = React.createContext({});
export const useIdxTransaction = () => React.useContext(IdxTransaction);

export const MyAccountContext = React.createContext({});
export const useMyAccountContext = () => React.useContext(MyAccountContext);
