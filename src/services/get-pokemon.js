import Pokedex from 'pokedex-promise-v2';

const P = new Pokedex();

export const getPokemonDataFromUrl = async ({ url }) => {
  const pokemon = await P.getResource(url);
  return pokemon;
};

export const getPokemonList = async ({ howMany = 0, startFromId = 0 }) => {
  const data = await P.getPokemonsList({ limit: howMany, offset: startFromId });
  return data;
};

export const getPokemonFromPokedexId = async (id) => {
  const data = await P.getPokemonByName(id);
  return data;
};

/* 
    getPokemonsList({ limit: 10, interval: 34 }) 
    NOTE: this will retrieve the pokemon urls between id 34 to 44.

    getPokemonByName(34)
    NOTE: retrieve the pokemon data based on pokedex id

*/
