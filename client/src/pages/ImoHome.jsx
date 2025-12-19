import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ImoItems from './ImoItems';
import ServicosSecao from '../components/Service';
import { FaHeart, FaRegHeart, FaQuestionCircle } from 'react-icons/fa';
import MapMoz from '../components/MapMoz';

export default function Home() {
  const [offerImos, setOfferImos] = useState([]);
  const [saleImos, setSaleImos] = useState([]);
  const [rentImos, setRentImos] = useState([]);
  const [buildImos, setBuildImos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState([]);
  const [processingLikes, setProcessingLikes] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  SwiperCore.use([Navigation, Autoplay, EffectFade]);

  // Função para verificar autenticação
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token;
  }, []);

  // Buscar likes do usuário
  const fetchUserLikes = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY_ONRENDER}/api/like/user`,
        { 
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        console.log('Likes do usuário:', data);
        
        // Extrair IDs dos imóveis curtidos
        const likedIds = data.likedProperties || 
                        (data.likes ? data.likes.map(like => like.propertyId || like.imoId) : []);
        
        setLikedProperties(likedIds);
      } else if (res.status === 401) {
        // Usuário não autenticado
        setLikedProperties([]);
      }
    } catch (error) {
      console.error('Erro ao buscar likes:', error);
    }
  }, []);

  // Função para dar/remover like usando o endpoint toggle
  const handleLike = async (imoId) => {
    // Verificar se usuário está autenticado
    if (!isAuthenticated()) {
      setError('Por favor, faça login para adicionar aos favoritos');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (processingLikes[imoId]) return;
    
    setProcessingLikes(prev => ({ ...prev, [imoId]: true }));
    setError(null);
    
    const isCurrentlyLiked = likedProperties.includes(imoId);
    
    try {
      // Usar o endpoint toggle
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY_ONRENDER}/api/like/toggle`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ propertyId: imoId })
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        console.log('Resposta do like:', data);
        
        // Atualizar estado baseado na resposta
        if (data.liked) {
          // Like adicionado
          setLikedProperties(prev => [...prev, imoId]);
          updateLikeCount(imoId, true);
        } else {
          // Like removido
          setLikedProperties(prev => prev.filter(id => id !== imoId));
          updateLikeCount(imoId, false);
        }
      } else if (res.status === 401) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        setTimeout(() => setError(null), 3000);
      } else {
        throw new Error(`Erro ${res.status}: Não foi possível processar o like`);
      }
    } catch (error) {
      console.error('Erro ao processar like:', error);
      setError(error.message || 'Erro ao processar sua ação. Tente novamente.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingLikes(prev => ({ ...prev, [imoId]: false }));
    }
  };

  // Fallback para endpoints antigos (caso o toggle não exista)
  const handleLikeFallback = async (imoId) => {
    if (processingLikes[imoId]) return;
    
    setProcessingLikes(prev => ({ ...prev, [imoId]: true }));
    setError(null);
    
    const isCurrentlyLiked = likedProperties.includes(imoId);
    
    try {
      if (isCurrentlyLiked) {
        // Tenta remover like usando endpoints alternativos
        const endpoints = [
          `/api/like/property/${imoId}`,
          `/api/like/delete/${imoId}`,
          `/api/like/${imoId}`
        ];
        
        let success = false;
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_KEY_ONRENDER}${endpoint}`,
              {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (res.ok) {
              setLikedProperties(prev => prev.filter(id => id !== imoId));
              updateLikeCount(imoId, false);
              success = true;
              break;
            }
          } catch (err) {
            console.log(`Endpoint ${endpoint} falhou, tentando próximo...`);
          }
        }
        
        if (!success) {
          throw new Error('Não foi possível remover o like');
        }
      } else {
        // Tenta criar like usando endpoints alternativos
        const endpoints = [
          '/api/like/create',
          '/api/like'
        ];
        
        let success = false;
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_KEY_ONRENDER}${endpoint}`,
              {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: imoId })
              }
            );
            
            if (res.ok) {
              setLikedProperties(prev => [...prev, imoId]);
              updateLikeCount(imoId, true);
              success = true;
              break;
            }
          } catch (err) {
            console.log(`Endpoint ${endpoint} falhou, tentando próximo...`);
          }
        }
        
        if (!success) {
          throw new Error('Não foi possível adicionar o like');
        }
      }
    } catch (error) {
      console.error('Erro ao processar like (fallback):', error);
      setError(error.message || 'Erro ao processar sua ação. Tente novamente.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingLikes(prev => ({ ...prev, [imoId]: false }));
    }
  };

  // Função unificada para lidar com like
  const handleLikeWrapper = async (imoId) => {
    if (!isAuthenticated()) {
      setError('Por favor, faça login para adicionar aos favoritos');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Primeiro tenta o novo endpoint toggle
    try {
      await handleLike(imoId);
    } catch (err) {
      console.log('Tentando fallback para endpoints antigos...');
      // Se falhar, tenta os endpoints antigos
      await handleLikeFallback(imoId);
    }
  };

  const updateLikeCount = (imoId, increment) => {
    const updateImoList = (list) => 
      list.map(imo => 
        imo._id === imoId 
          ? { 
              ...imo, 
              likes: increment 
                ? (imo.likes || 0) + 1 
                : Math.max((imo.likes || 1) - 1, 0)
            } 
          : imo
      );

    setOfferImos(prev => updateImoList(prev));
    setSaleImos(prev => updateImoList(prev));
    setRentImos(prev => updateImoList(prev));
    setBuildImos(prev => updateImoList(prev));
  };

  // Função para verificar se um imóvel está curtido
  const isLiked = (imoId) => {
    return likedProperties.includes(imoId);
  };

  // Buscar todos os imóveis
  useEffect(() => {
    const fetchAllImos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar imóveis em paralelo
        const [offerRes, rentRes, saleRes, buildRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?offer=true&limit=4`, 
            { credentials: 'include' }),
          fetch(`${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?type=rent&limit=4`, 
            { credentials: 'include' }),
          fetch(`${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?type=sale&limit=4`, 
            { credentials: 'include' }),
          fetch(`${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?type=build&limit=4`, 
            { credentials: 'include' })
        ]);

        const [offerData, rentData, saleData, buildData] = await Promise.all([
          offerRes.ok ? offerRes.json() : [],
          rentRes.ok ? rentRes.json() : [],
          saleRes.ok ? saleRes.json() : [],
          buildRes.ok ? buildRes.json() : []
        ]);

        setOfferImos(offerData || []);
        setRentImos(rentData || []);
        setSaleImos(saleData || []);
        setBuildImos(buildData || []);
        
        // Buscar likes do usuário
        await fetchUserLikes();
        
      } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
        setError('Erro ao carregar imóveis. Por favor, recarregue a página.');
        setTimeout(() => setError(null), 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchAllImos();
  }, [fetchUserLikes]);

  // Componente de botão de like reutilizável
  const LikeButton = ({ imoId, size = 'md', position = 'absolute', showText = false }) => {
    const liked = isLiked(imoId);
    const processing = processingLikes[imoId];
    
    const handleClick = async (e) => {
      e.stopPropagation();
      e.preventDefault();
      await handleLikeWrapper(imoId);
    };
    
    return (
      <button
        onClick={handleClick}
        disabled={processing}
        className={`
          ${position === 'absolute' ? 'absolute top-3 right-3 z-10' : ''}
          ${size === 'lg' ? 'p-3' : size === 'sm' ? 'p-1.5' : 'p-2'}
          ${showText ? 'px-4 py-2 rounded-md flex items-center gap-2' : 'rounded-full'}
          shadow-md hover:scale-110 transition-all duration-200
          ${processing 
            ? 'opacity-50 cursor-not-allowed bg-gray-200' 
            : liked
              ? 'bg-red-50 hover:bg-red-100'
              : 'bg-white hover:bg-gray-50'
          }
          ${showText && liked ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
          ${showText && !liked ? 'bg-gray-700 hover:bg-gray-800 text-white' : ''}
        `}
        title={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        {processing ? (
          <div className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} border-2 border-blue-500 border-t-transparent rounded-full animate-spin`}></div>
        ) : liked ? (
          <>
            <FaHeart className={`${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-xl' : 'text-lg'} text-red-500`} />
            {showText && <span>Remover Favorito</span>}
          </>
        ) : (
          <>
            <FaRegHeart className={`${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-xl' : 'text-lg'} text-gray-500`} />
            {showText && <span>Adicionar Favorito</span>}
          </>
        )}
      </button>
    );
  };

  // Função para renderizar seção de imóveis
  const renderImoSection = (title, link, imos) => {
    if (!imos || imos.length === 0) return null;

    return (
      <div>
        <div className="my-3 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-700">{title}</h2>
          <Link to={link} className="text-sm text-blue-800 hover:underline font-medium">
            Mostrar mais
          </Link>
        </div>
        <div className="flex flex-wrap gap-4">
          {imos.map((imo) => (
            <div key={imo._id} className="relative flex-1 min-w-[280px] max-w-[320px]">
              <ImoItems imo={imo} />
              <LikeButton imoId={imo._id} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Obter imóveis curtidos a partir de todas as listas
  const getLikedImos = () => {
    const allImos = [...offerImos, ...rentImos, ...saleImos, ...buildImos];
    return allImos.filter(imo => likedProperties.includes(imo._id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm font-medium">A carregar conteúdo...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Mensagem de erro */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg animate-fade-in">
          <div className="flex items-center">
            <FaQuestionCircle className="mr-2" />
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Swiper com botão de like */}
      {offerImos.length > 0 && (
        <Swiper
          loop={true}
          autoplay={{
            delay: 9000,
            disableOnInteraction: false,
          }}
          slidesPerView={1}
          speed={1000}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          modules={[Autoplay, Navigation]}
          className="w-full"
          navigation
        >
          {offerImos.map((imo) => (
            <SwiperSlide key={imo._id}>
              <div
                className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] cursor-pointer"
                style={{
                  background: `url(${imo.imageUrls?.[0] || '/default-image.jpg'}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
                onClick={() => navigate(`/imo/${imo._id}`)}
              >
                {/* Botão de Like */}
                <div onClick={(e) => e.stopPropagation()}>
                  <LikeButton imoId={imo._id} size="lg" />
                </div>

                <div className="absolute inset-0 bg-black/30"></div>

                <div className="absolute inset-0 flex flex-col justify-center items-start p-6 text-white max-w-2xl ml-10">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg">
                      {imo.name}
                    </h2>
                    <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                      <FaHeart className="text-red-300" />
                      <span>{imo.likes || 0}</span>
                    </span>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg mb-4 drop-shadow-md">
                    {imo.description?.substring(0, 100)}...
                  </p>
                  <div className="flex gap-3">
                    <Link
                      to={`/imo/${imo._id}`}
                      className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md text-sm font-semibold shadow-md transition duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver mais detalhes
                    </Link>
                    <div onClick={(e) => e.stopPropagation()}>
                      <LikeButton imoId={imo._id} showText={true} position="relative" />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Resto do conteúdo */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {/* Seção de Imóveis Curtidos */}
        {likedProperties.length > 0 && (
          <div className="bg-gradient-to-r from-pink-50 to-red-50 p-6 rounded-xl shadow-sm">
            <div className="my-3 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-slate-700">Meus Favoritos</h2>
                <p className="text-sm text-slate-500">Propriedades que você curtiu</p>
              </div>
              <Link 
                to="/favorites" 
                className="text-sm text-pink-700 hover:text-pink-800 hover:underline font-medium flex items-center gap-1"
              >
                <FaHeart className="text-pink-600" />
                Ver todos ({likedProperties.length})
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {getLikedImos().slice(0, 4).map((imo) => (
                <div key={imo._id} className="relative flex-1 min-w-[280px] max-w-[320px]">
                  <ImoItems imo={imo} />
                  <LikeButton imoId={imo._id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Imóveis em Oferta */}
        {renderImoSection("Mais recentes", "/search?offer=true", offerImos)}

        {/* Imóveis para Arrendar */}
        {renderImoSection("Casas para arrendar", "/search?type=rent", rentImos)}

        {/* Imóveis para Venda */}
        {renderImoSection("Casas para venda", "/search?type=sale", saleImos)}

        {/* Construção & Investimento */}
        {renderImoSection("Construção & Investimento", "/search?type=build", buildImos)}

        {/* Serviços */}
        <ServicosSecao />
        
        {/* Mapa */}
        <MapMoz />
      </div>
    </div>
  );
}