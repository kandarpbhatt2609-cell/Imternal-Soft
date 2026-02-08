import {createSlice} from '@reduxjs/toolkit';


const initialState = {
  status: null, // Change from false to null
  userData: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.status = true;
      state.userData = action.payload;
    },
    logout: (state) => {
      state.status = false; // User is definitely logged out
      state.userData = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
