const express = require("express");
// const storiesRouter = require("./routes/storiesRouter")
const postsRouter = require("./routes/postsRouter");
const usersRouter = require("./routes/usersRouter");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const rateLimit = require("express-rate-limit");
// const helmet = require("helmet");
// const mongoSanitize = require("express-mongo-sanitize");
// const xss = require("xss-clean");

const app = express();

// cookieParser middleware
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);


// Set security HTTP header
// app.use(helmet());

//Limit request from an IP
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many request from this IP, please try again after an hour",
// });
// app.use("/api", limiter);

//Body Parser, reading data from body into req.body
app.use(express.json());

//Data sanitization against NoSql query injection
// app.use(mongoSanitize());

//Data sanitization against XSS
// app.use(xss());

//Serving static file
app.use(express.static(`${__dirname}/public`));

// app.use("/api/v1/stories", storiesRouter);
app.use("/api/v1/posts", postsRouter);
app.use("/api/v1/users", usersRouter);

app.get("/", (req, res) => {
  res.end("Hello from server");
});

app.all('*',(req,res,next)=>{
  res.end("404 ERROR PAGE")
})

module.exports = app;

//express-rate-limit
//helmet
//express-mongo-sanatize
//xss-clean
