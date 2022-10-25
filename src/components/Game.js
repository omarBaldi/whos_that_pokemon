import React, { useMemo, useRef, useEffect, useState, useReducer } from 'react';
import { getPokemonFromPokedexId } from '../services/pokemons';
import { shuffleArray } from '../utils/shuffle-array';
import { getRandomNumberBetweenRange } from '../utils/generate-random-number';
import PokemonImage from './PokemonImage';
import Spinner from './Spinner';
import {
  DEFAULT_POKEMON_CHOICES,
  DEFAULT_SECONDS_UNTIL_NEXT_ROUND,
  MAX_NUMBER_ROUNDS,
  TOTAL_NUMBER_POKEMONS,
} from '../constant';
import { useCountdown } from '../hooks/useCountdown';
import { pokemonReducer } from '../reducers/pokemon-reducer';
import {
  updateLoadingIndicator,
  updateNumberRounds,
  updatePokemonClicked,
  updatePokemonsData,
  updatePokemonVisibility,
} from '../actions-creators/pokemon-actions-creators';

const initialReducerState = {
  loading: false,
  round: 1,
  showPokemon: false,
  pokemonClicked: undefined,
  pokemonData: {
    pokemonToGuess: undefined,
    otherPokemons: undefined,
  },
};

/**
 *
 * ? take in consideration of replacing multiple useState hooks with useReducer
 * TODO: create button component
 * TODO: create title component
 */
function GameTest() {
  const [
    { loading, round, showPokemon, pokemonClicked, pokemonData },
    dispatch,
  ] = useReducer(pokemonReducer, initialReducerState);

  const currentScore = useRef(0);

  /* *---------------------------------- TIME TO NEXT ROUND STATE */
  const countdownNextPokemonQuizRef = useRef();
  const [secondsLeftUntilNextRound, setSecondsLeftUntilNextRound] = useState(
    DEFAULT_SECONDS_UNTIL_NEXT_ROUND
  );

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

      dispatch(
        updatePokemonsData({ pokemonToGuess, otherPokemons: restPokemons })
      );
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(updateLoadingIndicator(false));
    }
  };

  const {
    secondsLeft: currentRoundSeconds,
    stopCountdown: stopCountdownCurrentRound,
  } = useCountdown({
    initialValue: 10,
    deps: useMemo(() => [round], [round]),
  });

  useEffect(() => {
    if (round > MAX_NUMBER_ROUNDS) return;

    getRandomPokemon();

    return () => {
      // * reset values on component unmount
      dispatch(
        updatePokemonsData({
          pokemonToGuess: undefined,
          otherPokemons: undefined,
        })
      );
      dispatch(updatePokemonClicked(undefined));
      setSecondsLeftUntilNextRound(DEFAULT_SECONDS_UNTIL_NEXT_ROUND);
    };
  }, [round]);

  useEffect(() => {
    if (pokemonClicked || currentRoundSeconds <= 0) {
      dispatch(updatePokemonVisibility(true));
      //NOTE: if the user clicks on one of the pokemon choices
      //before the timer expires, then stop it

      stopCountdownCurrentRound();

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
      dispatch(updateNumberRounds());
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

  if (round > MAX_NUMBER_ROUNDS) {
    //TODO: render table showing the pokemon name,...
    //TODO: ...pokemon id and the time it took to reply to the question
    //TODO: also the unanswered questions
    return <h1>You totalized an amount of {currentScore.current}</h1>;
  }
  if (loading) return <Spinner bgColor={'#fff'} />;
  if (typeof pokemonData.pokemonToGuess === 'undefined') return;

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
                onClick={() => dispatch(updatePokemonClicked(pokemon))}
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
