import { journeys } from "../data/content";
import { Reveal } from "./Reveal";
import { CoverflowCarousel } from "./CoverflowCarousel";

export function Journeys() {
  return (
    <section className="journeys section" id="journeys" aria-labelledby="journeys-title">
      <div className="shell">
        <Reveal className="section-marker"><span>03</span><p>Journeys</p></Reveal>
        <div className="journeys-heading">
          <Reveal><h2 id="journeys-title">Places pass by.<br /><em>Moments stay.</em></h2></Reveal>
          <Reveal delay={0.08}><p>Each chapter keeps a route, a sequence of images, and the ordinary details that would otherwise disappear.</p></Reveal>
        </div>
      </div>
      <CoverflowCarousel slides={journeys} />
      <div className="shell rail-note coverflow-note" aria-hidden="true"><span>Drag / swipe / arrow keys</span><i /><span>Tap the centre card to open ↗</span></div>
    </section>
  );
}
