import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
  userId: number | null;
  token: string;
  webviewToken: string;
}

const initialState: UserInfo = {
  userId: null,
  token: "",
  webviewToken: "",
};

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState: initialState,
  reducers: {
    resetUserInfo: () => {
      return initialState;
    },
    setUserInfo: (
      state,
      action: PayloadAction<{ userId: number; token: string }>
    ) => {
      state.userId = action.payload.userId;
      state.token = action.payload.token;
    },
    setWebviewToken: (state, action: PayloadAction<string>) => {
      state.webviewToken = action.payload;
    },
  },
});

export const { setUserInfo, setWebviewToken, resetUserInfo } =
  userInfoSlice.actions;

export default userInfoSlice.reducer;
