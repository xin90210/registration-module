const http = require('http')
const server = http.createServer(requestHandler)
require('dotenv').config()
const db = require('./mySqlClient.js')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { nextTick } = require('process')

module.exports = server

function requestHandler(request, response) {
    if (request.url == '/') {
        fs.readFile('./front/index.html', (err, data) => {
            if (err) {
                console.error(err)
                response.statusCode = 400
                response.end('Server error')
            } else {
                response.end(data)
            }
        })
    } else if (request.url == '/users') {

        const authHeader = request.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]
        if (!token) {
            response.statusCode = 403
            response.end(JSON.stringify({ error: 'Token not found' }))
            return
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                response.statusCode = 403
                response.end(JSON.stringify({ error: 'Token not found' }))
                return
            }
            const sql = "SELECT `name`, `login` FROM users"
            db.query(sql, (err, data) => {
                if (err) {
                    console.error(err)
                    response.statusCode = 400
                    response.end(JSON.stringify({ error: 'db error' }))
                } else {
                    response.end(JSON.stringify(data))
                }
            })
        })


    } else if (request.url == '/newuser' && request.method == 'POST') {
        receiveToString(request)
            .then(json => JSON.parse(json))
            .then(user => Promise.all([user, bcrypt.genSalt()]))
            .then(([user, salt]) => Promise.all([user, bcrypt.hash(user.password, salt)]))
            .then(([{ name, login }, hash]) => {
                const sql = `INSERT INTO users (name, login, pass_hash) VALUE ("${name}", "${login}", "${hash}")`
                db.query(sql, (err, data) => {
                    if (err) {
                        console.error(err)
                        response.statusCode = 400
                        response.end('{"error": "db error"}')
                    } else response.end(JSON.stringify(data))
                })
            })

    } else if (request.url.startsWith('/check/')) {
        const login = request.url.match(/[^\/]+$/)[0]

        const sql = "SELECT * FROM `users` WHERE `login` = '" + login + "'"
        db.query(sql, (err, data) => {
            if (err) {
                console.error(err)
                response.statusCode = 400
                response.end('{"error": "db error"}')
            } else {
                response.end(data.length ? "occupied" : 'free')
            }
        })
    } else if (request.url == '/login' && request.method == 'POST') {

        receiveToString(request).then(json => {
            const user = JSON.parse(json)

            const sql = "SELECT pass_hash FROM `users` WHERE `login` = '" + user.login + "'"
            db.query(sql, (err, data) => {
                if (err) {
                    console.error(err)
                    response.statusCode = 400
                    response.end(JSON.stringify({ error: 'db error' }))
                } else {
                    if (!data.length) {
                        response.end(JSON.stringify({ error: 'User not found' }))
                        return
                    }
                    bcrypt.compare(user.password, data[0].pass_hash).then(correct => {
                        if (!correct) {
                            response.end(JSON.stringify({ error: 'Incorrect password' }))
                            return
                        }
                        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
                        response.end(JSON.stringify({ accessToken }))
                    })
                }


            })
        })
    } else {
        fs.readFile('./front' + request.url, (err, data) => {
            if (err) {
                console.error(err)
                response.statusCode = 404
                response.end('404 file not found')
            } else {
                if (request.url.endsWith('.css')) {
                    response.setHeader('Content-Type', 'text/css')
                }
                response.end(data)
            }
        })

        // response.statusCode = 400
        // response.end('Server error')
    }

}

function receiveToString(body, parts = []) {
    return new Promise((resolve, reject) => body
        .on('data', part => parts.push(part))
        .on('end', () => resolve(Buffer.concat(parts).toString('utf8')))
        .on('error', reject))
}