const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)

})
  
blogsRouter.post('/', async (request, response) => {
    const body = request.body
    if (!request.user) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(request.user.id)
    
    const blog = new Blog({
      ...body,
      user: user._id,
    })

    const savedBlog = await blog.save()
    const populatedBlog = await savedBlog.populate('user', { username: 1, name: 1 })
    user.blogs = user.blogs.concat(populatedBlog._id)
    await user.save()
    response.status(201).json(populatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!request.user || request.user.id.toString() !== blog.user.toString()){
    return response.status(401).json({ error: 'token invalid' })
  }
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: body.user
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true }).populate('user', { username: 1, name: 1 })
  response.json(updatedBlog)
})


module.exports = blogsRouter