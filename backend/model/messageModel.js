import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    message:{
        type:String,
        trim:true,
        required:true
    },
    status:{
        type:String,
        enum:["sent", "delivered", "seen"],
        default:"sent"
    }
},{timestamps:true});

const Message = mongoose.model("Message", messageSchema);

export default Message;