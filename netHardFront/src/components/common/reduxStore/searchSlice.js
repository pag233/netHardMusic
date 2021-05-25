import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { BackEnd, SecsToTime } from '../utils';
import { fetchData } from '../fetch';

export const search = createAsyncThunk('search', async (params) => {
    const url = new URL(BackEnd.address + '/search');
    const { type } = params;
    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });
    return await fetchData(url, 'GET').then(res => res.json()).then(async jsonRes => {
        if (jsonRes.error) {
            throw new Error(jsonRes.error);
        }
        switch (type) {
            case 'song':
                jsonRes.tracks.forEach(track => {
                    track.duration = SecsToTime(track.duration);
                });
                return jsonRes;
            case 'songlist':
            case 'username':
                return jsonRes;
            default:
                throw new Error('搜索时发生错误');
        }
    });
});
const slice = createSlice({
    name: 'search',
    initialState: {
        searchStr: ''
    },
    reducers: {
        setSearchStr(state, action) {
            state.searchStr = action.payload;
        }
    },
});
export default slice.reducer;
export const { setSearchStr } = slice.actions;
export const searchStrSelector = state => state.search.searchStr;