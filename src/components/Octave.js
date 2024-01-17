import React from 'react';
import Key from './Key';
import '../styles/key.css';

const Octave = ({keysDown}) => {

    // const convertedKeys = ;

    return (
        <div className='flex'>
            <Key styleType="white"/>
            <Key styleType="black one"/>
            <Key styleType="white"/>
            <Key styleType="black two"/>
            <Key styleType="white"/>
            <Key styleType="white"/>
            <Key styleType="black three"/>
            <Key styleType="white"/>
            <Key styleType="black four"/>
            <Key styleType="white"/>
            <Key styleType="black five"/>
            <Key styleType="white"/>
        </div>
    );
}

export default Octave;