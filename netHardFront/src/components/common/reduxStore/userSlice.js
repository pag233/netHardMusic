import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { fetchJSONData, fetchDataWithToken, fetchData } from '../fetch';
import { parseJwt, parseImageAsDataURL, BackEnd } from '../utils';
import { resetComment } from './commentSlice';
import { resetPlaylist } from './playlistSlice';
import { resetSonglists, replaceFavTracks } from './songlistsSlice';
import LocalStorageWrapper from '../localStorageWrapper';

const rootkey = process.env.REACT_APP_LOCALSTORAGEROOTKEY;
const offlineRootkey = process.env.REACT_APP_OFFINEROOTKEY;
const lsw = LocalStorageWrapper.instance(rootkey);
const lswOffline = LocalStorageWrapper.instance(offlineRootkey);
/**
 * 注册
 * @param {string} body.email -用户email
 * @param {string} body.username -用户username
 * @param {string} body.password -用户password
 */
export const addUser = createAsyncThunk('user/addUser', async body => {
    return await fetchJSONData(BackEnd.address + '/user', 'POST', { body }).then(async res => {
        const jsonResonse = await res.json();
        if (jsonResonse.error) {
            throw new Error(jsonResonse.error);
        } else if (jsonResonse.status === 'done') {
            return jsonResonse;
        } else {
            throw new Error('未知错误');
        }
    });
});
/**
 * 登录
 * @param {string} body.email -用户email
 * @param {string} body.password -用户password
 */
export const login = createAsyncThunk('user/login', async body => {
    return await fetchJSONData(BackEnd.address + '/auth', 'POST', { body }).then(async res => {
        const jsonResponse = await res.json();
        if (jsonResponse.status === 'done') {
            const token = res.headers.get('x-auth-token');
            const { username, _id } = parseJwt(token);
            const avatarURL = jsonResponse.avatarURL;
            const avatarDataURL = avatarURL && await parseImageAsDataURL(BackEnd.address + avatarURL);
            lsw.bulk({ userId: _id, token, isLogin: true, username, avatarDataURL });
            return { userId: _id, username, avatarDataURL };
        } else {
            throw new Error(jsonResponse.error);
        }
    });
});
/**
 * 登出
 */
export const logout = createAsyncThunk('user/logout', async (_, thunkAPI) => {
    return await fetchJSONData(BackEnd.address + '/auth', 'DELETE').then(() => {
        thunkAPI.dispatch(resetSonglists());
        thunkAPI.dispatch(resetPlaylist());
        thunkAPI.dispatch(replaceFavTracks({ favTracks: lswOffline.pick('offlineTracks') || [] }));
        thunkAPI.dispatch(resetComment());
        // lsw.delete('isLogin');
        // lsw.delete('avatarDataURL');
        // lsw.delete('token');
        // lsw.delete('username');
        // lsw.delete('tracks');
        lsw.clear();
    });
});
/**
 * @param {File} image - 限制4m
 */
export const uploadAvatar = createAsyncThunk('user/uploadAvatar', async ({ image }) => {
    const formData = new FormData();
    formData.append('avatar', image);
    return await fetchData(BackEnd.address + '/user/avatar', 'POST', {
        body: formData,
        headers: {
            'x-auth-token': lsw.pick('token')
        }
    }).then(async res => {
        const jsonResponse = await res.json();
        if (res.ok) {
            const avatarURL = jsonResponse.avatarURL;
            const avatarDataURL = avatarURL && await parseImageAsDataURL(BackEnd.address + avatarURL);
            lsw.put('avatarDataURL', avatarDataURL);
            return {
                ...jsonResponse,
                avatarDataURL
            };
        } else {
            throw new Error(jsonResponse);
        }
    });
});

export const uploadInfo = createAsyncThunk('user/uploadInfo', async ({ username, description, year, month, day, gender, province, city }) => {
    const birth = new Date(`${year}-${month}-${day}`).getTime();
    return await fetchDataWithToken(
        fetchJSONData,
        BackEnd.address + '/user/info',
        'POST',
        {
            body: {
                username,
                info: {
                    description, birth, gender, province, city
                }
            },
            keyRoot: rootkey
        }).then(async res => {
            const jsonResponse = await res.json();
            if (jsonResponse.error) {
                throw new Error(jsonResponse.error);
            }
            const token = res.headers.get('x-auth-token');
            const payload = parseJwt(token);
            const { username } = payload;
            lsw.put('username', username);
            return { username, ...jsonResponse };
        });
});

const slice = createSlice({
    name: 'user',
    initialState: {
        avatarDataURL: lsw.pick('avatarDataURL') || '',
        isLogin: lsw.pick('isLogin') || false,
        loading: false, //指示登录状态
        msg: '',
        userId: lsw.pick('userId') || '',
        username: lsw.pick('username') || '',
    },
    reducers: {
        clearMsg(state) {
            state.msg = '';
        },
        setMsg(state, action) {
            state.msg = action.payload.msg;
        }
    },
    extraReducers: {
        [addUser.fulfilled]: (state, action) => {
            state.loading = false;
        },
        [addUser.pending]: state => {
            state.loading = true;
        },
        [addUser.rejected]: (state, action) => {
            state.loading = false;
            console.error('用户注册错误');
            console.error(action);
        },
        [login.fulfilled]: (state, action) => {
            state.avatarDataURL = action.payload.avatarDataURL;
            state.isLogin = true;
            state.loading = false;
            state.userId = action.payload.userId;
            state.username = action.payload.username;
        },
        [login.pending]: state => {
            state.loading = true;
        },
        [login.rejected]: (state, action) => {
            state.loading = false;
            if (action.error.message.search(/failed to fetch/i) > -1) {
                console.error("网络连接超时");
            } else {
                console.error('登录错误');
                console.error(action.error);
            }
        },
        [logout.fulfilled]: state => {
            state.isLogin = false;
            state.username = '';
            state.avatarDataURL = '';
            state.loading = false;
            state.msg = '';
        },
        [logout.rejected]: (state, action) => {
            if (action.error.message.search(/failed to fetch/i) > -1) {
                console.error('连接网络错误');
            } else {
                console.error('登出错误');
                console.error(action.error);
            }
        },
        [uploadAvatar.fulfilled]: (state, action) => {
            state.loading = false;
            state.avatarDataURL = action.payload.avatarDataURL;
        },
        [uploadAvatar.pending]: state => {
            state.loading = true;
        },
        [uploadAvatar.rejected]: (state, action) => {
            state.loading = false;
        },
        [uploadInfo.fulfilled]: (state, action) => {
            state.username = action.payload.username;
        },
        [uploadInfo.rejected]: (state, action) => {
            console.error('上传信息错误');
            console.error(action);
        },
    }
});

export default slice.reducer;
export const { clearMsg, setMsg } = slice.actions;
export const avatarSelector = state => state.user.avatarDataURL;
export const infoSelector = state => state.user.info;
export const isLoginSelector = state => state.user.isLogin;
export const userIdSelector = state => state.user.userId;
export const usernameSelector = state => state.user.username;