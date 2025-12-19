import Like from "../models/like.model.js";
import { errorHandler } from "../utils/erros.js";

// Criar ou remover like (toggle)
export const toggleLike = async (req, res, next) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.id;

    if (!propertyId) {
      return next(errorHandler(400, "ID do imóvel é obrigatório"));
    }

    // Verificar se já existe like
    const existingLike = await Like.findOne({
      userId,
      $or: [
        { propertyId },
        { postId: propertyId },
        { imoId: propertyId }
      ]
    });

    if (existingLike) {
      // Remover like
      await Like.findByIdAndDelete(existingLike._id);
      
      return res.status(200).json({
        success: true,
        message: "Like removido",
        liked: false,
        propertyId
      });
    } else {
      // Criar like
      const like = await Like.create({
        userId,
        propertyId,
        postId: propertyId,
        imoId: propertyId
      });

      return res.status(201).json({
        success: true,
        message: "Like adicionado",
        liked: true,
        propertyId,
        like
      });
    }
  } catch (error) {
    next(error);
  }
};

// Verificar se o usuário deu like em um imóvel específico
export const checkUserLike = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const like = await Like.findOne({
      userId,
      $or: [
        { propertyId },
        { postId: propertyId },
        { imoId: propertyId }
      ]
    });

    return res.status(200).json({
      liked: !!like,
      like
    });
  } catch (error) {
    next(error);
  }
};

// Listar todos os likes do usuário atual
export const getUserLikes = async (req, res, next) => {
  try {
    const likes = await Like.find({ 
      userId: req.user.id 
    }).sort({ createdAt: -1 });

    // Extrair apenas os IDs dos imóveis curtidos
    const likedProperties = likes.map(like => 
      like.propertyId || like.postId || like.imoId
    );

    return res.status(200).json({
      likes,
      likedProperties
    });
  } catch (error) {
    next(error);
  }
};

// Contar likes de um imóvel
export const getLikesCount = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    
    const count = await Like.countDocuments({
      $or: [
        { propertyId },
        { postId: propertyId },
        { imoId: propertyId }
      ]
    });

    return res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};