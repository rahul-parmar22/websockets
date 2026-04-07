import { Router } from "express"
import { getAllUsers, login, register } from "../controller/userController.js";


const router = Router(); 


router.get("/all-users", getAllUsers);
router.post("/register", register);
router.post("/login", login);

export default router; 