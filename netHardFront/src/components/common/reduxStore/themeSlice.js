import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import LocalStorageWrapper from '../localStorageWrapper';

const rootkey = process.env.REACT_APP_LOCALSTORAGEROOTKEY;
const lsw = LocalStorageWrapper.instance(rootkey);

/**
 * @param {string} theme -主题名称,可选: theme-red, theme-light, theme-dark 
 */
export const saveTheme = createAsyncThunk('theme/saveTheme', (theme) => {
    lsw.put('theme', theme);
    return { theme };
});

const slice = createSlice({
    name: 'theme',
    initialState: {
        current: lsw.pick('theme') || "theme-red"
    },
    reducers: {
        setTheme(state, action) {
            state.current = action.payload.theme;
        }
    },
    extraReducers: {
        [saveTheme.fulfilled]: (state, action) => {
            state.current = action.payload.theme;
        }
    }
});

export default slice.reducer;
export const { setTheme } = slice.actions;