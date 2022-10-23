import React from 'react';

function Spinner({ bgColor }) {
  return (
    <div className='spinner'>
      <div style={{ backgroundColor: bgColor }} className='circle-core'></div>
    </div>
  );
}

export default Spinner;
