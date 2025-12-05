import Like from "../models/like.model.js";
import { errorHandler } from "../utils/erros.js";

// Criar Like
export const createLike = async (req, res, next) => {
  try {
    const { postId } = req.body;

    // Verificar se já existe like do mesmo user
    const exists = await Like.findOne({ userId: req.user.id, postId });

    if (exists) {
      return next(errorHandler(400, "Já deste like neste post."));
    }

    const like = await Like.create({
      userId: req.user.id,
      postId,
    });

    return res.status(201).json(like);
  } catch (error) {
    next(error);
  }
};

// Remover Like
export const deleteLike = async (req, res, next) => {
  try {
    const like = await Like.findById(req.params.id);

    if (!like) {
      return next(errorHandler(404, "Like não encontrado"));
    }

    if (req.user.id !== like.userId) {
      return next(errorHandler(401, "Apenas podes remover o teu próprio like"));
    }

    await Like.findByIdAndDelete(req.params.id);

    return res.status(200).json("Like removido com sucesso!");
  } catch (error) {
    next(error);
  }
};

// Listar likes de um post
export const getLikesByPost = async (req, res, next) => {
  try {
    const likes = await Like.find({ postId: req.params.postId }).sort({ createdAt: -1 });
    return res.status(200).json(likes);
  } catch (error) {
    next(error);
  }
};

// Listar likes do utilizador
export const getUserLikes = async (req, res, next) => {
  try {
    const likes = await Like.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    return res.status(200).json(likes);
  } catch (error) {
    next(error);
  }
};
