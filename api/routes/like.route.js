import express from "express";
import { verifyToken } from "../utils/verificar.usuario.js";
import {
  toggleLike,
  checkUserLike,
  getUserLikes,
  getLikesCount
} from "../controllers/like.controller.js";

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(verifyToken);

// Like/Unlike
router.post("/toggle", toggleLike);

// Verificar like específico
router.get("/check/:propertyId", checkUserLike);

// Likes do usuário
router.get("/user", getUserLikes);

// Contar likes de um imóvel
router.get("/count/:propertyId", getLikesCount);

export default router;