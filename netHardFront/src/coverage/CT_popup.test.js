import React, { useRef, useState } from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';


import { AnchorPopup } from '../components/common/popup';
import userEvent from '@testing-library/user-event';

const SimpleComponment = () => {
  const parentRef = useRef();
  const [show, setShow] = useState();
  return (
    <>
      <div id="anchor-block" onClick={() => setShow(true)} ref={parentRef}>
        parent
      {
          show &&
          <AnchorPopup anchorRef={parentRef} parentRef={parentRef} closePopup={() => setShow(false)}>
            <div>children</div>
          </AnchorPopup>
        }
      </div>
      <div>uncle</div>
    </>
  );
};

beforeEach(() => {
  render(
    <SimpleComponment />
  );
});

it('should open popup when click parent componment and close popup when click uncle element componment', async () => {
  expect(screen.queryByText('children')).toBeNull();
  const parent = await screen.findByText('parent');
  userEvent.click(parent);
  expect(await screen.findByText('children')).toBeVisible();

  const uncle = await screen.findByText('uncle');
  userEvent.click(uncle);
  expect(screen.queryByText('children')).toBeNull();
});

it('should not open popup when click uncle element and not close popup when click parnent or self element', async () => {
  const uncle = await screen.findByText('uncle');
  userEvent.click(uncle);
  expect(screen.queryByText('children')).toBeNull();

  const parent = await screen.findByText('parent');
  userEvent.click(parent);
  expect(await screen.findByText('children')).toBeVisible();
  userEvent.click(parent);
  expect(await screen.findByText('children')).toBeVisible();
});