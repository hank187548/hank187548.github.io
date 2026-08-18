import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { journeys, mapBase, mapRoutes, mapStops, projectMapPoint } from "../data/content";
import { Reveal } from "./Reveal";

export function WorldMap() {
  const [activeStopId, setActiveStopId] = useState(mapStops[0].id);
  const reduceMotion = useReducedMotion();
  const activeStop = mapStops.find((stop) => stop.id === activeStopId) ?? mapStops[0];
  const active = journeys.find((journey) => journey.id === activeStop.journeyId) ?? journeys[0];
  const base = projectMapPoint(mapBase.lat, mapBase.lon);

  return (
    <section className="map-section section" id="map" aria-labelledby="map-title">
      <div className="shell">
        <Reveal className="section-marker section-marker--dark"><span>03</span><p>Atlas</p></Reveal>
        <div className="map-heading"><Reveal><h2 id="map-title">From Taipei,<br /><em>outward.</em></h2></Reveal><Reveal delay={0.08}><p>Every marker sits on the map itself. Choose a stop to highlight the route and reopen the journey it belongs to.</p></Reveal></div>
        <div className="atlas">
          <div className="atlas-map" aria-label="Interactive map of journey stops">
            <div className="atlas-map__grid" aria-hidden="true" />
            <div className="atlas-map__canvas">
              <img src="/assets/maps/world-map.png" alt="World map showing Hank's journey destinations" loading="lazy" decoding="async" />
              <svg className="atlas-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {mapRoutes.map((route) => {
                  const points = [
                    ...(route.includeBase ? [projectMapPoint(mapBase.lat, mapBase.lon)] : []),
                    ...route.stopIds.map((id) => {
                      const stop = mapStops.find((item) => item.id === id)!;
                      return projectMapPoint(stop.lat, stop.lon);
                    }),
                  ];
                  if (points.length < 2) return null;
                  return <polyline key={route.journeyId} className={`atlas-route ${route.journeyId === active.id ? "is-active" : ""}`} points={points.map((point) => `${point.x.toFixed(3)},${point.y.toFixed(3)}`).join(" ")} />;
                })}
              </svg>
              <span className="atlas-base" style={{ "--x": `${base.x}%`, "--y": `${base.y}%` } as CSSProperties}><i /><b>Taipei</b></span>
              {mapStops.map((stop) => {
                const point = projectMapPoint(stop.lat, stop.lon);
                const selected = stop.id === activeStop.id;
                const sameJourney = stop.journeyId === active.id;
                return <button type="button" key={stop.id} className={`atlas-stop ${sameJourney ? "is-route-active" : ""} ${selected ? "is-selected" : ""}`} style={{ "--x": `${point.x}%`, "--y": `${point.y}%` } as CSSProperties} data-label={stop.label} aria-label={`${stop.label} — ${active.title}`} aria-pressed={selected} onMouseEnter={() => setActiveStopId(stop.id)} onFocus={() => setActiveStopId(stop.id)} onClick={() => setActiveStopId(stop.id)} />;
              })}
            </div>
          </div>
          <div className="atlas-card">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${active.id}-${activeStop.id}`} className="atlas-card__inner" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -10 }} transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}>
                <div className="atlas-card__media"><img src={active.image} alt={active.alt} loading="lazy" decoding="async" /></div>
                <span className="atlas-card__eyebrow">{active.mapLabel} · {activeStop.label}</span>
                <h3>{active.title}</h3><p>{active.route}</p><a href={active.href}>Open journey <span>↗</span></a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
