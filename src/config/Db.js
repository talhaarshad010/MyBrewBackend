const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}

main()
  .then(() => {
    console.log("Data Base is connected");
  })
  .catch((err) => {
    console.log(err);
  });
