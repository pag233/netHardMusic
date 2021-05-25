import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { Button } from '../components/common/buttons';

const btnTypes = ["normal", "round", "confirm", "save", "circle"];

it.each(btnTypes)("could render buttons correctly with type %p",
  (type) => {
    const mockFn = jest.fn();
    const btnClass = "test";
    render(<Button role="button" className={btnClass} type={type} onClick={() => mockFn()}>按钮</Button>);
    // const btn = screen.getByText('按钮');
    const btn = screen.getByRole('button', {
      name: "按钮"
    });
    userEvent.click(btn);

    expect(btn.className.includes(`${type}-btn`));
    expect(btn.className.includes(btnClass));
    expect(mockFn).toBeCalledTimes(1);
  }
);