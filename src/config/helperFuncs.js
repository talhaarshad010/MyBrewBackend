const crypto = require("crypto");
const generateSlug = () => {
  return crypto.randomBytes(3).toString("hex");
};
export default generateSlug;
