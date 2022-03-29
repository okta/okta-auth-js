import { useIdxTransaction } from '../contexts';

export default function ErroPage() {
  const { 
    transaction: { error } 
  } = useIdxTransaction();

  return (<div>{error.message || JSON.stringify(error, null, 4)}</div>);
}
