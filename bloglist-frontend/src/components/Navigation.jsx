import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setUser } from "../reducers/userReducer"
import blogService from "../services/blogs"

const Navigation = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)

  const handleLogout = () => {
    window.localStorage.removeItem("loggedUser")
    dispatch(setUser(null))
    blogService.setToken(null)
  }

  return (
    <nav>
      <Link to="/">blogs</Link>
      {"  |  "}
      <Link to="/users">users</Link>
      {"  |  "}
      {user ? (
        <>
          <span>{user.name} logged in</span>
          <button onClick={handleLogout}>logout</button>
        </>
      ) : (
        <p>You haven't logged in</p>
      )}
    </nav>
  )
}

export default Navigation
