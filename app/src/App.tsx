import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Profile } from "./components/Profile";
import { Journeys } from "./components/Journeys";
import { WorldMap } from "./components/WorldMap";
import { Contact } from "./components/Contact";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Hero />
        <Profile />
        <Journeys />
        <WorldMap />
        <Contact />
      </main>
    </>
  );
}
