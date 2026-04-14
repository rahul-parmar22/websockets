{
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
}


//Last ma chhelle room , group, badhu explanation chhe in detaield ma samji levu::
import Message from "../model/messageModel.js"
import User from "../model/userModel.js";


    //jo db ma register user status online store karvi ane pachhi e pramane je online chhe tene message show karo vagerema bov time lagi jay ...mateaa instantly decision le without server req,res cycle ...jethi speed ma data online user me mokalvano chhe te mali jay..pan last seen vagere eva mate to db ma store karvu pade ....
const onlineUsers = new Map();    //✅ Pros: ⚡ Ultra fast (O(1))...Real-time accurate.....No DB calls (performance best).....Socket-based → perfect for chat
                                  //❌ Cons: Server restart → data lost.....Last seen store nahi hota
                             //jetala pan variable vager chhe e "RAM" ma store thay hamesha to aa online userni value pan ram ma store thay
                             
     // INTERVIEW SCALING QUESTIONS:: map to ram ki limit ke hisab se user handle karega chalo like 5000-20000 online users jab 50,000 , 100000 users aa gye to ??
     //   ANS: jayre vadhare user hoy tyare aapane vadhare server banaviye like  Server 1  → users A, B  and Server 2  → users C, D     jyare app scale thay to but 👉 Ab: A ko message bhejna hai C ko...Lekin A ka server (Server 1) ko pata hi nahi C online hai ya nahi 😬...👉 Kyuki:onlineUsers (Map) → sirf local server ka data hai......?? 
     //🔥 Yahan Redis ka role aata hai..🟢 1. Redis as Shared Store ..Instead of:Map()  Tum store karte ho:Redis.set("user:123", "online")....👉 Ab:Server 1 bhi dekh sakta hai..Server 2 bhi dekh sakta hai
     //                                 🟣 2. Redis as Pub/Sub (MOST IMPORTANT): Redis me ek feature hota hai:👉 Publish / Subscribe system....e websocket jem j hoy chhe ke server 1 ma redis.publish(event1, {}) aane redis.subscribe(event1,{})  to have jem .emit, .on karta hta tem j chhe  

    // ⚡ 3. Socket.IO + Redis Adapter  //👉Ye kya karta hai? 👉 Agar tum likho: io.to("user123").emit("message");....👉 To:Automatically sab servers me check karega..Jaha user connected hai waha message pahucha dega

                                 // User → Server → Socket.IO
                                 //                ↓
                                 //              Redis
                                 //                ↓
                                 //         Other Servers

//ahi aapane map() use karyu tenu bov motu logic chhe...
// 🧠 Real analogy
// ❌ Array = library me sab books check karna  //jo 1000 user online hoy ane aapane to only 20 user sathe vat karta hoie to  jo Array hoy e bahda user ne find kare ane bov time jay array.find(u => u.id === "A")....👉 O(n) → 1000 users = 1000 checks....

// ✅ Map = index se direct shelf number mil jana //parantu  map.has("A") 👉 O(1) → direct jump ..aa indexing use kare....js internal engine use kare aa badhu... like ...instagram ma lakho usermathi ek ne kem find karvi evi rite to 

export const webSocketHandler = (io)=>{


io.on("connection", async(socket)=>{

 // ✅ Register user
    socket.on("register", async(userId) => {
      const id = userId.toString(); // always string
      socket.userId = id;
      socket.join(id); // logical room for the user
      onlineUsers.set(id, socket.id);
      console.log("User registered:", id);

      const user = await User.findByIdAndUpdate(id, {isOnline:true}); 
         console.log("user", user)
      // 📢 Sabko updated online list bhejo
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
console.log("User registered:", id);



// 🔥 JADU YAHAN HAI:
    // 1. Database mein is user ke liye aaye huye saare 'sent' messages ko 'delivered' kar do
    const undeliveredMessages = await Message.find({ receiver: id, status: "sent" });
    
    if (undeliveredMessages.length > 0) {
        await Message.updateMany(
            { receiver: id, status: "sent" },
            { status: "delivered" }
        );

        // 2. Har ek sender ko notify karo ki unka message deliver ho gaya hai
        undeliveredMessages.forEach((msg) => {
            const senderSocketId = onlineUsers.get(msg.sender.toString());
            if (senderSocketId) {
                io.to(senderSocketId).emit("message_status_update", {
                    _id: msg._id,
                    status: "delivered"
                });
            }
        });
    }


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

//   socket.on("send_message", async({ receiver, message })=>{
//     const sender = socket.userId; // sender from socket
//         if (!sender) {
//         console.error("Sender undefined. Did you forget register?");
//         return;
//     }

//     // 1️⃣ Save message
//     const newMsg = await Message.create({
//         sender,
//         receiver,
//         message,
//         status:"sent"
//     });

//     // 2️⃣Sender sees instantly
//     socket.emit("receive_message", newMsg);

//     // 3️⃣ Send only to receiver's socket
//       const receiverSocketId = onlineUsers.get(receiver?.toString());


//     if (receiverSocketId) {
//         io.to(receiverSocketId).emit("receive_message", newMsg);

//         // 4️⃣ Delivered mark karo
//         const updated = await Message.findByIdAndUpdate(
//             newMsg._id,
//             { status: "delivered" },
//             { returnDocument: "after" }
//         );

//         // 5️⃣ Sender ko update bhejo
//         socket.emit("message_status_update", updated);
//     }
// });


socket.on("send_message", async ({ receiver, message }) => {
    const sender = socket.userId;
    if (!sender) {
        console.error("Sender undefined. Did you forget register?");
        return;
    }

    // 1️⃣ Save message
    const newMsg = await Message.create({
        sender,
        receiver,
        message,
        status: "sent"
    });

    // 2️⃣ Sender ko confirm karo (taaki multiple tabs sync rahein)
    // socket.emit ki jagah io.to(sender) use karna better hai
    io.to(sender.toString()).emit("receive_message", newMsg);

    // 3️⃣ Target: Only Receiver ke room mein message bhejo 🔥
    // Aapne register mein socket.join(id) kiya hua hai, isliye direct room use karo
    io.to(receiver.toString()).emit("receive_message", newMsg);

    // 4️⃣ Delivered status logic
    const receiverSocketId = onlineUsers.get(receiver?.toString());

    if (receiverSocketId) {
        // DB update
        const updated = await Message.findByIdAndUpdate(
            newMsg._id,
            { status: "delivered" },
            {returnDocument: 'after' } // returnDocument: "after" ka modern shortcut
        );  //ahi jyare aa message first  time jay to e only aa status j aape cheh ane ek small error aave chhe to e aano jya use thay chhe frontend ma tya in detailed ma chhe show

        // 5️⃣ Sender ko status update bhejo (Blue tick se pehle wala double tick)
        io.to(sender.toString()).emit("message_status_update", updated);  //ahi updated ma only 
    }
});



// ✅ Mark messages as seen
socket.on("mark_as_seen", async ({ sender }) => {
  // 1. DB Update
  await Message.updateMany(
    { sender, receiver: socket.userId, status: { $ne: "seen" } },
    { status: "seen" }
  );

  // 2. Samne wale (jisne message bheja tha) ko batao
  const targetSocketId = onlineUsers.get(sender?.toString()); // Iska naam simple rakhte hai
  
  if (targetSocketId) {
    // Hum "by" bhej rahe hain (yani jisne message abhi padha hai)
    io.to(targetSocketId).emit("message_seen", { by: socket.userId });
  }
});

 // ✅ Typing indicators
    socket.on("typing", ({ sender, receiver }) => {
      const receiverSocketId = onlineUsers.get(receiver?.toString());
      if (receiverSocketId) io.to(receiverSocketId).emit("typing", { sender });
    });

    socket.on("stop_typing", ({ sender, receiver }) => {
      const receiverSocketId = onlineUsers.get(receiver?.toString());
      if (receiverSocketId) io.to(receiverSocketId).emit("stop_typing", { sender });
    });


// socket.on("typing",  ({sender,receiver})=>{
//             io.to(receiver).emit("typing", {sender}); 
// });

// socket.on("stop_typing", ({sender, receiver})=>{
//   io.to(receiver).emit("stop_typing", {sender}); 
// });

    // ✅ Disconnect
    socket.on("disconnect", async() => {
      if (socket.userId) {
        const userId = socket.userId; 
        onlineUsers.delete(socket.userId);

const updatedUser = await User.findByIdAndUpdate(userId, {isOnline:false, lastSeen: new Date()} , {new:true})


        // 📢 Sabko batao ki list change ho gayi hai
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        
        
        console.log("User disconnected:", socket.userId, socket.id);

        io.emit("user_status_update", {
          userId, lastSeen:updatedUser.lastSeen,
          isOnline:false
        })
      }
    });

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