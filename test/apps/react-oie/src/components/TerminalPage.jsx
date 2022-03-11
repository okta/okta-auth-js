import { useTransaction } from '../TransactionContext';

export default function TerminalPage() {
  const { 
    transaction: { messages } 
  } = useTransaction();

  return (<div>{JSON.stringify(messages, null, 4)}</div>);
}
