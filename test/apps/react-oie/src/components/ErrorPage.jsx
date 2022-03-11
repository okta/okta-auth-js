import { useTransaction } from '../TransactionContext';

export default function ErroPage() {
  const { 
    transaction: { error } 
  } = useTransaction();

  return (<div>{error.message || JSON.stringify(error, null, 4)}</div>);
}
