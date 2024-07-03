import { useState, useEffect, useRef } from "react"
import Blog from "./components/Blog"
import LoginForm from "./components/LoginForm"
import Notification from "./components/Notification"
import blogService from "./services/blogs"
import loginService from "./services/login"
import BlogForm from "./components/BlogForm"
import Togglable from "./components/togglable"
import { showError } from "./reducers/notificationReducer"
import { useDispatch, useSelector } from "react-redux"
import { initializeBlogs, createBlogSync, updateBlogSync, deleteBlogSync} from "./reducers/blogReducer"
import { setUser } from "./reducers/userReducer"

const App = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const blogFormRef = useRef()
  const dispatch = useDispatch()
  const blogs = useSelector((state) => state.blogs)
  const user = useSelector((state) => state.user)

  useEffect(() => {
    dispatch(initializeBlogs())
  }, [dispatch])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedUser")
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      dispatch(setUser(user))
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password,
      })
      window.localStorage.setItem("loggedUser", JSON.stringify(user))
      blogService.setToken(user.token)
      dispatch(setUser(user))
      setUsername("")
      setPassword("")
    } catch (exception) {
      setUsername("")
      setPassword("")
      dispatch(showError("Wrong username or password", 5))
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem("loggedUser")
    dispatch(setUser(null))
    blogService.setToken(null)
  }

  const createBlog = async (blogObject) => {
    blogFormRef.current.toggleVisibility()
    dispatch(createBlogSync(blogObject))
    return returnedBlog
  }

  const updateBlog = async (blogObject) => {
    dispatch(updateBlogSync(blogObject))
    return returnedBlog
  }

  const deleteBlog = async (id) => {
    dispatch(deleteBlogSync(id))
  }

  if (user === null) {
    return (
      <div>
        <h2>log in to application</h2>
        <Notification />
        <LoginForm
          username={username}
          password={password}
          handleUsernameChange={({ target }) => setUsername(target.value)}
          handlePasswordChange={({ target }) => setPassword(target.value)}
          handleLogin={handleLogin}
        />
      </div>
    )
  } else {
    return (
      <div>
        <h2>blogs</h2>
        <Notification />
        <p>
          {user.name} logged in <button onClick={handleLogout}>logout</button>
        </p>
        <Togglable buttonLabel="new blog" ref={blogFormRef}>
          <h2>create new</h2>
          <BlogForm
            createBlog={createBlog}
          />
        </Togglable>
        {blogs.map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            updateBlog={updateBlog}
            user={user}
            deleteBlog={deleteBlog}
          />
        ))}
      </div>
    )
  }
}

export default App
