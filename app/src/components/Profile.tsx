import { Reveal } from "./Reveal";

export function Profile() {
  return (
    <section className="profile section shell" id="profile" aria-labelledby="profile-title">
      <Reveal className="section-marker"><span>01</span><p>Profile</p></Reveal>
      <div className="profile-grid">
        <Reveal className="profile-copy">
          <p className="eyebrow">Work–life, without the split.</p>
          <h2 id="profile-title">I like problems that need <em>structure</em>, and places that make me forget it.</h2>
          <p className="profile-lede">Based in Taipei. Graduate researcher in quantitative research, with work across machine learning and computer vision. Outside the model, I keep a visual diary of people, light, water, and movement.</p>
          <div className="profile-actions">
            <a href="/CV1_Hank_quant.pdf" target="_blank" rel="noreferrer">View CV <span>↗</span></a>
            <a href="https://github.com/hank187548" target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
          </div>
        </Reveal>
        <Reveal className="profile-portrait" delay={0.08}>
          <div className="profile-portrait__frame"><img src="/assets/life/ME.jpg" alt="Hank" loading="lazy" decoding="async" /><span>Hank / Taipei</span></div>
        </Reveal>
      </div>
      <Reveal className="profile-facts">
        <article><span>Base</span><strong>Taipei, Taiwan</strong></article>
        <article><span>Research</span><strong>Quant / ML / Vision</strong></article>
        <article><span>Core stack</span><strong>Python / Qlib / PyTorch</strong></article>
        <article><span>Elsewhere</span><strong>Travel / Ocean / Cities</strong></article>
      </Reveal>
    </section>
  );
}
