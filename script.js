import { instrumentManager } from './instruments.js';

let currentInstrument = null;
let currentSeed = null;
let noteInterval;
let isPlaying = false;
let isPaused = false;
let isRewinding = false;
let scheduledEvents = [];
Tone.Transport.bpm.value = 120;

const musicNotes = ['\u266A', '\u266B', '\u266C', '\u2669'];
const TOTAL_MEASURES = 8;
const COMPOSITION_MEASURES = TOTAL_MEASURES - 0.5;

const scales = {
  major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  naturalMinor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
  harmonicMinor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'B4', 'C5'],
  melodicMinor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  majorPentatonic: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
  minorPentatonic: ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5'],
  blues: ['C4', 'Eb4', 'F4', 'Gb4', 'G4', 'Bb4', 'C5']
};

function createMusicNote() {
  const note = document.createElement('div');
  note.className = 'music-note';
  note.textContent = musicNotes[Math.floor(Math.random() * musicNotes.length)];
  note.style.left = `${Math.random() * 100}%`;
  note.style.opacity = '1';
  
  const container = document.querySelector('.ascii-container');
  container.appendChild(note);
  
  setTimeout(() => {
    note.style.transition = 'opacity 0.5s';
    note.style.opacity = '0';
    setTimeout(() => {
      if (container.contains(note)) {
        container.removeChild(note);
      }
    }, 500);
  }, 1500);
}

function startNoteAnimation() {
  stopNoteAnimation();
  noteInterval = setInterval(createMusicNote, 500);
}

function stopNoteAnimation() {
  if (noteInterval) {
    clearInterval(noteInterval);
    noteInterval = null;
  }
  const container = document.querySelector('.ascii-container');
  const notes = container.querySelectorAll('.music-note');
  notes.forEach(note => {
    note.style.transition = 'opacity 0.5s';
    note.style.opacity = '0';
    setTimeout(() => {
      if (container.contains(note)) {
        container.removeChild(note);
      }
    }, 500);
  });
}

function extractMusicalDNA(rorId) {
  if (!rorId || rorId.length < 9) {
    throw new Error('Invalid ROR ID format');
  }
  
  const prefix = rorId.slice(0, 3);
  const separator = rorId.charAt(3);
  const encoded = rorId.slice(4, -2);
  const checksum = parseInt(rorId.slice(-2));
  
  const crockfordToNum = char => '0123456789abcdefghjkmnpqrstvwxyz'.indexOf(char.toLowerCase());
  const encodedNum = encoded.split('')
    .reduce((acc, char, i) => acc + crockfordToNum(char) * Math.pow(32, encoded.length - 1 - i), 0);
  
  const hash = (n, mod) => ((encodedNum * n) + checksum) % mod;
  
  const moodTypes = {
    joyful: {
      baseVelocity: 0.8,
      tempoMod: 1.2,
      preferredIntervals: [2, 4, 7],
      rhythmicDensity: 0.8,
      staccatoProbability: 0.7,
      preferredScales: ['major', 'majorPentatonic']
    },
    melancholic: {
      baseVelocity: 0.6,
      tempoMod: 0.8,
      preferredIntervals: [3, -2, -4],
      rhythmicDensity: 0.4,
      staccatoProbability: 0.1,
      preferredScales: ['naturalMinor', 'harmonicMinor']
    },
    mysterious: {
      baseVelocity: 0.65,
      tempoMod: 0.9,
      preferredIntervals: [6, -3, 1],
      rhythmicDensity: 0.5,
      staccatoProbability: 0.3,
      preferredScales: ['melodicMinor', 'harmonicMinor']
    },
    dramatic: {
      baseVelocity: 0.85,
      tempoMod: 1.1,
      preferredIntervals: [5, -7, 2],
      rhythmicDensity: 0.7,
      staccatoProbability: 0.5,
      preferredScales: ['harmonicMinor', 'melodicMinor']
    },
    playful: {
      baseVelocity: 0.75,
      tempoMod: 1.15,
      preferredIntervals: [2, -2, 4, -4],
      rhythmicDensity: 0.9,
      staccatoProbability: 0.8,
      preferredScales: ['majorPentatonic', 'major']
    },
    serene: {
      baseVelocity: 0.55,
      tempoMod: 0.85,
      preferredIntervals: [1, 2, -1],
      rhythmicDensity: 0.3,
      staccatoProbability: 0.1,
      preferredScales: ['minorPentatonic', 'naturalMinor']
    },
    intense: {
      baseVelocity: 0.9,
      tempoMod: 1.25,
      preferredIntervals: [7, -5, 4],
      rhythmicDensity: 0.6,
      staccatoProbability: 0.6,
      preferredScales: ['blues', 'harmonicMinor']
    }
  };

  const selectedMood = Object.keys(moodTypes)[hash(13, Object.keys(moodTypes).length)];
  const moodProfile = moodTypes[selectedMood];
  
  return {
    personality: {
      density: (encodedNum % 5) + 1,
      complexity: (encodedNum % 7) + 1,
      direction: [2, 1, -1, -2][encodedNum % 4],
      mood: selectedMood,
      moodProfile: moodProfile,
      energy: hash(17, 100) / 100,
      tension: hash(19, 100) / 100
    },
    intervals: {
      patterns: Array.from({ length: 8 }, (_, i) => {
        const base = (encodedNum >> (i * 3)) & 0x7;
        const modifier = checksum % (i + 2);
        return (base + modifier) % 7;
      }),
      preferred: moodProfile.preferredIntervals,
      probability: 0.7
    },
    development: {
      repeatProbability: 0.1 + (0.8 * (checksum / 97)),
      jumpProbability: 0.1 + (0.8 * ((97 - checksum) / 97)),
      phraseLengthBase: 2 + (encodedNum % 7),
      rhythmicVariety: moodProfile.rhythmicDensity,
      harmonyDensity: (encodedNum % 100) / 100,
      velocity: {
        base: moodProfile.baseVelocity,
        variation: 0.2
      },
      articulation: {
        staccato: moodProfile.staccatoProbability,
        legato: 1 - moodProfile.staccatoProbability
      },
      tempoModifier: moodProfile.tempoMod
    }
  };
}

function createRandomGenerator(seed) {
  let x = parseInt(seed.replace(/\D/g, '')) || 12345;
  return function() {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
}

function safeNote(notes, index) {
  const safeIndex = ((index % notes.length) + notes.length) % notes.length;
  return notes[safeIndex];
}

function generateMelody(seed, scale) {
  if (!scales[scale]) return [];
  if (!seed) return [];
  
  const notes = scales[scale];
  const dna = extractMusicalDNA(seed);
  const safeNote = (index) => {
    const safeIndex = ((index % notes.length) + notes.length) % notes.length;
    return notes[safeIndex] || notes[0];
  };

  const melody = [];
  const seededRandom = createRandomGenerator(seed);
  let currentTime = 0;

  while (currentTime < COMPOSITION_MEASURES) {
    const usePreferred = seededRandom() < dna.intervals.probability;
    const intervalPool = usePreferred ? dna.intervals.preferred : dna.intervals.patterns;
    const intervalIndex = Math.floor(seededRandom() * intervalPool.length);
    const interval = intervalPool[intervalIndex];
    const noteIndex = melody.length === 0 ? 0 : 
      ((melody[melody.length - 1].note.match(/\d+/) || ['4'])[0] - interval);
    
    const duration = seededRandom() < dna.development.rhythmicVariety ? '8n' : '4n';
    const velocityVariation = (seededRandom() - 0.5) * dna.development.velocity.variation;
    
    melody.push({
      note: safeNote(noteIndex),
      duration,
      time: currentTime,
      velocity: Math.min(1, Math.max(0.1, dna.development.velocity.base + velocityVariation))
    });

    if (seededRandom() < dna.development.harmonyDensity) {
      const harmonyOffset = dna.personality.complexity % 3 + 2;
      melody.push({
        note: safeNote(noteIndex + harmonyOffset),
        duration,
        time: currentTime,
        velocity: Math.min(1, Math.max(0.1, (dna.development.velocity.base * 0.8) + velocityVariation))
      });
    }

    currentTime += getDurationValue(duration);
  }

  addCadence(melody, notes, dna, currentTime, seededRandom);
  return melody.filter(event => event.note !== undefined);
}

function addCadence(melody, notes, dna, currentTime, seededRandom) {
  const { personality, development } = dna;
  const direction = personality.direction;
  const scale = $('#scaleSelect').val();
  const numVoices = development.harmonyDensity > 0.7 ? 3 : 2;
  
  let finalProgression;
  switch(scale) {
    case 'major':
    case 'majorPentatonic':
      finalProgression = direction > 0 ? [4, 2, 0] : [4, 3, 0];
      break;
    case 'naturalMinor':
    case 'minorPentatonic':
      finalProgression = direction > 0 ? [5, 3, 0] : [3, 2, 0];
      break;
    case 'harmonicMinor':
      finalProgression = direction > 0 ? [4, 2, 0] : [6, 2, 0];
      break;
    case 'melodicMinor':
      finalProgression = direction > 0 ? [6, 4, 0] : [5, 2, 0];
      break;
    case 'blues':
      finalProgression = direction > 0 ? [4, 1, 0] : [3, 1, 0];
      break;
    default:
      finalProgression = direction > 0 ? [4, 2, 0] : [4, 3, 0];
  }

  const approachNote = (dna.intervals[0] % 7 + 7) % 7;
  const preResolution = [approachNote, ...finalProgression];
  
  preResolution.forEach((noteIdx, i) => {
    const isLast = i === preResolution.length - 1;
    const isApproach = i === 0;
    const duration = isLast ? '2n' : '4n';
    const time = currentTime + (i * 0.5);
    
    melody.push({
      note: safeNote(notes, noteIdx),
      duration,
      time,
      velocity: isLast ? 0.85 : isApproach ? 0.65 : 0.75
    });
    
    if (numVoices > 1 && !isApproach) {
      const harmonyOffset = isLast ? 4 : 2;
      melody.push({
        note: safeNote(notes, noteIdx + harmonyOffset),
        duration,
        time,
        velocity: isLast ? 0.7 : 0.5
      });
      
      if (numVoices > 2 && isLast) {
        melody.push({
          note: safeNote(notes, noteIdx + 7),
          duration,
          time,
          velocity: 0.6
        });
      }
    }
  });
}

function getDurationValue(duration) {
  switch (duration) {
    case '16n': return 0.125;
    case '8n': return 0.25;
    case '4n': return 0.5;
    case '2n': return 1.0;
    default: return 0.125;
  }
}

function convertToABC(melody) {
  const header = `X:1\nM:4/4\nL:1/8\nK:C\n`;
  let abcNotes = '';
  
  melody.forEach(({ note, duration }) => {
    const abcNote = note.replace(/[0-9]/, '');
    let abcDuration = '';
    switch(duration) {
      case '16n': abcDuration = '/2'; break;
      case '8n': abcDuration = ''; break;
      case '4n': abcDuration = '2'; break;
      case '2n': abcDuration = '4'; break;
    }
    abcNotes += abcNote + abcDuration + ' ';
  });
  
  return header + abcNotes;
}

function updateScore(melody) {
  const scoreLabel = document.getElementById('scoreLabel');
  const rorId = document.getElementById('rorId');
  
  scoreLabel.textContent = 'Now Playing:';
  const rorUrl = `https://ror.org/${currentSeed}`;
  rorId.innerHTML = `ROR ID: <a href="${rorUrl}" target="_blank">${rorUrl}</a>`;
  
  scoreLabel.classList.add('visible');
  rorId.classList.add('visible');
  
  const abcNotation = convertToABC(melody);
  ABCJS.renderAbc('score', abcNotation, {
    responsive: 'resize',
    add_classes: true,
    format: {
      titlefont: "VT323 16",
      gchordfont: "VT323 12",
      vocalfont: "VT323 12"
    }
  });
}

async function playMusic() {
  if (!currentSeed) return;

  if (isPaused) {
      Tone.Transport.start();
      isPlaying = true;
      isPaused = false;
      startNoteAnimation();
      updateButtonStates();
      announceStatus('Playing melody');
      return;
  }

  if (isPlaying) return;

  stopMusic();
  
  try {
      currentInstrument = await instrumentManager.loadInstrument(
          document.getElementById('instrumentSelect').value || 'piano'
      );
  } catch (error) {
      console.error('Failed to load instrument:', error);
      return;
  }
  
  isPlaying = true;
  const scale = $('#scaleSelect').val();
  const melody = generateMelody(currentSeed, scale);
  updateScore(melody);
  
  Tone.Transport.cancel();
  scheduledEvents = [];
  
  const rorIdElement = document.getElementById('rorId');

  melody.forEach(({ note, duration, time, velocity }) => {
      const noteLength = getDurationValue(duration);
      const event = Tone.Transport.schedule(time => {
          instrumentManager.triggerAttackRelease(note, noteLength, time, velocity);
          rorIdElement.classList.add('pulse');
          setTimeout(() => {
              rorIdElement.classList.remove('pulse');
              if (noteLength >= 0.5) {
                  rorIdElement.classList.add('sustain');
                  setTimeout(() => {
                      rorIdElement.classList.remove('sustain');
                  }, noteLength * 1000 - 150);
              }
          }, 150);
      }, time);
      
      scheduledEvents.push(event);
  });
  
  const totalDuration = melody[melody.length - 1].time + 
                       getDurationValue(melody[melody.length - 1].duration);
  
  scheduledEvents.push(Tone.Transport.schedule(time => {
      stopNoteAnimation();
      isPlaying = false;
      isPaused = false;
      Tone.Transport.stop();
      updateButtonStates();
  }, totalDuration));

  await Tone.start();
  startNoteAnimation();
  updateButtonStates();
  const rorUrl = `https://ror.org/${currentSeed}`;
  announceStatus('Playing melody for ROR ID: ' + rorUrl);
  Tone.Transport.start();
}

async function rewindMusic() {
  if (!currentSeed || isRewinding) return;

  stopMusic();
  isRewinding = true;
  updateButtonStates();
  
  const scale = $('#scaleSelect').val();
  const melody = generateMelody(currentSeed, scale);
  const originalDuration = melody[melody.length - 1].time + getDurationValue(melody[melody.length - 1].duration);
  const speedFactor = 4;
  
  const reversedMelody = melody.slice().reverse().map((note) => {
    const timeFromEnd = originalDuration - note.time - getDurationValue(note.duration);
    return {
      ...note,
      time: timeFromEnd / speedFactor,
      duration: getDurationValue(note.duration) / speedFactor
    };
  });
  
  await Tone.start();
  startNoteAnimation();
  
  Tone.Transport.cancel();
  scheduledEvents = [];
  const rorIdElement = document.getElementById('rorId');
  
  reversedMelody.forEach(({ note, duration, time, velocity }) => {
    const event = Tone.Transport.schedule((time) => {
      currentInstrument.triggerAttackRelease(note, duration, time, velocity);
      rorIdElement.classList.add('pulse');
      setTimeout(() => {
        rorIdElement.classList.remove('pulse');
      }, Math.min(duration * 1000 * 0.8, 100));
    }, time);
    scheduledEvents.push(event);
  });
  
  scheduledEvents.push(Tone.Transport.schedule((time) => {
    stopNoteAnimation();
    isRewinding = false;
    Tone.Transport.stop();
    updateButtonStates();
  }, originalDuration / speedFactor));
  
  Tone.Transport.start();
  announceStatus('Rewinding melody...');
}

function pauseMusic() {
  if (isPlaying && !isPaused) {
    Tone.Transport.pause();
    isPaused = true;
    isPlaying = false;
    stopNoteAnimation();
    updateButtonStates();
    announceStatus('Melody paused');
  }
}

function stopMusic() {
  scheduledEvents.forEach(id => Tone.Transport.clear(id));
  scheduledEvents = [];
  Tone.Transport.stop();
  Tone.Transport.position = 0;
  stopNoteAnimation();
  isPlaying = false;
  isPaused = false;
  isRewinding = false;
  updateButtonStates();
  announceStatus('Melody stopped');
}

function updateButtonStates() {
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const rewindBtn = document.getElementById('rewindBtn');

  playBtn.disabled = isPlaying && !isPaused;
  pauseBtn.disabled = !isPlaying || isPaused;
  stopBtn.disabled = !isPlaying && !isPaused;
  rewindBtn.disabled = !currentSeed;

  [playBtn, pauseBtn, stopBtn, rewindBtn].forEach(btn => 
    btn.setAttribute('aria-disabled', btn.disabled));
}

function announceStatus(message) {
  const announcementArea = document.getElementById('announcement-area');
  announcementArea.textContent = message;
  announcementArea.classList.remove('fade-out');
  
  let screenReaderAnnouncement = document.getElementById('sr-announcer');
  if (!screenReaderAnnouncement) {
    screenReaderAnnouncement = document.createElement('div');
    screenReaderAnnouncement.id = 'sr-announcer';
    screenReaderAnnouncement.setAttribute('aria-live', 'polite');
    screenReaderAnnouncement.className = 'visually-hidden';
    document.body.appendChild(screenReaderAnnouncement);
  }
  screenReaderAnnouncement.textContent = message;
  
  setTimeout(() => announcementArea.classList.add('fade-out'), 2000);
}

document.addEventListener('DOMContentLoaded', async function() {
  $('#organizationSearch').val('');
  
  var organizations = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: 'https://api.ror.org/organizations?query=%QUERY',
      wildcard: '%QUERY',
      transform: response => response.items
    }
  });

  $('#organizationSearch')
    .typeahead({
      hint: false,
      highlight: true,
      minLength: 1,
      autoselect: false
    },
    {
      name: 'organizations',
      source: organizations,
      limit: 5,
      display: 'name',
      templates: {
        suggestion: data => `<div role="option">${data.name}</div>`
      }
    })
    .on('typeahead:select', function(ev, suggestion) {
      currentSeed = suggestion.id.split('/').pop();
      this.setAttribute('aria-expanded', 'false');
      generateMelody(currentSeed, document.getElementById('scaleSelect').value);
    });

  const instrumentSelect = document.getElementById('instrumentSelect');
  instrumentSelect.addEventListener('change', async function() {
    const selectedInstrument = this.value;
    if (isPlaying || isPaused) stopMusic();

    try {
      function updateLoadingState(isLoading, instrumentName = '') {
        if (isLoading) {
          announceStatus(`Loading ${instrumentName}...`);
        } else {
          announceStatus(`${instrumentName} loaded successfully`);
        }
      }
      updateLoadingState(true, selectedInstrument);
      await instrumentManager.loadInstrument(selectedInstrument);
      currentInstrument = selectedInstrument;
      updateLoadingState(false, selectedInstrument);
      announceStatus(`Changed instrument to ${this.options[this.selectedIndex].text}`);
    } catch (error) {
      console.error('Error loading instrument:', error);
      announceStatus('Error loading instrument. Please try again.');
    }
  });

  document.getElementById('playBtn').addEventListener('click', playMusic);
  document.getElementById('pauseBtn').addEventListener('click', pauseMusic);
  document.getElementById('stopBtn').addEventListener('click', stopMusic);
  document.getElementById('rewindBtn').addEventListener('click', rewindMusic);
  document.getElementById('clearDataBtn').addEventListener('click', function() {
    $('#organizationSearch').typeahead('val', '');
    currentSeed = null;
    stopMusic();
    ['score', 'scoreLabel', 'melodyText', 'rorId'].forEach(id => 
      document.getElementById(id).textContent = '');
    announceStatus('Search cleared');
  });

  document.getElementById('scaleSelect').addEventListener('change', function() {
    if (currentSeed) {
      generateMelody(currentSeed, this.value);
      announceStatus('Scale changed to ' + this.options[this.selectedIndex].text);
    }
  });

  try {
    function updateLoadingState(isLoading, instrumentName = '') {
      if (isLoading) {
        announceStatus(`Loading ${instrumentName}...`);
      } else {
        announceStatus(`${instrumentName} loaded successfully`);
      }
    }
    updateLoadingState(true, 'piano');
    await instrumentManager.loadInstrument('piano');
    updateLoadingState(false, 'piano');
  } catch (error) {
    console.error('Error loading default instrument:', error);
    announceStatus('Error loading initial instrument. Please refresh the page.');
  }
});