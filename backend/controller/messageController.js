import Message from "../model/messageModel.js"



export const getMessages = async(req , res)=>{
    try {

 const {sender,receiver}=  req.query;
   
        
        const messages =  await Message.find({
            $or:[
                { sender:sender , receiver:receiver},
                {sender:receiver, receiver:sender}
            ]
        });

        res.status(200).json({
            success:true ,
            messages:messages
        })
console.log(messages)

    } catch (error) {
        res.status(500).json({
            status:false,
            message:error.message
        })
    }
}

