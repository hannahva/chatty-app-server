const express = require("express");
const SocketServer = require("ws").Server;
const uuidv4 = require("uuid/v4");

const PORT = 3001;

const server = express()
  .use(express.static("public"))
  .listen(PORT, "0.0.0.0", "localhost", () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

//takes in client messages/notifications
//changes their types and gives id's to them
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
  messageObj.id = uuidv4();
  return messageObj;
}

//sends back out data
//(ie messageObj or clientSize below)
//to each client online
const broadcast = (data) => {
  const dataString = JSON.stringify(data);

  wss.clients.forEach((client) => {
    client.send(dataString);
  });
};

// determines number of clients online
//and sends back to users, to display
//number of users online
const clientUpdated = () => {
  const clientSize = {
    type: "clientUpdated",
    content: wss.clients.size
  };
  broadcast(clientSize);
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  clientUpdated();

  ws.onmessage = (event) => {
    broadcast(handleMessage(event.data));
  };

  ws.on("close", () => {
    clientUpdated();
    console.log("Client disconnected")
  });
});


