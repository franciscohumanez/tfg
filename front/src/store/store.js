import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth/authSlice";
import { dashboardSlice } from "./dashboard/dashboardSlice";

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        dashboard: dashboardSlice.reducer,
    },
});