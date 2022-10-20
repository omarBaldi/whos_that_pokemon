import React from "react";
import { useEffect, useState } from "react";
import { pokeClient } from "./PokeClient";
import "./styles.css";
import useInterval from "../hooks/useInterval";
import constants from "./gameConstants";
import PokemonImage from "./PokemonImage";

function Game(props) {
	const [gameData, setGameData] = useState({
		allPokemons: [],
		score: 0,
		wasAnyButtonClicked: false,
	});

	const [correctPokemon, setCorrectPokemon] = useState({});
	const [showPokemonImage, setShowPokemonImage] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState(constants.timerValue);
	const [endTimer, setEndTimer] = useState(false);

	useEffect(() => {
		getGameData().then((res) => {
			setGameData((prevGameData) => {
				return { ...prevGameData, ...res };
			});
		});
	}, []);

	let intervalRef = useInterval(createTimer, endTimer ? null : 1000);

	function createTimer() {
		if (timeRemaining < 1) {
			setEndTimer(true);

			setShowPokemonImage(true);

			setGameData((prevData) => ({
				...prevData,
				wasAnyButtonClicked: true,
			}));

			if (!gameData.wasAnyButtonClicked) {
				setTimeout(resetGameData, constants.timeoutBeforeClearance);
			} else {
				resetGameData();
			}
		} else {
			setTimeRemaining((prevTime) => prevTime - 1);
		}
	}

	async function getGameData() {
		const randomPokemonFromPokedex = [...props.pokemonData]
			.sort(() => Math.random() - 0.5)
			.slice(0, 4);

		getPokemonData(randomPokemonFromPokedex[0]).then((pokemon) =>
			setCorrectPokemon(pokemon)
		);

		const pokemons = await Promise.all(
			randomPokemonFromPokedex.map(getPokemonData)
		);

		return {
			allPokemons: pokemons,
		};
	}

	async function getPokemonData({ url }) {
		let pokemonData = await pokeClient.getPokemonByUrl(url);

		return {
			name: pokemonData.name,
			imageUrl: pokemonData.sprites.front_default,
		};
	}

	function handleButtonClick(event) {
		const { value } = event.target;

		setShowPokemonImage(true);

		if (correctPokemon.name === value) {
			setGameData((prevData) => ({
				...prevData,
				wasAnyButtonClicked: true,
				score: prevData.score + 1,
			}));
		} else {
			event.target.classList.add("wrong");

			setGameData((prevData) => ({
				...prevData,
				wasAnyButtonClicked: true,
			}));

			setTimeout(() => {
				event.target.classList.remove("wrong");
			}, constants.timeoutBeforeClearance);
		}

		setEndTimer(true);
		setTimeout(resetGameData, constants.timeoutBeforeClearance);
	}

	function resetGameData() {
		setShowPokemonImage(false);

		getGameData().then((res) => {
			setGameData((prevGameData) => ({
				...prevGameData,
				...res,
				wasAnyButtonClicked: false,
			}));
		});

		setTimeRemaining(constants.timerValue);
		setEndTimer(false);
	}

	function endGame() {
		alert(`You final score was ${gameData.score}`);
		window.clearInterval(intervalRef.current);
	}

	return (
		<>
			<div className="p-2 flex justify-between items-center">
				<h1 className="">CurrentScore : {gameData.score}</h1>
				<button
					onClick={endGame}
					className="text-gray-600 bg-indigo-300/60 p-1 rounded-lg"
				>
					End Game
				</button>
			</div>
			<h1 className="mt-5 text-xl font-extrabold text-center">
				Who's that pokemon?
			</h1>
			<div className="grid mx-auto md:w-[75%] m-5 gap-3 place-items-center grid-cols-2">
				<div className="img-container col-span-2">
					<PokemonImage
						key={correctPokemon.name + ":" + showPokemonImage}
						showPokemonImage={showPokemonImage}
						correctPokemon={correctPokemon}
					/>
					<div className="timer">{timeRemaining}</div>
				</div>
				{gameData.allPokemons.map((pokemon) => {
					let rightAnswer =
						gameData.wasAnyButtonClicked &&
						pokemon.name === correctPokemon.name
							? "right"
							: "";
					return (
						<button
							key={pokemon.name}
							onClick={handleButtonClick}
							value={pokemon.name}
							disabled={gameData.wasAnyButtonClicked}
							className={`btn ${rightAnswer}`}
						>
							{pokemon.name}
						</button>
					);
				})}
			</div>
		</>
	);
}

export default Game;
