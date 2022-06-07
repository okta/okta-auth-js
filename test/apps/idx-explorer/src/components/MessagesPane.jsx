import { Header, List } from 'semantic-ui-react';
import { useIdx } from '../IdxContext';

const MSG_MAP = {
  'ERROR': 'red',
  'INFO': 'teal'
};

function MessageBody (props) {
  let subheader = null;
  if (props?.i18n?.key) {
    subheader = (
      <Header.Subheader size='tiny' as={List.Description}>
        ({props?.i18n?.key})
      </Header.Subheader>
    );
  }
  
  return (
    <List.Content>
      <Header size='small' color={MSG_MAP[props?.class || 'INFO']}>
        {props.message}
        {!!subheader && subheader}
      </Header>
    </List.Content>
  )
}

export default function MessagesPane () {
  const { currentTransaction: curr } = useIdx();

  const messages = curr?.messages || curr?.context?.messages || [];
  if (messages.length < 1) {
    return null;
  }

  return (
    <div>
      <List ordered>
        {messages.map(m => (
          <List.Item key={m.message}>
            <MessageBody {...m} />
          </List.Item>
        ))}
      </List>
    </div>
  );
}
