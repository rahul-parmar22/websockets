import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username:{type:String, required:true},
    password:{type:String, required:true},
    isOnline:{type:Boolean, default:false},
    lastSeen:{type:Date}

},{ timestamps:true});

 const  User = mongoose.model("User", userSchema); 

 export default User; 