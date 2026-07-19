import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollProvider } from "./context/ScrollContext";
import PageWrapper from "./components/layout/PageWrapper";
import PageBackground from "./components/layout/PageBackground";
import LoadingScreen from "./components/layout/LoadingScreen";
import Navbar    from "./components/layout/Navbar";
import Footer    from "./components/layout/Footer";
import Home      from "./pages/Home";
import Team      from "./pages/Team";
import Playground from "./pages/Playground";

const App = () => {
  // Intro runs once per browser session — repeat navigations / HMR skip it.
  const [introDone, setIntroDone] = useState(
    () => typeof sessionStorage !== "undefined" && !!sessionStorage.getItem("sds_intro_seen")
  );

  const handleIntroComplete = () => {
    try { sessionStorage.setItem("sds_intro_seen", "1"); } catch { /* private mode */ }
    setIntroDone(true);
  };

  return (
    <BrowserRouter>
      <ScrollProvider>
        <PageBackground />
        {!introDone && <LoadingScreen onComplete={handleIntroComplete} />}
        <Navbar />
        <PageWrapper>
          <Routes>
            {/* introDone gates Hero's entrance so it plays as the loader lifts */}
            <Route path="/"           element={<Home introDone={introDone} />} />
            <Route path="/team"       element={<Team />} />
            <Route path="/playground" element={<Playground />} />
          </Routes>
          <Footer />
        </PageWrapper>
      </ScrollProvider>
    </BrowserRouter>
  );
};

export default App;
