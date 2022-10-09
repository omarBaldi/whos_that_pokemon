import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import PokeClient from "./PokeClient";
import "./styles.css";
import { useInterval } from "./customHooks/CustomHooks";
import constants from "./gameConstants";

function Game(props) {
	const [gameData, setGameData] = useState({
		correctPokemon: {},
		allPokemons: [],
		score: 0,
		correctAnswer: false,
		wasAnyButtonClicked: false,
	});

	const [imageBrightnessZero, setImageBrightnessZero] = useState(true);
	const [isLoading, setIsLoading] = useState(true);
	const [timeRemaining, setTimeRemaining] = useState(constants.timerValue);
	const [timerEnded, setTimerEnded] = useState(false);

	const pokeClient = new PokeClient();

	let intervalRef = useInterval(createTimer, timerEnded ? null : 1000);

	function createTimer() {
		if (timeRemaining < 1) {
			setTimerEnded(true);

			setImageBrightnessZero(false);

			setGameData((prevData) => ({
				...prevData,
				wasAnyButtonClicked: true,
			}));

			if (!gameData.wasAnyButtonClicked) {
				setTimeout(restGameData, constants.timeoutBeforeClearance);
			} else {
				restGameData();
			}
		} else {
			setTimeRemaining((prevTime) => prevTime - 1);
		}
	}

	useEffect(() => {
		getGameData().then((res) => {
			setGameData((prevGameData) => {
				return { ...prevGameData, ...res };
			});
		});

		setIsLoading(false);
	}, []);

	async function getGameData() {
		let correctPokemon = await getRandomPokemonData();
		let incorrectPokemons = [
			await getRandomPokemonData(),
			await getRandomPokemonData(),
			await getRandomPokemonData(),
		];

		let allPokemons = [correctPokemon, ...incorrectPokemons];

		allPokemons = allPokemons.sort(() => Math.random() - 0.7);

		allPokemons = allPokemons.sort(() => Math.random() - 0.2);

		allPokemons = allPokemons.sort(() => Math.random() - 0.5);

		allPokemons = allPokemons.sort(() => Math.random() - 0.1);

		return {
			correctPokemon: correctPokemon,
			allPokemons: allPokemons,
		};
	}

	async function getRandomPokemonData() {
		let pokemonUrl =
			props.pokemonData[
				Math.floor(Math.random() * props.pokemonData.length)
			].url;

		let pokemonData = await pokeClient.getPokemonByUrl(pokemonUrl);

		let data = {
			name: pokemonData.name,
			imageUrl: pokemonData.sprites.front_default,
		};

		return data;
	}

	function handleButtonClick(event) {
		const { value } = event.target;

		setImageBrightnessZero(false);

		if (gameData.correctPokemon.name === value) {
			setGameData((prevData) => ({
				...prevData,
				correctAnswer: true,
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

		setTimerEnded(true);
		setTimeout(restGameData, constants.timeoutBeforeClearance);
	}

	function restGameData() {
		setImageBrightnessZero(true);

		getGameData().then((res) => {
			setGameData((prevGameData) => ({
				...prevGameData,
				...res,
				correctAnswer: false,
				wasAnyButtonClicked: false,
			}));
		});

		setTimeRemaining(constants.timerValue);
		setTimerEnded(false);
	}

	function endGame() {
		alert(`You final score was ${gameData.score}`);
		window.clearInterval(intervalRef.current);
	}

	if (isLoading) {
		return <h1>Lading Data....</h1>;
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
				Whos's that pokemon?
			</h1>
			<div className="grid mx-auto md:w-[75%] m-5 gap-3 place-items-center grid-cols-2">
				<div className="img-container col-span-2">
					<img
						className={`img h-full w-full object-cover ${
							imageBrightnessZero
								? "brightness0"
								: "brightness100"
						}`}
						src={gameData.correctPokemon.imageUrl}
						alt={gameData.correctPokemon.name}
					/>

					<div className="timer">{timeRemaining}</div>
				</div>
				{gameData.allPokemons.map((pokemon) => {
					let rightAnswer =
						gameData.wasAnyButtonClicked &&
						pokemon.name === gameData.correctPokemon.name
							? "right"
							: "";
					return (
						<button
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
