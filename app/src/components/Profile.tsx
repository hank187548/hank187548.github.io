import { Reveal } from "./Reveal";

export function Profile() {
  return (
    <section className="profile section shell" id="profile" aria-labelledby="profile-title">
      <Reveal className="section-marker"><span>01</span><p>Life</p></Reveal>
      <div className="profile-grid">
        <Reveal className="profile-copy">
          <p className="eyebrow">Life / Taipei</p>
          <h2 id="profile-title">A life, <em>in motion.</em></h2>
          <p className="profile-lede">Based in Taipei, keeping a visual diary of the places I go and the people, light, water, and ordinary moments I find there.</p>
        </Reveal>
        <Reveal className="profile-portrait" delay={0.08}>
          <div className="profile-portrait__frame"><img src="/assets/life/ME.jpg" alt="Hank" loading="lazy" decoding="async" /><span>Hank / Taipei</span></div>
        </Reveal>
      </div>
      <Reveal className="profile-facts profile-facts--life">
        <article><span>Base</span><strong>Taipei, Taiwan</strong></article>
        <article><span>Drawn to</span><strong>Mountains / Water / Cities</strong></article>
        <article><span>Archive</span><strong>Photos / Motion / Notes</strong></article>
      </Reveal>
    </section>
  );
}
