import Hero          from "../components/sections/Hero";
import AboutUs       from "../components/sections/AboutUs";
import Events        from "../components/sections/Events";
import Speakers      from "../components/sections/Speakers";
import Projects      from "../components/sections/Projects";
import Testimonials  from "../components/sections/Testimonials";
import Sponsors      from "../components/sections/Sponsors";
import Gallery       from "../components/sections/Gallery";
import Connect       from "../components/sections/Connect";

const Home = ({ introDone = true }) => (
  <main>
    <Hero introDone={introDone} />
    <AboutUs />
    <Events />
    <Speakers />
    <Projects />
    <Testimonials />
    <Sponsors />
    <Gallery />
    <Connect />
  </main>
);

export default Home;
