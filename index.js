require("dotenv").config();
const express = require("express");
const app = express();
const Port = process.env.PORT;
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
require("./src/config/Db");
app.get("/", (req, res) => {
  console.log("Brew is running Ok");
  res.send("Brew is running Ok");
});

app.use("/", require("./src/routes/User_Controller/User.Routes"));
app.listen(Port, () => {
  console.log(`Server is listening at http://localhost:${Port}`);
});
