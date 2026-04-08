import axios from "axios";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

const socket =  io("http://localhost:5000");  //aane component ni bahar lakhvu nahi to jyare pan component render thashe like typing vakhte pan to etali var new socekt banshe ....mate me pahela andar lakhelu htu ane jyare pan refresh karto page to backend ma ketala badha user disconnnected na message aavta means badha render vakhte ek new socket bantu htu

function Home() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null); // jo ahi null nahi hoy ane [] pass karsho to aa bhale empty hoy chhata array ek truthy valu chhe to empty array hova chhata je true ni condition hashe te chalshe..mate ahi jo active user nahi hoy tem chhata active userno je interface and style dekahdvani hoy te dekhashe
  const [sender, setSender] = useState(localStorage.getItem("userId"));
 const [isTyping,setIsTyping] = useState(false); 


  // const messageEndRef = useRef(null);  // jo scroll intoveiw valu use karo to ena mate
  const containerRef = useRef(null);  // aa whatsapp jevu lage ke message already niche j hoy ...
  // localStorage.setItem("user", JSON.stringify(res.data.users[0]))  //localstorage ma hamesha string j store thay ..json data store thay..pan jo backend thi koi object aavto  hoy to tene store akrvo hoy local storage ma to tame direct tene setItem thi nahi store kari shako...mate pela tamare tene tene pahale json.stringify thi te object ne string/json ma convert karo ane pachhi te store thay..ahi user object ne string ma convert karine store karay
  //JSON.parse(localStorage.getItem("user"))  // upar je local ma string ma object chhe tene have destrcuture karine use no kari shako mate pela te string/json ne pachhu object ma convert karvu pade pachhi teno use thay mate ..json.parse() ... ahi user key  chhe ane teni value ek evo object chhe je string ma convert chhe to tene pachho object ma convert karvo chhe em


  const API = "http://localhost:5000/api/v1";
  //fetching users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/user/all-users`);

      const filtered = res.data.users.filter(
        (u) => u.username !== localStorage.getItem("username"),
      );
 
      setUsers(filtered);

      console.log(sender);
    } catch (error) {
      console.log(error);
    }
  };

useEffect(() => {
  fetchUsers();

    socket.emit("register", sender);
}, []);

  //fetch messages

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${API}/messages?sender=${sender}&receiver=${activeUser._id}`,
      );
      setMessages(res.data.messages);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeUser]);

useEffect(()=>{
     // messageEndRef.current?.scrollIntoView({behavior:"smooth"}); // name evu kam chhe element ne scroll kare view ma aave etalu.... jya aa elemnet hoy tene show kari de  // aa evu lage ke scroll kare chhe em 
if(containerRef.current){
  containerRef.current.scrollTop = containerRef.current.scrollHeight; 
}

},[messages])

//🔥 2. typing handler bana (IMPORTANT) 

const typingTimeoutRef = useRef(null); 

const handleTyping = (e)=>{
  setMessage(e.target.value);

  socket.emit("typing", { sender, receiver:activeUser._id, }); 
  
  //debounce
  if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(()=>{
      socket.emit("stop_typing", { sender, receiver:activeUser._id , });
    }, 1000)
}

//🔥 3. socket listeners add kar //je socket mokle chhe data tene have listen karvi chhi... upar aapane socket ne mokalta hta.. 
//socket hamesha be baju work kare like.. aapane kaik ahithi mokalyu to e ek event ane tyathi kaik aavyo te ek event... to same typing ma ahithi kaik aapane moklvi e have je bijo user connect chhe ena mate aaveli event hashe..ane aapana mate je aaveli event chhe e koik user e moklili event hashe em aa ek loop jevu chhe

useEffect(()=>{
  socket.on("typing", ({sender:typingUser})=>{  //js destructuting property ke je sender ni value aave chhe tene have localvariable typingUser name thi use kro ...{ sender: typingUser } ka matlab: "jo sender property aa rahi hai usko local variable typingUser naam se use karo".
     if(typingUser === activeUser?._id) setIsTyping(true); 
  })

socket.on("stop_typing", ({sender:typingUser})=>{
  if(typingUser === activeUser?._id) setIsTyping(false); 
})

return()=>{
  socket.off("typing");
  socket.off("stop_typing")
}


},[activeUser])


  const sendMessage = () => {
    if (message.trim() !== "") 
        
        {
      socket.emit("send_message", {
       
        receiver: activeUser._id,
        message,
      });

     socket.emit("stop_typing", {sender, receiver:activeUser._id}) //⚠️ 6. SEND pe typing band kar
 
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
  useEffect(() => {
    socket.on("receive_message", (newMsg) => setMessages((pre)=>[...pre, newMsg]));

    return () => {  //return ma ek fun j hovo joi.. only "return abcd" karo to no chale
      socket.off("receive_message");
    };
  }, []);  //ahi [] chhe means evu nathi ke only ek var j receive thashe message em nathi...jya shudhi compnent chhe mount chhe tya sudhi aa chalshe...etale have game etala message ave badha chalshe em

  //✅ (A) status update handle karo
useEffect(()=>{
  socket.on("message_status_update", (updatedMsg)=>{
    setMessages((prev)=> prev.map((msg)=> msg._id === updatedMsg._id ? updatedMsg : msg));
  });
 return()=> socket.off("message_status_update");
},[]);

//✅ (B) seen update handle karo
useEffect(() => {
socket.on("message_seen", ({ by }) => {
  setMessages((prev) =>
    prev.map((msg) =>
      msg.sender === by ? { ...msg, status: "seen" } : msg
    )
  );
});

  return () => socket.off("message_seen");
}, []);

//✅ (C) Chat open hote hi seen emit karo..👉 Ye sabse important hai 🔥

useEffect(() => {
  if (activeUser) {
    // Emit to backend
    socket.emit("mark_as_seen", {
      sender: activeUser._id
    });

    // Optimistically update UI immediately
    setMessages((prev) =>
      prev.map((msg) =>
        msg.sender === activeUser._id ? { ...msg, status: "seen" } : msg
      )
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
         
         <div className="">logged in As: {localStorage.getItem("username")}</div>
         
          {users.map((item, index) => {
            return (
              <button
                key={index}
                onClick={() => {
                  setActiveUser(item);
                  setMessage("");
                }}
                disabled={activeUser?.username === item.username}
                className={` ${activeUser?.username === item.username ? "bg-gray-300" : ""}   cursor-pointer p-1 w-full shadow text-lg pl-5 lg:pl-20`}
              >
                {" "}
                {item.username}
              </button>
            );
          })}
        </div>

        {activeUser ? (
          <>
            <div className="min-h-screen bg-gray-100 w-full p-5 ">
              <div className="shadow-xl h-196  relative ">
                <div className="flex gap-2 items-center py-2 pl-2 shadow-md ">
                  <div className="h-13 w-13 bg-gray-300 rounded-full "> </div>
                <div>

                  <div className="font-medium text-lg">
                    {activeUser?.username}{" "}
                    
                  </div>
<div className="h-5">

          {isTyping &&
              <div className="text-sm text-gray-500 px-3">typing...</div>
          }
</div>
                </div>
                </div>

                {messages.length == 0 ? (
                  <div className=" h-1/2 text-lg flex items-end justify-center" > Start Chatting...</div>
                ) : (
                  <div ref={containerRef} className="flex flex-col   gap-2 p-1 h-[650px] overflow-y-auto ">
                    {messages.map((message, i) => {

                        const isOwn = message.sender === sender 
                      return (
                        <div className="" key={i} >
                             <div className={`${isOwn ? "bg-gray-300  ml-auto rounded-lg  " :" bg-gray-200"} p-1 break-all  w-fit max-w-[70%]`}>
                                 <div>   {message.message} </div>
                                 <div className="text-xs "> {new Date(message.createdAt).toLocaleTimeString()} </div>

{isOwn && (
  <div className="text-xs">
    {message.status === "sent" && "✓"}
    {message.status === "delivered" && "✓✓"}
    {message.status === "seen" && (<span className="text-blue-500">✓✓</span>)}
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
