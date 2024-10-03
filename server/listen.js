const server = require('./server'); // Import the server
const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
