import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Blog from "./Blog"

describe("<Blog />", () => {
  let container
  const blog = {
    title: "Test title",
    author: "Test author",
    url: "http://test.com",
    likes: 0,
    user: {
      id: "12345",
      name: "Wentao",
      username: "wynter",
    },
  }

  const user = {
    id: "12345",
    name: "Wentao",
    username: "wynter",
  }

  const mockUpdateBlog = vi.fn()

  beforeEach(() => {
    container = render(
      <Blog
        blog={blog}
        user={user}
        updateBlog={mockUpdateBlog}
        deleteBlog={() => {}}
      />
    ).container
  })

  test("renders title and author, but does not render URL or likes by default", () => {
    const previewDiv = container.querySelector(".blogPreview")
    expect(previewDiv).toHaveTextContent(`${blog.title} ${blog.author}`)

    const detailsDiv = container.querySelector(".blogDetails")
    expect(detailsDiv).toBeNull()
  })

  test("after clicking the button, URL and likes are displayed", async () => {
    const user = userEvent.setup()
    const button = screen.getByText("view")
    await user.click(button)

    const detailsDiv = container.querySelector(".blogDetails")
    expect(detailsDiv).not.toHaveStyle("display: none")
    expect(detailsDiv).toHaveTextContent(blog.url)
    expect(detailsDiv).toHaveTextContent(`likes ${blog.likes}`)
  })

  test("if the like button is clicked twice, the event handler is called twice", async () => {
    const user = userEvent.setup()
    const viewButton = screen.getByText("view")
    await user.click(viewButton)

    const likeButton = screen.getByText("like")
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockUpdateBlog.mock.calls).toHaveLength(2)
  })
})
