import { Header } from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import { useIdx } from '../IdxContext';

export default function NetworkResponse () {
  const { currentTransaction: curr } = useIdx();
  return (
    <div>
      <Header size='small'>Network Response</Header>
      {curr && (
        <ReactJson 
          src={curr?.rawIdxState} 
          collapsed={1}
          indentWidth={2}
          collapseStringsAfterLength={50}
          name={null}
        />
      )} 
    </div>
  );
}