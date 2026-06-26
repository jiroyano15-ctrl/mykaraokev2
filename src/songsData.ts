/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Song } from './types';

export const SONGS: Song[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    genre: 'Children / Classic',
    difficulty: 'Easy',
    bpm: 80,
    highScore: 0,
    backingNotes: [
      // Verse 1
      { time: 0.0, duration: 0.7, midiPitch: 60, syllable: 'Twin-' },
      { time: 0.75, duration: 0.7, midiPitch: 60, syllable: 'kle ' },
      { time: 1.5, duration: 0.7, midiPitch: 67, syllable: 'twin-' },
      { time: 2.25, duration: 0.7, midiPitch: 67, syllable: 'kle ' },
      { time: 3.0, duration: 0.7, midiPitch: 69, syllable: 'lit-' },
      { time: 3.75, duration: 0.7, midiPitch: 69, syllable: 'tle ' },
      { time: 4.5, duration: 1.4, midiPitch: 67, syllable: 'star, ' },

      { time: 6.0, duration: 0.7, midiPitch: 65, syllable: 'how ' },
      { time: 6.75, duration: 0.7, midiPitch: 65, syllable: 'I ' },
      { time: 7.5, duration: 0.7, midiPitch: 64, syllable: 'won-' },
      { time: 8.25, duration: 0.7, midiPitch: 64, syllable: 'der ' },
      { time: 9.0, duration: 0.7, midiPitch: 62, syllable: 'what ' },
      { time: 9.75, duration: 0.7, midiPitch: 62, syllable: 'you ' },
      { time: 10.5, duration: 1.4, midiPitch: 60, syllable: 'are! ' },

      // Verse 2
      { time: 12.0, duration: 0.7, midiPitch: 67, syllable: 'Up ' },
      { time: 12.75, duration: 0.7, midiPitch: 67, syllable: 'a-' },
      { time: 13.5, duration: 0.7, midiPitch: 65, syllable: 'bove ' },
      { time: 14.25, duration: 0.7, midiPitch: 65, syllable: 'the ' },
      { time: 15.0, duration: 0.7, midiPitch: 64, syllable: 'world ' },
      { time: 15.75, duration: 0.7, midiPitch: 64, syllable: 'so ' },
      { time: 16.5, duration: 1.4, midiPitch: 62, syllable: 'high, ' },

      { time: 18.0, duration: 0.7, midiPitch: 67, syllable: 'like ' },
      { time: 18.75, duration: 0.7, midiPitch: 67, syllable: 'a ' },
      { time: 19.5, duration: 0.7, midiPitch: 65, syllable: 'dia-' },
      { time: 20.25, duration: 0.7, midiPitch: 65, syllable: 'mond ' },
      { time: 21.0, duration: 0.7, midiPitch: 64, syllable: 'in ' },
      { time: 21.75, duration: 0.7, midiPitch: 64, syllable: 'the ' },
      { time: 22.5, duration: 1.4, midiPitch: 62, syllable: 'sky! ' },

      // Verse 3
      { time: 24.0, duration: 0.7, midiPitch: 60, syllable: 'Twin-' },
      { time: 24.75, duration: 0.7, midiPitch: 60, syllable: 'kle ' },
      { time: 25.5, duration: 0.7, midiPitch: 67, syllable: 'twin-' },
      { time: 26.25, duration: 0.7, midiPitch: 67, syllable: 'kle ' },
      { time: 27.0, duration: 0.7, midiPitch: 69, syllable: 'lit-' },
      { time: 27.75, duration: 0.7, midiPitch: 69, syllable: 'tle ' },
      { time: 28.5, duration: 1.4, midiPitch: 67, syllable: 'star, ' },

      { time: 30.0, duration: 0.7, midiPitch: 65, syllable: 'how ' },
      { time: 30.75, duration: 0.7, midiPitch: 65, syllable: 'I ' },
      { time: 31.5, duration: 0.7, midiPitch: 64, syllable: 'won-' },
      { time: 32.25, duration: 0.7, midiPitch: 64, syllable: 'der ' },
      { time: 33.0, duration: 0.7, midiPitch: 62, syllable: 'what ' },
      { time: 33.75, duration: 0.7, midiPitch: 62, syllable: 'you ' },
      { time: 34.5, duration: 1.4, midiPitch: 60, syllable: 'are! ' }
    ],
    lyrics: [
      {
        time: 0.0,
        duration: 5.9,
        text: 'Twinkle twinkle little star,',
        words: [
          { time: 0.0, duration: 0.7, text: 'Twin-', midiPitch: 60 },
          { time: 0.75, duration: 0.7, text: 'kle ', midiPitch: 60 },
          { time: 1.5, duration: 0.7, text: 'twin-', midiPitch: 67 },
          { time: 2.25, duration: 0.7, text: 'kle ', midiPitch: 67 },
          { time: 3.0, duration: 0.7, text: 'lit-', midiPitch: 69 },
          { time: 3.75, duration: 0.7, text: 'tle ', midiPitch: 69 },
          { time: 4.5, duration: 1.4, text: 'star,', midiPitch: 67 }
        ]
      },
      {
        time: 6.0,
        duration: 5.9,
        text: 'how I wonder what you are!',
        words: [
          { time: 6.0, duration: 0.7, text: 'how ', midiPitch: 65 },
          { time: 6.75, duration: 0.7, text: 'I ', midiPitch: 65 },
          { time: 7.5, duration: 0.7, text: 'won-', midiPitch: 64 },
          { time: 8.25, duration: 0.7, text: 'der ', midiPitch: 64 },
          { time: 9.0, duration: 0.7, text: 'what ', midiPitch: 62 },
          { time: 9.75, duration: 0.7, text: 'you ', midiPitch: 62 },
          { time: 10.5, duration: 1.4, text: 'are!', midiPitch: 60 }
        ]
      },
      {
        time: 12.0,
        duration: 5.9,
        text: 'Up above the world so high,',
        words: [
          { time: 12.0, duration: 0.7, text: 'Up ', midiPitch: 67 },
          { time: 12.75, duration: 0.7, text: 'a-', midiPitch: 67 },
          { time: 13.5, duration: 0.7, text: 'bove ', midiPitch: 65 },
          { time: 14.25, duration: 0.7, text: 'the ', midiPitch: 65 },
          { time: 15.0, duration: 0.7, text: 'world ', midiPitch: 64 },
          { time: 15.75, duration: 0.7, text: 'so ', midiPitch: 64 },
          { time: 16.5, duration: 1.4, text: 'high,', midiPitch: 62 }
        ]
      },
      {
        time: 18.0,
        duration: 5.9,
        text: 'like a diamond in the sky!',
        words: [
          { time: 18.0, duration: 0.7, text: 'like ', midiPitch: 67 },
          { time: 18.75, duration: 0.7, text: 'a ', midiPitch: 67 },
          { time: 19.5, duration: 0.7, text: 'dia-', midiPitch: 65 },
          { time: 20.25, duration: 0.7, text: 'mond ', midiPitch: 65 },
          { time: 21.0, duration: 0.7, text: 'in ', midiPitch: 64 },
          { time: 21.75, duration: 0.7, text: 'the ', midiPitch: 64 },
          { time: 22.5, duration: 1.4, text: 'sky!', midiPitch: 62 }
        ]
      },
      {
        time: 24.0,
        duration: 5.9,
        text: 'Twinkle twinkle little star,',
        words: [
          { time: 24.0, duration: 0.7, text: 'Twin-', midiPitch: 60 },
          { time: 24.75, duration: 0.7, text: 'kle ', midiPitch: 60 },
          { time: 25.5, duration: 0.7, text: 'twin-', midiPitch: 67 },
          { time: 26.25, duration: 0.7, text: 'kle ', midiPitch: 67 },
          { time: 27.0, duration: 0.7, text: 'lit-', midiPitch: 69 },
          { time: 27.75, duration: 0.7, text: 'tle ', midiPitch: 69 },
          { time: 28.5, duration: 1.4, text: 'star,', midiPitch: 67 }
        ]
      },
      {
        time: 30.0,
        duration: 5.9,
        text: 'how I wonder what you are!',
        words: [
          { time: 30.0, duration: 0.7, text: 'how ', midiPitch: 65 },
          { time: 30.75, duration: 0.7, text: 'I ', midiPitch: 65 },
          { time: 31.5, duration: 0.7, text: 'won-', midiPitch: 64 },
          { time: 32.25, duration: 0.7, text: 'der ', midiPitch: 64 },
          { time: 33.0, duration: 0.7, text: 'what ', midiPitch: 62 },
          { time: 33.75, duration: 0.7, text: 'you ', midiPitch: 62 },
          { time: 34.5, duration: 1.4, text: 'are!', midiPitch: 60 }
        ]
      }
    ]
  },
  {
    id: 'flyme',
    title: 'Fly Me to the Moon',
    artist: 'Frank Sinatra',
    genre: 'Jazz / Standards',
    difficulty: 'Medium',
    bpm: 110,
    highScore: 0,
    backingNotes: [
      // "Fly me to the moon"
      { time: 1.0, duration: 0.5, midiPitch: 65, syllable: 'Fly ' }, // F4
      { time: 1.5, duration: 0.5, midiPitch: 64, syllable: 'me ' },  // E4
      { time: 2.0, duration: 0.5, midiPitch: 62, syllable: 'to ' },  // D4
      { time: 2.5, duration: 0.5, midiPitch: 60, syllable: 'the ' }, // C4
      { time: 3.0, duration: 1.5, midiPitch: 58, syllable: 'moon, ' }, // Bb3

      // "and let me play among the stars"
      { time: 5.0, duration: 0.4, midiPitch: 57, syllable: 'and ' }, // A3
      { time: 5.4, duration: 0.4, midiPitch: 55, syllable: 'let ' }, // G3
      { time: 5.8, duration: 0.4, midiPitch: 53, syllable: 'me ' }, // F3
      { time: 6.2, duration: 0.6, midiPitch: 67, syllable: 'play ' }, // G4
      { time: 6.8, duration: 0.4, midiPitch: 65, syllable: 'a-' },   // F4
      { time: 7.2, duration: 0.4, midiPitch: 64, syllable: 'mong ' }, // E4
      { time: 7.6, duration: 0.4, midiPitch: 62, syllable: 'the ' }, // D4
      { time: 8.0, duration: 1.5, midiPitch: 60, syllable: 'stars. ' }, // C4

      // "Let me see what spring is like on"
      { time: 10.0, duration: 0.5, midiPitch: 62, syllable: 'Let ' }, // D4
      { time: 10.5, duration: 0.5, midiPitch: 60, syllable: 'me ' },  // C4
      { time: 11.0, duration: 0.5, midiPitch: 58, syllable: 'see ' },  // Bb3
      { time: 11.5, duration: 0.5, midiPitch: 57, syllable: 'what ' }, // A3
      { time: 12.0, duration: 1.5, midiPitch: 55, syllable: 'spring ' }, // G3
      { time: 13.5, duration: 0.4, midiPitch: 53, syllable: 'is ' }, // F3
      { time: 13.9, duration: 0.4, midiPitch: 64, syllable: 'like ' }, // E4
      { time: 14.3, duration: 0.4, midiPitch: 62, syllable: 'on ' }, // D4

      // "Jupiter and Mars"
      { time: 15.0, duration: 0.8, midiPitch: 60, syllable: 'Ju-' },  // C4
      { time: 15.8, duration: 0.4, midiPitch: 58, syllable: 'pi-' },  // Bb3
      { time: 16.2, duration: 0.4, midiPitch: 57, syllable: 'ter ' },  // A3
      { time: 16.6, duration: 0.4, midiPitch: 55, syllable: 'and ' }, // G3
      { time: 17.0, duration: 1.8, midiPitch: 53, syllable: 'Mars. ' }, // F3

      // "In other words, hold my hand"
      { time: 19.5, duration: 0.4, midiPitch: 65, syllable: 'In ' }, // F4
      { time: 19.9, duration: 0.4, midiPitch: 64, syllable: 'o-' },  // E4
      { time: 20.3, duration: 0.4, midiPitch: 62, syllable: 'ther ' }, // D4
      { time: 20.7, duration: 0.4, midiPitch: 60, syllable: 'words, ' }, // C4
      { time: 21.5, duration: 1.0, midiPitch: 67, syllable: 'hold ' }, // G4
      { time: 22.5, duration: 0.5, midiPitch: 65, syllable: 'my ' },  // F4
      { time: 23.0, duration: 1.5, midiPitch: 64, syllable: 'hand. ' }, // E4

      // "In other words, baby, kiss me"
      { time: 25.0, duration: 0.4, midiPitch: 62, syllable: 'In ' }, // D4
      { time: 25.4, duration: 0.4, midiPitch: 60, syllable: 'o-' },  // C4
      { time: 25.8, duration: 0.4, midiPitch: 58, syllable: 'ther ' }, // Bb3
      { time: 26.2, duration: 0.4, midiPitch: 57, syllable: 'words, ' }, // A3
      { time: 27.0, duration: 0.8, midiPitch: 64, syllable: 'ba-' }, // E4
      { time: 27.8, duration: 0.4, midiPitch: 62, syllable: 'by, ' },  // D4
      { time: 28.5, duration: 1.0, midiPitch: 60, syllable: 'kiss ' }, // C4
      { time: 29.5, duration: 1.5, midiPitch: 59, syllable: 'me! ' }  // B3
    ],
    lyrics: [
      {
        time: 1.0,
        duration: 3.5,
        text: 'Fly me to the moon,',
        words: [
          { time: 1.0, duration: 0.5, text: 'Fly ', midiPitch: 65 },
          { time: 1.5, duration: 0.5, text: 'me ', midiPitch: 64 },
          { time: 2.0, duration: 0.5, text: 'to ', midiPitch: 62 },
          { time: 2.5, duration: 0.5, text: 'the ', midiPitch: 60 },
          { time: 3.0, duration: 1.5, text: 'moon,', midiPitch: 58 }
        ]
      },
      {
        time: 5.0,
        duration: 4.5,
        text: 'and let me play among the stars.',
        words: [
          { time: 5.0, duration: 0.4, text: 'and ', midiPitch: 57 },
          { time: 5.4, duration: 0.4, text: 'let ', midiPitch: 55 },
          { time: 5.8, duration: 0.4, text: 'me ', midiPitch: 53 },
          { time: 6.2, duration: 0.6, text: 'play ', midiPitch: 67 },
          { time: 6.8, duration: 0.4, text: 'a-', midiPitch: 65 },
          { time: 7.2, duration: 0.4, text: 'mong ', midiPitch: 64 },
          { time: 7.6, duration: 0.4, text: 'the ', midiPitch: 62 },
          { time: 8.0, duration: 1.5, text: 'stars.', midiPitch: 60 }
        ]
      },
      {
        time: 10.0,
        duration: 4.7,
        text: 'Let me see what spring is like on',
        words: [
          { time: 10.0, duration: 0.5, text: 'Let ', midiPitch: 62 },
          { time: 10.5, duration: 0.5, text: 'me ', midiPitch: 60 },
          { time: 11.0, duration: 0.5, text: 'see ', midiPitch: 58 },
          { time: 11.5, duration: 0.5, text: 'what ', midiPitch: 57 },
          { time: 12.0, duration: 1.5, text: 'spring ', midiPitch: 55 },
          { time: 13.5, duration: 0.4, text: 'is ', midiPitch: 53 },
          { time: 13.9, duration: 0.4, text: 'like ', midiPitch: 64 },
          { time: 14.3, duration: 0.4, text: 'on ', midiPitch: 62 }
        ]
      },
      {
        time: 15.0,
        duration: 3.8,
        text: 'Jupiter and Mars.',
        words: [
          { time: 15.0, duration: 0.8, text: 'Ju-', midiPitch: 60 },
          { time: 15.8, duration: 0.4, text: 'pi-', midiPitch: 58 },
          { time: 16.2, duration: 0.4, text: 'ter ', midiPitch: 57 },
          { time: 16.6, duration: 0.4, text: 'and ', midiPitch: 55 },
          { time: 17.0, duration: 1.8, text: 'Mars.', midiPitch: 53 }
        ]
      },
      {
        time: 19.5,
        duration: 5.0,
        text: 'In other words, hold my hand.',
        words: [
          { time: 19.5, duration: 0.4, text: 'In ', midiPitch: 65 },
          { time: 19.9, duration: 0.4, text: 'o-', midiPitch: 64 },
          { time: 20.3, duration: 0.4, text: 'ther ', midiPitch: 62 },
          { time: 20.7, duration: 0.4, text: 'words, ', midiPitch: 60 },
          { time: 21.5, duration: 1.0, text: 'hold ', midiPitch: 67 },
          { time: 22.5, duration: 0.5, text: 'my ', midiPitch: 65 },
          { time: 23.0, duration: 1.5, text: 'hand.', midiPitch: 64 }
        ]
      },
      {
        time: 25.0,
        duration: 6.0,
        text: 'In other words, baby, kiss me!',
        words: [
          { time: 25.0, duration: 0.4, text: 'In ', midiPitch: 62 },
          { time: 25.4, duration: 0.4, text: 'o-', midiPitch: 60 },
          { time: 25.8, duration: 0.4, text: 'ther ', midiPitch: 58 },
          { time: 26.2, duration: 0.4, text: 'words, ', midiPitch: 57 },
          { time: 27.0, duration: 0.8, text: 'ba-', midiPitch: 64 },
          { time: 27.8, duration: 0.4, text: 'by, ', midiPitch: 62 },
          { time: 28.5, duration: 1.0, text: 'kiss ', midiPitch: 60 },
          { time: 29.5, duration: 1.5, text: 'me!', midiPitch: 59 }
        ]
      }
    ]
  },
  {
    id: 'dontstop',
    title: "Don't Stop Believin'",
    artist: 'Journey',
    genre: 'Rock / Classic',
    difficulty: 'Hard',
    bpm: 120,
    highScore: 0,
    backingNotes: [
      // "Just a small town girl"
      { time: 1.0, duration: 0.4, midiPitch: 59, syllable: 'Just ' },  // B3
      { time: 1.4, duration: 0.4, midiPitch: 61, syllable: 'a ' },     // C#4
      { time: 1.8, duration: 0.4, midiPitch: 63, syllable: 'small ' },  // D#4
      { time: 2.2, duration: 0.4, midiPitch: 64, syllable: 'town ' },   // E4
      { time: 2.6, duration: 0.8, midiPitch: 66, syllable: 'girl, ' },  // F#4

      // "living in a lonely world"
      { time: 4.0, duration: 0.4, midiPitch: 68, syllable: 'liv-' },   // G#4
      { time: 4.4, duration: 0.4, midiPitch: 66, syllable: 'ing ' },    // F#4
      { time: 4.8, duration: 0.4, midiPitch: 64, syllable: 'in ' },     // E4
      { time: 5.2, duration: 0.4, midiPitch: 63, syllable: 'a ' },     // D#4
      { time: 5.6, duration: 0.4, midiPitch: 64, syllable: 'lone-' },  // E4
      { time: 6.0, duration: 0.4, midiPitch: 66, syllable: 'ly ' },    // F#4
      { time: 6.4, duration: 1.2, midiPitch: 64, syllable: 'world. ' },  // E4

      // "She took the midnight train going anywhere"
      { time: 8.5, duration: 0.4, midiPitch: 59, syllable: 'She ' },   // B3
      { time: 8.9, duration: 0.4, midiPitch: 61, syllable: 'took ' },  // C#4
      { time: 9.3, duration: 0.4, midiPitch: 63, syllable: 'the ' },   // D#4
      { time: 9.7, duration: 0.4, midiPitch: 64, syllable: 'mid-' },   // E4
      { time: 10.1, duration: 0.4, midiPitch: 66, syllable: 'night ' }, // F#4
      { time: 10.5, duration: 0.8, midiPitch: 64, syllable: 'train ' }, // E4
      { time: 11.5, duration: 0.4, midiPitch: 68, syllable: 'go-' },   // G#4
      { time: 11.9, duration: 0.4, midiPitch: 66, syllable: 'ing ' },   // F#4
      { time: 12.3, duration: 0.4, midiPitch: 64, syllable: 'a-' },    // E4
      { time: 12.7, duration: 0.4, midiPitch: 66, syllable: 'ny-' },   // F#4
      { time: 13.1, duration: 1.5, midiPitch: 68, syllable: 'where. ' }, // G#4

      // "Just a city boy"
      { time: 16.0, duration: 0.4, midiPitch: 59, syllable: 'Just ' }, // B3
      { time: 16.4, duration: 0.4, midiPitch: 61, syllable: 'a ' },    // C#4
      { time: 16.8, duration: 0.4, midiPitch: 63, syllable: 'ci-' },   // D#4
      { time: 17.2, duration: 0.4, midiPitch: 64, syllable: 'ty ' },   // E4
      { time: 17.6, duration: 0.8, midiPitch: 66, syllable: 'boy, ' }, // F#4

      // "born and raised in south Detroit"
      { time: 19.0, duration: 0.4, midiPitch: 68, syllable: 'born ' }, // G#4
      { time: 19.4, duration: 0.4, midiPitch: 66, syllable: 'and ' },  // F#4
      { time: 19.8, duration: 0.4, midiPitch: 64, syllable: 'raised ' }, // E4
      { time: 20.2, duration: 0.4, midiPitch: 63, syllable: 'in ' },   // D#4
      { time: 20.6, duration: 0.4, midiPitch: 64, syllable: 'south ' }, // E4
      { time: 21.0, duration: 0.4, midiPitch: 66, syllable: 'De-' },   // F#4
      { time: 21.4, duration: 1.2, midiPitch: 64, syllable: 'troit. ' }, // E4

      // "He took the midnight train going anywhere"
      { time: 23.5, duration: 0.4, midiPitch: 59, syllable: 'He ' },   // B3
      { time: 23.9, duration: 0.4, midiPitch: 61, syllable: 'took ' },  // C#4
      { time: 24.3, duration: 0.4, midiPitch: 63, syllable: 'the ' },   // D#4
      { time: 24.7, duration: 0.4, midiPitch: 64, syllable: 'mid-' },   // E4
      { time: 25.1, duration: 0.4, midiPitch: 66, syllable: 'night ' }, // F#4
      { time: 25.5, duration: 0.8, midiPitch: 64, syllable: 'train ' }, // E4
      { time: 26.5, duration: 0.4, midiPitch: 68, syllable: 'go-' },   // G#4
      { time: 26.9, duration: 0.4, midiPitch: 66, syllable: 'ing ' },   // F#4
      { time: 27.3, duration: 0.4, midiPitch: 64, syllable: 'a-' },    // E4
      { time: 27.7, duration: 0.4, midiPitch: 66, syllable: 'ny-' },   // F#4
      { time: 28.1, duration: 1.5, midiPitch: 68, syllable: 'where! ' } // G#4
    ],
    lyrics: [
      {
        time: 1.0,
        duration: 2.6,
        text: 'Just a small town girl,',
        words: [
          { time: 1.0, duration: 0.4, text: 'Just ', midiPitch: 59 },
          { time: 1.4, duration: 0.4, text: 'a ', midiPitch: 61 },
          { time: 1.8, duration: 0.4, text: 'small ', midiPitch: 63 },
          { time: 2.2, duration: 0.4, text: 'town ', midiPitch: 64 },
          { time: 2.6, duration: 0.8, text: 'girl,', midiPitch: 66 }
        ]
      },
      {
        time: 4.0,
        duration: 3.8,
        text: 'living in a lonely world.',
        words: [
          { time: 4.0, duration: 0.4, text: 'liv-', midiPitch: 68 },
          { time: 4.4, duration: 0.4, text: 'ing ', midiPitch: 66 },
          { time: 4.8, duration: 0.4, text: 'in ', midiPitch: 64 },
          { time: 5.2, duration: 0.4, text: 'a ', midiPitch: 63 },
          { time: 5.6, duration: 0.4, text: 'lone-', midiPitch: 64 },
          { time: 6.0, duration: 0.4, text: 'ly ', midiPitch: 66 },
          { time: 6.4, duration: 1.2, text: 'world.', midiPitch: 64 }
        ]
      },
      {
        time: 8.5,
        duration: 6.3,
        text: 'She took the midnight train going anywhere.',
        words: [
          { time: 8.5, duration: 0.4, text: 'She ', midiPitch: 59 },
          { time: 8.9, duration: 0.4, text: 'took ', midiPitch: 61 },
          { time: 9.3, duration: 0.4, text: 'the ', midiPitch: 63 },
          { time: 9.7, duration: 0.4, text: 'mid-', midiPitch: 64 },
          { time: 10.1, duration: 0.4, text: 'night ', midiPitch: 66 },
          { time: 10.5, duration: 0.8, text: 'train ', midiPitch: 64 },
          { time: 11.5, duration: 0.4, text: 'go-', midiPitch: 68 },
          { time: 11.9, duration: 0.4, text: 'ing ', midiPitch: 66 },
          { time: 12.3, duration: 0.4, text: 'a-', midiPitch: 64 },
          { time: 12.7, duration: 0.4, text: 'ny-', midiPitch: 66 },
          { time: 13.1, duration: 1.5, text: 'where.', midiPitch: 68 }
        ]
      },
      {
        time: 16.0,
        duration: 2.6,
        text: 'Just a city boy,',
        words: [
          { time: 16.0, duration: 0.4, text: 'Just ', midiPitch: 59 },
          { time: 16.4, duration: 0.4, text: 'a ', midiPitch: 61 },
          { time: 16.8, duration: 0.4, text: 'ci-', midiPitch: 63 },
          { time: 17.2, duration: 0.4, text: 'ty ', midiPitch: 64 },
          { time: 17.6, duration: 0.8, text: 'boy,', midiPitch: 66 }
        ]
      },
      {
        time: 19.0,
        duration: 3.8,
        text: 'born and raised in south Detroit.',
        words: [
          { time: 19.0, duration: 0.4, text: 'born ', midiPitch: 68 },
          { time: 19.4, duration: 0.4, text: 'and ', midiPitch: 66 },
          { time: 19.8, duration: 0.4, text: 'raised ', midiPitch: 64 },
          { time: 20.2, duration: 0.4, text: 'in ', midiPitch: 63 },
          { time: 20.6, duration: 0.4, text: 'south ', midiPitch: 64 },
          { time: 21.0, duration: 0.4, text: 'De-', midiPitch: 66 },
          { time: 21.4, duration: 1.2, text: 'troit.', midiPitch: 64 }
        ]
      },
      {
        time: 23.5,
        duration: 6.3,
        text: 'He took the midnight train going anywhere!',
        words: [
          { time: 23.5, duration: 0.4, text: 'He ', midiPitch: 59 },
          { time: 23.9, duration: 0.4, text: 'took ', midiPitch: 61 },
          { time: 24.3, duration: 0.4, text: 'the ', midiPitch: 63 },
          { time: 24.7, duration: 0.4, text: 'mid-', midiPitch: 64 },
          { time: 25.1, duration: 0.4, text: 'night ', midiPitch: 66 },
          { time: 25.5, duration: 0.8, text: 'train ', midiPitch: 64 },
          { time: 26.5, duration: 0.4, text: 'go-', midiPitch: 68 },
          { time: 26.9, duration: 0.4, text: 'ing ', midiPitch: 66 },
          { time: 27.3, duration: 0.4, text: 'a-', midiPitch: 64 },
          { time: 27.7, duration: 0.4, text: 'ny-', midiPitch: 66 },
          { time: 28.1, duration: 1.5, text: 'where!', midiPitch: 68 }
        ]
      }
    ]
  }
];
