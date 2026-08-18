import { motion, useReducedMotion } from "motion/react";
import { journeys } from "../data/content";
import { Reveal } from "./Reveal";

export function Journeys() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="journeys section" id="journeys" aria-labelledby="journeys-title">
      <div className="shell">
        <Reveal className="section-marker"><span>03</span><p>Journeys</p></Reveal>
        <div className="journeys-heading"><Reveal><h2 id="journeys-title">Places pass by.<br /><em>Moments stay.</em></h2></Reveal><Reveal delay={0.08}><p>Each chapter keeps a route, a sequence of images, and the ordinary details that would otherwise disappear.</p></Reveal></div>
      </div>
      <div className="journey-rail" aria-label="Travel journeys">
        {journeys.map((journey, index) => (
          <motion.a key={journey.id} href={journey.href} className="journey-card" initial={reduceMotion ? false : { opacity: 0, x: 28 }} whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true, margin: "0px -5%" }} transition={{ duration: 0.75, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}>
            <div className="journey-card__media"><img src={journey.image} alt={journey.alt} loading={index === 0 ? "eager" : "lazy"} decoding="async" /><span className="journey-card__shade" aria-hidden="true" /><span className="journey-card__number">{journey.number}</span><span className="journey-card__arrow" aria-hidden="true">↗</span></div>
            <div className="journey-card__meta"><span>{journey.eyebrow}</span><h3>{journey.title}</h3><p>{journey.route}</p></div>
          </motion.a>
        ))}
      </div>
      <div className="shell rail-note" aria-hidden="true"><span>Drag / swipe</span><i /><span>Open a chapter ↗</span></div>
    </section>
  );
}
