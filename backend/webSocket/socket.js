
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


//Last ma chhelle room , group, badhu explanation chhe in detaield ma samji levu::
import Message from "../model/messageModel.js"

export const webSocketHandler = (io)=>{


io.on("connection", async(socket)=>{

const onlineUsers = new Map();

socket.on("register", (userId) => {
    socket.userId = userId;
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
});

socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
});


  // socket.on("send_message", async({sender , receiver, message})=>{
          
  //   // 1. save message
  //   const newMsg = await Message.create({sender, receiver , message, status:"sent"  })

  //     // 3. receiver ko bhejo
  //    io.to(receiver).emit("receive_message",newMsg) //real time push// aa etala mate j hoy chhe ke live tej user ne message jay jene aapane dekahdvo chhe ..samjo .. jo tame socket.emit karo to jetala pan user hoy te badha ne instant message dekhay jay.. mongodb fetch karya vina ..mate j aapane ek socket server no use karvi je ahi aa functionality aape ...live instant message dekhay... pan tamare badha ne nathi moklava instant ma to mate tane io.to(receiver) to have aa tej user ne instant dekhashe jene tame moklo chho em...same grop ma  pan hoy.. 
  //                                                   //Room: Ek logical group hai jisme sockets (connections) rakhe ja sakte hain....Socket.io ke andar, har ek socket default room me hota hai jiska naam uska id hota hai....Jab aap socket.join("roomName") karte ho, to is socket ko ek extra room me daal dete ho...  aa room chhe e ek logical vastu tame vicharo...like tame have je pan user ne te room ma join karo to te badhane message dekhay... like tame ahi one to one room banavi chhe.. jo tame group nu name aapi dyo ane te badhane join karo to have instatn message te group ma hoy tene j dekhay instant bijane nahi  
  //                                   //socket.to(room)  aane broadcasting kevay... aanathi sender ne only event nahi jay..teni sivayna badha par lagu padshe.. // io.on() thi te room ma hoy te badhaen event jashe
  //  // 2. sender ko turant dikhado
  //   io.to(sender).emit("receive_message", newMsg)  

  //   // 4. delivered mark karo
  //   await Message.findByIdAndUpdate(newMsg._id, { status:"delivered"})

  //     // 5. sender ko update bhejo
  //     io.to(sender).emit("message_status_update", { ...newMsg._doc, status:"delivered"})
  //   })

  socket.on("send_message", async({ receiver, message })=>{
    const sender = socket.userId; // sender from socket

    // 1️⃣ Save message
    const newMsg = await Message.create({
        sender,
        receiver,
        message,
        status:"sent"
    });

    // 2️⃣ Sender ko turant dikhao
    socket.emit("receive_message", newMsg);


    io.to(receiver).emit("receive_message", newMsg);


    // 3️⃣ Check if receiver online
    const receiverSockets = io.sockets.adapter.rooms.get(receiver); // room me koi hai ya nahi
    if(receiverSockets && receiverSockets.size > 0){
        // 4️⃣ Receiver ko bhejo
        io.to(receiver).emit("receive_message", newMsg);

        // 5️⃣ Delivered mark karo
        const updated = await Message.findByIdAndUpdate(
            newMsg._id,
            { status: "delivered" },
            { new: true }
        );

        // 6️⃣ Sender ko update bhejo
        socket.emit("message_status_update", updated);
    }
});




socket.on("mark_as_seen", async({sender})=>{
  await Message.updateMany(
    {sender, receiver:socket.userId, status:{$ne:"seen"}}, 
    {status:"seen"}
  );
  io.to(sender).emit("message_seen", { by:socket.userId})
})




socket.on("typing",  ({sender,receiver})=>{
            io.to(receiver).emit("typing", {sender}); 
});

socket.on("stop_typing", ({sender, receiver})=>{
  io.to(receiver).emit("stop_typing", {sender}); 
});

socket.on("disconnect", ()=> console.log("user Disconnected:", socket.id))

})
}


// 💡 Summary:


//Jab aap socket.join(userId) karte ho, room ka naam userId hai... 
 // to upar chhe em aapane je name aapyu teni ek room bane ane te room ma je aapane join thaya tyare je scoekt connection banyu te hoy...
 //jo tame multiple device ma same id thi join thata ho like mobile, laptop badhey tame kholi app ane same userid thi join thaya to room ek j already chhe ane e room ma multiple socket hoy karan ke alag alag device ma alag alag socekt banya..
// jo tame koik group ni unique id valu group banavo to socket.join(groupUniqueId)  to have je pan user register kare aa unique id thi te badha aa group ma avi jay


//group no faydo::

//je tame io.to(room)  je to()  ma aapo ek room hoy teni id , name etc ane have to().emit ke kai pan event thay te have te room purti j hashe measn have message emit karo to tetala user ne j te message instantly uypdate dekahshe/..websocekt etale j use thay ke message instantly dekhay,,baki db ma to messag aapane je store karvi tene api thi irequest mokline pachhi aave ane aa webscokect server aa room ma direct jetala pan conected hoy te badhane instantly mokli de
//websocket thi je instant message aave tene aapane prev message ma spread operator thi add kari devi ane user ne direct show karavi ...mate tyare jyare userni chatiiing chalu hoy tyare aapane live message jova api db ma call nathi karta tyare aapane je io.to(room) aapvi to teni help thi e room je hoy tya message aave te instantly jovi aapane
//io.to thi je kai pan event tame emit karsho te badhu te group ma jetla pan hoy te badhane jay... 


/// websocket  ma only event emit thay ane listen thay frontend and backend banne baju ane loop chalya rakhe bas...
// jo event ne listen karvi hoy  to socket.on karvu ane jo event ne mokalvi hoy to socekt.emit karvu bas.....