import { Grid, Menu, Header, Button, Loader, Dimmer, Container, List, Divider, Label, Segment } from 'semantic-ui-react';
import RemediationList from './RemediationList';
import NetworkResponse from './NetworkResponse';
import TransactionDisplay from './TransactionDisplay';

import { useIdx } from '../IdxContext';

function Navbar () {
  return (
    <Menu className='navbar' inverted fluid compact>
      <Menu.Item>
        <Header inverted size='medium'>IDX Explorer</Header>
      </Menu.Item>
    </Menu>
  );
}

function SidePanel () {
  const { start, transactions, currentTransaction: curr } = useIdx();

  return (
    <div className="side-panel">
      <div style={{flex: 1, display: 'flex'}}>
        <Menu vertical fluid borderless inverted>
          <Menu.Item>
            <Button color='green' onClick={() => start()}>
              Start New Transaction
            </Button>
            <Segment textAlign='center'>
              <Header size='tiny' floated='left'>Status:</Header>
              <Label>{curr?.status || 'NONE'}</Label>
            </Segment>
          </Menu.Item>
          <Menu.Item>
            <Divider />
          </Menu.Item>
          <Menu.Item>
            <Header size='small' inverted>Transactions</Header>
            <List bulleted inverted>
              {transactions.map(t => (
                  <List.Item key={t.name}>
                    <List.Content>
                      <List.Header>{t.name}</List.Header>
                    </List.Content>
                  </List.Item>
                )
              )}
            </List>
          </Menu.Item>
        </Menu>
      </div>
    </div>
  );
}

function MainPanel ({ loading }) {
  return (
    <Dimmer.Dimmable dimmed={loading} className="main-panel">
      <Dimmer active={loading} inverted>
        <Loader>Loading</Loader>
      </Dimmer>

      <Grid celled style={{height: '100%'}}>
        <Grid.Row>
          <Grid.Column width={3}>
            <RemediationList />
          </Grid.Column>
          <Grid.Column width={8}>
            <TransactionDisplay />
          </Grid.Column>
          <Grid.Column width={5}>
            <NetworkResponse />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
        <Grid.Column width={4}>
            Form
          </Grid.Column>
          <Grid.Column>
            JS
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Dimmer.Dimmable>
  );
}

export default function Layout ({ loading }) {
  return (
    <>
      <Navbar />
      <Container className="content" fluid>
        <SidePanel />
        <MainPanel loading={loading} />
      </Container>
    </>
  );
}