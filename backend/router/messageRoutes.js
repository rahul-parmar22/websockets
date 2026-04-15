import { Router } from "express";
import { deleteMessage, getMessages } from "../controller/messageController.js";



const router = Router(); 

router.get("/all-messages", getMessages);
router.delete("/:id", deleteMessage)


export default router;

