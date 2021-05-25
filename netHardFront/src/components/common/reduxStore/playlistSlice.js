import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import LocalStorageWrapper from '../localStorageWrapper';
import { playSonglist } from './songlistsSlice';

const rootkey = process.env.REACT_APP_LOCALSTORAGEROOTKEY;
const offlineRootkey = process.env.REACT_APP_OFFINEROOTKEY;
const lsw = LocalStorageWrapper.instance(rootkey);
const lswOffline = LocalStorageWrapper.instance(offlineRootkey);
export const saveTracksToLocalStorage = createAsyncThunk('playlist/saveTracks', ({ tracks }, thunkAPI) => {
    try {
        thunkAPI.getState().user.isLogin ?
            lsw.put('tracks', tracks) :
            lswOffline.put('offlineTracks', tracks);
    } catch (error) {
        throw new Error(error.message);
    }
});
export const clearTracksFromLocalStorage = createAsyncThunk('playlist/clearTracks', (_) => {
    try {
        lsw.put('tracks', []);
    } catch (error) {
        throw new Error(error.message);
    }
});
/**
 * @param {string} currentTrackId - 当前track._id
 * @param {string} trackIdx- 当前单曲在playlist中的index
 * @param {array} tracks- 单曲列表
 * @param {string} trackSonglistId - 单曲列表从属songlist._id
 */
export const playTrackSonglist = createAsyncThunk('playlist/playSonglist', ({
    currentTrackId,
    trackIdx,
    tracks,
    trackSonglistId,
}, thunkAPI) => {
    const state = thunkAPI.getState().playlist;
    const { meta } = state;
    thunkAPI.dispatch(setTracks({
        tracks
    }));
    thunkAPI.dispatch(saveTracksToLocalStorage({
        tracks
    }));
    thunkAPI.dispatch(setTrackMeta({
        trackIdx, currentTrackId
    }));
    if (meta.trackSonglistId !== trackSonglistId) {
        thunkAPI.dispatch(setTrackMeta({
            trackSonglistId
        }));
        if (trackSonglistId && trackSonglistId !== 'offline') {
            thunkAPI.dispatch(playSonglist({
                songlist_id: trackSonglistId
            }));
            return { status: 'played' };
        }
    }
    return { status: 'done' };
});
export const playTrackSingle = createAsyncThunk('playlist/playSingle', ({ track }, thunkAPI) => {
    try {
        const { tracks } = thunkAPI.getState().playlist;
        const trackIdx = tracks.findIndex(t => t._id === track._id);
        if (trackIdx < 0) {
            const newTracks = [track, ...tracks];
            thunkAPI.dispatch(setTracks({
                tracks: newTracks
            }));
            thunkAPI.dispatch(saveTracksToLocalStorage({
                tracks: newTracks
            }));
            thunkAPI.dispatch(setTrackMeta({
                trackIdx: tracks.length, currentTrackId: track._id, trackSonglistId: undefined
            }));
        } else {
            thunkAPI.dispatch(setTrackMeta({
                trackIdx, currentTrackId: track._id, trackSonglistId: undefined
            }));
        }
    } catch (error) {
        throw new Error(error);
    }
});
export const removeTrackFromTracks = createAsyncThunk('playlist/removeTrack', ({ track }, thunkAPI) => {
    const { tracks } = thunkAPI.getState().playlist;
    const filtedTracks = tracks.filter(t => t !== track);
    thunkAPI.dispatch(setTracks({ tracks: filtedTracks }));
    thunkAPI.dispatch(saveTracksToLocalStorage({ tracks: filtedTracks }));
});
export const addToHistoryTrack = createAsyncThunk('playlist/addToHistoryTracks', ({ track }, thunkAPI) => {
    const { historyTracks } = thunkAPI.getState().playlist;
    if (!historyTracks.includes(track)) {
        const newHistoryTracks = [...historyTracks, track];
        lsw.put('historyTracks', newHistoryTracks);
        return thunkAPI.dispatch(setHistoryTracks({ tracks: newHistoryTracks }));
    }
});
export const clearHistoryTracks = createAsyncThunk('playlist/clearHistoryTracks', (_, thunkAPI) => {
    lsw.put('historyTracks', []);
    thunkAPI.dispatch(setHistoryTracks({ tracks: [] }));
});

function getTracks() {
    const isLogin = lsw.pick('isLogin');
    return isLogin ? lsw.pick('tracks') : lswOffline.pick('offlineTracks');
}
const initialState = {
    tracks: getTracks() ?? [],
    historyTracks: lsw.pick('historyTracks') ?? [],
    meta: {
        currentTrackId: undefined,
        playing: false,
        trackIdx: -1,
        trackSonglistId: undefined
    }
};
const slice = createSlice({
    name: 'playlist',
    initialState: initialState,
    reducers: {
        setHistoryTracks(state, action) {
            state.historyTracks = action.payload.tracks;
        },
        setTrackMeta(state, action) {
            state.meta = {
                ...state.meta,
                ...action.payload
            };
        },
        setTracks(state, action) {
            state.tracks = action.payload.tracks;
        },
        nextTrack(state) {
            if (state.tracks.length > 0) {
                let idx = state.meta.trackIdx;
                idx = idx < state.tracks?.length - 1 ? idx + 1 : idx;
                state.meta.trackIdx = idx;
                state.meta.currentTrackId = state.tracks[idx]._id;
            }
        },
        prevTrack(state) {
            if (state.tracks.length > 0) {
                let idx = state.meta.trackIdx;
                idx = idx > 0 ? idx - 1 : idx;
                state.meta.trackIdx = idx;
                state.meta.currentTrackId = state.tracks[idx]._id;
            }
        },
        resetPlaylist(state) {
            state.tracks = [];
            state.meta = {
                currentTrackId: undefined,
                playing: false,
                trackIdx: -1,
                trackSonglistId: undefined
            };
        },
        firstTrack(state) {
            state.meta.trackIdx = 0;
            state.meta.currentTrackId = state.tracks[0]._id;
        },
    }
});

export default slice.reducer;
export const {
    firstTrack,
    nextTrack,
    prevTrack,
    resetPlaylist,
    setHistoryTracks,
    setTrackMeta,
    setTracks,
} = slice.actions;
export const tracksSelector = state => state.playlist.tracks;
export const hitstoryTracksSelector = state => state.playlist.historyTracks;
export const trackMetaStateSelector = state => state.playlist.meta;