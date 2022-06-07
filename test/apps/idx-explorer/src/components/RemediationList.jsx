import IdxForm from './IdxForm';
import { List, Divider, Placeholder } from 'semantic-ui-react';
import { useIdx } from '../IdxContext';

export default function RemediationList () {
  const { currentTransaction: curr, proceedWithRem, step } = useIdx();

  const handleRemediation = (remediation) => {
    proceedWithRem(remediation);
  };

  if (!curr) {
    return (
      <div>
        <Placeholder>
          <Placeholder.Line length='medium' />
          <Placeholder.Line length='medium' />
          <Placeholder.Line length='medium' />
          <Placeholder.Line length='medium' />
          <Placeholder.Line length='medium' />
          <Placeholder.Line length='medium' />
        </Placeholder>
      </div>
    );
  }

  return (
    <div>
      <List selection>
        {(curr?.availableSteps || []).map(rem => (
          <List.Item key={rem.name} active={!!step && step.name === rem.name} onClick={()=>handleRemediation(rem)}>
            <List.Content>
              <List.Header>{rem.name}</List.Header>
            </List.Content>
          </List.Item>
        ))}
      </List>
      {step && (
        <>
          <Divider section />
          <IdxForm />
        </>
      )}
    </div>
  );
}