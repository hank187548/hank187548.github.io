import { motion, useReducedMotion } from "motion/react";
import { workItems } from "../data/content";
import { Reveal } from "./Reveal";

export function Work() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="work section" id="work" aria-labelledby="work-title">
      <div className="shell">
        <Reveal className="section-marker section-marker--dark"><span>02</span><p>Selected work</p></Reveal>
        <div className="work-heading">
          <Reveal><h2 id="work-title">Systems built to answer <em>real questions.</em></h2></Reveal>
          <Reveal delay={0.08}><p>Research workflows, forecasting experiments, and vision systems — built to be tested, compared, and used.</p></Reveal>
        </div>
        <div className="case-list">
          {workItems.map((item, index) => (
            <motion.a key={item.number} className={`case-study ${index === 0 ? "case-study--featured" : ""}`} href={item.href} target="_blank" rel="noreferrer" initial={reduceMotion ? false : { opacity: 0, y: 30 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ duration: 0.7, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }} whileHover={reduceMotion ? undefined : { y: -5 }}>
              <span className="case-number">{item.number}</span>
              <div className="case-copy"><p className="case-kicker">{item.kicker}</p><h3>{item.title}</h3><p className="case-description">{item.description}</p><ul className="tag-list" aria-label="Technologies">{item.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul></div>
              <div className="case-code" aria-hidden="true"><span>{item.code}</span><i /></div>
              <span className="case-arrow" aria-hidden="true">↗</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
