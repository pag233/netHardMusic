import { useCallback } from 'react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

import LocalStorageWrapper from '../localStorageWrapper';
const rootkey = process.env.REACT_APP_LOCALSTORAGEROOTKEY;
const lsw = LocalStorageWrapper.instance(rootkey);
export const turnOffShowPlayAllWarning = createAsyncThunk('ui/showPlayAllWarning', () => {
    lsw.put('displayPlayAllWarning', false);
});

const slice = createSlice({
    name: 'ui',
    initialState: {
        //当前弹窗唯一
        currentPopup: "",
        displayPlayAllWarning: lsw.pick('displayPlayAllWarning') || true,
        showLoginPopup: false,
        sideDocker: {
            show: false,
            children: undefined,
            session: {
                avatarURL: undefined,
                userId: undefined,
                username: undefined,
            },
            newMessages: {
                privateMessage: 0,
                comment: 0,
                at: 0,
                notice: 0,
            }
        },
        contextMenu: {
            position: {
                top: 0,
                left: 0
            },
            songlist_id: undefined,
            //用于判断是否为当前用户创建的歌单，favable为true意味着不是当前用户创建的
            favable: true,
            track: undefined
        },
        infoMessager: {
            show: false,
            //loading为false时，通知组件在若干秒延迟后自动设置show为false,详见/components/sidebar/SonglistLoadingMessager
            loading: true,
            fadeOutDelay: 2000,
            content: {
                message: "",
                // status = 'done'|| 'error'
                status: undefined
            }
        },
        songlistDetailNavType: "songlist"
    },
    reducers: {
        setPopup(state, action) {
            state.currentPopup = action.payload.currentPopup;
        },
        setSideDocker(state, action) {
            state.sideDocker = { ...state.sideDocker, ...action.payload };
        },
        resetSideDockerSession(state) {
            state.sideDocker.session.userId = state.sideDocker.session.username = undefined;
        },
        setSession(state, action) {
            state.sideDocker.session = {
                ...state.sideDocker.session,
                ...action.payload.session
            };
        },
        setNewMessages(state, action) {
            state.sideDocker.newMessages = {
                ...state.sideDocker.newMessages,
                ...action.payload.newMessages
            };
        },
        resetNewMessages(state) {
            state.sideDocker.newMessages = {
                privateMessage: 0,
                comment: 0,
                at: 0,
                notice: 0,
            };
        },
        setMenuContext(state, action) {
            state.contextMenu = {
                ...state.contextMenu,
                ...action.payload
            };
        },
        setInfoMessager(state, action) {
            state.infoMessager = {
                ...state.infoMessager,
                ...action.payload
            };
        },
        setSonglistDetailNavType(state, action) {
            state.songlistDetailNavType = action.payload;
        },
        setshowLoginPopup(state, action) {
            state.showLoginPopup = action.payload;
        }
    },
    extraReducers: {
        [turnOffShowPlayAllWarning.fulfilled](state) {
            state.displayPlayAllWarning = false;
        }
    }
});

export default slice.reducer;
export const {
    resetNewMessages,
    resetSideDockerSession,
    setInfoMessager,
    setMenuContext,
    setNewMessages,
    setPopup,
    setSession,
    setshowLoginPopup,
    setSideDocker,
    setSonglistDetailNavType
} = slice.actions;
export const currentPopup = state => state.ui.currentPopup;

export function useShowPopup(id) {
    const popup = useSelector(currentPopup);
    const dispatch = useDispatch();

    const togglePopup = useCallback(() => {
        if (popup === id) {
            return dispatch(setPopup({ currentPopup: '' }));
        } else {
            return dispatch(setPopup({ currentPopup: id }));
        }
    }, [popup, dispatch, id]);

    const closePopup = useCallback(() => {
        return dispatch(setPopup({ currentPopup: '' }));
    }, [dispatch]);

    const openPopup = useCallback(() => {
        return dispatch(setPopup({ currentPopup: id }));
    }, [dispatch, id]);

    return { showPopup: popup === id, togglePopup, openPopup, closePopup };
}

export const sideDockerSelector = state => state.ui.sideDocker;
export const contextMenuSelector = state => state.ui.contextMenu;
export const infoMessagerSelector = state => state.ui.infoMessager;
export const newMessagesSelector = state => state.ui.sideDocker.newMessages;
export const songlistDetailNavTypeSelector = state => state.ui.songlistDetailNavType;