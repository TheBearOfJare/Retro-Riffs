var samplerate = 44100 //samples per second of audio 
var tempo = document.getElementById('tempo').value //literally just BPM
var spn = (tempo/60)/16 //the length of a 16th note in seconds

function getPitch(pitch) {
	let notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

	if (pitch < notes.length ) {
		pitch = notes[pitch]+'1'
	}
	else {
		octave = Math.floor(pitch/notes.length)+1
		pitch = notes[pitch-((octave-1)*notes.length)]
		pitch = pitch+String(octave)
	}

	//console.log(pitch)
	return pitch
}

function getHertz(note) {

	//this used note notation but was refactored to just numbers because that makes more sense
	/*
	let octave = parseInt(note[note.length -1])-4 //we're measuring from A4 so we'll treat octave 4 as the 0 of our scale
	let Ascale = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#']
	let location = Ascale.indexOf(note.slice(0,note.length -1)) //accounts for notes with a #
	let n = (octave*12) + location
	*/

	//n is the number of half steps above (or below) A4 which has a numerical count of 45 on my scale up from C1
	let n = note-45
	
	let hertz = 440 * ((2**(1/12))**n)
	return hertz
}

function triangleWave(x) {
	return (x**(1.3/2))
}

function squareWave(x) {
	return (0-((0.4**0.5)*(0.5*(x**1.3)))+1)
}

function sineWave(x) {
	return Math.sin(x*Math.PI)
}

function sawWave(x) {
	return (2*x) - 1
}

//add support for different waves
function getWavetable(notation, duration, waveform) {

	tempo = document.getElementById('tempo').value 
	spn = (tempo/60)/16
	
	//duration should be the total length in seconds of the track
	let wavetable = new Array(duration*samplerate).fill(0);
	
	for (let i = 0; i < notation.length; i++) {
		chord = notation[i]

		chord.forEach((element) => {
			let tmp = element.split(':')
			let polarity = 1
			let pitch = getHertz(tmp[0])
			let value = parseInt(tmp[1])

			//iterate through the duration of the note, updating data points based off of the designated wave type
			let count = 0
			while (count <= Math.floor(value*spn*samplerate)) {
				//there are "pitch" total repetitions of the shape each second. Therefore the wavetable value for a given sample is its percentage through 1/pitch seconds because the shape is 100% complete when there are 1/pitch seconds worth of samples
				if (waveform === 'triangle') {
					y = triangleWave(( ( (count % samplerate) / samplerate) % (1/pitch) ) / (1/pitch) )*polarity
				}
				else if (waveform === 'square') {
					y = squareWave(( ( (count % samplerate) / samplerate) % (1/pitch) ) / (1/pitch) )*polarity
				}
				else if (waveform === 'sin') {
					y = sineWave(( ( (count % samplerate) / samplerate) % (1/pitch) ) / (1/pitch) )*polarity
				}
				else if (waveform === 'saw') {
					//no polarity for saw waves
					y = sawWave(( ( (count % samplerate) / samplerate) % (1/pitch) ) / (1/pitch) )*polarity
				}

				if (isNaN(y)) {
					console.log('NaN found: ', count, samplerate, pitch, count%samplerate, (1/pitch) * polarity, 'x: '+ ( ( (count % samplerate) / samplerate) % (1/pitch) ) / ( 1/pitch), "y:"+y )
					y = 0
				}
				wavetable[count+Math.floor(i*spn*samplerate)] += y

				
				//invert the waveshape
				if (count%Math.floor((1/pitch)*samplerate) === 0) {
					polarity = (-1)*polarity
				} 
				count++
			}

			
			
		})
		
	}

	//prevent overspill by normalizing data into the range of -1, 1

	console.log('wavetable: '+wavetable)
	let top = Math.max(...wavetable)
	let bottom = Math.min(...wavetable)
	if (bottom * (0-1) > top) {top = bottom * (0-1)}
	
	console.log('max: '+top)
	for (let i = 0; i < wavetable.length; i++) {
		wavetable[i] = wavetable[i]/ ( top * 1.000000001 )
	}

	console.log('wavetable: '+ wavetable)
	return wavetable
}


//add support for reading waveforms from track data
function sample(data, duration) {
	//"data" is an array of track datasets. Track datasets look like [["46:1","48:1","52:2"],["42:1","44:1"]] with notes and their duration (in 16th notes) packaged together.
	const audioCtx = new AudioContext();
	//create an audio buffer with as many channels as there are tracks in the dataset and a length adjusted for the sample rate.
	const buffer = audioCtx.createBuffer(data.length, samplerate*duration, samplerate);

	//iterate through channels in the audio data
	for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
		
	  	//iterate through channel data and update it
	  	const newBuffer = buffer.getChannelData(channel);
	  	newBuffer = getWavetable(notation = data[channel], duration)
	}

	// Get an AudioBufferSourceNode.
	// This is the AudioNode to use when we want to play an AudioBuffer
	const source = audioCtx.createBufferSource();
	
	// set the buffer in the AudioBufferSourceNode
	source.buffer = buffer;
	
	// connect the AudioBufferSourceNode to the
	// destination so we can hear the sound
	source.connect(audioCtx.destination);
	
	// start the source playing
	source.start();
		
}

//sample([1],5)



		

