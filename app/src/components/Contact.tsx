import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section className="contact section" id="contact" aria-labelledby="contact-title">
      <div className="shell contact-shell">
        <Reveal className="section-marker"><span>05</span><p>Contact</p></Reveal>
        <Reveal className="contact-title"><p>Research, collaboration, or a good story.</p><h2 id="contact-title">Build something.<br /><em>Go somewhere.</em></h2></Reveal>
        <Reveal className="contact-links" delay={0.08}>
          <a href="mailto:hank187548@gmail.com"><span>Email</span><strong>hank187548@gmail.com</strong><i aria-hidden="true">↗</i></a>
          <a href="https://github.com/hank187548" target="_blank" rel="noreferrer"><span>GitHub</span><strong>@hank187548</strong><i aria-hidden="true">↗</i></a>
        </Reveal>
        <footer className="site-footer"><span>Hank / Taipei, Taiwan</span><span>Systems × Stories / 2026</span><a href="#top">Back to top ↑</a></footer>
      </div>
    </section>
  );
}
