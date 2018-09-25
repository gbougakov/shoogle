const net = require('net')
const fs = require('fs')
let google = require('google')

google.resultsPerPage = 5
let nextCounter = 0


let sockets = []

/*
 * Cleans the input of carriage return, newline
 */
function cleanInput (data) {
  return data.toString().replace(/(\r\n|\n|\r)/gm, '')
}

/*
 * Method executed when data is received from a socket
 */
function receiveData (socket, data) {
  const cleanData = cleanInput(data)
  if (cleanData === '@quit') {
    socket.end('Goodbye!\n')
  }
  else {
    socket.write('Loading...\n')
    google(cleanData, function (err, res) {
      console.log(res.links)
      for (let i in res.links) {
        socket.write('Title:        ' + res.links[i].title + '\n')
        socket.write('Description:  ' + res.links[i].description + '\n')
        socket.write('Link:         ' + res.links[i].href + '\n')
        socket.write('\n')
      }
      socket.write('\n> ')
    })
  }
}

/*
 * Method executed when a socket ends
 */
function closeSocket (socket) {
  const i = sockets.indexOf(socket)
  if (i != -1) {
    sockets.splice(i, 1)
  }
}

/*
 * Callback method executed when a new TCP socket is opened.
 */
function newSocket (socket) {
  sockets.push(socket)
  socket.write(fs.readFileSync('shooglart.txt', {
    encoding: 'utf8'
  }))
  socket.write('\n\nWelcome to the Shoogle! To search for something, type it and hit "Enter". If you want to quit,' +
    ' type "@quit" and hit "Enter"\n\n> ')
  socket.on('data', function (data) {
    receiveData(socket, data)
  })
  socket.on('end', function () {
    closeSocket(socket)
  })
}

// Create a new server and provide a callback for when a connection occurs
const server = net.createServer(newSocket)

// Listen on port 8888
server.listen(23)