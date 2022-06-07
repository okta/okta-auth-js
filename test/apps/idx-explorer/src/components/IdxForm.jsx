import { Header, Form, Checkbox, Button, Segment } from 'semantic-ui-react';
import { useIdx } from '../IdxContext';
import { capitalize } from '../util';

const toUIOptions = opts => opts.map(opt => ({key: opt.value, text: opt.label, value: opt.value}));

const renderInput = (input) => {
  const { type, name, options } = input;
  let label = input?.label || capitalize(input.name);
  let content = null;

  if (type === 'boolean') {
    content = (<Checkbox label={label} />);
  }
  else if (!!options && options.length > 0) {
    content = (
      <Form.Select fluid label={label} options={toUIOptions(options)} />
    );
  }
  else {
    const contentProps = {};
    if (type) {
      contentProps.type = type;
    }
    content = (<Form.Input label={label} name={name} {...contentProps} />);
  }

  // text input
  return (
    <Form.Field key={name}>
      {content}
    </Form.Field>
  );
};

const validateForm = (form, inputs) => {
  return true;
};

export default function IdxForm () {
  const { step, submitForm } = useIdx();

  console.log(step);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    const formData = new FormData(e.currentTarget);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    console.log(data);
    if (validateForm(data, step.inputs)) {
      submitForm(data);
    }
  };

  if (!step) {
    // return (
    //   <div>
    //     <Header size='small'>No Remediation Selected</Header>
    //   </div>
    // );
    return;
  }

  return (
    <div>
      <Header size='small' dividing>Form: `{step.name}`</Header>
      <Form as={Form} onSubmit={handleSubmit}>
        <Segment secondary padded>
          {step && step.inputs.map(renderInput)}
        </Segment>
        <Segment basic textAlign='center' style={{padding: 0}}>
          <Button type='submit'>Proceed</Button>
        </Segment>
      </Form>
    </div>
  );
}