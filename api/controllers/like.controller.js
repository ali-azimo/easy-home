import Like from "../models/like.model.js";
import { errorHandler } from "../utils/erros.js";

// Criar Like - Aceita postId, propertyId ou imoId
export const createLike = async (req, res, next) => {
  try {
    const { postId, propertyId, imoId } = req.body;
    
    // Determinar qual ID usar (prioridade: postId > propertyId > imoId)
    const targetId = postId || propertyId || imoId;
    
    if (!targetId) {
      return next(errorHandler(400, "ID do imóvel é obrigatório"));
    }

    // Verificar se já existe like do mesmo user para este imóvel
    const exists = await Like.findOne({
      userId: req.user.id,
      $or: [
        { postId: targetId },
        { propertyId: targetId },
        { imoId: targetId }
      ]
    });

    if (exists) {
      return next(errorHandler(400, "Já deste like neste imóvel."));
    }

    const like = await Like.create({
      userId: req.user.id,
      postId: targetId,
      propertyId: targetId,
      imoId: targetId
    });

    return res.status(201).json(like);
  } catch (error) {
    next(error);
  }
};

// Remover Like pelo ID do like
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

    return res.status(200).json({
      success: true,
      message: "Like removido com sucesso!",
      propertyId: like.postId || like.propertyId || like.imoId
    });
  } catch (error) {
    next(error);
  }
};

// Remover Like pelo ID da propriedade
export const deleteLikeByProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    
    if (!propertyId) {
      return next(errorHandler(400, "ID da propriedade é obrigatório"));
    }

    const like = await Like.findOne({
      userId: req.user.id,
      $or: [
        { postId: propertyId },
        { propertyId: propertyId },
        { imoId: propertyId }
      ]
    });

    if (!like) {
      return next(errorHandler(404, "Like não encontrado"));
    }

    if (req.user.id !== like.userId) {
      return next(errorHandler(401, "Apenas podes remover o teu próprio like"));
    }

    await Like.findByIdAndDelete(like._id);

    return res.status(200).json({
      success: true,
      message: "Like removido com sucesso!",
      propertyId: propertyId
    });
  } catch (error) {
    next(error);
  }
};

export const getLikesByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    
    const likes = await Like.find({
      $or: [
        { postId: postId },
        { propertyId: postId },
        { imoId: postId }
      ]
    }).sort({ createdAt: -1 });
    
    return res.status(200).json(likes);
  } catch (error) {
    next(error);
  }
};

export const getUserLikes = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const likes = await Like.find({ 
      userId: userId 
    }).sort({ createdAt: -1 });
    
    return res.status(200).json(likes);
  } catch (error) {
    next(error);
  }
};

export const getUserLikesByToken = async (req, res, next) => {
  try {
    const likes = await Like.find({ 
      userId: req.user.id 
    }).sort({ createdAt: -1 });
    
    return res.status(200).json(likes);
  } catch (error) {
    next(error);
  }
};