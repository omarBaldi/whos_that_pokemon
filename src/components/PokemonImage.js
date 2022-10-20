import React from "react";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";

function PokemonImage({ showPokemonImage, correctPokemon }) {
	const [pokemonUrl, setPokemonUrl] = useState("");
	const [loading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(false);
	}, [pokemonUrl]);

	useEffect(() => {
		setIsLoading(true);

		fetch(correctPokemon.imageUrl)
			.then((response) => response.blob())
			.then((imageBlob) => setPokemonUrl(URL.createObjectURL(imageBlob)));
	}, []);

	if (loading) {
		return <Spinner bgColor={"#fff"} />;
	}

	return (
		<img
			style={
				showPokemonImage
					? { filter: "brightness(100%)" }
					: { filter: "brightness(0%)" }
			}
			className="img h-full w-full object-cover"
			src={pokemonUrl}
			alt={correctPokemon.name}
		/>
	);
}

export default PokemonImage;
