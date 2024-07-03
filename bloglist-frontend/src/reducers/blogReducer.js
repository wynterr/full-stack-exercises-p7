import { createSlice } from "@reduxjs/toolkit"
import blogService from "../services/blogs"

const blogSlice = createSlice({
  name: "blogs",
  initialState: [],
  reducers: {
    updateBlog: (state, action) => {
      const updatedBlog = action.payload
      return [
        ...state.map((blog) =>
          blog.id !== updatedBlog.id ? blog : updatedBlog
        ),
      ].sort((a, b) => b.likes - a.likes)
    },
    appendBlog: (state, action) => {
      state.push(action.payload)
      state.sort((a, b) => b.likes - a.likes)
    },
    setBlogs: (state, action) => {
      return action.payload.sort((a, b) => b.likes - a.likes)
    },
    deleteBlog: (state, action) => {
      const id = action.payload
      return state.filter(blog => blog.id !== id)
    }
  },
})

export const { updateBlog, addBlog, appendBlog, setBlogs, deleteBlog } = blogSlice.actions

export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await blogService.getAll()
    dispatch(setBlogs(blogs))
  }
}

export const createBlogSync = (blog) => {
  return async (dispatch) => {
    const newBlog = await blogService.create(blog)
    dispatch(appendBlog(newBlog))
  }
}

export const updateBlogSync = (updatedBlog) => {
  return async (dispatch) => {
    const updatedBlogReturn = await blogService.update(
      updatedBlog.id,
      updatedBlog
    )
    dispatch(updateBlog(updatedBlogReturn))
  }
}

export const deleteBlogSync = (id) => {
  return async (dispatch) => {
    await blogService.remove(id)
    dispatch(deleteBlog(id))
  }
}

export default blogSlice.reducer
