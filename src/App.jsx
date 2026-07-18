import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollProvider } from "./context/ScrollContext";
import PageWrapper from "./components/layout/PageWrapper";
import Navbar    from "./components/layout/Navbar";
import Footer    from "./components/layout/Footer";
import Home      from "./pages/Home";
import Team      from "./pages/Team";
import Playground from "./pages/Playground";

const App = () => (
  <BrowserRouter>
    <ScrollProvider>
      <Navbar />
      <PageWrapper>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/team"       element={<Team />} />
          <Route path="/playground" element={<Playground />} />
        </Routes>
        <Footer />
      </PageWrapper>
    </ScrollProvider>
  </BrowserRouter>
);

export default App;
