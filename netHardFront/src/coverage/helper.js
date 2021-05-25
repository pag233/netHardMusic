import React from 'react';
import store from '../components/common/reduxStore/store';

import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

export const backendAddress = "http://localhost:9630";

export const renderWithStateAndRouter = (
  ui,
  { path = '/', location = '/', mockServer, overwriteHandler } = {},
  renderOptions
) => {
  if (mockServer && overwriteHandler) {
    mockServer.use(overwriteHandler);
  }
  const history = createMemoryHistory();
  history.push(location);
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <Router history={history}>
        <Route path={path}>
          {children}
        </Route>
      </Router>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
