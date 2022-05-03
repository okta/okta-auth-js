import { Header, List, Divider, Button } from 'semantic-ui-react';
import { useIdx } from '../IdxContext';

export default function MessagesPane () {
  const { currentTransaction: curr } = useIdx();

  const messages = curr?.messages || curr?.context?.messages || [];

  if (messages.length < 1) {
    return null;
  }

  return (
    <div>
      <List>
      {messages.map(m => (
        <List.Item key={m.name}>
          m
        </List.Item>
      ))}
      </List>
    </div>
  );
}