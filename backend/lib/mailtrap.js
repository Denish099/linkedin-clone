import { MailtrapClient } from "mailtrap";
import { config } from "dotenv";
config();

const TOKEN = process.env.MAILTRAP_TOKEN;

export const Client = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: process.env.EMAIL,
  name: process.env.EMAILPERSONNAME,
};
