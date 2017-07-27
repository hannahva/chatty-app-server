const express = require('express');
const SocketServer = require('ws').Server;
const uuidv4 = require('uuid/v4');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
const handleMessage = (messageString) => {
  const messageObj = JSON.parse(messageString);
  switch(messageObj.type) {
    case "postMessage":
      messageObj.type = "incomingMessage"
      break;
    case "postNotification":
      messageObj.type = "incomingNotification"
      break;
  }
  messageObj["id"] = uuidv4();
  return JSON.stringify(messageObj);
}

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    client.send(data);
  });
};

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.onmessage = (event) => {
    broadcast(handleMessage(event.data));
  };


  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
});