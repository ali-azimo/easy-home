import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ImoItems from './ImoItems';
import ServicosSecao from '../components/Service';
import { FaClock, FaQuestionCircle, FaEnvelope, FaMapMarkerAlt, FaHeart, FaRegHeart } from 'react-icons/fa';
import MapMoz from '../components/MapMoz';

export default function Home() {
  const [offerImos, setOfferImos] = useState([]);
  const [saleImos, setSaleImos] = useState([]);
  const [rentImos, setRentImos] = useState([]);
  const [buildImos, setBuildImos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState([]);
  const [userLikedImos, setUserLikedImos] = useState([]);
  const [processingLikes, setProcessingLikes] = useState({});
  const [error, setError] = useState(null);

  SwiperCore.use([Navigation, Autoplay, EffectFade]);

  const fetchUserLikes = async () => {
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
        
        // Verificar a estrutura da resposta
        const likedIds = data.likes ? data.likes.map(like => like.propertyId || like.imoId) : 
                        Array.isArray(data) ? data.map(like => like.propertyId || like.imoId) : [];
        
        setLikedProperties(likedIds);
        
        // Buscar detalhes dos imóveis curtidos
        if (likedIds.length > 0) {
          try {
            const likedRes = await fetch(
              `${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/liked-properties`,
              { 
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyIds: likedIds })
              }
            );
            
            if (likedRes.ok) {
              const likedData = await likedRes.json();
              console.log('Imóveis curtidos:', likedData);
              setUserLikedImos(likedData);
            } else {
              console.error('Erro ao buscar imóveis curtidos:', likedRes.status);
            }
          } catch (err) {
            console.error('Erro na requisição de imóveis curtidos:', err);
          }
        }
      } else {
        console.error('Erro ao buscar likes do usuário:', res.status);
        // Se for 401 (não autenticado), apenas limpar os likes
        if (res.status === 401) {
          setLikedProperties([]);
          setUserLikedImos([]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar likes:', error);
      setError('Erro ao carregar favoritos');
    }
  };

  // Função para dar/remover like
  const handleLike = async (imoId) => {
    // Prevenir múltiplos cliques
    if (processingLikes[imoId]) return;
    
    setProcessingLikes(prev => ({ ...prev, [imoId]: true }));
    setError(null);
    
    const isCurrentlyLiked = likedProperties.includes(imoId);
    
    try {
      if (isCurrentlyLiked) {
        // Buscar o ID do like para deletar - primeiro verificar qual endpoint existe
        const res = await fetch(
          `${import.meta.env.VITE_API_KEY_ONRENDER}/api/like/${imoId}`,
          {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (res.ok) {
          // Atualizar estado dos likes
          setLikedProperties(prev => prev.filter(id => id !== imoId));
          setUserLikedImos(prev => prev.filter(imo => imo._id !== imoId));
          
          // Atualizar contador de likes nos imóveis
          updateLikeCount(imoId, false);
        } else {
          throw new Error(`Erro ${res.status}: ${res.statusText}`);
        }
      } else {
        // Criar novo like - testar diferentes endpoints
        const res = await fetch(
          `${import.meta.env.VITE_API_KEY_ONRENDER}/api/like`,
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
          console.log('Like criado:', data);
          
          // Atualizar estado dos likes
          setLikedProperties(prev => [...prev, imoId]);
          
          // Buscar detalhes do imóvel curtido
          const imoToAdd = [...offerImos, ...saleImos, ...rentImos, ...buildImos]
            .find(imo => imo._id === imoId);
          if (imoToAdd) {
            setUserLikedImos(prev => [...prev, { ...imoToAdd, likes: (imoToAdd.likes || 0) + 1 }]);
          }
          
          // Atualizar contador de likes nos imóveis
          updateLikeCount(imoId, true);
        } else {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Erro ${res.status}: ${res.statusText}`);
        }
      }
    } catch (error) {
      console.error('Erro ao processar like:', error);
      setError(error.message || 'Erro ao processar sua ação. Tente novamente.');
      
      // Tentar método alternativo se o primeiro falhar
      if (!isCurrentlyLiked) {
        try {
          // Tentar endpoint alternativo
          const altRes = await fetch(
            `${import.meta.env.VITE_API_KEY_ONRENDER}/api/like/create`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ propertyId: imoId })
            }
          );
          
          if (altRes.ok) {
            const data = await altRes.json();
            console.log('Like criado via endpoint alternativo:', data);
            
            setLikedProperties(prev => [...prev, imoId]);
            updateLikeCount(imoId, true);
            setError(null);
          }
        } catch (altError) {
          console.error('Erro no método alternativo:', altError);
        }
      }
    } finally {
      setProcessingLikes(prev => ({ ...prev, [imoId]: false }));
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
        
        // Buscar imóveis em paralelo para melhor performance
        const requests = [
          fetch(`${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?offer=true&limit=4`, 
            { credentials: 'include' }),
          fetch(`${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?type=rent&limit=4`, 
            { credentials: 'include' }),
          fetch(`${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?type=sale&limit=4`, 
            { credentials: 'include' }),
          fetch(`${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?type=build&limit=4`, 
            { credentials: 'include' })
        ];

        const responses = await Promise.all(requests);
        
        // Verificar se todas as respostas são OK
        const errors = responses.filter(res => !res.ok);
        if (errors.length > 0) {
          throw new Error(`Erro ao buscar imóveis: ${errors.map(r => r.status).join(', ')}`);
        }
        
        const [offerData, rentData, saleData, buildData] = await Promise.all(
          responses.map(res => res.json())
        );

        setOfferImos(offerData || []);
        setRentImos(rentData || []);
        setSaleImos(saleData || []);
        setBuildImos(buildData || []);
        
        // Buscar likes do usuário
        await fetchUserLikes();
        
      } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
        setError('Erro ao carregar imóveis. Por favor, recarregue a página.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllImos();
  }, []);

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

  // Função para renderizar seção de imóveis
  const renderImoSection = (title, link, imos, isLikedSection = false) => {
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
              <button
                onClick={() => handleLike(imo._id)}
                disabled={processingLikes[imo._id]}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md hover:scale-110 transition-all ${
                  processingLikes[imo._id] 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'bg-white hover:bg-gray-100'
                }`}
                title={
                  processingLikes[imo._id] 
                    ? "Processando..." 
                    : isLiked(imo._id) 
                    ? "Remover dos favoritos" 
                    : "Adicionar aos favoritos"
                }
              >
                {processingLikes[imo._id] ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : isLiked(imo._id) || isLikedSection ? (
                  <FaHeart className="text-red-500 text-lg" />
                ) : (
                  <FaRegHeart className="text-gray-500 text-lg" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
            delay: offerImos.length > 0 ? 9000 / offerImos.length : 9000,
            disableOnInteraction: false,
          }}
          slidesPerView={1}
          pagination={{ clickable: true }}
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
                className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px]"
                style={{
                  background: `url(${imo.imageUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
              >
                {/* Botão de Like */}
                <button
                  onClick={() => handleLike(imo._id)}
                  disabled={processingLikes[imo._id]}
                  className={`absolute top-4 right-4 z-20 p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 ${
                    processingLikes[imo._id] 
                      ? 'opacity-50 cursor-not-allowed bg-gray-300' 
                      : 'bg-white/90 hover:bg-white'
                  }`}
                  title={
                    processingLikes[imo._id] 
                      ? "Processando..." 
                      : isLiked(imo._id) 
                      ? "Remover dos favoritos" 
                      : "Adicionar aos favoritos"
                  }
                >
                  {processingLikes[imo._id] ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : isLiked(imo._id) ? (
                    <FaHeart className="text-red-500 text-xl" />
                  ) : (
                    <FaRegHeart className="text-gray-600 text-xl" />
                  )}
                </button>

                <div className="absolute inset-0 bg-black/30 bg-opacity-20"></div>

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
                    >
                      Ver mais detalhes
                    </Link>
                    <button
                      onClick={() => handleLike(imo._id)}
                      disabled={processingLikes[imo._id]}
                      className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold shadow-md transition duration-300 ${
                        processingLikes[imo._id] 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : isLiked(imo._id) 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-gray-700 hover:bg-gray-800'
                      }`}
                    >
                      {processingLikes[imo._id] ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processando...
                        </>
                      ) : isLiked(imo._id) ? (
                        <>
                          <FaHeart /> Remover Favorito
                        </>
                      ) : (
                        <>
                          <FaRegHeart /> Adicionar Favorito
                        </>
                      )}
                    </button>
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
        {userLikedImos.length > 0 && (
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
                Ver todos ({userLikedImos.length})
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {userLikedImos.slice(0, 4).map((imo) => (
                <div key={imo._id} className="relative flex-1 min-w-[280px] max-w-[320px]">
                  <ImoItems imo={imo} />
                  <button
                    onClick={() => handleLike(imo._id)}
                    disabled={processingLikes[imo._id]}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md hover:scale-110 transition-all ${
                      processingLikes[imo._id] 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'bg-white hover:bg-gray-100'
                    }`}
                    title="Remover dos favoritos"
                  >
                    {processingLikes[imo._id] ? (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaHeart className="text-red-500 text-lg" />
                    )}
                  </button>
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