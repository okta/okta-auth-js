import { useTransaction } from '../TransactionContext';

export default function() {
  const { 
    transaction: { messages } 
  } = useTransaction();

  return (<div>{JSON.stringify(messages, null, 4)}</div>);
}
