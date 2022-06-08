import { Form, Checkbox, Button, Segment } from 'semantic-ui-react';
import { useIdx } from '../IdxContext';
import { formToObject } from '../util';

const CHECKBOXES = [
  'useGenericRemediator',
  'autoRemediate',
  'shouldProceedWithEmailAuthenticator'
];

// Form to allow manipulations of params passed to idx.<method>() calls
export default function ParamsForm () {
  const { idxParams, setIdxParams } = useIdx();

  const handleSubmit = (e) => {
    const data = formToObject(e.currentTarget);
    CHECKBOXES.forEach(c => {
      if (c in data) data[c] = true;
    });
    setIdxParams(data);
  };

  // TODO:
  const handleClear = () => {
    setIdxParams({});
  };

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        {CHECKBOXES.map(c => (
          <Form.Field key={c}>
            <Checkbox label={c} name={c} defaultChecked={idxParams[c]} />
          </Form.Field>
        ))}
        <Form.Field>
          <Form.Input label='activationToken' name='activationToken' />
        </Form.Field>
        <Form.Field>
          <Form.Input label='recoveryToken' name='recoveryToken' />
        </Form.Field>
        <Segment basic textAlign='center' style={{padding: 0}}>
          {/* <Button type='button' basic onClick={handleClear}>Clear</Button> */}
          <Button type='submit'>Save</Button>
        </Segment>
      </Form>
    </div>
  );
};
