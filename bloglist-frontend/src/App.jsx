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
import {
  initializeBlogs,
  createBlogSync,
  updateBlogSync,
  deleteBlogSync,
} from "./reducers/blogReducer"
import { setUser } from "./reducers/userReducer"
import userService from "./services/users"
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useMatch,
} from "react-router-dom"
import UserList from "./components/UserList"
import User from "./components/User"
import BlogDetail from "./components/BlogDetail"
import Navigation from "./components/Navigation"

const App = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [users, setUsers] = useState([])
  const blogFormRef = useRef()
  const dispatch = useDispatch()
  const blogs = useSelector((state) => state.blogs)
  const user = useSelector((state) => state.user)

  const userMatch = useMatch("/users/:id")
  const pageUser = userMatch
    ? users.find((user) => user.id === userMatch.params.id)
    : null

  const blogMatch = useMatch("/blogs/:id")
  const pageBlog = blogMatch
    ? blogs.find((blog) => blog.id === blogMatch.params.id)
    : null

  useEffect(() => {
    dispatch(initializeBlogs())
    const loggedUserJSON = window.localStorage.getItem("loggedUser")
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      dispatch(setUser(user))
      blogService.setToken(user.token)
      userService.getAll().then((response) => {
        setUsers(response)
      })
    }
  }, [dispatch])

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

  const Home = () => {
    return (
      <div>
        <Togglable buttonLabel="new blog" ref={blogFormRef}>
          <h2>create new</h2>
          <BlogForm createBlog={createBlog} />
        </Togglable>
        {blogs.map((blog) => (
          <Blog key={blog.id} blog={blog} />
        ))}
      </div>
    )
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
        <Navigation />
        <Notification />
        <h2>Blogs app</h2> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<UserList users={users} />} />
          <Route path="/users/:id" element={<User user={pageUser} />} />
          <Route
            path="/blogs/:id"
            element={<BlogDetail blog={pageBlog} user={user} />}
          />
        </Routes>
      </div>
    )
  }
}

export default App
