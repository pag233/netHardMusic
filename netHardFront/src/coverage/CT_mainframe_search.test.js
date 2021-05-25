import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { setupServer } from 'msw/node';

import { searchResultHandler, searchEmptyResultHandler } from './mockHandlers';
import { renderWithStateAndRouter } from './helper';

import Result from '../components/mainframe/search/pages/search';

const handlers = [searchResultHandler];

const server = setupServer(...handlers);

beforeAll(() => server.listen({
  onUnhandledRequest: 'warn',
}));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const path = '/search/result/:path/:query';
const location = '/search/result/song/fakename';

const render = (overwriteHandler) => {
  renderWithStateAndRouter(
    <Result />,
    {
      path,
      location,
      mockServer: server,
      overwriteHandler
    }
  );
};

it('should display search results content', async () => {
  render();
  expect(await screen.findByText('fakename'));
});

it('should display 很抱歉，未能找到与“<query>”相关的任何内容', async () => {
  render(searchEmptyResultHandler);
  expect(await screen.findByText('很抱歉', { exact: false }));
});