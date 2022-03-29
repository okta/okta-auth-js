import { useIdxTransaction } from '../contexts';

export default function TerminalPage() {
  const { transaction } = useIdxTransaction();
  const messages = transaction ? transaction.messages : 'Transaction could not be loaded';
  return (
    <>
      <div>{JSON.stringify(messages, null, 4)}</div>
      <a href="/">Back to Signin</a>
    </>
  );
}
