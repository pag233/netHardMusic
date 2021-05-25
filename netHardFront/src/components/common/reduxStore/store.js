import { configureStore } from '@reduxjs/toolkit';
import historyStateReducer from './historyStateSlice';
import playlistReducer from './playlistSlice';
import searchReducer from './searchSlice';
import songlistReducer from './songlistsSlice';
import themeReducer from './themeSlice';
import uiReducer from './uiSlice';
import userReducer from './userSlice';
import commentReducer from './commentSlice';

export default configureStore({
    reducer: {
        historyState: historyStateReducer,
        user: userReducer,
        theme: themeReducer,
        ui: uiReducer,
        songlists: songlistReducer,
        playlist: playlistReducer,
        search: searchReducer,
        comment: commentReducer
    }
});