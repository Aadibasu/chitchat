import {resendCLIENT,sender} from "../lib/resend.js";
import {createWelcomeEmailTemplate} from "../email/emailTemplates.js"

export const sendWelcomeEmail = async(email,name,clientURL)=>{
  const {data,error}=await resendCLIENT.emails.send({
    from:`${sender.name} <${sender.email}>`,
    to:email,
    subject:"welcome to chitchat",
    html:createWelcomeEmailTemplate(name,clientURL)
  });
  if(error){
    console.log("Error sending welcome email:",error);
    throw new Error("Failed to send welcome email");
  }
  console.log("Welcome email sent successfully to",email);
}
