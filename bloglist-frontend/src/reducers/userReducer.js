import { createSlice } from "@reduxjs/toolkit"

const initialState = null

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => action.payload,
    clearUser: () => initialState,
  },
})

export const { setUser, setError, clearUser } = userSlice.actions

export default userSlice.reducer
