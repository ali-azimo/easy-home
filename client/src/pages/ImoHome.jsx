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

  SwiperCore.use([Navigation, Autoplay, EffectFade]);

  // Função para buscar imóveis curtidos pelo usuário
  const fetchUserLikes = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY_ONRENDER}/api/like/user-likes`,
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
        const likedIds = data.map(like => like.propertyId || like.imoId);
        setLikedProperties(likedIds);
        
        // Buscar detalhes dos imóveis curtidos
        if (likedIds.length > 0) {
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
            setUserLikedImos(likedData);
          }
        }
      }
    } catch (error) {
      console.log('Erro ao buscar likes:', error);
    }
  };

  // Função para dar/remover like
  const handleLike = async (imoId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY_ONRENDER}/api/like/${imoId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (res.ok) {
        // Atualizar estado dos likes
        if (likedProperties.includes(imoId)) {
          setLikedProperties(likedProperties.filter(id => id !== imoId));
          setUserLikedImos(userLikedImos.filter(imo => imo._id !== imoId));
        } else {
          setLikedProperties([...likedProperties, imoId]);
          // Buscar detalhes do imóvel curtido
          const imoToAdd = [...offerImos, ...saleImos, ...rentImos, ...buildImos]
            .find(imo => imo._id === imoId);
          if (imoToAdd) {
            setUserLikedImos([...userLikedImos, imoToAdd]);
          }
        }
        
        // Atualizar contador de likes nos imóveis
        updateLikeCount(imoId);
      }
    } catch (error) {
      console.log('Erro ao dar like:', error);
    }
  };

  const updateLikeCount = (imoId) => {
    // Atualizar contador em todas as listas
    const updateImoList = (list) => 
      list.map(imo => 
        imo._id === imoId 
          ? { 
              ...imo, 
              likes: likedProperties.includes(imoId) 
                ? (imo.likes || 1) - 1 
                : (imo.likes || 0) + 1 
            } 
          : imo
      );

    setOfferImos(updateImoList(offerImos));
    setSaleImos(updateImoList(saleImos));
    setRentImos(updateImoList(rentImos));
    setBuildImos(updateImoList(buildImos));
  };

  // Função para verificar se um imóvel está curtido
  const isLiked = (imoId) => {
    return likedProperties.includes(imoId);
  };

  useEffect(() => {
    const fetchOfferImos = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?offer=true&limit=4`,
          { credentials: 'include' }
        );
        const data = await res.json();
        setOfferImos(data);
        fetchRentImos();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRentImos = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?type=rent&limit=4`,
          { credentials: 'include' }
        );
        const data = await res.json();
        setRentImos(data);
        fetchSaleImos();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleImos = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?type=sale&limit=4`,
          { credentials: 'include' }
        );
        const data = await res.json();
        setSaleImos(data);
        fetchBuildImos();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchBuildImos = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_KEY_ONRENDER}/api/imo/get?type=build&limit=4`,
          { credentials: 'include' }
        );
        const data = await res.json();
        setBuildImos(data);
        setLoading(false);
        // Buscar likes do usuário após carregar todos os imóveis
        fetchUserLikes();
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchOfferImos();
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

  return (
    <div>
      {/* Swiper com botão de like */}
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
                className="absolute top-4 right-4 z-20 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                title={isLiked(imo._id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                {isLiked(imo._id) ? (
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
                    className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-md text-sm font-semibold shadow-md transition duration-300 flex items-center gap-2"
                  >
                    {isLiked(imo._id) ? (
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
                to="/liked-properties" 
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
                    className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 hover:scale-110 transition-all"
                    title="Remover dos favoritos"
                  >
                    <FaHeart className="text-red-500 text-lg" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Imóveis em Oferta */}
        {offerImos.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Mais recentes</h2>
              <Link to="/search?offer=true" className="text-sm text-blue-800 hover:underline">
                Mostrar mais
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {offerImos.map((imo) => (
                <div key={imo._id} className="relative flex-1 min-w-[280px] max-w-[320px]">
                  <ImoItems imo={imo} />
                  <button
                    onClick={() => handleLike(imo._id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 hover:scale-110 transition-all"
                    title={isLiked(imo._id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    {isLiked(imo._id) ? (
                      <FaHeart className="text-red-500 text-lg" />
                    ) : (
                      <FaRegHeart className="text-gray-500 text-lg" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Imóveis para Arrendar */}
        {rentImos.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Casas para arrendar</h2>
              <Link to="/search?type=rent" className="text-sm text-blue-800 hover:underline">
                Mostrar mais
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {rentImos.map((imo) => (
                <div key={imo._id} className="relative flex-1 min-w-[280px] max-w-[320px]">
                  <ImoItems imo={imo} />
                  <button
                    onClick={() => handleLike(imo._id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 hover:scale-110 transition-all"
                    title={isLiked(imo._id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    {isLiked(imo._id) ? (
                      <FaHeart className="text-red-500 text-lg" />
                    ) : (
                      <FaRegHeart className="text-gray-500 text-lg" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Imóveis para Venda */}
        {saleImos.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Casas para venda</h2>
              <Link to="/search?type=sale" className="text-sm text-blue-800 hover:underline">
                Mostrar mais
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {saleImos.map((imo) => (
                <div key={imo._id} className="relative flex-1 min-w-[280px] max-w-[320px]">
                  <ImoItems imo={imo} />
                  <button
                    onClick={() => handleLike(imo._id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 hover:scale-110 transition-all"
                    title={isLiked(imo._id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    {isLiked(imo._id) ? (
                      <FaHeart className="text-red-500 text-lg" />
                    ) : (
                      <FaRegHeart className="text-gray-500 text-lg" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Construção & Investimento */}
        {buildImos.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Construção & Investimento</h2>
              <Link to="/search?type=build" className="text-sm text-blue-800 hover:underline">
                Mostrar mais
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {buildImos.map((imo) => (
                <div key={imo._id} className="relative flex-1 min-w-[280px] max-w-[320px]">
                  <ImoItems imo={imo} />
                  <button
                    onClick={() => handleLike(imo._id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 hover:scale-110 transition-all"
                    title={isLiked(imo._id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    {isLiked(imo._id) ? (
                      <FaHeart className="text-red-500 text-lg" />
                    ) : (
                      <FaRegHeart className="text-gray-500 text-lg" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Serviços */}
        <ServicosSecao />
        
        {/* Mapa */}
        <MapMoz />
      </div>
    </div>
  );
}