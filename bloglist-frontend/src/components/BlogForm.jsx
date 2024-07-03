import { useState } from "react"
import { useDispatch } from "react-redux"
import {showNotification, showError} from "../reducers/notificationReducer"

const BlogForm = ({ createBlog}) => {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [url, setUrl] = useState("")
  const dispatch = useDispatch()

  const addBlog = async (event) => {
    event.preventDefault()
    const blogObject = {
      title: title,
      author: author,
      url: url,
    }

    try {
      createBlog(blogObject)
      dispatch(showNotification(`a new blog '${title}' by '${author}' added`, 5))
      setAuthor("")
      setTitle("")
      setUrl("")
    } catch {
      dispatch(showError("Unknown error happens!", 5))
    }
  }
  return (
    <form onSubmit={addBlog}>
      <div>
        title:
        <input
          data-testid='title'
          value={title}
          onChange={({ target }) => setTitle(target.value)}
          placeholder="title input"
        />
      </div>
      <div>
        author:
        <input
          data-testid='author'
          value={author}
          onChange={({ target }) => setAuthor(target.value)}
          placeholder="author input"
        />
      </div>
      <div>
        url:
        <input
          data-testid='url'
          value={url}
          onChange={({ target }) => setUrl(target.value)}
          placeholder="url input"
        />
      </div>
      <button type="submit">create</button>
    </form>
  )
}

export default BlogForm
