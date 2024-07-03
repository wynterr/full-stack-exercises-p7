import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  message: null,
  error: false,
}

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotification: (state, action) => {
      state.message = action.payload
      state.error = false
    },
    setError: (state, action) => {
      state.message = action.payload
      state.error = true
    },
    clearNotification: () => initialState,
  },
})

export const { setNotification, setError, clearNotification } = notificationSlice.actions

export const showNotification = (message, seconds) => {
  return async (dispatch) => {
    dispatch(setNotification(message))
    setTimeout(() => {
      dispatch(clearNotification())
    }, seconds * 1000)
  }
}

export const showError = (message, seconds) => {
  return async (dispatch) => {
    dispatch(setError(message))
    setTimeout(() => {
      dispatch(clearNotification())
    }, seconds * 1000)
  }
}

export default notificationSlice.reducer
