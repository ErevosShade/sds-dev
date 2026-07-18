import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar    from "./components/layout/Navbar";
import Footer    from "./components/layout/Footer";
import Home      from "./pages/Home";
import Team      from "./pages/Team";
import Playground from "./pages/Playground";

const App = () => (
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/"           element={<Home />} />
      <Route path="/team"       element={<Team />} />
      <Route path="/playground" element={<Playground />} />
    </Routes>
    <Footer />
  </BrowserRouter>
);

export default App;
