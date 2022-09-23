import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userInfoSlice from "./slices/userInfoSlice";

const rootReducer = combineReducers({
  userInfo: userInfoSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
});

export default store;
