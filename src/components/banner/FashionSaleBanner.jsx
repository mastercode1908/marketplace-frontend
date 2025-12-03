import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

/**
 * FashionSaleBanner Component
 * Left banner with carousel functionality for Fashion Sale & New Arrival
 */
export default function FashionSaleBanner({ banners = [], currentSlide, onSlideChange, otherBannerSlide }) {
  const navigate = useNavigate();
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselIntervalRef = useRef(null);

  const heroSlides = banners;

  // Navigation functions
  const nextSlide = () => {
    if (heroSlides.length === 0) return;
    let next = (currentSlide + 1) % heroSlides.length;
    // Ensure left banner is not same as right banner
    if (heroSlides.length > 1 && next === otherBannerSlide) {
      next = (next + 1) % heroSlides.length;
    }
    onSlideChange(next);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    if (heroSlides.length === 0) return;
    let next = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    // Ensure left banner is not same as right banner
    if (heroSlides.length > 1 && next === otherBannerSlide) {
      next = (next - 1 + heroSlides.length) % heroSlides.length;
    }
    onSlideChange(next);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToSlide = (index) => {
    onSlideChange(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Auto-play effect
  useEffect(() => {
    if (isAutoPlaying && heroSlides.length > 1) {
      carouselIntervalRef.current = setInterval(() => {
        let next = (currentSlide + 1) % heroSlides.length;
        // Ensure left banner is not same as right banner
        if (heroSlides.length > 1 && next === otherBannerSlide) {
          next = (next + 1) % heroSlides.length;
        }
        onSlideChange(next);
      }, 5000); // Change slide every 5 seconds
    } else {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    }

    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, [isAutoPlaying, heroSlides.length, currentSlide, otherBannerSlide, onSlideChange]);

  return (
    <div className="relative w-full h-[300px] rounded-2xl overflow-hidden">
      {heroSlides.length === 0 ? (
        <div className="w-full h-[200px] md:h-[316px] bg-[#212844] rounded-2xl flex items-center justify-center text-white text-lg">
          Chưa có banner quảng cáo nào
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-banner relative overflow-hidden rounded-2xl cursor-pointer absolute inset-0"
            style={{
              width: "100%",
              height: "100%",
              background: heroSlides[currentSlide]?.imageUrl
                ? `url(${heroSlides[currentSlide].imageUrl}) center/100% 100% no-repeat`
                : "#212844",
            }}
            onMouseEnter={() => setIsBannerHovered(true)}
            onMouseLeave={() => setIsBannerHovered(false)}
            onClick={() => {
              if (heroSlides[currentSlide]?.sellerId) {
                navigate(`/shop/${heroSlides[currentSlide].sellerId}`);
              }
            }}
          >
            {/* Navigation Arrows - Only visible on hover */}
            {heroSlides.length > 1 && (
              <>
                <button
                  className="hero-nav-btn-prev absolute left-2 md:left-4 z-20 bg-white rounded-full shadow-lg w-8 h-8 md:w-12 md:h-12 flex items-center justify-center border border-[#EDEDED] hover:bg-[#008ECC] transition-all duration-300 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  aria-label="Previous hero slide"
                  style={{
                    opacity: isBannerHovered ? 1 : 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    transition: "opacity 0.3s ease",
                    pointerEvents: isBannerHovered ? "auto" : "none",
                    position: "absolute",
                  }}
                >
                  <LeftOutlined
                    className="group-hover:text-white"
                    style={{ fontSize: "14px", color: "#008ECC" }}
                  />
                </button>
                <button
                  className="hero-nav-btn-next absolute right-2 md:right-4 z-20 bg-white rounded-full shadow-lg w-8 h-8 md:w-12 md:h-12 flex items-center justify-center border border-[#EDEDED] hover:bg-[#008ECC] transition-all duration-300 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  aria-label="Next hero slide"
                  style={{
                    opacity: isBannerHovered ? 1 : 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    transition: "opacity 0.3s ease",
                    pointerEvents: isBannerHovered ? "auto" : "none",
                    position: "absolute",
                  }}
                >
                  <RightOutlined
                    className="group-hover:text-white"
                    style={{ fontSize: "14px", color: "#008ECC" }}
                  />
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Carousel Dots */}
      <div
        className="absolute bottom-4 left-1/4 transform -translate-x-1/2 flex gap-2 z-10"
        style={{ bottom: "31px", gap: "15px" }}
      >
        {heroSlides.map((_, index) => (
          <motion.button
            key={index}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-[#008ECC] w-8"
                : "bg-white opacity-50 w-2"
            }`}
            style={{ height: "8px" }}
            onClick={() => goToSlide(index)}
            whileHover={{ scale: 1.2, opacity: 1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to hero slide ${index + 1}`}
            animate={{
              opacity: index === currentSlide ? 1 : 0.5,
              scale: index === currentSlide ? 1.2 : 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

