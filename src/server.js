import http from "http";
import WebSocket from "ws";
import express from "express";
import livereloadMiddleware from "connect-livereload";
import livereload from "livereload";

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Browser ✅");
  socket.on("close", () => {
    console.log("Disconnected to the Browser ❌");
  });
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
        break;
      case "nickname":
        socket["nickname"] = message.payload;
        break;
    }
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
server.listen(3000, handleListen);

const liveServer = livereload.createServer({
  exts: ["js", "pug", "css"],
  delay: 1000,
});
liveServer.watch(__dirname);
app.use(livereloadMiddleware());

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));
