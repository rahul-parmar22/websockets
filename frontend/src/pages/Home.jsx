import axios from "axios";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); //aane component ni bahar lakhvu nahi to jyare pan component render thashe like typing vakhte pan to etali var new socekt banshe ....mate me pahela andar lakhelu htu ane jyare pan refresh karto page to backend ma ketala badha user disconnnected na message aavta means badha render vakhte ek new socket bantu htu

function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null); // jo ahi null nahi hoy ane [] pass karsho to aa bhale empty hoy chhata array ek truthy valu chhe to empty array hova chhata je true ni condition hashe te chalshe..mate ahi jo active user nahi hoy tem chhata active userno je interface and style dekahdvani hoy te dekhashe
  const [sender, setSender] = useState(localStorage.getItem("userId"));
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const activeUser = users.find(
  (u) => u._id.toString() === activeUserId
);

  // const messageEndRef = useRef(null);  // jo scroll intoveiw valu use karo to ena mate
  const containerRef = useRef(null); // aa whatsapp jevu lage ke message already niche j hoy ...
  // localStorage.setItem("user", JSON.stringify(res.data.users[0]))  //localstorage ma hamesha string j store thay ..json data store thay..pan jo backend thi koi object aavto  hoy to tene store akrvo hoy local storage ma to tame direct tene setItem thi nahi store kari shako...mate pela tamare tene tene pahale json.stringify thi te object ne string/json ma convert karo ane pachhi te store thay..ahi user object ne string ma convert karine store karay
  //JSON.parse(localStorage.getItem("user"))  // upar je local ma string ma object chhe tene have destrcuture karine use no kari shako mate pela te string/json ne pachhu object ma convert karvu pade pachhi teno use thay mate ..json.parse() ... ahi user key  chhe ane teni value ek evo object chhe je string ma convert chhe to tene pachho object ma convert karvo chhe em

  useEffect(() => {
    socket.on("getOnlineUsers", (data) => {
    setOnlineUsers(data); // Ye saari online User IDs ka array hoga
      // console.log(data)
    });
    return () => socket.off("getOnlineUsers");
  }, []);

useEffect(()=>{
            
  socket.on("user_status_update", (data)=>{
 
  setUsers((prev)=> prev.map((u)=>u._id === data.userId ?{ ...u, lastSeen:data.lastSeen, isOnline:data.isOnline} : u))
 
  }); 
   return ()=> socket.off("user_status_update")
},[]);

  const API = "http://localhost:5000/api/v1";
  //fetching users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/user/all-users`);

      const filtered = res.data.users.filter(
        (u) => u.username !== localStorage.getItem("username"),
      );

      setUsers(filtered);
   console.log(filtered)
      // console.log(sender);
    } catch (error) {
      console.log(error);
    }
  };



  const deleteMessage= async(id)=>{
  try {
    
const res=  axios.delete(`${API}/message/${id}`);
console.log((await res).data.message);
fetchMessages(); 

  } catch (error) {
    console.log(error)
  }
}

const editMessage = async(id)=>{
  try {
    console.log(id)
  } catch (error) {
    console.log(error)
  }
}






  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(()=>{
        if (!sender) return; // jo initial sender haji localstorage ma set no hoy to backend ma sender undefined jay to error cause kare

    socket.emit("register", sender.toString()); //khas dhyan rakhvu ke koi type mismatch no thay ..ahi safety mate string() kari nakhvu
  console.log(sender)
  },[sender])

  //fetch messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${API}/message/all-messages?sender=${sender}&receiver=${activeUser._id}`,
      );
      setMessages(res.data.messages);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

useEffect(() => {
  if (!activeUser) return;
  fetchMessages();
}, [activeUserId]);

  useEffect(() => {
    // messageEndRef.current?.scrollIntoView({behavior:"smooth"}); // name evu kam chhe element ne scroll kare view ma aave etalu.... jya aa elemnet hoy tene show kari de  // aa evu lage ke scroll kare chhe em
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

//🔥 2. typing handler bana (IMPORTANT)

  const typingTimeoutRef = useRef(null);

  const handleTyping = (e) => {
    setMessage(e.target.value);

    socket.emit("typing", { sender, receiver: activeUser._id });

    //debounce
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { sender, receiver: activeUser._id });
    }, 1000);
  };

  //🔥 3. socket listeners add kar //je socket mokle chhe data tene have listen karvi chhi... upar aapane socket ne mokalta hta..
  //socket hamesha be baju work kare like.. aapane kaik ahithi mokalyu to e ek event ane tyathi kaik aavyo te ek event... to same typing ma ahithi kaik aapane moklvi e have je bijo user connect chhe ena mate aaveli event hashe..ane aapana mate je aaveli event chhe e koik user e moklili event hashe em aa ek loop jevu chhe

  useEffect(() => {
    socket.on("typing", ({ sender: typingUser }) => {
      //js destructuting property ke je sender ni value aave chhe tene have localvariable typingUser name thi use kro ...{ sender: typingUser } ka matlab: "jo sender property aa rahi hai usko local variable typingUser naam se use karo".
      if (typingUser === activeUser?._id) setIsTyping(true);
    });

    socket.on("stop_typing", ({ sender: typingUser }) => {
      if (typingUser === activeUser?._id) setIsTyping(false);
    });

    return () => {
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [activeUser]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", {
        receiver: activeUser._id,
        message,
      });
      
      socket.emit("stop_typing", { sender, receiver: activeUser._id }); //⚠️ 6. SEND pe typing band kar

      setMessage("");

      // aam pan thay
      // const msgData  = {
      //   sender:sender._id,
      //   receiver: activeUser._id,
      //   message :message,  //message trim backend ma karie chhie... schema ma trim:true
      // }
      //  socket.emit("send_message",msgData )
    }
  };

  //instant messages set when backend socket send new messages
  //   useEffect(() => { //aama haji ek error to chhe j ke ..haji pan backend thi  user jene message mokle tena badha open chat ma mesage to bakcend send kare j chhe io.receiver  thi... pan aaya frontend thi only condition lagavine check karvi chhie..to backend thi j only aa ek j ne jay evu solution find karo..
  //     socket.on("receive_message", (newMsg) => {
  //     // Condition: Sirf tabhi messages mein add karo agar...
  //     // 1. Message bhenjne wala (newMsg.sender) wahi hai jo hamara activeUser hai.
  //     // 2. YA phir hum khud sender hain (self-message case, halaki aapne isse backend se handle kiya hai).

  //     setActiveUser((currentActiveUser) => {
  //       // Agar wahi chat open hai jiska message aaya hai
  //       if (currentActiveUser && newMsg.sender === currentActiveUser._id) {
  //         setMessages((prev) => [...prev, newMsg]);

  // // 2. Agar ye message current chat wale se hi aaya hai, toh seen mark karo
  // if (activeUser && newMsg.sender === activeUser._id) {
  //       socket.emit("mark_as_seen", {
  //         sender: activeUser._id // Jo bhej raha tha uski ID
  //       });
  //     }
  //       } else if (newMsg.sender === sender) {
  //         // Agar message humne hi dusre device se bheja ho (optional handling)
  //         setMessages((prev) => [...prev, newMsg]);
  //       } else {
  //         // Yahan aap "New message from other user" ki notification dikha sakte hain
  //         console.log("Notification: Message received from", newMsg.sender);
  //             //ahiya upar notification pan rakhi shako e new message aavyo
  //       }
  //       return currentActiveUser;
  //     });
  //   });
  //     return () => {  //return ma ek fun j hovo joi.. only "return abcd" karo to no chale
  //       socket.off("receive_message");
  //     };
  //   }, [sender]);


  useEffect(() => {
  const handleReceive = (newMsg) => {

    setMessages((prev) => {
      const currentActiveId = activeUserId; // latest closure safe

      if (
        currentActiveId &&
        (newMsg.sender === currentActiveId ||
         newMsg.receiver === currentActiveId)
      ) {
        return [...prev, newMsg];
      }

      console.log("New message from someone else:", newMsg.sender);
      return prev;
    });

  };

  socket.on("receive_message", handleReceive);

  return () => socket.off("receive_message", handleReceive);
}, [activeUserId]);

//uparna code nu in detailed ma explanation niche chhe...
  // useEffect(() => {
  //   const handleReceive = (newMsg) => {
  //     // Functional update ka use karein taaki latest state mile

  //           const currentActive = users.find(
  //     (u) => u._id === activeUserId
  //   );
  //       //ahi khas logic chhe ke aa setActiveUser shu kam use karie chhie jyare activeUser to upar state male chhe?? ane aane set karvi chhi kem??
  //       //ANS: initially website load samye activeUser null hoy to e samye aa [] first time chale etale activeUser null thay ane jyare change thay ane jo aa useeffect ni dpendency ma nakho to jo user 50 var user ne badalya kare to 50 var aa useeffect ma je connection chhe e chalu bandh thay ane performance kharab thay
  //       //mate aa setActiveUser eetale chhe ke jyare active user jo change thay ane koi message aave pan chhe server thi to aa current ma je user active hashe tene aapashe etale kahabr padi jay ke current ma kayo chhe e janva mate ane perfomance mate aa setActiveUser ho upyoug karel chhe ..nahi ke set karva teni value....

  //       //most imp logic:: //
  //       // ahi niche aapane filter lagavela chhe karan ke jyare userA login kare etale room ma joday jene aapane userId name aapel chhe to pachhi evi rite bijo userB joday to e teni userId ni room ma joday  .....
  //       //have jyare userA messag mokle io.to(userIdB) tema to teni pase have andar ghana badha chat hoy ..ane socket nu kam chhe ke instantly message batavvo userB me karan ke teni room ma mokalel chhe to pachhi game e chat open hoy aapane aa karvi setMessages((prev) => [...prev, newMsg]); etale currnetly je pan chat open chhe tena message ma aa newmsg add thai jay ane aapanne lage ke badha user ne message jay chhe.pan e badha user ne messsage no jato hoy ...room ma only one user connect hoy to e ek ne j mesage jay chhe pan je chat open hoy tene show thai jay em 
  //       //mate io.to() nu kam chhe e room ma message ne mokalvanu have tene frontend ma tamare kya show karvo ke nahi show karvo ke notification batavvu e badhu kam frontend nu chhe..mate ahi niche aapane logic and condition lagavine user pramane dekhadie chhie...
  //       //io.to(userId) means aakhi aapani open website ek room chhe ... je user chhe andar na e badha ek ek room nathi

  //       // Check 1: Kya ye message usi ki chat ka hai jo abhi OPEN hai?
  //       if (
  //         currentActive &&
  //         (newMsg.sender === currentActive._id ||
  //           newMsg.receiver === currentActive._id)
  //       ) {
  //         setMessages((prev) => [...prev, newMsg]);

  //         // Check 2: Agar message samne wale se aaya hai (hum receiver hain), toh SEEN bhej do
  //         if (newMsg.sender === currentActive._id) {
  //           socket.emit("mark_as_seen", { sender: currentActive._id });
  //         }
  //       } else {
  //         // Agar chat open nahi hai, toh yahan notification logic handle karein
  //         console.log("New message from someone else:", newMsg.sender);
  //       }

  //       return currentActive; // State return karna mat bhoolna
    
  //   };

  //   socket.on("receive_message", handleReceive);

  //   return () => {
  //     socket.off("receive_message", handleReceive);
  //   };
  // }, [activeUserId , sender]); // Sirf sender change hone par refresh karein

  //✅ (A) status update handle karo




  useEffect(() => {
    socket.on("message_status_update", (updatedMsg) => {
      //niche ek minor error hti me pela only  {...msg, ...updatedMsg} karyu htu pan jyare koi eva user ne message kare je login nathi to tene single tickno message dekhay but jevo e user login kare etale te te message ni jagyae e "invalid Date" aavu aavi jay ....because e message ma tya createdAt field hoy j nahi to e shu kam no hoy?? karan niche chhe
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMsg._id ? { ...msg, ...updatedMsg } : msg,
        ),
      ); //jyare message moklo etale e db ma store thay but jyare user login thay etale status update chale ane tema backend na logic ma chhe ema findId and update chhe to e update kare document ne ane tema new:true hoy etale e only tyathi je vastu mokle etaly j hoy chhe...ane te only backend thi status j mokle chhe to teni pase tyare createdAt ke message shu chhe e nahi hoy mate tya date nahi hoy etale e invalid batave ane message pan no batave pan jyare user pachhi bija active use pase jai ane pachhi pachho aave to tyare batave karan ke tyare data api thi aavto hoy ...instant je .emit thi change thay ena karne error aave
    }); // mate aapane aa karvi chhie ek already je message chhe teni badhi property to raheva j do jethi message , creatdAt badhu male ane aa je only new aavi tene add kari dyo ..and already hoy to tene change kari dyo em...
    return () => socket.off("message_status_update");
  }, []); //ahi [] chhe means evu nathi ke only ek var j status update thashe messageno em nathi...jya shudhi compnent chhe mount chhe tya sudhi aa chalshe...etale have game etala message update thay e component chhe tya shudhi thaya rakhe.....
  //useEffect ka empty array [] matlab hai ki socket listener sirf ek baar register hoga (mount par)...Lekin kyunki wo listener socket.on hai, wo background mein hamesha chalta rahega jab tak component unmount nahi hota......

  //✅ (B) seen update handle karo
  useEffect(() => {
    socket.on("message_seen", ({ by }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          // Agar message maine (sender) bheja tha aur 'by' (receiver) ne ab dekh liya
          // Yahan 'by' wo user hai jisne message padha hai
          msg.receiver === by && msg.status !== "seen"
            ? { ...msg, status: "seen" }
            : msg,
        ),
      );
    });

    return () => socket.off("message_seen");
  }, []); // Isme dependencies ki zaroorat nahi kyunki prev state use ho rahi hai

  //✅ (C) Chat open hote hi seen emit karo..👉 Ye sabse important hai 🔥

  useEffect(() => {
    if (activeUser) {
      // Emit to backend
      socket.emit("mark_as_seen", {
        sender: activeUser._id,
      });

      // Optimistically update UI immediately
      setMessages((prev) =>
        prev.map(
          (msg) =>
            msg.sender === activeUser._id ? { ...msg, status: "seen" } : msg, //Ye bahut smart move hai! Isse user ko "lagta" hai ki app super fast hai (Optimistic UI update), bina server ke response ka wait kiye.
        ),
      );
    }
  }, [activeUser]);

  //  //websocket connection simple
  //   useEffect(() => {
  //     socket.emit("send_message", message);
  //     socket.on("send_message", (message) => console.log(message));
  //     return () => socket.off("send_message"); // return ma ek fun j hovo joie karane ke jo tame only  "return socket.off("send_message")" karsho to nahi chale ...
  //   }, []);

  
  return (
    <>
      <div className="flex">
        <div className=" w-1/5 bg-gray-200 flex flex-col items-start gap-3 min-h-screen pt-22  ">
          <div className="">
            logged in As: {localStorage.getItem("username")}
          </div>

          {users.map((item, index) => {
            // Check if user is in onlineUsers array
            const isOnline = onlineUsers.includes(item._id.toString());

            return (
              <button
                key={index}
                onClick={() => {
                  setActiveUserId(item._id);
                  setMessage("");
                }}
                className={`relative flex items-center gap-3 p-2 w-full shadow text-lg pl-5 lg:pl-20 
        ${activeUser?._id === item._id ? "bg-gray-300" : ""}`}
              >
                {/* Green Dot with Glow */}
                <div className="relative">
                  <div className="h-10 w-10 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm">
                    {item.username[0].toUpperCase()}
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white shadow-[0_0_8px_rgba(34,197,94,0.7)]"></span>
                  )}
                </div>

                <div className="flex flex-col items-start">
                  <span>{item.username}</span>
                  <span
                    className={`text-[10px] ${isOnline ? "text-green-600 font-bold" : "text-gray-500"}`}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {activeUser ? (
          <>
            <div className="min-h-screen bg-gray-100 w-full p-5 ">
              <div className="shadow-xl h-196  relative ">
                <div className="flex gap-2 items-center bg-yellow-200 py-2 pl-2 shadow-md ">
                  <div className="h-13 w-13 flex items-center justify-center font-medium text-gray-800 bg-gray-300 rounded-full ">{activeUser.username[0].toUpperCase()}</div>
                  
                
                      
                      <div className="flex flex-col font-medium text-lg items-center">
                        {activeUser?.username
                                                 }
                        <div>
                      {
                      isTyping ? (
                        <div className="text-sm text-gray-500 px-3">
                          typing...
                        </div>
                      ):onlineUsers.includes(activeUser?._id.toString())? (
                          <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            Active Now
                          </span>
                        ) : activeUser?.lastSeen ?( <div className="text-xs text-gray-600"> {activeUser?.lastSeen}</div>) : <div className="text-xs text-gray-600">offline</div>
                      
                        }

                        </div>

                      </div>
                    
                  
                </div>

                {messages.length == 0 ? (
                  <div className=" h-1/2 text-lg flex items-end justify-center">
                    {" "}
                    Start Chatting...
                  </div>
                ) : (
                  <div
                    ref={containerRef}
                    className="flex flex-col   gap-2 p-1 h-[650px] overflow-y-auto "
                  >
                    {messages.map((message, i) => {
                     const isOwn = message.sender === sender;
                      return (
                        <div className="" key={i}>
                          <div
                            className={`${isOwn ? "bg-gray-300  ml-auto rounded-lg  " : " bg-gray-200"} p-1 break-all  w-fit max-w-[70%]`}
                          >

                            <div className="flex justify-between gap-2"> <span>{message.message}</span>  { isOwn ? <><span onClick={()=>deleteMessage(message._id)} className="cursor-pointer text-sm">🗑️</span><span onClick={()=>editMessage(message._id)} className="cursor-pointer text-sm">✏</span></> :""} </div>
                            <div className="text-xs ">
                              {" "}
                              {new Date(
                                message.createdAt,
                              ).toLocaleTimeString('en-US',  { hour: '2-digit', minute: '2-digit', hour12: false })}{" "}
                              {/* toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) */}
                         
                            </div>

                            {isOwn && (
                              <div className="text-xs">
                                {message.status === "sent" && "✓"}
                                {message.status === "delivered" && "✓✓"}
                                {message.status === "seen" && (
                                  <span className="text-blue-500">✓✓</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* ✅ THIS SHOULD BE INSIDE aa scroll into view valu karvu hoy to ena mate */}
                    {/* <div ref={messageEndRef}></div> */}
                    {/* aane khas kya place karvo e khyal rakhvo... badha messages ni niche karsho to e scroll thashe ..jo aa messages jema chhe e div ni bahar rakhsho to nahi chale karan ke eto same page par dekahy j chhe em.. 
     //be type na scroll hoy window scroll and container scroll ...apana case ma window nathi scroll thatu karan ke aapane scroll ne div ma aapel chhe andar ....
     //like user button par ke kyay pan click kare ane aapane page ma te element par scroll thai jaie te effect aanathi aave scrollIntoView() thi
 */}
                  </div>
                )}

                <div className="absolute bottom-4 flex gap-3 w-[90%]">
                  <input
                    type="text"
                    value={message}
                    onChange={handleTyping}
                    placeholder="Type message"
                    className=" shadow-md p-2  w-[90%] outline-none "
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-gray-700 text-white px-3 rounded cursor-pointer"
                  >
                    send
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="min-h-screen bg-gray-200 w-full text-center ">
              <p className="relative top-40 text-xl">
                Please select User for chatting
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Home;
