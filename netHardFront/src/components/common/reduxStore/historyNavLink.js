import React from 'react';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { incrIdx } from './historyStateSlice';
export default function HistoryNavLink(props) {
    const dispatch = useDispatch();
    const { onClick } = props;
    return (
        <NavLink {...props} onClick={() => {
            dispatch(incrIdx());
            typeof onClick === 'function' && onClick();
        }}>
            {
                props.children
            }
        </NavLink>
    );
}