import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchData, fetchDataWithToken, fetchJSONData } from '../fetch';
import { setInfoMessager, setshowLoginPopup } from './uiSlice';

import { BackEnd, SecsToTime, parseImageAsDataURL } from '../utils';

import LocalStorageWrapper from '../localStorageWrapper';
const rootkey = process.env.REACT_APP_LOCALSTORAGEROOTKEY;
const lsw = LocalStorageWrapper.instance(rootkey);

function printError(state, action) {
    console.error(action);
}
export const getUserCreatedSonglist = createAsyncThunk('songlist/getCreatedSonglist', async (_, thunkAPI) => {
    const url = new URL(BackEnd.address + '/user/songlist');
    url.searchParams.append('username', thunkAPI.getState().user.username);
    return await fetchData(url, 'GET').then(async res => {
        const jsonRes = await res.json();
        if (jsonRes.error) {
            throw new Error('jsonRes.error');
        }
        return jsonRes;
    });
});
export const postUserCreatedSonglist = createAsyncThunk('songlist/postCreatedSonglist', async ({ body }, thunkAPI) => {
    let { tracks } = body;
    if (tracks) {
        tracks = Array.isArray(tracks) ? tracks.map(track => track._id) : [tracks._id];
        console.log(tracks);
    }
    if (thunkAPI.getState().user.isLogin) {
        thunkAPI.dispatch(setInfoMessager({
            show: true,
            loading: true
        }));
        return await fetchDataWithToken(fetchJSONData, BackEnd.address + '/user/songlist', "POST", {
            body: {
                ...body,
                tracks
            },
            keyRoot: rootkey
        }).then(async res => {
            const jsonRes = await res.json();
            if (jsonRes.error) {
                throw new Error(jsonRes.error);
            }
            thunkAPI.dispatch(
                setInfoMessager({
                    content: { status: 'done', message: '已创建歌单' }
                })
            );
            thunkAPI.dispatch(setInfoMessager({
                show: false,
            }));
            return jsonRes;
        });
    }
});
/**
 * @param {string} song_id - 查询歌单id
 * @param {string} type - 查询歌单返回类型可以是'all', 'edit'
 */
export const getSonglistDetail = createAsyncThunk('songlist/getSonglistDetail', async ({ songlist_id, type = 'all', isOffline }, thunkAPI) => {
    if (isOffline) {
        return thunkAPI.getState().songlists.offlineSonglistDetail;
    }
    const { isLogin } = thunkAPI.getState().user;
    const url = new URL(BackEnd.address + '/songlist/detail');
    url.searchParams.append('songlist_id', songlist_id);
    url.searchParams.append('type', type);
    let response;
    if (isLogin) {
        response = fetchDataWithToken(fetchData, url, 'GET', {
            keyRoot: rootkey
        });
    } else {
        response = fetchData(url, 'GET');
    }
    return await response.then(async res => {
        const jsonRes = await res.json();
        const coverDataUrl = jsonRes.coverUrl && await parseImageAsDataURL(BackEnd.address + jsonRes.coverUrl);
        if (jsonRes.error) {
            throw new Error(jsonRes.error);
        }
        if (type === 'all') {
            jsonRes.tracks.forEach(track => {
                track.duration = SecsToTime(track.duration);
            });
        }
        return { ...jsonRes, coverUrl: coverDataUrl, createdBy: jsonRes.created_by?.username };
    });
});
/**
 * @param {string} body.songlist_id - requried 歌单id
 * @param {boolean} body.meta.played - 播放数
 * @param {array} body.info.tags - 标签
 * @param {string} body.info.description - 简介
 */
export const updateSonglistDetail = createAsyncThunk('songlist/updateSonglistDetail', async (body) => {
    const { songlist_id, info, cover } = body;
    const { name, tags, description } = info ?? {};
    if (!songlist_id) {
        throw new Error('必须提供歌单id');
    }
    try {
        if (cover) {
            const formData = new FormData();
            formData.append('cover', cover);
            formData.append('songlist_id', songlist_id);
            const jsonRes = await fetchDataWithToken(fetchData, BackEnd.address + '/songlist/detail/cover', 'POST', {
                body: formData,
                keyRoot: rootkey
            }).then(res => res.json());
            if (jsonRes.error) {
                throw new Error(jsonRes.error);
            } else if (jsonRes.status === 'done') {
                const coverDataUrl = await parseImageAsDataURL(BackEnd.address + jsonRes.coverUrl);
                return { coverUrl: coverDataUrl };
            } else {
                throw Error('更新歌单封面错误');
            }
        } else {
            if (!name) {
                throw Error('歌单名称不能为空');
            }
            const jsonRes = await fetchDataWithToken(fetchJSONData, BackEnd.address + '/songlist/detail', 'POST', {
                body,
                keyRoot: rootkey
            }).then(res => res.json());
            if (jsonRes.error) {
                throw new Error(jsonRes.error);
            } else if (jsonRes.status === 'done') {
                return { songlist_id, name, tags, description };
            } else {
                throw Error('更新歌单未知错误');
            }
        }
    } catch (error) {
        throw Error(error.message);
    }
});
export const playSonglist = createAsyncThunk('songlist/playSonglist', async ({ songlist_id }) => {
    return fetchJSONData(BackEnd.address + '/songlist/detail/play', "POST", {
        body: { songlist_id }
    }).then(res => res.json()).then(jsonRes => {
        if (jsonRes.error) {
            throw new Error(jsonRes.error);
        } else if (jsonRes.status === 'done') {
            return;
        }
        throw new Error('更新播放数时出错');
    });
});
export const setOfflineTrack = createAsyncThunk('songlist/setOfflineTrack', ({ track, type = 'save' }, thunkAPI) => {
    const { tracks } = thunkAPI.getState().songlists.offlineSonglistDetail;
    switch (type) {
        case 'save':
            thunkAPI.dispatch(putOfflineTrack({ track }));
            thunkAPI.dispatch(putFavTrack({ track }));
            lsw.put('offlineTracks', [...tracks, track]);
            break;
        case 'delete':
            thunkAPI.dispatch(delOfflineTrack({ track }));
            thunkAPI.dispatch(delFavTrack({ track }));
            lsw.put('offlineTracks', tracks.filter(t => t._id !== track._id));
            break;
        default:
            break;
    }
});
export const setFavTrack = createAsyncThunk('songlist/setFavTrack', async ({ track, faved }, thunkAPI) => {
    if (thunkAPI.getState().user.isLogin) {
        thunkAPI.dispatch(setInfoMessager({
            show: true,
            loading: true
        }));
        return await fetchDataWithToken(fetchJSONData, BackEnd.address + '/user/songlist/favedTrack', 'POST', {
            body: {
                track_id: track._id, faved
            },
            keyRoot: rootkey
        }).then(res => res.json()).then(jsonResponse => {
            if (jsonResponse.error) {
                throw new Error(jsonResponse.error);
            }
            else if (jsonResponse.status === 'done') {
                if (faved) {
                    thunkAPI.dispatch(putFavTrack({
                        track
                    }));
                    thunkAPI.dispatch(
                        setInfoMessager({
                            content: { status: 'done', message: '已收藏' }
                        })
                    );
                }
                else {
                    thunkAPI.dispatch(delFavTrack({
                        track
                    }));
                    thunkAPI.dispatch(
                        setInfoMessager({
                            content: { status: 'done', message: '已取消收藏' }
                        })
                    );
                }
            }
            thunkAPI.dispatch(setInfoMessager({
                show: false
            }));
        });
    } else {
        if (faved) {
            thunkAPI.dispatch(setOfflineTrack({ track, type: 'save' }));
        } else {
            thunkAPI.dispatch(setOfflineTrack({ track, type: 'delete' }));
        }
    }
});
export const deleteSonglist = createAsyncThunk('songlist/deleteSonglist', async ({ songlist_id }) => {
    try {
        return await fetchDataWithToken(fetchJSONData, BackEnd.address + '/songlist', 'DELETE', {
            body: {
                songlist_id,
            },
            keyRoot: rootkey
        }).then(res => res.json()).then(jsonRes => {
            if (jsonRes.error) {
                throw new Error(jsonRes.error);
            }
            if (jsonRes.status === 'done') {
                return { songlist_id };
            }
        });
    } catch (error) {
        throw new Error('删除歌单时发生未知错误: ' + error);
    }
});
export const addTrackToSonglist = createAsyncThunk('songlist/addTrackToSonglist', async ({ songlist_id, track }, thunkAPI) => {
    if (thunkAPI.getState().user.isLogin) {
        thunkAPI.dispatch(setInfoMessager({
            show: true,
            loading: true
        }));
        return await fetchDataWithToken(fetchJSONData, BackEnd.address + '/songlist/track', 'POST', {
            body: {
                songlist_id,
                track_id: track._id
            },
            keyRoot: '/netHardMusic'
        }).then(res => res.json()).then(jsonRes => {
            if (jsonRes.error) {
                thunkAPI.dispatch(
                    setInfoMessager({
                        content: { status: 'error', message: '收藏到歌单时发生错误' }
                    })
                );
                throw new Error(jsonRes.error);
            }
            else if (jsonRes.status === 'done') {
                thunkAPI.dispatch(
                    setInfoMessager({
                        content: { status: 'done', message: '已收藏到歌单' }
                    })
                );
                thunkAPI.getState().songlists.userSonglists.createdlists[0]._id === songlist_id && thunkAPI.dispatch(putFavTrack({ track }));
            } else if (jsonRes.status === 'dup') {
                thunkAPI.dispatch(
                    setInfoMessager({
                        content: { status: 'error', message: '歌曲已存在' }
                    })
                );
            } else {
                throw new Error('收藏到歌单时发生 未知错误');
            }
            thunkAPI.dispatch(setInfoMessager({
                show: false
            }));
        });
    }
    try {
        thunkAPI.dispatch(setInfoMessager({
            show: true,
            loading: false
        }));
        const hasTrack = thunkAPI.getState().songlists.favTracks.filter(t => t._id === track._id);
        if (hasTrack.length > 0) {
            return thunkAPI.dispatch(
                setInfoMessager({
                    content: { status: 'error', message: '歌曲已存在' }
                })
            );
        }
        thunkAPI.dispatch(setOfflineTrack({ track, type: 'save' }));
        thunkAPI.dispatch(
            setInfoMessager({
                content: { status: 'done', message: '已收藏到歌单' }
            })
        );
    } catch (error) {
        throw new Error(error.message);
    }
});
export const deleteTrackFromSonglist = createAsyncThunk('songlist/deletefromSonglist', async ({ songlist_id, track_id, deleteable }, thunkAPI) => {
    return await fetchDataWithToken(fetchJSONData, BackEnd.address + '/songlist/track', 'DELETE', {
        body: {
            songlist_id,
            track_id,
        },
        keyRoot: rootkey
    }).then(res => res.json()).then(jsonRes => {
        if (jsonRes.error) {
            throw new Error(jsonRes.error);
        }
        if (jsonRes.status === 'done') {
            if (!deleteable) {
                thunkAPI.dispatch(delFavTrack({ track: { _id: track_id } }));
            }
            return { track_id };
        }
    });
});
export const getUserFavedSonglist = createAsyncThunk('songlist/getFavedSonglist', async ({ type }) => {
    const url = new URL(BackEnd.address + '/user/songlist/favedlists');
    url.searchParams.append('type', type);
    return await fetchDataWithToken(fetchJSONData, url, 'GET', {
        keyRoot: rootkey
    }).then(res => res.json()).then(jsonRes => {
        if (jsonRes.error) {
            throw new Error(jsonRes.error);
        }
        else if (jsonRes.status === 'done') {
            return jsonRes.favSonglists;
        }
    });
});
export const postUserFavedSonglist = createAsyncThunk('songlist/postFavedSonglist', async ({ songlist }, thunkAPI) => {
    if (!(thunkAPI.getState().user.isLogin)) {
        thunkAPI.dispatch(setshowLoginPopup(true));
        return { status: 'nologin' };
    }
    thunkAPI.dispatch(setInfoMessager({
        show: true,
        loading: true
    }));
    return await fetchDataWithToken(fetchJSONData, BackEnd.address + '/user/songlist/favedlists', 'POST', {
        body: { songlist_id: songlist._id },
        keyRoot: rootkey
    }).then(res => res.json()).then(jsonRes => {
        thunkAPI.dispatch(setInfoMessager({
            show: false,
        }));
        if (jsonRes.error) {
            thunkAPI.dispatch(
                setInfoMessager({
                    content: { status: 'error', message: '收藏歌单时发生错误' }
                })
            );
            throw new Error(jsonRes.error);
        }
        else if (jsonRes.status === 'done') {
            thunkAPI.dispatch(
                setInfoMessager({
                    content: { status: 'done', message: '歌单已收藏' }
                })
            );
            thunkAPI.dispatch(
                putUserFavedSonglist({ songlist })
            );
            return { status: 'done' };
        } else {
            throw new Error('收藏到歌单时发生未知错误');
        }
    });
});
export const removeUserFavedSonglist = createAsyncThunk('songlist/removeFavedSonglist', async ({ songlist }, thunkAPI) => {
    thunkAPI.dispatch(setInfoMessager({
        show: true,
        loading: true
    }));
    return await fetchDataWithToken(fetchJSONData, BackEnd.address + '/user/songlist/favedlists', 'DELETE', {
        body: { songlist_id: songlist._id },
        keyRoot: rootkey
    }).then(res => res.json()).then(jsonRes => {
        thunkAPI.dispatch(setInfoMessager({
            show: false,
        }));
        if (jsonRes.error) {
            thunkAPI.dispatch(
                setInfoMessager({
                    content: { status: 'error', message: '收藏歌单时发生错误' }
                })
            );
            throw new Error(jsonRes.error);
        }
        else if (jsonRes.status === 'done') {
            thunkAPI.dispatch(
                setInfoMessager({
                    content: { status: 'done', message: '歌单已取消收藏' }
                })
            );
            thunkAPI.dispatch(
                delUserFavedSonglist({ songlist })
            );
            return { status: 'done' };
        } else {
            throw new Error('收藏到歌单时发生未知错误');
        }
    });
});

const offlineSonglistDetail = {
    _id: 'offline',
    createdBy: '未登录',
    commentLength: 0,
    deleteable: false,
    editable: false,
    favable: false,
    icon: 'fav',
    name: '我喜欢的音乐',
    played: 0,
    shared: 0,
    tracks: lsw.pick('offlineTracks') || [],
};

const initialState = {
    favTracks: lsw.pick('isLogin') ? [] : (lsw.pick('offlineTracks') ?? []),
    userSonglists: {
        createdlists: lsw.pick('isLogin') ? [] : [offlineSonglistDetail],
        favlists: []
    },
    detailSonglist: {},
    offlineSonglistDetail: offlineSonglistDetail,
};

const slice = createSlice({
    name: 'songlists',
    initialState,
    reducers: {
        setDetail(state, action) {
            state.detailSonglist = {
                ...state.detailSonglist,
                ...action.payload
            };
        },
        setTracks(state, action) {
            state.detailSonglist.tracks = action.payload;
        },
        putFavTrack(state, action) {
            state.favTracks.push(action.payload.track);
        },
        delFavTrack(state, action) {
            state.favTracks = state.favTracks.filter(t => t._id !== action.payload.track._id);
        },
        replaceFavTracks(state, action) {
            state.favTracks = action.payload.favTracks;
        },
        delUserCreatedSonglist(state, action) {
            state.userSonglists.createdlists = [...state.userSonglists.createdlists].filter(list => list._id !== action.payload.songlist_id);
        },
        putUserFavedSonglist(state, action) {
            state.userSonglists.favlists = [...state.userSonglists.favlists, action.payload.songlist];
        },
        delUserFavedSonglist(state, action) {
            state.userSonglists.favlists = state.userSonglists.favlists.filter(list => list._id !== action.payload.songlist._id);
        },
        resetSonglists(state) {
            state.favTracks = [];
            state.detailSonglist = state.offlineSonglistDetail;
            state.userSonglists = {
                createdlists: [state.offlineSonglistDetail],
                favlists: []
            };
        },
        putOfflineTrack(state, action) {
            state.offlineSonglistDetail.tracks.push(action.payload.track);
        },
        delOfflineTrack(state, action) {
            state.offlineSonglistDetail.tracks = state.offlineSonglistDetail.tracks.filter(track => track._id !== action.payload.track._id);
        }
    },
    extraReducers: {
        [getUserCreatedSonglist.fulfilled]: (state, action) => {
            state.userSonglists.createdlists = action.payload.songlists.map(list => ({
                ...list,
                subtitle: (list?.tracks?.length ?? 0) + '首歌',
                createdBy: action.payload?.created_by ?? '未登录'
            }));
            state.favTracks = action.payload.songlists[0].tracks;
        },
        [getUserCreatedSonglist.rejected]: printError,
        [postUserCreatedSonglist.fulfilled]: (state, action) => {
            state.userSonglists.createdlists.push(action.payload.songlist);
        },
        [postUserCreatedSonglist.rejected]: printError,
        [getSonglistDetail.fulfilled]: (state, action) => {
            state.detailSonglist = action.payload;
        },
        [getSonglistDetail.rejected]: printError,
        [playSonglist.fulfilled]: (state) => {
            state.detailSonglist.played++;
        },
        [playSonglist.rejected]: printError,
        [updateSonglistDetail.fulfilled]: (state, action) => {
            const { songlist_id, name, ...props } = action.payload;
            state.userSonglists.createdlists = state.userSonglists.createdlists.map(list => {
                if (list._id === songlist_id) {
                    list.name = name;
                }
                return list;
            });
            state.detailSonglist = { ...state.detailSonglist, name, ...props };
        },
        [updateSonglistDetail.rejected]: printError,
        [setFavTrack.rejected]: printError,
        [deleteSonglist.fulfilled]: (state, action) => {
            state.userSonglists.createdlists = state.userSonglists.createdlists.filter(list => list._id !== action.payload.songlist_id);
        },
        [deleteSonglist.rejected]: printError,
        [deleteTrackFromSonglist.fulfilled]: (state, action) => {
            state.detailSonglist.tracks = state.detailSonglist.tracks.filter(track => track._id !== action.payload.track_id);
        },
        [deleteTrackFromSonglist.rejected]: printError,
        [getUserFavedSonglist.fulfilled]: (state, action) => {
            state.userSonglists.favlists = action.payload;
        },
        [postUserFavedSonglist.fulfilled]: (state, action) => {
            if (action.payload.status === 'done') {
                state.detailSonglist.faved = true;
                state.detailSonglist.favnum = state.detailSonglist.favnum + 1;
            }
        },
        [removeUserFavedSonglist.fulfilled]: (state, action) => {
            if (action.payload.status === 'done') {
                state.detailSonglist.faved = false;
                state.detailSonglist.favnum = state.detailSonglist.favnum - 1;
            }
        },
        [removeUserFavedSonglist.rejected]: printError,
    }
});

export default slice.reducer;
export const { setDetail, putFavTrack, delFavTrack, setTracks,
    delUserCreatedSonglist, resetSonglists, putOfflineTrack,
    putUserFavedSonglist, delUserFavedSonglist, delOfflineTrack, replaceFavTracks } = slice.actions;
export const userCreatedSonglistsSelector = state => state.songlists.userSonglists.createdlists;
export const songlistDetailSelector = state => state.songlists.detailSonglist;
export const userFavedSonglistSelector = state => state.songlists.userSonglists.favlists;
export const favTracksSelector = state => state.songlists.favTracks;