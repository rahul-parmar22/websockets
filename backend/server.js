

import express from "express";
import http from "http";    
import cors from "cors"; 
import { Server } from "socket.io";
import { webSocketHandler } from "./webSocket/socket.js";
import connectDB from "./db/db.js";
import userRoutes from "./router/userRoutes.js";
import messageRoutes from "./router/messageRoutes.js";


const app = express();  // Ye ek function + router + middleware system hai.  // aa ek express app chhe jema tame routing , middleware , reqest, res badhu decide kari shako controller ni help thi vagere.. pan aa server nathi..aa ek app chhe

app.use(cors())
app.use(express.json()); 

const server = http.createServer(app); //1. Ye actual network server hai...iska kam hai 1.port pe listen karna (server.listen)...2.incoming HTTP request receive karna....3.fir us request ko app ko pass kar dena...👉 Matlab: "request ko accept karna" 
                                      //2. Client (browser)->HTTP Server (server)->Express App (app)->Response back  //je webserver hoy ngnix , evi rite aa ek node nu web server j chhe.. je client thi req le and express app ne aape
                                     //3. aapane je app.listen direct karvi e internally aa j kartu hoy http.createServer(app).listen(5000).. ek server banave and tene run kare...
                                    //4.  👉 Isliye lagta hai ki app hi server hai, but reality me:Express app ko HTTP server ke andar wrap kiya jaata hai
                                   //5. ⚡ To phir alag server kyun banate hai?...Socket.IO ko actual HTTP server chahiye hota hai, Express app nahi.... ane app.listen ma app j server banavi nakhe pan socket mate thoduk haji configuration karvanu hoy server ma to e app.listen ma nahi kari shakay mate ahi server manually banavvi chhie
                                  //6.  2 number ni line ma je chhe flow ema em chhe ke tame url nakho browser ma etale e url server par jay ane  "server (HTTP server) us request ko receive karta hai" ane pachhi aapane http.createServer(app) karelu cheh to👉 server automatically ye karta hai: app(req, res);  Ab app (Express) check karta hai:app.get("/")  👉 match mil gaya → response bhej deta hai

const io = new Server(server,{ cors:{
    origin:"http://localhost:5173"
}}); 

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/messages", messageRoutes); 

webSocketHandler(io); 


const startServer = async()=>{
    try {

       await  connectDB(); 
       server.listen(5000, ()=>console.log("server runnin on port 5000"))

        
    } catch (error) {
        console.log(error);
        process.exit(1); 
    }
}

startServer(); 








// why express App? nodejsApp vs expressApp

//node js features aape te::  1. 🌐 HTTP module(👉 Ye hi actual server banata hai)   2. 📁 File system (fs)(👉 Files read/write kar sakta hai)     3. ⚡ Event system(👉 Non-blocking, async ka pura system)     4. 🔌 Networking(👉 TCP, streams, buffers — low level control)

// wihtout epxress tamare jetala pan url bane tene aavi rite handle karva pade

// import http from "http";

// const server = http.createServer((req, res) => {
//   if (req.url === "/" && req.method === "GET") {
//     res.end("Home page");
//   }
// });

// server.listen(5000);     // tamare abdha url ma check lagavva pade ane andar function lakhva pade je bov tough chhe... url check, method check, response handle badhu manually karvu pade 

// mate express aavi ane aa badhu simple kari didhu

// ✅ With Express
// const app = express();

// app.get("/", (req, res) => {
//   res.send("Home page");
// });