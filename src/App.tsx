import { Routes, Route, Link } from "react-router-dom";
import CharactersPage from "./pages/CharactersPage";
import LocationsPage from "./pages/LocationsPage";
import EpisodesPage from "./pages/EpisodePage";

export default function App() {
  return (
    <div className="p-6">
      <nav className="flex gap-4 mb-6">
        <Link to="/" className="text-cyan-400 hover:underline">
          Inicio
        </Link>
        <Link to="/characters" className="text-cyan-400 hover:underline">
          Personajes
        </Link>
        <Link to="/locations" className="text-cyan-400 hover:underline">
          Ubicaciones
        </Link>
        <Link to="/episodes" className="text-cyan-400 hover:underline">
          Episodios
        </Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <h1 className="text-3xl font-bold">Portal Finder 3000 🌀</h1>
          }
        />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/episodes" element={<EpisodesPage />} />
      </Routes>
    </div>
  );
}
