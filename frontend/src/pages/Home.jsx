import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

const socket =  io("http://localhost:5000");  //aane component ni bahar lakhvu nahi to jyare pan component render thashe like typing vakhte pan to etali var new socekt banshe ....mate me pahela andar lakhelu htu ane jyare pan refresh karto page to backend ma ketala badha user disconnnected na message aavta means badha render vakhte ek new socket bantu htu

function Home() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null); // jo ahi null nahi hoy ane [] pass karsho to aa bhale empty hoy chhata array ek truthy valu chhe to empty array hova chhata je true ni condition hashe te chalshe..mate ahi jo active user nahi hoy tem chhata active userno je interface and style dekahdvani hoy te dekhashe
  const [sender, setSender] = useState(localStorage.getItem("userId"));

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

  const sendMessage = () => {
    if (message.trim() !== "") 
        
        {
      socket.emit("send_message", {
        sender: sender,
        receiver: activeUser._id,
        message,
      });
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
                  <div className="font-medium text-lg">
                    {activeUser?.username}{" "}
                  </div>
                </div>

                {messages.length == 0 ? (
                  <div className=" h-1/2 text-lg flex items-end justify-center" > Start Chatting...</div>
                ) : (
                  <div className="flex flex-col  gap-2 p-1 h-[650px] overflow-y-auto ">
                    {messages.map((message, i) => {

                        const isOwn = message.sender === sender 
                      return (
                        <div className="" key={i} >
                             <div className={`${isOwn ? "bg-gray-300 max-w-[70%]  ml-auto rounded-lg  break-all " :" bg-gray-200"}   `}>
                                   {message.message} 
                             </div>
                       
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="absolute bottom-4 flex gap-3 w-[90%]">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
