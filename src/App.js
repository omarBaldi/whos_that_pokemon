import React from 'react';
import Game from './components/Game';
import './styles.css';

function App() {
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
      <Game />
    </>
  );
}

export default App;
