import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section className="contact section" id="contact" aria-labelledby="contact-title">
      <div className="shell contact-shell">
        <Reveal className="section-marker"><span>04</span><p>Contact</p></Reveal>
        <Reveal className="contact-title"><p>A place, a story, or just hello.</p><h2 id="contact-title">Keep moving.<br /><em>Stay in touch.</em></h2></Reveal>
        <Reveal className="contact-links contact-links--simple" delay={0.08}>
          <a href="mailto:hank187548@gmail.com"><span>Email</span><strong>hank187548@gmail.com</strong><i aria-hidden="true">↗</i></a>
        </Reveal>
        <footer className="site-footer"><span>Hank / Taipei, Taiwan</span><span>Travel × Life / 2026</span><a href="#top">Back to top ↑</a></footer>
      </div>
    </section>
  );
}
