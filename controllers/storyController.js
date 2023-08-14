// const Story = require("../model/storyModel");

// exports.getAllStories = async (req, res) => {
//   try {
//     const stories = Story.find();

//     res.status(200).json({
//       status: "success",
//       results: stories.length,
//       data: {
//         stories,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };

// exports.createStory = async (req, res) => {
//   try {
//     const newStory = await Story.create(req.body);

//     res.status(201).json({
//       status: "success",
//       data: {
//         stories: newStory,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };

// exports.getStory = async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);

//     res.status(200).json({
//       status: "success",
//       data: {
//         story,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };

// exports.deleteStory = async (req, res) => {
//   try {
//     await Story.findByIdAndDelete(req.params.id);

//     res.status(204).json({
//       status: "success",
//       data: null,
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };
