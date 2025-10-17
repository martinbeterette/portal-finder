import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEpisodes, fetchCharacterByUrl } from "../api/rickApi";
import type { Character, Episode } from "../api/rickApi";

export default function EpisodesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Cargar favoritos de localStorage al inicio
  useEffect(() => {
    const stored = localStorage.getItem("favEpisodes");
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  // Guardar favoritos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem("favEpisodes", JSON.stringify(favorites));
  }, [favorites]);

  // Query de episodios
  const { data, isLoading, error } = useQuery({
    queryKey: ["episodes", page, debouncedSearch],
    queryFn: () => fetchEpisodes(page, debouncedSearch),
    staleTime: 1000 * 60,
  });

  // Query de personajes del episodio seleccionado
  const { data: charactersData, isLoading: loadingChars } = useQuery({
    queryKey: ["episodeCharacters", selectedEpisode?.id],
    queryFn: async () => {
      if (!selectedEpisode) return [];
      const promises = selectedEpisode.characters.map(fetchCharacterByUrl);
      return Promise.all(promises) as Promise<Character[]>;
    },
    enabled: !!selectedEpisode,
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  if (isLoading) return <p>Cargando episodios...</p>;
  if (error) return <p>Error al cargar episodios.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Archivo de Episodios</h1>

      {/* Buscador */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o episodio"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded flex-1 bg-gray-900 text-white"
        />
      </div>

      {/* Lista de episodios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data?.results.map((ep: Episode) => (
          <div
            key={ep.id}
            className={`border rounded p-3 cursor-pointer hover:shadow-lg ${
              selectedEpisode?.id === ep.id ? "bg-cyan-800" : "bg-gray-900"
            }`}
            onClick={() => setSelectedEpisode(ep)}
          >
            <h2 className="font-semibold text-lg text-cyan-400">{ep.name}</h2>
            <p className="text-sm text-gray-300">{ep.episode}</p>
            <p className="text-sm text-gray-400">{ep.air_date}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(ep.id);
              }}
              className={`mt-2 px-2 py-1 rounded ${
                favorites.includes(ep.id)
                  ? "bg-yellow-400 text-gray-900"
                  : "bg-gray-700 text-white"
              }`}
            >
              {favorites.includes(ep.id) ? "★ Favorito" : "☆ Marcar"}
            </button>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-1 bg-cyan-400 text-gray-900 rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!data?.info.prev}
        >
          Anterior
        </button>
        <span className="self-center">
          Página {page} de {data?.info.pages}
        </span>
        <button
          className="px-4 py-1 bg-cyan-400 text-gray-900 rounded disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.info.next}
        >
          Siguiente
        </button>
      </div>

      {/* Detalle de episodio seleccionado */}
      {selectedEpisode && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2 text-cyan-400">
            Personajes en {selectedEpisode.name}
          </h2>
          {loadingChars && <p>Cargando personajes...</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {charactersData?.map((char: Character) => (
              <div
                key={char.id}
                className="border rounded shadow p-2 flex flex-col items-center bg-gray-900"
              >
                <img
                  src={char.image}
                  alt={char.name}
                  className="w-32 h-32 rounded-full mb-2"
                />
                <h3 className="font-bold text-lg text-cyan-400">{char.name}</h3>
                <p>
                  {char.species} — {char.status}
                </p>
                <p>Origen: {char.origin.name}</p>
                <p>Ubicación: {char.location.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
