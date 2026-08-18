import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { journeys } from "../data/content";
import { Reveal } from "./Reveal";

export function WorldMap() {
  const [activeId, setActiveId] = useState(journeys[0].id);
  const reduceMotion = useReducedMotion();
  const active = journeys.find((journey) => journey.id === activeId) ?? journeys[0];
  return (
    <section className="map-section section" id="map" aria-labelledby="map-title">
      <div className="shell">
        <Reveal className="section-marker section-marker--dark"><span>04</span><p>Atlas</p></Reveal>
        <div className="map-heading"><Reveal><h2 id="map-title">One base.<br /><em>Many directions.</em></h2></Reveal><Reveal delay={0.08}><p>The map is no longer the hero. It works better as an index: choose a stop and reopen the chapter from there.</p></Reveal></div>
        <div className="atlas">
          <div className="atlas-map" aria-label="Interactive journey map">
            <div className="atlas-map__grid" aria-hidden="true" />
            <img src="/assets/maps/world-map.png" alt="World map showing Hank's journey destinations" loading="lazy" decoding="async" />
            <span className="atlas-base" style={{ "--x": "83.8%", "--y": "36.1%" } as CSSProperties}><i /><b>Taipei</b></span>
            {journeys.map((journey) => (
              <button type="button" key={journey.id} className={`atlas-stop ${activeId === journey.id ? "is-active" : ""}`} style={{ "--x": journey.mapX, "--y": journey.mapY } as CSSProperties} aria-label={`Show ${journey.mapLabel}`} aria-pressed={activeId === journey.id} onMouseEnter={() => setActiveId(journey.id)} onFocus={() => setActiveId(journey.id)} onClick={() => setActiveId(journey.id)}><span>{journey.number}</span></button>
            ))}
          </div>
          <div className="atlas-card">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={active.id} className="atlas-card__inner" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -10 }} transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}>
                <div className="atlas-card__media"><img src={active.image} alt={active.alt} loading="lazy" decoding="async" /></div><span className="atlas-card__eyebrow">{active.mapLabel}</span><h3>{active.title}</h3><p>{active.route}</p><a href={active.href}>Open journey <span>↗</span></a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
