export const API_BASE = "https://rickandmortyapi.com/api";

//personaje
export type Character = {
  id: number;
  name: string;
  status: string; // "Alive" | "Dead" | "unknown"
  species: string;
  type: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  episode: string[];
};

export type CharacterResponse = {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Character[];
};

export async function fetchCharacters(
  page = 1,
  name?: string,
  status?: string
): Promise<CharacterResponse> {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  if (name) params.set("name", name);
  if (status) params.set("status", status);

  const res = await fetch(`${API_BASE}/character?${params.toString()}`);
  if (!res.ok) throw new Error("Error fetching characters");
  return res.json();
}

//localizacion
export type Location = {
  id: number;
  name: string;
  type: string;
  dimension: string;
  residents: string[]; // URLs de los personajes
};

export type LocationResponse = {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Location[];
};

export async function fetchLocations(page = 1): Promise<LocationResponse> {
  const res = await fetch(
    `https://rickandmortyapi.com/api/location?page=${page}`
  );
  if (!res.ok) throw new Error("Error fetching locations");
  return res.json();
}

//episodio
export type Episode = {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
};

export type EpisodeResponse = {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Episode[];
};

// Fetch episodios con búsqueda opcional
export async function fetchEpisodes(
  page = 1,
  name?: string
): Promise<EpisodeResponse> {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  if (name) params.set("name", name);

  const res = await fetch(`${API_BASE}/episode?${params.toString()}`);
  if (!res.ok) throw new Error("Error fetching episodes");
  return res.json();
}

// Fetch personaje por URL individual
export async function fetchCharacterByUrl(url: string): Promise<Character> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching character");
  return res.json();
}
