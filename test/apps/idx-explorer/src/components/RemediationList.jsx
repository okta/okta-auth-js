import { Header, List, Divider, Button } from 'semantic-ui-react';
import { useIdx } from '../IdxContext';

export default function RemediationList () {
  const { currentTransaction: curr, proceedWithAction, proceedWithRem } = useIdx();

  const handleAction = (key) => {
    proceedWithAction(key);
  };

  const handleRemediation = (name) => {
    proceedWithRem(name);
  };

  const renderRemediationList = () => (
    <List>
      {(curr.availableSteps || []).map(rem => (
        <List.Item key={rem.name}>
          <List.Content floated='right'>
            <Button size='mini' onClick={() => handleRemediation(rem.name)}>Proceed</Button>
          </List.Content>
          <List.Content>
            <List.Header>{rem.name}</List.Header>
          </List.Content>
        </List.Item>
      ))}
    </List>
  );

  const renderActionList = () => (
    <List>
      {Object.keys(curr.actions).map(key => (
        <List.Item key={key}>
          <List.Content floated='right'>
            <Button size='mini' onClick={() => handleAction(key)}>Proceed</Button>
          </List.Content>
          <List.Content>
            <List.Header>{key}</List.Header>
          </List.Content>
        </List.Item>
      ))}
    </List>
  );

  return (
    <div>
      <Header size='small'>Remediations</Header>
      {curr && renderRemediationList()}
      <Divider section />
      <Header size='small'>Actions</Header>
      {curr && renderActionList()}
    </div>
  );
}