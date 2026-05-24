'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Heart, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatPrice } from '../store/commerce';

export function GlassProductCard({ product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Lock body scroll when cinematic modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const springTransition = {
    type: "spring",
    damping: 20,
    stiffness: 100
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  // Fallback to array containing single main image if product.images is undefined
  const images = product.images?.length > 0 ? product.images : [product.image];

  const nextImage = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setCurrentImageIndex(0), 400); // Reset slider on close
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted((prev) => {
      const next = !prev;
      if (next) {
        toast.success("Added to wishlist", {
          description: `${product.name} has been saved for later.`
        });
      } else {
        toast("Removed from wishlist", {
          description: `${product.name} has been removed from your wishlist.`
        });
      }
      return next;
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Simulate a network request to add the item to the cart
    setTimeout(() => {
      setIsAddingToCart(false);
      toast.success("Added to cart", {
        description: `${product.name} has been added to your cart.`
      });
    }, 1500); // 1.5 seconds loading state
  };

  // Auto-play effect
  useEffect(() => {
    if (!isOpen || images.length <= 1 || isAutoPlayPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500); // Automatically cycle every 3.5 seconds

    return () => clearInterval(timer);
  }, [isOpen, images.length, currentImageIndex, isAutoPlayPaused]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && images.length > 1) {
        setDirection(1);
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        setDirection(-1);
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setTimeout(() => setCurrentImageIndex(0), 400);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length]);

  return (
    <>
    {/* Collapsed Card */}
    <motion.div
      layoutId={`product-card-${product.slug}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => setIsOpen(true)}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex w-full max-w-sm cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] p-4 transition-colors duration-300 hover:bg-white dark:hover:bg-white/[0.04]"
    >

      {/* Product Badge */}
      {product.badge && (
        <motion.div layoutId={`product-badge-${product.slug}`} className="absolute left-6 top-6 z-10 rounded-full border border-black/5 dark:border-white/10 bg-white/90 dark:bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white backdrop-blur-md">
          {product.badge}
        </motion.div>
      )}

      {/* Wishlist Button (Thumbnail) */}
      <motion.button
        layoutId={`wishlist-btn-${product.slug}`}
        onClick={handleWishlist}
        className={`absolute right-6 top-6 z-20 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
          isWishlisted 
            ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/20 hover:bg-rose-100' 
            : 'border border-black/5 dark:border-white/10 bg-white dark:bg-black/50 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10'
        }`}
      >
        <Heart className={`h-4 w-4 transition-all duration-300 ${isWishlisted ? 'fill-current drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : ''}`} />
      </motion.button>

      {/* Cinematic Image Container */}
      <motion.div layoutId={`product-image-container-${product.slug}`} className="relative mb-4 aspect-[4/5] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800/50">
        <motion.div
          className="h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        {/* Subtle inner shadow for depth */}
        <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" />
      </motion.div>

      {/* Card Content */}
      <div className="relative z-10 flex flex-col gap-1 px-2 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <motion.p layoutId={`product-category-${product.slug}`} className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
              {product.category}
            </motion.p>
            <motion.h3 layoutId={`product-title-${product.slug}`} className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              {product.name}
            </motion.h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 45 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-black/5 dark:border-white/10 bg-white dark:bg-black/50 text-slate-900 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-white/10"
          >
            <ArrowUpRight className="h-5 w-5" />
          </motion.button>
        </div>
        
        <div className="mt-2">
          <motion.span layoutId={`product-price-${product.slug}`} className="inline-block text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {formatPrice(product.price)}
          </motion.span>
        </div>
      </div>
    </motion.div>

    {/* Cinematic Expanding Modal */}
    <AnimatePresence>
      {isOpen && (
        <motion.div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
          {/* Dark Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-auto absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-[100px]"
            onClick={handleClose}
          />

          {/* Expanded Card Structure */}
          <motion.div
            layoutId={`product-card-${product.slug}`}
            className="pointer-events-auto relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#0A0A0C] p-3 shadow-2xl md:flex-row"
            transition={springTransition}
          >
            {/* Wishlist Button */}
            <motion.button
              layoutId={`wishlist-btn-${product.slug}`}
              onClick={handleWishlist}
              className={`absolute right-20 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${
                isWishlisted 
                  ? 'bg-rose-500/10 text-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.2)] hover:bg-rose-500/20' 
                  : 'bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/20'
              }`}
            >
              <Heart className={`h-5 w-5 transition-all duration-300 ${isWishlisted ? 'fill-current drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : ''}`} />
            </motion.button>

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              onClick={handleClose}
              className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-white/10 text-slate-800 dark:text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-slate-50 dark:hover:bg-white/20 active:scale-95"
            >
              <X className="h-5 w-5" />
            </motion.button>

            {/* Expanded Image */}
            <motion.div
              layoutId={`product-image-container-${product.slug}`}
              className="group/slider relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800/50 md:w-1/2"
              onMouseEnter={() => setIsAutoPlayPaused(true)}
              onMouseLeave={() => setIsAutoPlayPaused(false)}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentImageIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  onPanEnd={(e, { offset, velocity }) => {
                    if (images.length <= 1) return;
                    if (offset.x < -50 || velocity.x < -500) {
                      nextImage();
                    } else if (offset.x > 50 || velocity.x > 500) {
                      prevImage();
                    }
                  }}
                  className="absolute inset-0 bg-cover bg-center touch-pan-y"
                  style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
                />
              </AnimatePresence>
              {product.badge && (
                <motion.div layoutId={`product-badge-${product.slug}`} className="absolute left-6 top-6 z-10 rounded-full border border-black/5 dark:border-white/10 bg-white/90 dark:bg-black/50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white backdrop-blur-md">
                  {product.badge}
                </motion.div>
              )}

              {images.length > 1 && (
                <>
                  {/* Slider Controls */}
                  <div className="absolute inset-0 z-10 flex items-center justify-between p-4 opacity-0 transition-opacity duration-300 group-hover/slider:opacity-100 pointer-events-none">
                    <button
                      onClick={prevImage}
                      className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/60 dark:bg-black/50 text-slate-900 dark:text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/90 dark:hover:bg-black/80"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/60 dark:bg-black/50 text-slate-900 dark:text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/90 dark:hover:bg-black/80"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {/* Slider Indicators */}
                  <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDirection(idx > currentImageIndex ? 1 : -1);
                          setCurrentImageIndex(idx);
                        }}
                        className={`h-2 rounded-full transition-all ${currentImageIndex === idx ? 'w-6 bg-white dark:bg-white shadow-[0_1px_3px_rgba(0,0,0,0.5)]' : 'w-2 bg-white/50 dark:bg-white/30 hover:bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.3)]'}`}
                      />
                    ))}
                  </div>

                  {/* Auto-play Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 h-1.5 bg-black/10 dark:bg-white/10">
                    {!isAutoPlayPaused && (
                      <motion.div
                        key={currentImageIndex}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3.5, ease: 'linear' }}
                        className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      />
                    )}
                  </div>
                </>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" />
            </motion.div>

            {/* Expanded Content */}
            <div className="flex w-full flex-col justify-center p-6 md:w-1/2 md:p-12">
              <motion.p layoutId={`product-category-${product.slug}`} className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">
                {product.category}
              </motion.p>
              <motion.h3 layoutId={`product-title-${product.slug}`} className="mt-3 text-3xl sm:text-4xl font-bold leading-[0.95] tracking-tighter text-slate-900 dark:text-white lg:text-5xl">
                {product.name}
              </motion.h3>
              
              <motion.div layoutId={`product-price-${product.slug}`} className="mt-6 flex items-center">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="relative mt-8"
              >
                <div className="absolute -left-4 bottom-0 top-0 w-1 rounded-full bg-gradient-to-b from-brand-primary/50 to-transparent dark:from-brand-primary/30" />
                <p className="text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                  {product.description}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-slate-900 dark:bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-white dark:text-slate-900 shadow-xl dark:shadow-white/10 transition-all hover:-translate-y-1 hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-2xl active:scale-95 disabled:pointer-events-none sm:w-auto"
                >
                  <span className={`relative z-10 flex items-center gap-2 transition-opacity duration-300 ${isAddingToCart ? 'opacity-0' : 'opacity-100'}`}>
                    <ShoppingBag className="h-5 w-5" />
                    Add to Cart
                  </span>
                  
                  {isAddingToCart && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900">
                      <style>{`
                        @keyframes shimmer-btn {
                          0% { transform: translateX(-100%); }
                          100% { transform: translateX(100%); }
                        }
                      `}</style>
                      <div className="absolute inset-0 -translate-x-full [animation:shimmer-btn_1.5s_infinite_linear] bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent" />
                      <span className="relative z-10 text-sm font-bold uppercase tracking-widest">Adding...</span>
                    </div>
                  )}

                  {!isAddingToCart && (
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full" />
                  )}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

