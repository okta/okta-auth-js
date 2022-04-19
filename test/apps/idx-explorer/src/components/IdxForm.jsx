import { Header, Form, Checkbox, Button } from 'semantic-ui-react';
import { useIdx } from '../IdxContext';

const toUIOptions = opts => opts.map(opt => ({key: opt.value, text: opt.label, value: opt.value}));

const renderInput = (input, options=[]) => {
  const { type, label, name, key } = input;
  let content = null;

  if (type === 'boolean') {
    content = (<Checkbox label={label} />);
  }
  else if (!type && options.length > 0 && key) {
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
    return (
      <div>
        <Header size='small'>No Remediation Selected</Header>
      </div>
    );
  }

  return (
    <div>
      <Header size='small' dividing>{step.name}</Header>
      <Form onSubmit={handleSubmit}>
        {step && step.inputs.map((input) => renderInput(input, step.options))}
        <Button type='submit'>Submit</Button>
      </Form>
    </div>
  );
}