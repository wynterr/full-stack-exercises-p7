const lodash = require('lodash');

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return null
  
    return blogs.reduce((favorite, blog) => {
        return blog.likes > favorite.likes ? blog : favorite
    })
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return null;
  
    const authorCounts = lodash.countBy(blogs, 'author')
    const maxAuthor = lodash.maxBy(lodash.keys(authorCounts), (author) => authorCounts[author])
  
    return {
      author: maxAuthor,
      blogs: authorCounts[maxAuthor]
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return null;
  
    const authorLikes = lodash(blogs)
      .groupBy('author')
      .map((authorBlogs, author) => ({
        author: author,
        likes: lodash.sumBy(authorBlogs, 'likes')
      }))
      .value()
  
    return lodash.maxBy(authorLikes, 'likes')
}
  

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}