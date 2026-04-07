import { Router } from "express";
import { getMessages } from "../controller/messageController.js";



const router = Router(); 

router.get("/", getMessages)

export default router;