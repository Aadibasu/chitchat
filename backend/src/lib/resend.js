import {Resend} from "resend";
import {ENV} from "./env.js";

export const resendCLIENT = new Resend(ENV.Resend_API_KEY);

export const sender ={
  email:ENV.EMAIL_FROM,
  name:ENV.EMAIL_FROM_NAME,
};