const http = require('http')
const express = require('express')
const es6Renderer = require('express-es6-template-engine')
const pgPromise = require('pg-promise')()
const bodyParser = require('body-parser')

const hostname = 'localhost'
const port = 3000
const config = {
    host: "localhost",
    port: 5432,
    database: "bloganon",
    user: "postgres",
}

const app = express()
const server = http.createServer(app)
const db = pgPromise(config)
const path = require('path')
app.engine('html', es6Renderer)
app.set('views', 'templates')
app.set('view engine', 'html')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(("./public")))



app.get('/', (req, res) => {
    res.render("layout", {
        partials: {
            body: "partials/home"
        },
        locals: {
            title: "Welcome to Bloggy!"
        }
    })
})

app.get('/search', (req, res) => {
    res.render("layout", {
        partials: {
            body: "partials/search"
        },
        locals: {
            title: "Welcome to Blog Anonymous!"
        }
    })
})

app.get('/blog', (req, res) => {
    db.query('SELECT * FROM posts;')
        .then((results) => {
            res.render('layout', {
                partials: {
                    body: 'partials/blog'
                },
                locals: {
                    title: 'Blog list!',
                    posts: results
                }
            })
        })
})

app.get('/blog_new', (req, res) => {
    res.render('layout', {
        partials: {
            body: 'partials/blog-form'
        },
        locals: {
            title: 'Add your blog'
        }
    })
})
app.post('/blog_new', (req, res) => {
    const title = req.body.title
    const body = req.body.body
    console.log(req.body.body)
    db.query("INSERT INTO posts (title, body) VALUES ($1, $2)", [title, body])
        .then(() => {
            return res.redirect('/blog')
        })
        .catch((err) => {
            console.log(err)
            res.send('no way jose!')
        })
})
app.get('/blogs/:id', (req, res) => {
    const id = req.params.id
    db.oneOrNone('SELECT * FROM posts WHERE id = $1', [id])
        .then(posts => {
            if (!posts) {
                res.status(404).json({ error: 'post not found' })
                return
            }
            res.render('layout', {
                partials: {
                    body: 'partials/blog-details'
                },
                locals: {
                    title: posts.title,
                    posts
                }
            })
        })
        .catch((e) => {
            console.log(e)
            res.status(400).json({ error: 'invalid id' })
        })
})

app.get('*', (req, res) => {
    res.status(404).send('404 Not Found')
})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})