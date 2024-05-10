import { createSlice } from "@reduxjs/toolkit";

export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        isSaving: true
    },
    reducers: {
        increment: (state) => {
            state.counter += 1;
        },
    }
});

export const { increment } = dashboardSlice.actions;