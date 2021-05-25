import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';


import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { SonglistComment } from '../components/common/comment';

import { songlistCommentHandler, topicHandler } from './mockHandlers';
import { renderWithStateAndRouter, backendAddress } from './helper';


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    songlist_id: '5fee98707277083e5041912c',
  }),
}));

const handlers = [
  songlistCommentHandler, topicHandler
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({
  onUnhandledRequest: 'warn',
}));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const render = (overwriteHandler) => {
  renderWithStateAndRouter(
    <>
      <div id="main-body"></div>
      <SonglistComment />
    </>,
    {
      mockServer: server
      , overwriteHandler
    }
  );
};

describe('with comments response', () => {
  it('should make a fetch to get comments', async () => {
    render();
    expect(await screen.findByText('最新评论')).toBeVisible();
    expect(await screen.findAllByTestId("test-comment-line")).toHaveLength(3);
  });
});

describe('with empty comment response', () => {
  it('should display "还没有评论，快来抢沙发~" when there were no comment yet.', async () => {
    render(rest.get(backendAddress + '/songlist/comment', (req, res, ctx) => {
      return res(
        ctx.json(
          {
            comments: [], "featuredComments": [], "status": "done", "total": 0
          }
        )
      );
    }));
    expect(await screen.findByText('还没有评论，快来抢沙发~')).toBeVisible();
  });
});
