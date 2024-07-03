import { useState } from "react"

const Blog = ({ blog, updateBlog, user, deleteBlog }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLike = async () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id,
    }

    updateBlog(updatedBlog)
  }

  const handleDelete = async () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      deleteBlog(blog.id)
    }
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  }

  const removeButtonStyle = {
    backgroundColor: "blue",
    color: "white",
    padding: "5px 10px",
    cursor: "pointer",
  }

  return (
    <div style={blogStyle} className="blogPreview" data-testid="blog">
      <div>
        {blog.title} {visible ? "" : blog.author}{" "}
        <button onClick={toggleVisibility}>{visible ? "hide" : "view"}</button>
      </div>
      {visible && (
        <div className="blogDetails">
          <p>{blog.url}</p>
          <p>
            likes {blog.likes}
            <button onClick={handleLike}>like</button>
          </p>
          <p>{blog.author}</p>

          {blog.user.id === user.id && (
            <button style={removeButtonStyle} onClick={handleDelete}>
              remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog
