import { useDispatch} from 'react-redux'
import { updateBlogSync, deleteBlogSync } from '../reducers/blogReducer'
import { useNavigate } from 'react-router-dom'

const BlogDetail = ({blog, user}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  if (!blog) {
    return null
  }

  const handleLike = () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id,
    }
    dispatch(updateBlogSync(updatedBlog))
  }

  const handleDelete = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      dispatch(deleteBlogSync(blog.id))
      navigate('/')
    }
  }

  const removeButtonStyle = {
    backgroundColor: 'blue',
    color: 'white',
    padding: '5px 10px',
    cursor: 'pointer',
  }

  return (
    <div>
      <h2>{blog.title} {blog.author} </h2>
      <a href={blog.url} target="_blank" rel="noopener noreferrer">{blog.url}</a>
      <p>
        likes {blog.likes}
        <button onClick={handleLike}>like</button>
      </p>
      <p>added by {blog.user.name}</p>
      {blog.user.id === user.id && (
        <button style={removeButtonStyle} onClick={handleDelete}>
          remove
        </button>
      )}
    </div>
  )
}

export default BlogDetail
