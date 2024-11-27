import Express, { Request } from "express";
import { createServer, IncomingMessage } from "http";
import WebSocket from "ws";
import ExpressSession from "express-session";

const map = new Map();

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export function startExpressServer() {
  console.log("Initialzing express session");
  const sessionParser = ExpressSession({
    saveUninitialized: false,
    secret: "$ecurity",
    resave: false,
  });
  console.log("Creating express server");
  const app = Express();
  const server = createServer(app);
  const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

  server.on("upgrade", function (request: IncomingMessage & Request, socket, head) {
    console.log("Parsing session from request...");

    sessionParser(request, {} as any, () => {
      if (!request.session.userId) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      console.log("Session is parsed!");

      wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit("connection", ws, request);
      });
    });
  });

  app.use(Express.static("./public"));
  app.use(sessionParser);

  app.post("/login", function (req, res) {
    //
    // "Log in" user and set userId to session.
    //
    const id = "1";

    console.log(`Updating session for user ${id}`);
    req.session.userId = id;
    res.send({ result: "OK", message: "Session updated" });
  });

  app.delete("/logout", function (request, response) {
    const ws = map.get(request.session.userId);

    console.log("Destroying session");
    request.session.destroy(function () {
      if (ws) ws.close();

      response.send({ result: "OK", message: "Session destroyed" });
    });
  });

  wss.on("connection", (ws, req: IncomingMessage & Request) => {
    const userId = req.session.userId;

    map.set(userId, ws);

    ws.on("message", function (message) {
      //
      // Here we can now use session parameters.
      //
      console.log(`Received message ${message} from user ${userId}`);
    });

    ws.on("close", function () {
      map.delete(userId);
    });
  });

  server.on("error", (err) => {
    console.error(err);
  });

  return server.listen(3000);
}
