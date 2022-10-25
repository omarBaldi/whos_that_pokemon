//TODO: create action folder and create an object for the actions type

/**
 *
 * @param {boolean} isLoading
 */
export const updateLoadingIndicator = (isLoading) => {
  return {
    type: 'update_loading_indicator',
    payload: {
      isLoading,
    },
  };
};

/**
 *
 * @param {currentRound} number
 */
export const updateNumberRounds = () => {
  return {
    type: 'update_number_rounds',
  };
};

/**
 *
 * @param {boolean} isVisible
 */
export const updatePokemonVisibility = (isVisible) => {
  return {
    type: 'update_pokemon_visibility',
    payload: {
      isPokemonVisible: isVisible,
    },
  };
};

/**
 *
 * @param {Object | undefined} pokemonClicked
 */
export const updatePokemonClicked = (pokemonClicked) => {
  return {
    type: 'update_pokemon_clicked',
    payload: {
      pokemonClicked,
    },
  };
};

/**
 *
 * @param {Object | undefined} pokemonToGuess
 * @param {Object | undefined} otherPokemons
 */
export const updatePokemonsData = ({ pokemonToGuess, otherPokemons }) => {
  return {
    type: 'update_pokemons_data',
    payload: {
      updatedPokemonData: {
        pokemonToGuess,
        otherPokemons,
      },
    },
  };
};
