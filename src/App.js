import React, {useEffect, useState} from 'react';
import Octave from './components/Octave';
import ChordNamer from './components/ChordNamer';
import Key from './components/Key';
import './styles/key.css';
import chordsDict from './data/chords.json';
import inversionsDict from './data/inversions.json';
import keyboardToNotes from './data/keyboardToNotes.json';
// import { useMidiInputs } from 'react-midi';
// import { init, onMIDIMessage } from 'web-midi-api';

// let keys

const notesDict = {
  0: "C",
  1: "Db",
  2: "D",
  3: "Eb",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "Ab",
  9: "A",
  10: "Bb",
  11: "B"
}

const nameNote = (num) => notesDict[num % 12];

const App = () => {
  // const { inputs, selectedInput, setSelectedInput } = useMidiInputs();
  const [chordName, setChordName] = useState("n.c.");
  const [noteOnMap, setNoteOnMap] = useState(new Map());
  const [keysDown, setKeysDown] = useState([]);
  // const noteOnMap = new Map();
  const [notes, setNotes] = useState([]);

  const handleKeyDown = (event) => {
    event.preventDefault();
    setKeysDown(prevKeys => {
      // Check if the key is not already in the array
      if (!prevKeys.includes(event.key)) {
        const newKeysDown = [...prevKeys, event.key];
        const newChordName = nameChord(newKeysDown);
        setChordName(newChordName);
        return newKeysDown;
      }
      return prevKeys;
    });
  }

  const handleKeyUp = (event) => {
    event.preventDefault();
    setKeysDown(prevKeys => {
      const newKeysDown = prevKeys.filter(key => key !== event.key);
      const newChordName = nameChord(newKeysDown);
      setChordName(newChordName);
      return prevKeys.filter(key => key !== event.key);
    });
  }

  const updateNotes = (note, add) => {
    if(add) {
      setNoteOnMap((prevNoteOnMap) => {
        const newNoteOnMap = new Map(prevNoteOnMap);
        newNoteOnMap.set(note, true);
        // console.log(newNoteOnMap);
        const newChordName = nameChordMIDI(newNoteOnMap);
        setChordName(newChordName);
        return newNoteOnMap;
      });
    }
    else {
      setNoteOnMap((prevNoteOnMap) => {
        const newNoteOnMap = new Map(prevNoteOnMap);
        newNoteOnMap.delete(note);
        // console.log(newNoteOnMap);
        const newChordName = nameChordMIDI(newNoteOnMap);
        setChordName(newChordName);
        return newNoteOnMap;
      });
    }
    // setTimeout(() => console.log("lowest", findRoot(noteOnMap)));
  }

  // const findRootMIDI = (noteMap) => {
  //   // console.log(noteMap);
  //   let lowestKey = null;
  //   for (const key of noteMap.keys()) {
  //     // console.log("k", key);
  //     if (lowestKey === null || key < lowestKey) {
  //       lowestKey = key;
  //     }
  //   }
  //   return lowestKey;
  // }

  const normalizeNotesDown = (notesDown) => {

    if(notesDown.length < 2 || notesDown[0] % 12 !== notesDown[1] % 12) {
      return notesDown;
    }

    const result = [notesDown[0]];

    let groupDone = false;

    for(let n = 1; n < notesDown.length - 1; ++n) {
      if(groupDone) {
        result.push(notesDown[n]);
        continue;
      }
      if(notesDown[n] % 12 !== notesDown[n + 1] % 12) {
        groupDone = true;
      }
    }

    result.push(notesDown[notesDown.length - 1]);

    return result;
  }

  const setupChord = (sortedNotesDown, rootNum) => {
    const relNotesDown = sortedNotesDown.map(noteNum => (noteNum - rootNum) % 12);
    const uniqueRelNotesDown = [...new Set(relNotesDown)];
    uniqueRelNotesDown.sort((a, b) => a - b);
    return uniqueRelNotesDown;
  }

  const nameChordHelper = (notesDown) => {
    notesDown.sort((a, b) => a - b);
    // console.log("nd", notesDown)
    const normalizedND = normalizeNotesDown(notesDown);
    // console.log("nnd", normalizedND);
    const rootNum = normalizedND[0];
    const rootNote = notesDict[rootNum % 12];

    // const relNotesDown = notesDown.map(noteNum => (noteNum - rootNum) % 12);

    // const uniqueRelNotesDown = [...new Set(relNotesDown)];
    // uniqueRelNotesDown.sort((a, b) => a - b);

    // const chordString = uniqueRelNotesDown.join(" ");

    const uniqueRelNotesDown = setupChord(normalizedND, rootNum);

    const chordString = uniqueRelNotesDown.join(" ");

    // console.log("nd", normalizedND);

    // console.log("cs", chordString);

    if(chordString in chordsDict) {
      return rootNote + chordsDict[chordString];
    }

    else if(chordString in inversionsDict) {
      const [inversion, quality] = inversionsDict[chordString];
      const numNotesInChord = uniqueRelNotesDown.length;
      const rootOffset = uniqueRelNotesDown[numNotesInChord - inversion];
      const invertedRootNote = notesDict[(rootNum + rootOffset) % 12];
      return invertedRootNote + quality + "/" + rootNote;
    }

    const aboveNotesDown = normalizedND.slice(1);
    // console.log("and", aboveNotesDown);
    const aboveRootNum = aboveNotesDown[0];
    const aboveRootNote = notesDict[aboveRootNum % 12];
    // const aboveRelNotesDown = aboveNotesDown.map(noteNum => (noteNum - rootNum) % 12);
    // const unrnd = [...new Set(aboveRelNotesDown)]
    // unrnd.sort((a, b) => a - b);
    // const aboveChordString = unrnd.join(" ");
    const aboveChordUniqueNotesDown = setupChord(aboveNotesDown, aboveRootNum);
    const aboveChordString = aboveChordUniqueNotesDown.join(" ");

    // console.log("acs", aboveChordString);

    if(aboveChordString in chordsDict) {
      // console.log("kjsdhfkjfsdh", aboveChordString);
      return aboveRootNote + chordsDict[aboveChordString] + "/" + rootNote;
    }
    else if(aboveChordString in inversionsDict) {
      const [inversion, quality] = inversionsDict[aboveChordString];
      // console.log(inversion, quality);
      // console.log(aboveChordUniqueNotesDown);
      const numNotesInChord = aboveChordUniqueNotesDown.length;
      const rootOffset = aboveChordUniqueNotesDown[numNotesInChord - inversion];
      const invertedRootNote = notesDict[(aboveRootNum + rootOffset) % 12];
      return invertedRootNote + quality + "/" + rootNote;
    }

    return chordName;
  }

  const nameChordMIDI = (noteMap) => {
    const notesDown = [...noteMap.keys()].map(key => key - 36);
    return nameChordHelper(notesDown);
  }

  const nameChord = (keysDown) => {
    const notesDown = keysDown.filter(key => key in keyboardToNotes).map(key => keyboardToNotes[key]);
    return nameChordHelper(notesDown);
  }

  useEffect(() => {
    let midiAccess = null;
    // const noteOnMap = new Map(); // Map to track note-on events

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const initializeMIDI = async () => {
      try {
        midiAccess = await navigator.requestMIDIAccess();

        midiAccess.inputs.forEach((input) => {
          input.onmidimessage = handleMIDIMessage;
        });
      } catch (error) {
        console.error('MIDI initialization failed:', error);
      }
    };

    const handleMIDIMessage = (event) => {
      const [status, note, velocity] = event.data;

      if (status === 144) {
        // Note-on event (status 144)
        if (velocity > 0) {
          // Note-on event
          // console.log(`Note-on: Note ${note}, Velocity ${velocity}`);
          // noteOnMap.set(note, true);
          updateNotes(note, true);
        } else {
          // Note-off event
          // console.log(`Note-off: Note ${note}`);
          // noteOnMap.set(note, false);
          // noteOnMap.delete(note);
          updateNotes(note, false);
        }
      } else if (status === 128) {
        // Note-off event (status 128)
        // console.log(`Note-off: Note ${note}`);
        // noteOnMap.set(note, false);
        // noteOnMap.delete(note);
        updateNotes(note, false);
      }


      // console.log(noteOnMap.keys());
      // console.log(typeof(note));

      // setNotes(Array.from(noteOnMap.keys()));
      // console.log(notes);

      // console.log(noteOnMap);
    };

    initializeMIDI();  

    return () => {
      if (midiAccess) {
        midiAccess.inputs.forEach((input) => {
          input.onmidimessage = null;
        });
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  // console.log(noteOnMap);
  // console.log(findRoot(noteOnMap));
  // console.log("sdjf", typeof(keysDown));
  // console.log("nom", typeof(noteOnMap));
  // console.log(typeof(keyboardToNotes));

  const searchKey = (keyIn) => keysDown.includes(keyIn);
  const searchKeyMIDI = (keyIn) => noteOnMap.has(keyIn + 36);

  return (
    <>
      <div style={{display: "flex"}}>
        {/* <Octave keysDown={keysDown}/>
        <Octave keysDown={keysDown}/>
        <Octave keysDown={keysDown}/>
        <Octave keysDown={keysDown}/>
        <Octave keysDown={keysDown}/> */}
        <div className='flex'>
            <Key styleType="white" keyLetter={"Q"} pressed={searchKey("q") || searchKeyMIDI(0)}/>
            <Key styleType="black one" keyLetter={"2"} pressed={searchKey("2") || searchKeyMIDI(1)}/>
            <Key styleType="white" keyLetter={"W"} pressed={searchKey("w") || searchKeyMIDI(2)}/>
            <Key styleType="black two" keyLetter={"3"} pressed={searchKey("3") || searchKeyMIDI(3)}/>
            <Key styleType="white" keyLetter={"E"} pressed={searchKey("e") || searchKeyMIDI(4)}/>
            <Key styleType="white" keyLetter={"R"} pressed={searchKey("r") || searchKeyMIDI(5)}/>
            <Key styleType="black three" keyLetter={"5"} pressed={searchKey("5") || searchKeyMIDI(6)}/>
            <Key styleType="white" keyLetter={"T"} pressed={searchKey("t") || searchKeyMIDI(7)}/>
            <Key styleType="black four" keyLetter={"6"} pressed={searchKey("6") || searchKeyMIDI(8)}/>
            <Key styleType="white" keyLetter={"Y"} pressed={searchKey("y") || searchKeyMIDI(9)}/>
            <Key styleType="black five" keyLetter={"7"} pressed={searchKey("7") || searchKeyMIDI(10)}/>
            <Key styleType="white" keyLetter={"U"} pressed={searchKey("u") || searchKeyMIDI(11)}/>
        </div>
        <div className='flex'>
            <Key styleType="white" keyLetter={"I"} pressed={searchKey("i") || searchKeyMIDI(12)}/>
            <Key styleType="black one" keyLetter={"9"} pressed={searchKey("9") || searchKeyMIDI(13)}/>
            <Key styleType="white" keyLetter={"O"} pressed={searchKey("o") || searchKeyMIDI(14)}/>
            <Key styleType="black two" keyLetter={"0"} pressed={searchKey("0") || searchKeyMIDI(15)}/>
            <Key styleType="white" keyLetter={"P"} pressed={searchKey("p") || searchKeyMIDI(16)}/>
            <Key styleType="white" keyLetter={"Z"} pressed={searchKey("z") || searchKeyMIDI(17)}/>
            <Key styleType="black three" keyLetter={"S"} pressed={searchKey("s") || searchKeyMIDI(18)}/>
            <Key styleType="white" keyLetter={"X"} pressed={searchKey("x") || searchKeyMIDI(19)}/>
            <Key styleType="black four" keyLetter={"D"} pressed={searchKey("d") || searchKeyMIDI(20)}/>
            <Key styleType="white" keyLetter={"C"} pressed={searchKey("c") || searchKeyMIDI(21)}/>
            <Key styleType="black five" keyLetter={"F"} pressed={searchKey("f") || searchKeyMIDI(22)}/>
            <Key styleType="white" keyLetter={"V"} pressed={searchKey("v") || searchKeyMIDI(23)}/>
        </div>
        <div className='flex'>
            <Key styleType="white" keyLetter={"B"} pressed={searchKey("b") || searchKeyMIDI(24)}/>
            <Key styleType="black one" keyLetter={"H"} pressed={searchKey("h") || searchKeyMIDI(25)}/>
            <Key styleType="white" keyLetter={"N"} pressed={searchKey("n") || searchKeyMIDI(26)}/>
            <Key styleType="black two" keyLetter={"J"} pressed={searchKey("j") || searchKeyMIDI(27)}/>
            <Key styleType="white" keyLetter={"M"} pressed={searchKey("m") || searchKeyMIDI(28)}/>
            <Key styleType="white" keyLetter={","} pressed={searchKey(",") || searchKeyMIDI(29)}/>
            <Key styleType="black three" keyLetter={"L"} pressed={searchKey("l") || searchKeyMIDI(30)}/>
            <Key styleType="white" keyLetter={"."} pressed={searchKey(".") || searchKeyMIDI(31)}/>
            <Key styleType="black four" keyLetter={";"} pressed={searchKey(";") || searchKeyMIDI(32)}/>
            <Key styleType="white" keyLetter={"/"} pressed={searchKey("/") || searchKeyMIDI(33)}/>
            <Key styleType="black five" keyLetter={""} pressed={searchKeyMIDI(34)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(35)}/>
        </div>
        <div className='flex'>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(36)}/>
            <Key styleType="black one" keyLetter={""} pressed={searchKeyMIDI(37)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(38)}/>
            <Key styleType="black two" keyLetter={""} pressed={searchKeyMIDI(39)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(40)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(41)}/>
            <Key styleType="black three" keyLetter={""} pressed={searchKeyMIDI(42)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(43)}/>
            <Key styleType="black four" keyLetter={""} pressed={searchKeyMIDI(44)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(45)}/>
            <Key styleType="black five" keyLetter={""} pressed={searchKeyMIDI(46)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(47)}/>
        </div>
        <div className='flex'>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(48)}/>
            <Key styleType="black one" keyLetter={""} pressed={searchKeyMIDI(49)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(50)}/>
            <Key styleType="black two" keyLetter={""} pressed={searchKeyMIDI(51)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(52)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(53)}/>
            <Key styleType="black three" keyLetter={""} pressed={searchKeyMIDI(54)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(55)}/>
            <Key styleType="black four" keyLetter={""} pressed={searchKeyMIDI(56)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(57)}/>
            <Key styleType="black five" keyLetter={""} pressed={searchKeyMIDI(58)}/>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(59)}/>
        </div>
        <div className='flex'>
            <Key styleType="white" keyLetter={""} pressed={searchKeyMIDI(60)}/>
        </div>
      </div>
      <br/>
      <ChordNamer value={chordName}/>
    </>
    
  )
}

export default App;