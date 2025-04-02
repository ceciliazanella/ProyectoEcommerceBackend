import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPass = process.env.ADMIN_PASSWORD;
const twilioId = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

export const options = {
  server: {
    port,
  },
  gmail: {
    adminEmail,
    adminPass,
  },
  twilio: {
    twilioId,
    twilioToken,
    twilioPhone,
  },
};
