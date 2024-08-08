const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);

const port = 3000;
const hostname = "localhost";

app.use(express.static("public"));

require("./websocket")(app);

app.listen(port, hostname, () => {
	console.log(`Listening at: http://${hostname}:${port}`);
	console.log(`Websocket server(s) running on: ws://${hostname}:${port}/:lobbyCode`);
});
