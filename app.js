const express = require("express");
// const storiesRouter = require("./routes/storiesRouter")
const postsRouter = require("./routes/postsRouter");
const usersRouter = require("./routes/usersRouter");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// app.use("/api/v1/stories", storiesRouter);
app.use("/api/v1/posts", postsRouter);
app.use("/api/v1/users", usersRouter);
app.get("/", (req, res) => {
  res.end("Hello from server");
});
app.all("*", (req, res, next) => {
  res.end("404 ERROR PAGE");
});

module.exports = app;
