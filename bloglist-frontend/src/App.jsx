import { useState, useEffect, useRef } from "react"
import Blog from "./components/Blog"
import LoginForm from "./components/LoginForm"
import Notification from "./components/Notification"
import blogService from "./services/blogs"
import loginService from "./services/login"
import BlogForm from "./components/BlogForm"
import Togglable from "./components/togglable"
import { showError } from "./reducers/notificationReducer"
import { useDispatch } from "react-redux"

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState(null)
  const blogFormRef = useRef()
  const dispatch = useDispatch()

  useEffect(() => {
    blogService
      .getAll()
      .then((blogs) => setBlogs(blogs.sort((a, b) => b.likes - a.likes)))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedUser")
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
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
      setUser(user)
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
    setUser(null)
    blogService.setToken(null)
  }

  const createBlog = async (blogObject) => {
    blogFormRef.current.toggleVisibility()
    const returnedBlog = await blogService.create(blogObject)
    console.log(returnedBlog)
    setBlogs(blogs.concat(returnedBlog).sort((a, b) => b.likes - a.likes))
    return returnedBlog
  }

  const updateBlog = async (blogObject) => {
    const returnedBlog = await blogService.update(blogObject.id, blogObject)
    setBlogs(
      blogs
        .map((blog) => (blog.id !== blogObject.id ? blog : returnedBlog))
        .sort((a, b) => b.likes - a.likes)
    )
    return returnedBlog
  }

  const deleteBlog = async (id) => {
    await blogService.remove(id)
    setBlogs(blogs.filter((blog) => blog.id !== id))
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
