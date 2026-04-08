import mongoose, { Schema } from "mongoose";


const messageSchema = new Schema({
    sender:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    receiver:{type:mongoose.Schema.Types.ObjectId, ref:"User" , default:null},
    message:{type:String, trim:true},
    status:{
        type:String,
        enum:["sent", "delivered", "seen"]
    }

},{timestamps:true});


const Message = mongoose.model("Message", messageSchema);

export default Message;