import { useEffect, useState } from "react";
import { motion, useScroll } from "motion/react";

const links = [
  ["Life", "#profile"],
  ["Travel", "#journeys"],
  ["Atlas", "#map"],
  ["Contact", "#contact"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <header className={`site-header ${compact ? "is-compact" : ""}`}>
        <a className="wordmark" href="#top" aria-label="Hank, back to top" onClick={() => setOpen(false)}>
          <strong>HANK</strong>
          <span>Travel × Life</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className="header-meta" aria-label="Location">
          <span className="status-dot" aria-hidden="true" />
          <span>Taipei · 2026</span>
        </div>
        <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
          <span>{open ? "Close" : "Menu"}</span>
        </button>
      </header>
      <div className={`mobile-menu ${open ? "is-open" : ""}`} id="mobile-menu" aria-hidden={!open}>
        <nav aria-label="Mobile navigation">
          {links.map(([label, href], index) => (
            <a href={href} key={href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{label}</a>
          ))}
        </nav>
        <div className="mobile-menu__footer">
          <a href="mailto:hank187548@gmail.com">hank187548@gmail.com</a>
          <span>Taipei, Taiwan</span>
        </div>
      </div>
    </>
  );
}
