import express from "express";

const router = express.Router();

router.get("/send",(re,res)=>{
  res.send("Send messgage endpoint");
})

export default router;