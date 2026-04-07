
//simple flow of websocket ..how to connect each other.... 
// export const webSocketHandler = (io)=>{
//  io.on("connect", (socket)=>{
//     console.log("user connected :", socket.id);

//    socket.on("send_message", (data)=>{
//     console.log("message :", data);

//     io.emit("receive_message", data); 
//    })

//    socket.emit("send_message", "hi from backend")

//    socket.on("disconnect", ()=>console.log("user disconnected :", socket.id))

//  })
// }


// frontend side code for above code

//  //websocket connection simple
//   useEffect(() => {
//     socket.emit("send_message", message);
//     socket.on("send_message", (message) => console.log(message));
//     return () => socket.off("send_message"); // return ma ek fun j hovo joie karane ke jo tame only  "return socket.off("send_message")" karsho to nahi chale ...
//   }, []);



import Message from "../model/messageModel.js"

export const webSocketHandler = (io)=>{


io.on("connect", async(socket)=>{

  socket.on("register", (userId)=>socket.join(userId))


  socket.on("send_message", async({sender , receiver, message})=>{
          
    const newMsg = await Message.create({sender, receiver , message})

     io.to(receiver).emit("receive_message",newMsg) //real time push
     io.to(sender).emit("receive_message", newMsg)  
  })

socket.on("disconnect", ()=> console.log("user Disconnected:", socket.id))
})
}