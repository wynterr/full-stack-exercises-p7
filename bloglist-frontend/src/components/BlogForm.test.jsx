import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import BlogForm from "./BlogForm"

describe("<BlogForm />", () => {
  let container
  const createBlog = vi.fn()
  beforeEach(() => {
    render(
      <BlogForm
        createBlog={createBlog}
      />
    )
  })
  test("calls createBlog with the right details when a new blog is created", async () => {
    const titleInput = screen.getByPlaceholderText("title input")
    const authorInput = screen.getByPlaceholderText("author input")
    const urlInput = screen.getByPlaceholderText("url input")
    const createButton = screen.getByText("create")

    const user = userEvent.setup()

    await user.type(titleInput, "Test Title")
    await user.type(authorInput, "Test Author")
    await user.type(urlInput, "http://testurl.com")
    await user.click(createButton)

    expect(createBlog.mock.calls).toHaveLength(1)
    expect(createBlog.mock.calls[0][0]).toEqual({
      title: "Test Title",
      author: "Test Author",
      url: "http://testurl.com",
    })
  })
})
