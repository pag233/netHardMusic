import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { sideDockerSelector, setSideDocker } from '../common/reduxStore/uiSlice';

import PlayList from './playlist';
import MessageList from './message';
import PrivateMessageSession from './privateMessageSession';
import './sidedocker.scss';

const ChildrenMap = {
    'playlist': <PlayList />,
    'message': <MessageList />,
    'session': <PrivateMessageSession />
};

export default function SideDocker() {
    const docker = useSelector(sideDockerSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        const closeDocker = e => {
            if (!e.isFromDocker) {
                dispatch(setSideDocker({
                    show: false
                }));
            }
        };
        document.addEventListener('mousedown', closeDocker);
        return () => {
            document.removeEventListener('mousedown', closeDocker);
        };
    }, [dispatch]);

    return (
        <div className="side-docker" id="side-docker"
            onMouseDown={e => {
                e.nativeEvent.isFromDocker = true;
            }}
        >
            {
                ChildrenMap[docker.children]
            }
        </div>
    );
}