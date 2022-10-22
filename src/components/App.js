import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { pokeClient } from './PokeClient';
import Game from './Game';
import './styles.css';

//TODO: move this to constant
const GEN_1_POKEMONS = 151;

/**
 *
 * ? possibility to use React Query
 * * Get a random pokemon and whenever a new one appears,
 * * reset the countdown timer. As soon as it reaches 0, show
 * * correct answer by highlight the button with correct answer (green).
 * * If the user clicks on the wrong choice, the timer stops, show both the
 * * wrong and correct button (red and green) and generate new pokemon.
 * @returns
 */
function App() {
  const [pokemonData, setPokemonData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  /* On component mount, get the pokemon list and update
	the state with the data returned from the promise */
  useEffect(() => {
    pokeClient.getPokemons(GEN_1_POKEMONS).then((res) => {
      setPokemonData(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <h1>Data is Loading....</h1>;
  }

  return (
    <>
      <header>
        <nav className='nav py-5 flex align-center font-extrabold'>
          <a
            className='ml-2 p-1 bg-white border border-gray-500 rounded-l'
            href='/'
          >
            Pokemon
          </a>
        </nav>
      </header>
      {/* <Game pokemonData={pokemonData} /> */}
      <Game />
    </>
  );
}

export default App;
