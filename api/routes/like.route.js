import express from "express";
import { verifyToken } from "../utils/verificar.usuario.js";
import {
  createLike,
  deleteLike,
  getLikesByPost,
  getUserLikes,
  getUserLikesByToken,
  deleteLikeByProperty
} from "../controllers/like.controller.js";

const router = express.Router();

router.post("/", verifyToken, createLike);
router.post("/create", verifyToken, createLike);

router.delete("/delete/:id", verifyToken, deleteLike); 
router.delete("/property/:propertyId", verifyToken, deleteLikeByProperty);

router.get("/post/:postId", getLikesByPost);
router.get("/user/:userId", getUserLikes);
router.get("/user", verifyToken, getUserLikesByToken); // Novo endpoint

export default router;