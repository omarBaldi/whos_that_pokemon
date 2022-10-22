import React from 'react';
import { useEffect, useState } from 'react';
import { pokeClient } from './PokeClient';
import './styles.css';
import useInterval from '../hooks/useInterval';
import constants from './gameConstants';
import PokemonImage from './PokemonImage';
import {
  getPokemonDataFromUrl,
  getPokemonFromPokedexId,
} from '../services/get-pokemon';
import { getRandomNumberBetweenRange } from '../utils/generate-random-number';
import Spinner from './Spinner';

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
    /* Randomize order of pokemons list and get the first 4 elements
		which corresponds to the number of buttons */
    const randomPokemonFromPokedex = [...props.pokemonData]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    /* Get pokemon further details based on url provided inside pokemon object */
    getPokemonData(randomPokemonFromPokedex[0]).then((pokemon) =>
      setCorrectPokemon(pokemon)
    );

    //! this will fail if one of the promises inside the array is being rejected
    // * should instead use Promise.allSettled or handle the catch
    // * another observation is the fact that there is no need to call the endpoint
    // * for the first pokemon as it was already called before
    const pokemons = await Promise.all(
      randomPokemonFromPokedex.map(getPokemonData)
    );

    // * No need for sorting the pokemon list thrice ??
    pokemons.sort(() => Math.random() - 0.5);
    pokemons.sort(() => Math.random() - 0.5);
    pokemons.sort(() => Math.random() - 0.5);

    return {
      allPokemons: pokemons.sort(() => Math.random() - 0.5),
    };
  }

  //TODO: move this function to service folder
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
      event.target.classList.add('wrong');

      setGameData((prevData) => ({
        ...prevData,
        wasAnyButtonClicked: true,
      }));

      setTimeout(() => {
        event.target.classList.remove('wrong');
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
      <div className='p-2 flex justify-between items-center'>
        <h1 className=''>CurrentScore : {gameData.score}</h1>
        <button
          onClick={endGame}
          className='text-gray-600 bg-indigo-300/60 p-1 rounded-lg'
        >
          End Game
        </button>
      </div>
      <h1 className='mt-5 text-xl font-extrabold text-center'>
        Who's that pokemon?
      </h1>
      <div className='grid mx-auto md:w-[75%] m-5 gap-3 place-items-center grid-cols-2'>
        <div className='img-container col-span-2'>
          <PokemonImage
            key={correctPokemon.name + ':' + showPokemonImage}
            showPokemonImage={showPokemonImage}
            correctPokemon={correctPokemon}
          />
          <div className='timer'>{timeRemaining}</div>
        </div>
        {gameData.allPokemons.map((pokemon) => {
          let rightAnswer =
            gameData.wasAnyButtonClicked && pokemon.name === correctPokemon.name
              ? 'right'
              : '';
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

function GameTest(props) {
  const [loading, setLoading] = useState(true);
  const [pokemonData, setPokemonData] = useState({
    pokemonToGuess: undefined,
    otherPokemons: undefined,
  });

  //? possibility to use usePromise hook
  const getRandomPokemon = async () => {
    try {
      /* take into consideration the possibility that one of them might be rejected
      do not proceed if at least one of them is rejected */
      //! when generating random numbers could happen that there would be more of the same
      const promiseResults = await Promise.allSettled(
        [...Array(4)]
          .fill(getRandomNumberBetweenRange({ end: 151 }))
          .map(getPokemonFromPokedexId)
      );

      let fourPokemons = [];

      for (const promise of promiseResults) {
        if (promise.status === 'rejected') {
          const { reason } = promise;
          throw new Error(reason);
        } else {
          fourPokemons = [...fourPokemons, promise.value];
        }
      }

      // * At this point I know that all of the four pokemons
      // * data are available
      const [pokemonToGuess, ...restPokemons] = fourPokemons;

      setPokemonData({ pokemonToGuess, otherPokemons: restPokemons });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRandomPokemon();
  }, []);

  if (loading) return <Spinner bgColor={'#fff'} />;
  if (typeof pokemonData.pokemonToGuess === 'undefined') return;

  return (
    <div>
      <h1 className='mt-5 text-xl font-extrabold text-center'>
        Who's that pokemon?
      </h1>
      <PokemonImage
        showPokemonImage
        correctPokemonImageUrl={
          pokemonData.pokemonToGuess.sprites.front_default
        }
      />
    </div>
  );
}

//export default Game;
export default GameTest;
