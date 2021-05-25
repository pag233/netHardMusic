///跟踪同步后退前进状态，决定sidebar top的前后按钮样式。
import { createSlice } from '@reduxjs/toolkit';

//bottom代表历史栈中栈底编号，top为栈顶编号。
const bottom = window.sessionStorage.getItem('bottom') ? Number(window.sessionStorage.getItem('bottom')) : 0;
const top = window.sessionStorage.getItem('top') ? Number(window.sessionStorage.getItem('top')) : 0;

const slice = createSlice({
    name: 'historyState',
    //idx代表当前页面处于的位置
    initialState: { idx: 0, bottom, top },
    reducers: {
        incrIdx(state) {
            state.idx++;
            //若当前处于可前进状态时新增历史成为最新历史。
            if (state.idx <= state.top) {
                state.top = state.idx;
                //否则处于最新位置，则直接递增最新历史。
            } else {
                state.top++;
            }
            if (window.history.length > 49) {
                state.bottom++;
            }
        },
        setIdx(state, action) {
            state.idx = action.payload.idx;
        }
    }
});

export default slice.reducer;
export const { incrIdx, setIdx } = slice.actions;