import React, { useMemo, useRef, useEffect, useState } from 'react';
import useInterval from '../hooks/useInterval';
import { shuffleArray } from '../utils/shuffle-array';
import { pokeClient } from './PokeClient';
import constants from './gameConstants';
import PokemonImage from './PokemonImage';
import { getPokemonFromPokedexId } from '../services/get-pokemon';
import { getRandomNumberBetweenRange } from '../utils/generate-random-number';
import Spinner from './Spinner';
import './styles.css';
import {
  DEFAULT_POKEMON_CHOICES,
  DEFAULT_SECONDS_UNTIL_NEXT_ROUND,
  MAX_NUMBER_ROUNDS,
  TOTAL_NUMBER_POKEMONS,
} from '../constant';

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

/**
 *
 * ? take in consideration of replacing multiple useState hooks with useReducer
 * TODO: create button component
 * TODO: create title component
 */
function GameTest() {
  const [loading, setLoading] = useState(true);

  //? replacing with useState depending wheter or not render the UI on web view
  const currentScore = useRef(0);

  const [round, setRound] = useState(1);
  const [showPokemon, setShowPokemon] = useState(false);
  const [pokemonClicked, setPokemonClicked] = useState(undefined);

  /* *---------------------------------- CURRENT ROUND STATE */
  const currentRoundCountdown = useRef();
  const [currentRoundSeconds, setCurrentRoundSeconds] = useState(10);
  /* *---------------------------------- TIME TO NEXT ROUND STATE */
  const countdownNextPokemonQuizRef = useRef();
  const [secondsLeftUntilNextRound, setSecondsLeftUntilNextRound] = useState(
    DEFAULT_SECONDS_UNTIL_NEXT_ROUND
  );

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
        [...Array(DEFAULT_POKEMON_CHOICES)]
          .map(() =>
            getRandomNumberBetweenRange({
              start: 1,
              end: TOTAL_NUMBER_POKEMONS,
            })
          )
          .map(getPokemonFromPokedexId)
      );

      let pokemonResults = [];

      for (const promise of promiseResults) {
        if (promise.status === 'rejected') {
          const { reason } = promise;
          throw new Error(reason);
        } else {
          const { value: pokemonData } = promise;

          pokemonResults = [...pokemonResults, pokemonData];
        }
      }

      // * At this point I know that all of the four pokemons
      // * data are available
      const [pokemonToGuess, ...restPokemons] = pokemonResults;

      setPokemonData({ pokemonToGuess, otherPokemons: restPokemons });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (round > MAX_NUMBER_ROUNDS) return;

    getRandomPokemon();

    //TODO: implement custom hook for setInterval with pokemonData.pokemonToGuess as dependency [...deps]
    currentRoundCountdown.current = setInterval(
      () => setCurrentRoundSeconds((prevSeconds) => prevSeconds - 1),
      1000
    );

    return () => {
      // * reset values on component unmount
      setPokemonData({ pokemonToGuess: undefined, otherPokemons: undefined });
      setPokemonClicked(undefined);
      setSecondsLeftUntilNextRound(DEFAULT_SECONDS_UNTIL_NEXT_ROUND);
      setCurrentRoundSeconds(10);
    };
  }, [round]);

  useEffect(() => {
    if (pokemonClicked || currentRoundSeconds <= 0) {
      setShowPokemon(true);
      //NOTE: if the user clicks on one of the pokemon choices
      //before the timer expires, then stop it
      clearInterval(currentRoundCountdown.current);

      if (
        typeof pokemonClicked !== 'undefined' &&
        pokemonClicked.name === pokemonData.pokemonToGuess.name
      ) {
        currentScore.current += 1;
      }

      //? possibility to create custom hook for using setInterval (deps as dependencies array ---> [...deps])
      countdownNextPokemonQuizRef.current = setInterval(
        () => setSecondsLeftUntilNextRound((prevSeconds) => prevSeconds - 1),
        1000
      );
    }
  }, [pokemonClicked, pokemonData.pokemonToGuess, currentRoundSeconds]);

  useEffect(() => {
    if (secondsLeftUntilNextRound <= 0) {
      clearInterval(countdownNextPokemonQuizRef.current);
      setRound((prevRound) => prevRound + 1);
    }
  }, [secondsLeftUntilNextRound]);

  const pokemonsChoices = useMemo(() => {
    let shuffledArr = [];

    if (typeof pokemonData.pokemonToGuess !== 'undefined') {
      shuffledArr = shuffleArray([
        pokemonData.pokemonToGuess,
        ...(pokemonData.otherPokemons ?? []),
      ]);
    }

    return shuffledArr;
  }, [pokemonData]);

  if (loading) return <Spinner bgColor={'#fff'} />;
  if (typeof pokemonData.pokemonToGuess === 'undefined') return;
  if (round > MAX_NUMBER_ROUNDS) {
    //TODO: render table showing the pokemon name,...
    //TODO: ...pokemon id and the time it took to reply to the question
    //TODO: also the unanswered questions
    return <h1>You totalized an amount of {currentScore.current}</h1>;
  }

  const pokemonImage = pokemonData.pokemonToGuess.sprites.front_default;
  const roundsLabel = `${round} of ${MAX_NUMBER_ROUNDS} rounds`;
  const secondsLeftLabel = `${secondsLeftUntilNextRound} seconds until next round`;
  const currentRoundFinished = currentRoundSeconds <= 0;
  const shouldButtonsBeDisabled = !!pokemonClicked || currentRoundFinished;

  return (
    <div style={{ padding: '3rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1
          style={{
            fontSize: '2em',
          }}
        >
          {roundsLabel}
        </h1>
        {(pokemonClicked || currentRoundFinished) &&
          secondsLeftUntilNextRound > 0 && (
            <h1
              style={{
                fontSize: '2em',
              }}
            >
              {secondsLeftLabel}
            </h1>
          )}
      </div>

      {currentRoundSeconds > 0 && <h1>{currentRoundSeconds} seconds left</h1>}

      <>
        <h1 className='mt-5 text-xl font-extrabold text-center'>
          Who's that pokemon?
        </h1>
        <PokemonImage
          showPokemonImage={showPokemon}
          correctPokemonImageUrl={pokemonImage}
        />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {pokemonsChoices.map((pokemon, _index) => {
            /* If a pokemon has been selected, compare it to the current
          pokemon option and return either true/false if same/different.
          If not selected then, return an empty string */

            //TODO: refactor dynamic class part
            const dynamicButtonClass =
              typeof pokemonClicked === 'undefined'
                ? ''
                : pokemonClicked.name === pokemon.name
                ? 'right'
                : 'wrong';

            return (
              <button
                key={pokemon.name}
                onClick={() => setPokemonClicked(pokemon)}
                value={pokemon.name}
                disabled={shouldButtonsBeDisabled}
                className={`btn ${dynamicButtonClass}`}
                style={{ margin: '0 1rem' }}
              >
                {pokemon.name}
              </button>
            );
          })}
        </div>
      </>
    </div>
  );
}

//export default Game;
export default GameTest;
