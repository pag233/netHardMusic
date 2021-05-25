import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { setupServer } from 'msw/node';
import { bannerResultHandler, bannerImageResultHandler } from './mockHandlers';

import Banner from '../components/common/banner';
import userEvent from '@testing-library/user-event';

const handlers = [bannerResultHandler, bannerImageResultHandler];
const server = setupServer(...handlers);

beforeAll(() => server.listen({
  onUnhandledRequest: 'warn',
}));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  render(
    <Banner />
  );
});

it('should switch next banner when click right button', async () => {
  const rightBtn = await screen.findByTestId('banner-right');
  userEvent.click(rightBtn);
  const banners = await screen.findAllByTestId('banner-testid');
  expect(banners[1]).toHaveClass('front');
});

it('should switch last banner when click left button', async () => {
  const leftBtn = await screen.findByTestId('banner-left');
  userEvent.click(leftBtn);
  const banners = await screen.findAllByTestId('banner-testid');
  expect(banners[banners.length - 1]).toHaveClass('front');
});

it('should switch to next banner after amount of time', async () => {
  jest.useFakeTimers();
  const banners = await screen.findAllByTestId('banner-testid');
  act(() => jest.advanceTimersByTime(5000));
  expect(banners[1]).toHaveClass('front');
});