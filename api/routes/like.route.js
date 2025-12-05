import express from "express";
import { verifyToken } from "../utils/verificar.usuario.js";
import {
  createLike,
  deleteLike,
  getLikesByPost,
  getUserLikes
} from "../controllers/like.controller.js";

const router = express.Router();
router.post("/create", verifyToken, createLike);
router.delete("/delete/:id", verifyToken, deleteLike);
router.get("/post/:postId", getLikesByPost);
router.get("/user/:userId", getUserLikes);

export default router;
