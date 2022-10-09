import Pokedex from "pokedex-promise-v2";

export default class PokeClient {
	constructor() {
		const options = {
			versionPath: "/api/v2/",
			cacheLimit: 180 * 1000, // 3m
			timeout: 5 * 1000, // 5s
		};
		this.Pokedex = new Pokedex(options);
	}

	async getPokemons(max) {
		let data = "";

		const interval = {
			limit: max,
		};

		await this.Pokedex.getPokemonsList(interval)
			.then((res) => (data = res))
			.catch((err) => {
				console.log(err);
			});

		return data;
	}

	async getPokemonByUrl(url) {
		let data = "";

		await this.Pokedex.getResource(url)
			.then((res) => (data = res))
			.catch((err) => {
				console.log(err);
			});

		return data;
	}
}
