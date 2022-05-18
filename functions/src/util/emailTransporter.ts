import { createTransport } from "nodemailer";

export default createTransport({
  service: "gmail",
  auth: {
    user: "brunyeeb@gmail.com",
    pass: "wvwksccppjnumtgl",
  },
});
