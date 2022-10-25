import React, { useMemo } from 'react';
import { updatePokemonClicked } from '../actions-creators/pokemon-actions-creators';
import { shuffleArray } from '../utils/shuffle-array';

const PokemonOptions = ({
  pokemons,
  pokemonClicked,
  dispatch,
  shouldOptionsBeDisabled,
}) => {
  const pokemonsChoices = useMemo(() => {
    let shuffledArr = [];

    if (typeof pokemons.pokemonToGuess !== 'undefined') {
      shuffledArr = shuffleArray([
        pokemons.pokemonToGuess,
        ...(pokemons.otherPokemons ?? []),
      ]);
    }

    return shuffledArr;
  }, [pokemons]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {pokemonsChoices.map((pokemon, _index) => {
        /*  If a pokemon has been selected, compare it to the current
            pokemon option and return either true/false if same/different.
            If not selected then, return an empty string 
        */

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
            disabled={shouldOptionsBeDisabled}
            className={`btn ${dynamicButtonClass}`}
            style={{ margin: '0 1rem' }}
          >
            {pokemon.name}
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(PokemonOptions);
