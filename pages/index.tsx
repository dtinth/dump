import Head from 'next/head'
import { ClientSideGuard } from '../src/ClientSideGuard'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { HomePage } from '../src/HomePage'
import { IdeaPage } from '../src/IdeaPage'

export default function DumpApplication() {
  return (
    <div>
      <Head>
        <title>dump</title>
      </Head>
      <ClientSideGuard>
        <Router>
          <Switch>
            <Route exact path="/" render={() => <HomePage />} />
            <Route
              path="/idea/:id"
              render={({ match }) => <IdeaPage id={match.params.id} />}
            />
          </Switch>
        </Router>
      </ClientSideGuard>
    </div>
  )
}
