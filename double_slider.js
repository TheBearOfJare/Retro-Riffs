function getVals(){
  // Get slider values
  notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  var parent = this.parentNode;
  var slides = parent.getElementsByTagName("input");
    var slide1 = parseFloat( slides[0].value );
    var slide2 = parseFloat( slides[1].value );
  // Neither slider will clip the other, so make sure we determine which is larger
  if( slide1 > slide2 ){ var tmp = slide2; slide2 = slide1; slide1 = tmp; }

  if (slide1 < notes.length ) {
	  slide1 = notes[slide1]+'1'
  }
	else {
		octave = Math.floor(slide1/notes.length)+1
		slide1 = notes[slide1-((octave-1)*notes.length)]
		slide1 = slide1+String(octave)
	}
	if (slide2 < notes.length ) {
	  slide2 = notes[slide2]+'1'
  }
	else {
		octave = Math.floor(slide2/notes.length)+1
		slide2 = notes[slide2-((octave-1)*notes.length)]
		slide2 = slide2+String(octave)
	}
  	var displayElement = parent.getElementsByClassName("rangeValues")[0];
    displayElement.innerHTML = slide1 + " - " + slide2;

	updatetracknotes()
}

function checkSliderVals() {
	var slides = document.getElementsByName("note_range");
	var slide1 = parseFloat( slides[0].value );
	var slide2 = parseFloat( slides[1].value );
	console.log(slide1,slide2)
	// Neither slider will clip the other, so make sure we determine which is larger
	if( slide1 > slide2 ){ var tmp = slide2; slide2 = slide1; slide1 = tmp; }
	return [slide1, slide2]
}
window.onload = function(){
  // Initialize Sliders
  var sliderSections = document.getElementsByClassName("range-slider");
      for( var x = 0; x < sliderSections.length; x++ ){
        var sliders = sliderSections[x].getElementsByTagName("input");
        for( var y = 0; y < sliders.length; y++ ){
          if( sliders[y].type ==="range" ){
            sliders[y].oninput = getVals;
            // Manually trigger event first time to display values
            sliders[y].oninput();
          }
        }
      }
}