import cloudinary from "../lib/cloudinary.js"
import Message from "../models/message.js";
import User from "../models/user.js";


export const getAllContacts = async(req,res)=>{
  try{
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-password")
    res.status(200).json(filteredUsers);
  }catch{
    console.log("enter in getAllContacts",error);
    res.status(500).json([]);
  }
}

export const getMessagesByUserId = async(req,res)=>{
  try{
    const myId = req.user._id;
    const {id:userToChatId} = req.params;

    const message = await Message.find({
      $or:[
        {senderId:myId,receiverId:userToChatId},
        {senderId:userToChatId,receiverId:myId},
      ]
    })
    res.status(200).json(message)
  }catch(error){
    console.log("error in getmessages controllers:",error.message);
    res.status(500).json([]);
  }
};

export const sendMessage = async(req,res)=>{
  try{
    const {text,image} = req.body;
    const {id:receiverId} = req.params;
    const senderId = req.user._id;
    
    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if(image){
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    // emit the new message to receiver if they are online
    try {
      const { getIo } = await import("../lib/socket.js");
      const io = getIo();
      // room named after receiver id
      io.to(receiverId.toString()).emit("newMessage", newMessage);
    } catch (err) {
      // socket might not be initialized yet, just log
      console.log("socket emit failed", err.message);
    }

    res.status(201).json(newMessage);
  }catch(error){
    console.log("error in sendMessage controllers:",error.message);
    res.status(500).json([]);
  }
}

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json([]);
  }
};

// new endpoint: remove a message by id (sender only)
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // only the sender should be allowed to delete their message
    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await message.deleteOne();

    // emit deletion event to both participants so their UIs can update
    try {
      const { getIo } = await import("../lib/socket.js");
      const io = getIo();

      [message.senderId, message.receiverId].forEach((uid) => {
        if (uid) {
          io.to(uid.toString()).emit("messageDeleted", messageId);
        }
      });
    } catch (err) {
      console.log("socket emit failed", err.message);
    }

    res.status(200).json({ message: "Message deleted", id: messageId });
  } catch (error) {
    console.error("error in deleteMessage controller:", error.message);
    res.status(500).json([]);
  }
};
