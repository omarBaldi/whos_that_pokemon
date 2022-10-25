export const pokemonReducer = (state, action) => {
  switch (action.type) {
    case 'update_loading_indicator': {
      const { isLoading } = action.payload;

      return {
        ...state,
        loading: isLoading,
      };
    }
    case 'update_number_rounds': {
      return {
        ...state,
        round: state.round + 1,
      };
    }
    case 'update_pokemon_visibility': {
      const { isPokemonVisible } = action.payload;

      return {
        ...state,
        showPokemon: isPokemonVisible,
      };
    }
    case 'update_pokemon_clicked': {
      const { pokemonClicked } = action.payload;

      return {
        ...state,
        pokemonClicked,
      };
    }
    case 'update_pokemons_data': {
      const { updatedPokemonData } = action.payload;

      return {
        ...state,
        pokemonData: {
          ...state.pokemonData,
          ...updatedPokemonData,
        },
      };
    }
    default: {
      return state;
    }
  }
};
