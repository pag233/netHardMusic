import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { setDetail } from './songlistsSlice';
import { setshowLoginPopup } from './uiSlice';
import { fetchJSONData, fetchDataWithToken } from '../fetch';
import { BackEnd } from '../utils';

const rootkey = process.env.REACT_APP_LOCALSTORAGEROOTKEY;

export const getComment = createAsyncThunk('comment/getComment', async ({ songlist_id, offset, limit, isOffline }, thunkAPI) => {
  if (!isOffline) {
    const url = new URL(BackEnd.address + '/songlist/comment');
    url.searchParams.append('songlist_id', songlist_id);
    url.searchParams.append('offset', offset * limit);
    url.searchParams.append('limit', limit);
    return await fetchJSONData(url, 'GET').then(res => res.json()).then(jsonRes => {
      if (jsonRes.error) {
        throw new Error(jsonRes.error);
      } else if (jsonRes.status === 'done') {
        const { comments, total, featuredComments } = jsonRes;
        thunkAPI.dispatch(setDetail({ commentLength: total }));
        return { comments, total, featuredComments };
      }
    });
  }
  return { comments: [], featuredComments: [] };
});
export const postComment = createAsyncThunk('comment/postComment', async ({ songlist_id, comment, replyTo_id }, thunkAPI) => {
  const { isLogin } = thunkAPI.getState().user;
  if (!isLogin) {
    return thunkAPI.dispatch(setshowLoginPopup(true));
  }
  return await fetchDataWithToken(fetchJSONData, BackEnd.address + '/songlist/comment', 'POST', {
    body: {
      songlist_id, comment, replyTo: replyTo_id
    },
    keyRoot: rootkey
  }).then(res => res.json()).then(jsonRes => {
    if (jsonRes.error) {
      throw new Error(jsonRes.error);
    } else if (jsonRes.status === 'done') {
      thunkAPI.dispatch(setDetail({ commentLength: jsonRes.total }));
      return { comment: jsonRes.comment, isLogin: true };
    }
  });
});
export const likeComment = createAsyncThunk('comment/likeComment', async ({ songlist_id, comment_id }, thunkAPI) => {
  const { isLogin } = thunkAPI.getState().user;
  if (!isLogin) {
    return thunkAPI.dispatch(setshowLoginPopup(true));
  }
  return await fetchDataWithToken(fetchJSONData, BackEnd.address + '/songlist/comment', 'PATCH', {
    body: { songlist_id, comment_id }, keyRoot: rootkey
  }).then(res => res.json()).then(jsonRes => {
    if (jsonRes.error) {
      throw new Error(jsonRes.error);
    } else if (jsonRes.status === 'done') {
      return { comment_id };
    }
  });

});
const initialState = {
  commentLines: [],
  featuredComments: [],
  offset: 0,
};
const slice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    resetComment(state) {
      state.commentLines = [];
      state.featuredComments = [];
    },
    setOffset(state, action) {
      state.offset = action.payload;
    }
  },
  extraReducers: {
    [getComment.fulfilled]: (state, action) => {
      state.commentLines = action.payload.comments;
      state.featuredComments = action.payload.featuredComments;
    },
    [getComment.rejected]: (state, action) => {
      console.error(action.error);
    },
    [postComment.fulfilled]: (state, action) => {
      if (action.payload.isLogin) {
        state.commentLines.unshift(action.payload.comment);
      }
    },
    [postComment.rejected]: (state, action) => {
      console.error(action.error);
    },
    [likeComment.fulfilled]: (state, action) => {
      state.commentLines = state.commentLines.map(line => {
        if (line._id === action.payload.comment_id) {
          line.like++;
        }
        return line;
      });
    }
  }
});

export default slice.reducer;
export const {
  resetComment,
  setCommentLength,
  setOffset,
} = slice.actions;
export const commentLinesSelector = state => state.comment.commentLines;
export const featuredCommentsSelector = state => state.comment.featuredComments;
export const offsetSelector = state => state.comment.offset;