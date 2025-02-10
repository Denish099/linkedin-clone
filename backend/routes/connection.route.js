import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendConnectionReq,
  acceptConnectionReq,
  rejectConnectionReq,
  getConnectionReq,
  getUserConnections,
  removeConnection,
  getConnectionStatus,
} from "../controllers/connection.controller.js";
const router = express.Router();

router.post("/request/:userId", protectRoute, sendConnectionReq);
router.put("accept/:requestId", protectRoute, acceptConnectionReq);
router.put("reject/:requestId", protectRoute, rejectConnectionReq);
//all pending connections request
router.get("/requests", protectRoute, getConnectionReq);
//all connection of a user
router.get("/", protectRoute, getUserConnections);
router.delete("/:userId", protectRoute, removeConnection);
router.get("/status/:userId", protectRoute, getConnectionStatus);

export default router;
