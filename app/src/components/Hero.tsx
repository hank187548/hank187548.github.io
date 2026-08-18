import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { heroSlides } from "../data/content";

export function Hero() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 90]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.03, reduceMotion ? 1.03 : 1.12]);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const current = heroSlides[active];

  return (
    <section className="hero" id="top" ref={sectionRef} aria-labelledby="hero-title">
      <motion.div className="hero-media" style={{ y: mediaY, scale: mediaScale }} aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={current.id}
            src={current.image}
            alt=""
            className="hero-media__image"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
            fetchPriority={active === 0 ? "high" : "auto"}
          />
        </AnimatePresence>
      </motion.div>
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />

      <div className="hero-shell shell">
        <div className="hero-kicker">
          <span>Independent portfolio / Taipei</span>
          <span>Quant · ML · Vision · Life</span>
        </div>

        <div className="hero-title-wrap">
          <motion.p className="hero-pretitle" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            I build systems.<br />I collect moments.
          </motion.p>
          <motion.h1 id="hero-title" initial={reduceMotion ? false : { opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}>
            HANK<span>.</span>
          </motion.h1>
        </div>

        <div className="hero-bottom">
          <p>Graduate researcher working across quantitative systems, machine learning, and computer vision — with a visual archive of travel, water, cities, and everything beyond the screen.</p>
          <div className="hero-links">
            <a href="#work">Selected work <span>↘</span></a>
            <a href="#journeys">Open journeys <span>↘</span></a>
          </div>
        </div>
      </div>

      <div className="hero-index" aria-label="Featured journey images">
        <div className="hero-index__count"><span>{String(active + 1).padStart(2, "0")}</span><i /><span>{String(heroSlides.length).padStart(2, "0")}</span></div>
        <div className="hero-index__label" aria-live="polite">{current.mapLabel}</div>
        <div className="hero-index__dots">
          {heroSlides.map((slide, index) => (
            <button type="button" key={slide.id} className={index === active ? "is-active" : ""} aria-label={`Show ${slide.mapLabel}`} aria-pressed={index === active} onClick={() => setActive(index)} />
          ))}
        </div>
      </div>

      <a className="scroll-cue" href="#profile"><span>Scroll to profile</span><i aria-hidden="true" /></a>
    </section>
  );
}
