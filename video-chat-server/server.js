const express = require('express');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.send('PeerJS server running');
});
