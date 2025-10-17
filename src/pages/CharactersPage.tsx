import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCharacters } from "../api/rickApi";
import type { Character, CharacterResponse } from "../api/rickApi";

export default function CharactersPage() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [debouncedName, setDebouncedName] = useState(name);

  // debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(name);
    }, 500); // espera 500ms después de que el usuario deje de escribir
    return () => clearTimeout(handler);
  }, [name]);

  const { data, isLoading, error } = useQuery<CharacterResponse, Error>({
    queryKey: ["characters", { page, name: debouncedName, status }],
    queryFn: () => fetchCharacters(page, debouncedName, status),
    staleTime: 1000 * 60,
  });

  if (isLoading) return <p>Cargando personajes...</p>;
  if (error) return <p>Error al cargar personajes.</p>;

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-2 mb-4 w-1/2">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setPage(1); // resetear página al cambiar filtro
          }}
          className="border p-2 rounded flex-1 bg-gray-900 text-white"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1); // resetear página al cambiar filtro
          }}
          className="border p-1 rounded bg-gray-900 text-white"
        >
          <option value="">Todos</option>
          <option value="alive">Vivo</option>
          <option value="dead">Muerto</option>
          <option value="unknown">Desconocido</option>
        </select>
      </div>

      {/* Lista de personajes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data?.results.map((char: Character) => (
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

      {/* Paginación */}
      <div className="flex justify-between mt-4">
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
    </div>
  );
}
