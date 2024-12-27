const express = require("express");
const router = express.Router();
const userController = require("./User.Controller");
const { uploadMiddleware } = require("../../config/multer");

router.post("/userSignup", userController.userSignup);
router.post("/userLogin", userController.userLogin);
router.post("/forgetPassword", userController.forgetPassword);
router.post("/verifyOtp", userController.verifyOTP);
router.post("/resetPassword", userController.resetPassword);

router.post("/addNotes", userController.addNotes);
router.get("/getNotes", userController.getNotes);
router.delete("/deleteNotes/:id", userController.deleteNotes);
router.put("/updateNotes/:id", userController.updateNote);

// router.post("/addBrew", userController.addBrew);
router.post(
  "/addBrew",
  uploadMiddleware.single("image"),
  userController.addBrew
);
router.delete("/deleteBrew/:id", userController.deleteBrew);
router.get("/getBrew/:slug", userController.getBrew);
router.get("/getAllBrew", userController.getAllBrew);

module.exports = router;
