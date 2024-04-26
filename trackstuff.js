var BPM = document.getElementById('time_signature').value

if (BPM === '3/4') {BPM = 3}
else {BPM = 4}

var samplerate = 44100 //samples per second of audio 
var tempo = document.getElementById('tempo').value //literally just beats per minute
var spn = (60/tempo)/16 //the length of a 16th note in seconds

var sequences = {}
var play_loop_id = ''

var textFile = null,
  makeTextFile = function (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
  };

function createtrack() {
	let grid = ''
	let note = 0
	while (note <= 84) {
		let beat = 0
		let noteset = ''
		while (beat <= (16*8) -1 ) {
			noteset=`${noteset}<label class="container" id = "${String(note)+';'+String(beat)}"><input type="checkbox" class="boxnote"><span class="notebox"></span></label>`
			beat++
		}
		if (note === 42){
			grid = `<span id="row${note}" class="note_row" > <span style="position: absolute; left: 10px; z-index: 10;"> ${getPitch(pitch=note)} </span> <span style="position: absolute; left: 40px;">${noteset}</span></span><br>\n${grid}`
		}
		else {
			grid = `<span id="row${note}" class="note_row" > <span style="position: absolute; left: 10px; z-index: 10;"> ${getPitch(pitch=note)} </span> <span style="position: absolute; left: 40px;">${noteset}</span></span><br>${grid}`
		}
		
		note++
	}
	
	let link = makeTextFile(grid)
	window.location.href = link
}

function createbeatlables() {
	let beat = 1
	let lableset = '<span id="4/4 beat lables" class = "beat lables">'
	while (beat <= 4*8) {
		//the inline if statement ensures that beat 4 is actually labled 4 instaid of 0
		lableset += `<span id="beat${beat}">${(beat%4 !== 0) ? beat%4 : 4}</span>`
		beat++
	}
	lableset += '</span>\n<span id="3/4 beat lables" class = "beat lables">'
	beat = 1
	while (beat <= 3*8) {
		//the inline if statement ensures that beat 3 is actually labled 3 instaid of 0
		lableset += `<span id="beat${beat}">${(beat%3 !== 0) ? beat%3 : 3}</span>`
		beat++
	}
	lableset += '</span>'
	
	let link = makeTextFile(lableset)
	window.location.href = link
}


//createbeatlables()

function update_time_signature(signature) {
	console.log('updating time signature to: '+signature)
	if (signature === "4/4") {
		document.getElementById('four_beat_lables').style.display = 'block'
		document.getElementById('three_beat_lables').style.display = 'none'
		
		BPM = 4
	}
	else {
		document.getElementById('four_beat_lables').style.display = 'none'
		document.getElementById('three_beat_lables').style.display = 'block'

		BPM = 3
	}
}


function updatetrackmesures() {
	console.log('running mesure update')
	let len = document.getElementById('mesure_slider').value
	let beats = document.querySelectorAll('.container');
	//console.log(len,BPM)
	//hidden = []
	//shown = []
	beats.forEach((count) => {
		let beat = count.id.split(';')[1]
		if (beat > len*4*BPM) {
			count.style.display = 'none';
			//hidden.push(beat)
		}
		else {
			count.style.display = 'inline-block';
			//shown.push(String((len*16*BPM) - beat)+" "+String(beat))
		}
	    
	});

	//hide beat lables

	if (BPM === 4) {
		let beats = document.getElementById('four_beat_lables').children;
	}
	else {
		let beats = document.getElementById('three_beat_lables').children;
	}
	
	beats.forEach((count) => {
		let beat = parseInt(count.id.split('beat')[1])
		if (beat > len*4*BPM) {
			count.style.display = 'none'
		}
		else {
			count.style.display = 'inline-block';
		}
	})
	
	//console.log(hidden,shown)
	
	
	
}

function updatetracknotes() {
	console.log('running note update')
	let notes = document.querySelectorAll('.note_row');
	let range = checkSliderVals()
	let grid = document.getElementById('sequence_grid')
	//console.log(notes,range)
	notes.forEach((note) => {
		let pitch = parseInt(note.id.split('row')[1])
		//console.log(pitch)
		if (pitch < range[0] || pitch > range[1]) {
			note.style.display = 'none';
			//console.log("removed pitch: "+pitch)
		}
		else {
			//console.log(pitch, range[0], range[1])
			note.style.display = 'inline-block';
		}
	    
	});
	grid.style['margin-top'] = 18.4*((range[1])-83)
	//console.log(grid.style['margin-top'],range)
	//document.getElementById('sequence_render_button').style['margin-top'] = String(18.9*(range[0]))+'px'
	
	
}


function setup_sequence(sequence) {
	if (sequence === "New_Sequence") {
		updatetracknotes()
		updatetrackmesures()
	}
	if (sequence !== "none") {
		document.getElementById('sequence_editor').style.display = "block"
	}
}

//modifies the behaviour of the sequencer checkboxes to allow for 3 states: unselected, selected, and tied.
function add_click_event() {
	console.log('updating click events')
	boxnotes = document.querySelectorAll('.boxnote')

		
	for (let i = 0; i < boxnotes.length; i++) {
		boxnotes[i].addEventListener("click", function() {

			//reset all "was tied" squares to normal blank squares if the selected square isn't one. This avoids unexpected behaviour when editing a previously shortened tied note.
			if (boxnotes[i].name !== 'was tied') {
				wassers = document.querySelectorAll('[name="was tied"]')
				wassers.forEach((element) => {
					element.name = 'normal'
				})
			}
			//convert tied notes to blank spaces, but their name is "was tied" so we know to turn them into selected squares next time they're clicked
			if (boxnotes[i].name === "tied") {
				boxnotes[i].name = 'was tied'
				boxnotes[i].checked = false

				//check if the box to the right is tied, if so, change it to a normal selected square
				let parent = boxnotes[i].parentElement.id.split(';')
				let note = parseInt(parent[0])
				let beat = parseInt(parent[1])
				
				if (beat < (4*16*8) -1) {
					//check if the next box is tied
					
					let next = document.getElementById(`${note};${beat+1}`).children[0]
					if (next.name === 'tied') {
						next.name = 'normal'
						next.checked = true
					}
					
				}
				//console.log(boxnotes[i].name, boxnotes[i].style)
			}
			
			//convert already active notes into tied notes (checked will be false because that value is immediately updated before this runs), but don't make unselected notes turn into tied notes
			else if (boxnotes[i].checked === false) {
				let parent = boxnotes[i].parentElement.id.split(';')
				let note = parseInt(parent[0])
				let beat = parseInt(parent[1])
				
				if (beat !== 0) {
					//check if the previous box was checked or is also tied in order for there to legally be a tied note here
					
					let previous = document.getElementById(`${note};${beat-1}`).children[0]
					//for making tied notes
					if (previous.checked === true || previous.name === 'tied') {
						boxnotes[i].name = 'tied' 
						//console.log(boxnotes[i], boxnotes[i].style)
					}
					//when turning off a normal selected block (just to check if the next note is tied to it)
					else{
					
						//check if the box to the right is tied, if so, change it to a normal selected square
						let parent = boxnotes[i].parentElement.id.split(';')
						let note = parseInt(parent[0])
						let beat = parseInt(parent[1])
						
						if (beat < (4*16*8) -1) {
							//check if the next box is tied
							
							let next = document.getElementById(`${note};${beat+1}`).children[0]
							if (next.name === 'tied') {
								next.name = 'normal'
								next.checked = true
							}
							
						}
						
					}
	 
					
				}
				
	
				
				
			}

			//make consecutive notes default to tied rather than a new note
			else if (boxnotes[i].checked === true) {
				let parent = boxnotes[i].parentElement.id.split(';')
				let note = parseInt(parent[0])
				let beat = parseInt(parent[1])
				
				if (beat !== 0 && boxnotes[i].name !== 'was tied') {
					let previous = document.getElementById(`${note};${beat-1}`).children[0]
	
					if (previous.checked === true || previous.name === 'tied') {
						boxnotes[i].name = 'tied'
						boxnotes[i].checked = false
						//console.log(boxnotes[i], boxnotes[i].style)
					}
				}
				//for "was tied" blocks, we turn them into selected squares regardless of whether or not they could be tied
				else {
					boxnotes[i].name = 'normal'
					boxnotes[i].chekced = true
				}
			}
			
	
			
		});
	}

}
/*
work in progress: 
needs to support different instruments
*/

/*
this makes the blocks of note sequences that can be added to the timeline editor. Sequence blocks are a dictionary containing the name, length (in mesures), note range, and note data (as an array of beat datapoints).
it also makes the dataset used when preveiwing a track (render = false)
Track datasets look like [["46:1","48:1","52:2"],["42:1","44:1"]] with notes and their duration (in 16th notes) packaged together.
*/
function render_sequence_block(render) {
	let sequence_name = document.getElementById('sequence_name')
	let len = document.getElementById('mesure_slider').value
	let range = checkSliderVals()
	let beat = 0

	let tmp = {'name': sequence_name, 'len': len, 'range': range, 'data': []}
	//iterate through each beat and compile all the notes on that beat
	while (beat < BPM*len*16) {
		tmp['data'][beat] = []
		//find selected notes (if any) that beat
		for (let index = range[0]; index <= range[1]; index++) {

			//the child input element of the lable for our given beat and note
			let test = document.getElementById(`${index};${beat}`).children[0]
			//check if a checkbox is checked for a given beat and note. Accounts for the input element being the child of the label element. Ignores tied notes (they got counted onto the original note)
			if (test.checked === true && test.name !== "tied") {

				let count = 1
				let value = 1
				//console.log(BPM*len*16, BPM, len)
				//check for consecutive tied notes
				while (beat+count < BPM*len*16) {
					next = document.getElementById(`${index};${beat+count}`).children[0]
					//console.log(next, next.name)
					if (next.name === 'tied') {
						value++
						count++
						//console.log(value)
					}
					else {
						break
					}
				}
				tmp['data'][beat].push(`${index}:${value}`)
				
			}
		}

		beat++
	}

	sequences[sequence_name] = tmp

	if (render === false) {
		console.log('notation: '+tmp['data'])
		let wavetable = getWavetable(notation=tmp['data'], duration=len*BPM*4*spn, waveform=document.getElementById('waveform').value)
		return wavetable
	}
}

//start and stop the playback of the current track or the whole song
function play_pause_track() {

	let trackpp = document.getElementById('track_play_pause')
	//note the name of the button is always opposite of what's happening
	
	if (trackpp.name === 'play') {
		
		trackpp.name = 'pause'
		trackpp.innerHTML = 'Pause'

		let data = render_sequence_block(render=false)

		console.log('sequence block: ' + data)
	
		//make the audio stuff
		const audioCtx = new AudioContext();
		//create an audio buffer with one channel and a duration equal to the number of samples
		const track_buffer = audioCtx.createBuffer(1, data.length, samplerate);
	
		//replace the chanel data with our wavetable
		const newBuffer = track_buffer.getChannelData(0);
		
		for (let index = 0; index < data.length; index++) {
			newBuffer[index] = data[index]
			//newBuffer[index] = Math.sin(index)
		}
			
	
		
		//delay is in milliseconds, so we need to convert the length, which is in seconds
		play_loop_id = setInterval(preveiw_track, ((data.length)/samplerate) * 1000, track_buffer)
	}
	else {
		trackpp.name = 'play'
		trackpp.innerHTML = 'Play'
	}
	
}


function preveiw_track(track_buffer) {
	//make the audio stuff
	const audioCtx = new AudioContext();
	// Get an AudioBufferSourceNode.
	// This is the AudioNode to use when we want to play an AudioBuffer
	const source = audioCtx.createBufferSource();
	
	// set the buffer in the AudioBufferSourceNode
	source.buffer = track_buffer;
	
	// connect the AudioBufferSourceNode to the
	// destination so we can hear the sound
	source.connect(audioCtx.destination);

	if (document.getElementById('track_play_pause').name === 'pause') {

		source.start();	
	
	}
	else {
		clearInterval(play_loop_id)
	}
	
	
}



