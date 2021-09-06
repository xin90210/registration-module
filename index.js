const server = require('./back/server.js')

server.listen(process.env.PORT || 3000, () => console.log('Server started' + (process.env.PORT ? '' : ' at http://localhost:3000' )))
