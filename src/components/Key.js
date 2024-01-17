import React, { useEffect } from 'react';
import '../styles/key.css';

const Key = ({styleType, keyLetter, pressed}) => {

    const keyClass = pressed ? (styleType + " pressed") : styleType;
    
    return (
        <div className={keyClass}>{keyLetter}</div>
    )

}

export default Key;