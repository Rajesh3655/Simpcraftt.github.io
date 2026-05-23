import { motion } from "motion/react";
import darkLogo from "./assets/logo/infibolt-dark.png";
import lightLogo from "./assets/logo/infibolt-light.png";

export default function BrandLogo({
  animate = false,
  className = "",
  revealDelay = 0,
}) {
  const handleLogoError = (e) => {
    if (e.currentTarget.dataset.fallbackApplied === "1") return;
    e.currentTarget.dataset.fallbackApplied = "1";
    e.currentTarget.src = lightLogo;
  };

  const content = (
    <div
      className={`inline-flex h-full items-center gap-[4px] md:gap-[6px] align-middle leading-none transition-opacity duration-300 hover:opacity-85 ${className}`}
    >
      <div className="shrink-0 flex items-center justify-center">
        <img
          src={lightLogo}
          alt="Infibolt logo"
          className="block h-[30px] w-auto select-none object-contain md:h-[38px] dark:hidden"
          draggable="false"
          loading="eager"
          decoding="async"
          onError={handleLogoError}
        />
        <img
          src={darkLogo}
          alt="Infibolt logo"
          className="hidden h-[30px] w-auto select-none object-contain md:h-[38px] dark:block"
          draggable="false"
          loading="eager"
          decoding="async"
          onError={handleLogoError}
        />
      </div>

      <span
        className="
          font-satoshi
          text-[14px]
          md:text-[14px]
          font-bold
          uppercase
          leading-none
          tracking-[0.16em]
          text-[#0B1020]
          dark:text-white
          translate-y-0
        "
      >
        INFIBOLT
      </span>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.975 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.72,
        delay: revealDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="inline-flex will-change-transform"
    >
      {content}
    </motion.div>
  );
}
