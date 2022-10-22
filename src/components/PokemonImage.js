import React from 'react';

function PokemonImage({ showPokemonImage, correctPokemonImageUrl }) {
  return (
    <img
      style={
        showPokemonImage
          ? { filter: 'brightness(100%)' }
          : { filter: 'brightness(0%)' }
      }
      className='img object-cover'
      src={correctPokemonImageUrl}
      alt=''
      height={100}
      width={100}
    />
  );
}

export default PokemonImage;
