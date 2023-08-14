const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: Number,
    // required: true,
    unique: true,
  },
  caption: {
    type: String,
  },
  like: [
    {
      userId: {
        type: Number,
        unique: true,
      },
    },
  ],
  comment: [
    {
      userId: {
        type: Number,
        unique: true,
      },
      content: {
        type: String,
        // required: true,
      },
      likes: [
        {
          userId: {
            type: Number,
            unique: true,
          },
        },
      ],
      reply: [
        {
          userId: {
            type: Number,
            unique: true,
          },
          content: {
            type: String,
            // required: true,
          },
          like: [
            {
              userId: {
                type: Number,
                unique: true,
              },
            },
          ],
        },
      ],
    },
    // image:{},
  ],
    
});

const post = mongoose.model("Post", postSchema);
module.exports = post;
