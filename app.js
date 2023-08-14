const express = require("express");
// const storiesRouter = require("./routes/storiesRouter")
const postsRouter = require("./routes/postsRouter")
const usersRouter = require("./routes/usersRouter")


const app = express();
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// app.use("/api/v1/stories", storiesRouter);
app.use("/api/v1/posts", postsRouter);
app.use("/api/v1/users", usersRouter);

app.get("/", (req, res) => {
  res.end("Hello from server");
});

module.exports = app;
