const { describe, test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

const User = require('../models/user')
const Blog = require('../models/blog')

describe('when there are initially some blogs saved', () => {
    beforeEach(async () => {
        await User.deleteMany({})
  
        const passwordHashRoot = await bcrypt.hash('sekret', 10)
        const rootUser = new User({ username: 'root', passwordHash: passwordHashRoot })
        await rootUser.save()

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'user', passwordHash: passwordHash })
        await user.save()


        await Blog.deleteMany({})

        const blogsWithUsers = helper.initialBlogs.map(blog => ({
            ...blog,
            user: rootUser._id
        }))
        await Blog.insertMany(blogsWithUsers)
    })
  
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
  
    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })
  
    test('the unique identifier property of the blog posts is named id', async () => {
        const response = await api.get('/api/blogs')
        response.body.forEach(blog => {
            assert.strictEqual(blog.hasOwnProperty('id'), true)
            assert.strictEqual(blog.hasOwnProperty('_id'), false)
        })
    })
    describe('addition of a new blog', () => {
        test('succeeds with valid data', async () => {
            const resp = await api
                .post('/api/login')
                .send({
                    username: "root",
                    password: "sekret"
                })
            const token = resp.body.token
            const newBlog = {
                title: "Valid blog",
                author: "Michael Jackson",
                url: "https://goodblog.com/",
                likes: 5
            }
  
            await api
                .post('/api/blogs')
                .set('Authorization', 'Bearer ' + token)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)
  
            const response = await api.get('/api/blogs')
            const contents = response.body.map(r => r.title)
            assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
            assert(contents.includes('Valid blog'))
        })
  
        test('if the likes property is missing, it defaults to 0', async () => {
            const resp = await api
                .post('/api/login')
                .send({
                    username: "root",
                    password: "sekret"
                })
            const token = resp.body.token
            const newBlog = {
                title: "Valid blog",
                author: "Michael Jackson",
                url: "https://goodblog.com/"
            }
    
            const postResponse = await api
                .post('/api/blogs')
                .set('Authorization', 'Bearer ' + token)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)
    
            assert.strictEqual(postResponse.body.likes, 0)
    
            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

        })
  
        test('fails with status code 400 if title is missing', async () => {
            const resp = await api
                .post('/api/login')
                .send({
                    username: "root",
                    password: "sekret"
                })
            const token = resp.body.token
            const newBlog = {
                author: "No Title",
                url: "https://goodblog.com/",
                likes: 1
            }
    
            await api
                .post('/api/blogs')
                .set('Authorization', 'Bearer ' + token)
                .send(newBlog)
                .expect(400)
    
            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body.length, helper.initialBlogs.length)
        })
  
        test('fails with status code 400 if url is missing', async () => {
            const resp = await api
                .post('/api/login')
                .send({
                    username: "root",
                    password: "sekret"
                })
            const token = resp.body.token
            const newBlog = {
                title: "No URL",
                author: "God",
                likes: 12
            }
    
            await api
                .post('/api/blogs')
                .set('Authorization', 'Bearer ' + token)
                .send(newBlog)
                .expect(400)
    
            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body.length, helper.initialBlogs.length)
        })

        test('fails with status code 401 if token not provided', async () => {
            const newBlog = {
                title: "Yes URL",
                url: "https://goodblog.com/",
                author: "God",
                likes: 12
            }
    
            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(401)
    
            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body.length, helper.initialBlogs.length)
        })
    })
    describe('deletion of a blog', () => {
        test('succeeds with status code 204 if id is valid', async () => {
            const resp = await api
                .post('/api/login')
                .send({
                    username: "root",
                    password: "sekret"
                })
            const token = resp.body.token
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]
    
            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set('Authorization', 'Bearer ' + token)
                .expect(204)
    
            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    
            const titles = blogsAtEnd.map(r => r.title)
            assert(!titles.includes(blogToDelete.title))
        })
    })
    describe('updating a blog', () => {
        test('succeeds with valid data', async () => {
            const resp = await api
                .post('/api/login')
                .send({
                    username: "root",
                    password: "sekret"
                })
            const token = resp.body.token
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]

            const updatedBlogData = {
                title: blogToUpdate.title,
                author: blogToUpdate.author,
                url: blogToUpdate.url,
                likes: blogToUpdate.likes + 1
            }

            const updatedBlog = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .set('Authorization', 'Bearer ' + token)
                .send(updatedBlogData)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            assert.strictEqual(updatedBlog.body.likes, blogToUpdate.likes + 1)

            const blogsAtEnd = await helper.blogsInDb()
            const updatedBlogFromDb = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
            assert.strictEqual(updatedBlogFromDb.likes, blogToUpdate.likes + 1)
        })
    })
})

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })
  
    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))
  
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with proper status code and message if username is too short', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
          username: 'te',
          name: 'tttt',
          password: 'pwddd',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        assert.strictEqual(result.body.error, 'username and password must be at least 3 characters long')
    
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      })
    
      test('creation fails with proper status code and message if password is too short', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
          username: 'test',
          name: 'testname',
          password: 'pw',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        assert.strictEqual(result.body.error, 'username and password must be at least 3 characters long')
    
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      })
    
      test('creation fails with proper status code and message if username or password is missing', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUserWithoutUsername = {
          name: 'test',
          password: 'pwddd',
        }
    
        const resultWithoutUsername = await api
          .post('/api/users')
          .send(newUserWithoutUsername)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        assert.strictEqual(resultWithoutUsername.body.error, 'username and password are required')
    
        const newUserWithoutPassword = {
          username: 'validusername',
          name: 'Missing Password',
        }
    
        const resultWithoutPassword = await api
          .post('/api/users')
          .send(newUserWithoutPassword)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        assert.strictEqual(resultWithoutPassword.body.error, 'username and password are required')
    
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      })
})

after(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
})