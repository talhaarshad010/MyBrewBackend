const userSchema = require("../../model/User");
const bcrypt = require("bcrypt");
const { parse } = require("dotenv");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../utils/helperFunction");
const Note = require("../../model/notes");
const Brew = require("../../model/brews");
const crypto = require("crypto");

const userSignup = async (req, res) => {
  const { isEmail, isPassword } = req.body;

  try {
    const user = await userSchema.findOne({ isEmail: isEmail });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(isPassword, salt);

      const newUser = await userSchema.create({
        ...req.body,
        isPassword: hashedPassword,
      });

      console.log("ghghgh", newUser);

      res.status(200).json({
        status: "Success",
        data: newUser,
      });
    } else {
      res.status(400).json({
        status: "Failed",
        message: "User already exists",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      error: error,
      message: error?.message,
    });
  }
};

const userLogin = async (req, res) => {
  const { isEmail, isPassword } = req.body;
  try {
    const user = await userSchema.findOne({ isEmail: isEmail });

    if (!!user) {
      const isMatch = await bcrypt.compare(isPassword, user.isPassword);

      if (!!isMatch) {
        const token = jwt.sign(
          {
            id: user._id,
            isEmail: user.isEmail,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        user.isToken = token;
        await user.save();
        const copyUser = await JSON.parse(JSON.stringify(user));
        copyUser.isToken = token;
        delete copyUser.isPassword;

        res.status(200).json({
          status: "Success",
          data: copyUser,
        });
      } else {
        // If password doesn't match
        res.status(400).json({
          status: "Failed",
          message: "Invalid Email/Password",
        });
      }
    } else {
      // If user is not found
      res.status(400).json({
        status: "Failed",
        message: "Invalid Email/Password",
      });
    }
  } catch (error) {
    // Catch any unexpected errors
    res.status(500).json({
      status: "Failed",
      error: error,
      message: error?.message,
    });
  }
};
const forgetPassword = async (req, res) => {
  const { isEmail } = req.body;
  try {
    const findUser = await userSchema.findOne({ isEmail: isEmail });
    if (!!findUser) {
      const { _id, isName, isEmail } = findUser;

      const Random = "0123456789";
      let code = "";
      for (let i = 0; i < 4; i++) {
        code += Random[Math.floor(Math.random() * Random.length)];
      }

      const expiryDate = new Date(Date.now() + 120000);
      const UpdateUser = await userSchema.updateOne(
        { _id },
        {
          $set: {
            resetPasswordVerificationCode: code,
            resetcodeExpiry: expiryDate,
          },
        }
      );

      if (!!UpdateUser) {
        const htmlEmail = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Dear ${isName},</p>
            <p>Here is your verification code to reset your password. Please use it within the next 2 minutes.</p>
            <hr>
            <p><strong>Verification Code:</strong> ${code}</p>
            <hr>
            <p>If you didn't request this verification code, please ignore this message.</p>
            <br>
            <p>Best regards,<br>My-Brew Support Team</p>
        </body>
        </html>
        `;

        const mailContent = {
          from: "abdul.basit@logicloopsolutions.net", //Sender
          to: isEmail, //Reciever//,
          subject: "Verification Code - My-Brew ",
          html: htmlEmail,
        };
        sendEmail(mailContent);
        console.log(code);
        res.status(200).json({
          message: "Code Sent",
          status: true,
          data: {
            id: _id,
            email: isEmail,
          },
        });
      }
    } else {
      res.status(403).json({
        message: "Can't find user",
        status: false,
      });
    }
  } catch (error) {
    res.status(403).json({
      error: error,
      status: false,
    });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userSchema.findOne({ isEmail: email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    if (
      user.resetPasswordVerificationCode === otp &&
      new Date() < new Date(user.resetcodeExpiry)
    ) {
      await userSchema.updateOne(
        { isEmail: email },
        {
          $set: {
            resetPasswordVerificationCode: null,
            resetcodeExpiry: null,
          },
        }
      );

      return res.status(200).json({
        message: "OTP verified successfully",
        status: true,
      });
    }

    res.status(400).json({
      message: "Invalid or expired OTP",
      status: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying OTP",
      error: error.message,
      status: false,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, isPassword } = req.body;

    const findUser = await userSchema.findOne({ isEmail: email });
    if (findUser) {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(isPassword, salt);

      const result = await userSchema.updateOne(
        { isEmail: email },
        {
          $set: {
            isPassword: hash,
            resetPasswordVerificationCode: "",
            resetcodeExpiry: null,
          },
        }
      );

      if (result.modifiedCount > 0) {
        res.status(200).json({
          message: "Password Changed Successfully",
          status: true,
        });
      } else {
        res.status(500).json({
          message: "Failed to update password",
          status: false,
        });
      }
    } else {
      res.status(404).json({
        message: "Cannot Find User",
        status: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while resetting the password",
      error: error.message,
      status: false,
    });
  }
};

const addNotes = async (req, res) => {
  console.log("Request Body:", req.body);

  const { description, categorie, date, userId } = req.body;

  if (!description || !categorie || !userId) {
    return res
      .status(400)
      .json({ message: "Description, category, and user_id are required." });
  }

  try {
    const note = new Note({
      description: description,
      categorie: categorie,
      userId: userId,
      date: date || new Date(),
    });

    await note.save();

    res.status(201).json(note);
  } catch (error) {
    console.error("Error saving note:", error);
    res
      .status(500)
      .json({ message: "Error saving note", error: error.message });
  }
};
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find();

    if (!notes.length) {
      return res.status(404).json({ message: "No notes found." });
    }

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res
      .status(500)
      .json({ message: "Error fetching notes", error: error.message });
  }
};

const deleteNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    await Note.findByIdAndDelete(id);
    res.status(200).json({ message: "Note deleted successfully." });
  } catch (error) {
    console.error("Error deleting note:", error);
    res
      .status(500)
      .json({ message: "Error deleting note", error: error.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, categorie, date } = req.body;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    note.description = description || note.description;
    note.categorie = categorie || note.categorie;
    note.date = date || note.date;

    const updatedNote = await note.save();

    res
      .status(200)
      .json({ message: "Note updated successfully.", note: updatedNote });
  } catch (error) {
    console.error("Error updating note:", error);
    res
      .status(500)
      .json({ message: "Error updating note", error: error.message });
  }
};

// const addBrew = async (req, res) => {
//   console.log("API hit");
//   const { brewName, bottleSize, date, userId, status, description } = req.body;

//   if (!brewName || !bottleSize || !date) {
//     return res.status(400).json({ message: "All fields are required." });
//   }

//   const generateSlug = () => {
//     return crypto.randomBytes(3).toString("hex");
//   };

//   try {
//     const slug = generateSlug();
//     const shareableLink = `http://localhost:3000/products/getBrew/${slug}`;

//     const newBrew = await Brew.create({
//       brewName,
//       status,
//       description,
//       bottleSize,
//       date,
//       userId,
//       slug,
//       shareableLink,
//     });

//     console.log(shareableLink);
//     res.status(201).json({
//       message: "Recipe created successfully!",
//       recipe: newBrew,
//     });
//   } catch (error) {
//     console.error("Error creating brew:", error);
//     res.status(500).json({
//       message: "An error occurred while creating the recipe.",
//       error: error.message,
//     });
//   }
// };

const addBrew = async (req, res) => {
  console.log("API hit");
  console.log("File Received:", req.file);
  console.log("Body Received:", req.body);

  const { brewName, bottleSize, date, userId, status, description } = req.body;

  if (!brewName || !bottleSize || !date || !userId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Image is required." });
  }

  try {
    const generateSlug = () => crypto.randomBytes(3).toString("hex");
    const slug = generateSlug();
    const shareableLink = `http://localhost:3000/products/getBrew/${slug}`;

    const file = req.file;
    const imageUrl = file.location;

    console.log("Image URL to save:", imageUrl);

    const newBrew = await Brew.create({
      brewName: brewName,
      status: status,
      description: description,
      bottleSize: bottleSize,
      date: date,
      userId: userId,
      slug: slug,
      shareableLink: shareableLink,
      image: imageUrl,
    });

    console.log("Shareable Link:", shareableLink);

    // Respond with success
    res.status(201).json({
      message: "Recipe created successfully!",
      recipe: newBrew,
    });
  } catch (error) {
    console.error("Error creating brew:", error);
    res.status(500).json({
      message: "An error occurred while creating the recipe.",
      error: error.message,
    });
  }
};

const getBrew = async (req, res) => {
  const { slug } = req.params;

  try {
    const recipe = await Brew.findOne({ slug });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    res.json(recipe);
  } catch (error) {
    console.error("Error fetching the recipe:", error);
    res.status(500).json({
      message: "An error occurred while fetching the recipe.",
      error: error.message,
    });
  }
};

const getAllBrew = async (req, res) => {
  try {
    const AllBrews = await Brew.find();
    if (AllBrews.length === 0) {
      return res.status(404).json({
        message: "No brews found.",
      });
    }

    return res.status(200).json({
      message: "Brews retrieved successfully.",
      data: AllBrews,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while fetching the brews.",
      error: error.message,
    });
  }
};

const deleteBrew = async (req, res) => {
  console.log("Delete API hit");
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Brew ID is required." });
  }

  try {
    const brew = await Brew.findById(id);

    if (!brew) {
      return res.status(404).json({ message: "Brew not found." });
    }

    await Brew.findByIdAndDelete(id);

    res.status(200).json({
      message: "Brew deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting brew:", error);
    res.status(500).json({
      message: "An error occurred while deleting the brew.",
      error: error.message,
    });
  }
};

module.exports = {
  userSignup,
  userLogin,
  forgetPassword,
  verifyOTP,
  resetPassword,
  addNotes,
  deleteNotes,
  getNotes,
  updateNote,
  addBrew,
  getBrew,
  getAllBrew,
  deleteBrew,
};
