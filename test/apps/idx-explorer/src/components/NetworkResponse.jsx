import { Placeholder } from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import { useIdx } from '../IdxContext';

export default function NetworkResponse () {
  const { currentTransaction: curr } = useIdx();

  if (!curr) {
    return (
      <div>
        <Placeholder>
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder>
      </div>
    );
  }

  return (
    <div>
      <ReactJson 
        src={curr?.rawIdxState} 
        collapsed={1}
        indentWidth={2}
        collapseStringsAfterLength={50}
        name={null}
      />
    </div>
  );
}