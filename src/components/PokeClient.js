import Pokedex from "pokedex-promise-v2";

class PokeClient {
	constructor() {
		const options = {
			versionPath: "/api/v2/",
			cacheLimit: 180 * 1000, // 3m
			timeout: 5 * 1000, // 5s
		};
		this.Pokedex = new Pokedex(options);
	}

	getPokemons(max) {
		return this.Pokedex.getPokemonsList({
			limit: max,
		}).then((res) => res.results);
	}

	getPokemonByUrl(url) {
		return this.Pokedex.getResource(url);
	}
}

const pokeClient = new PokeClient();

export { pokeClient };
