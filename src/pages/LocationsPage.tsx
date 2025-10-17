import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLocations, fetchCharacterByUrl } from "../api/rickApi";
import type { Character, CharacterResponse, Location } from "../api/rickApi";

export default function LocationsPage() {
  const [page, setPage] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  // Query de locations
  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["locations", page],
    queryFn: () => fetchLocations(page),
    staleTime: 1000 * 60,
  });

  // Query de residentes de la location seleccionada
  const {
    data: residentsData,
    isLoading: isResidentsLoading,
    error: residentsError,
  } = useQuery({
    queryKey: ["residents", selectedLocation?.id],
    queryFn: async () => {
      if (!selectedLocation) return [];
      const promises = selectedLocation.residents.map(fetchCharacterByUrl);
      return Promise.all(promises) as Promise<Character[]>;
    },
    enabled: !!selectedLocation,
  });

  if (isLocationsLoading) return <p>Cargando ubicaciones...</p>;
  if (locationsError) return <p>Error al cargar ubicaciones.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mapa de Ubicaciones</h1>

      {/* Grid de locations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {locationsData?.results.map((loc) => (
          <div
            key={loc.id}
            className={`border rounded p-3 cursor-pointer hover:shadow-lg ${
              selectedLocation?.id === loc.id ? "bg-cyan-800" : "bg-gray-900"
            }`}
            onClick={() => setSelectedLocation(loc)}
          >
            <h2 className="font-semibold text-lg text-cyan-400">{loc.name}</h2>
            <p className="text-sm text-gray-300">{loc.type}</p>
            <p className="text-sm text-gray-400">{loc.dimension}</p>
            <p className="text-sm mt-2">Residentes: {loc.residents.length}</p>
          </div>
        ))}
      </div>

      {/* Residents */}
      {selectedLocation && (
        <div>
          <h2 className="text-xl font-bold mb-2 text-cyan-400">
            Residentes en {selectedLocation.name}
          </h2>
          {isResidentsLoading && <p>Cargando residentes...</p>}
          {residentsError && <p>Error al cargar residentes.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {residentsData?.map((char: Character) => (
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

      {/* Paginación */}
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-1 bg-cyan-400 text-gray-900 rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!locationsData?.info.prev}
        >
          Anterior
        </button>
        <span className="self-center">
          Página {page} de {locationsData?.info.pages}
        </span>
        <button
          className="px-4 py-1 bg-cyan-400 text-gray-900 rounded disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={!locationsData?.info.next}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
