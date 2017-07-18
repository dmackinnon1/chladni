
/**
* Point utilities.
* A random point is generated given a square area (defined by the size attribute).
*/
function randomRange(greaterThan, lessThan){
	var shifted = randomInt(lessThan - greaterThan);
	return lessThan - shifted; 
};


function randomInt(lessThan){
	var selection = Math.floor(Math.random()*(lessThan));
	return selection;
};

class RandomPoint {
	constructor(size) {
 		this.x = randomRange(0,size);
		this.y = randomRange(0,size);
		this.size = size;		
	}
}

/**
* Color utilities
* Used to add color shading to the 'sand'.
*/
var colourBase = 150;

function hslColorChooser(level) {
	var l = (100 - Math.floor(level * 100)) + "%";
	return "hsl("+ colourBase + ", 50%, " + l +")";
};

function colourForSurfaceComponent() {
		var btn = "<span class='lrg-font'>color hue: </span><div class='btn-group btn-group-md' role='group'>";
		btn +=  "<button type='button' id='colourChooserUp' class='btn btn-primary', onclick='increaseHue(event)'>"; 
		btn += "<span class='glyphicon glyphicon-chevron-up lrg-font'></span>"
		btn += "</button>";
		btn +=  "<button type='button' id='colourChooserDown' class='btn btn-primary', onclick='decreaseHue(event)'>"; 
		btn += "<span class='glyphicon glyphicon-chevron-down lrg-font'></span>"
		btn += "</button>";
		btn += "</div>";
		return btn;
};

function increaseHue () {
	if (colourBase < 360) { colourBase += 2}
	else {colourBase = 0}
}
function decreaseHue () {
	if (colourBase > 0) {colourBase -=2}
	else {colourBase = 360}
}

/**
* Wave utilities
* Given a point, Wave instances add to its displacement. 
* A WavePool is a collection of waves. The displacement from the individual waves are added together,
* and we take the overall displacement as the absolute value of this sum.
*/
class Wave {
	constructor(id, frequencyNumerator, frequencyDenominator) {
		this.id = id;
		this.fn = frequencyNumerator;
		this.fd = frequencyDenominator;
		this.closed = true;
	}

	value(p) {
		var frequencyModulator = this.fn/this.fd;
		var f = frequencyModulator*2*Math.PI/p.size;
		if (this.closed) {
			return Math.sin(f*p.x)*Math.sin(f*p.y);
		} else {
			return Math.cos(f*p.x)*Math.cos(f*p.y);
		}
	}

	equation() {
		var m = "" + (this.fn / this.fd);
		if (this.fn%2 == 1) {
			m = "\\frac{"+this.fn+"}{"+this.fd+"}";
		} 
		if (this.fn == 2) {
			m = "";
		}
		if (this.closed) {
			return "sin(" + m + "x)\\times sin(" + m + "y)";
		} else {
			return "cos(" + m + "x)\\times cos(" + m + "y)";
		}
	}	
}

class WavePool {
	constructor() {
		this.waves = [];	
	}

	add(wave) {
		this.waves.push(wave);
	}

	remove(wave) {
		var newWaves = [];
		for (var i = 0; i < this.waves.length; i ++) {
			var selected = this.waves[i];
			if (selected.id != wave.id) {
				newWaves.push(selected);
			} else {
				console.log("removing wave " + wave.id);
			}
		}
		
		this.waves = newWaves;
	}

	get(waveId) {
		for (var i = 0; i < this.waves.length; i ++) {
			var selected = this.waves[i];
			if (selected.id == waveId) {
				return selected;
			}
		}
		console.log("error - not found: " + waveId);
	}

	value(p) {
		var value = 0;
		for (var i = 0; i < this.waves.length; i ++) {
			value += this.waves[i].value(p);
		}
		return Math.abs(value);
	}

	equation() {
		if (this.waves.length == 0) return;
		var eq = "\\begin{split} d = | &";
		eq += this.waves[0].equation();
		for (var i = 1; i < this.waves.length; i ++) {
			eq += "\\\\ &+ ";
			eq += this.waves[i].equation();
		}
		eq += " | \\end{split}";
		return eq;
	}
}

/**
* WaveController is used to generate components for adding, removing, and 
* modifying waves, and for displaying information about them.
*
*/
class WaveController {

	constructor(wavepool) {
		this.waveCount = 0;
		this.pool = wavepool;
		this.callback = null;
	}

	invokeCallback(){
		if (this.callback != null) {
			return this.callback();
		}
	}

	getWave(waveId) {
		return this.pool.get(waveId);
	}

	newWave() {
		var waveId = "wave"+ (this.waveCount ++);
		var wave = new Wave(waveId, 1,2);
		wave.closed = false;
		this.pool.add(wave);
	}

	componentForWave(index, wave) {

		var component = "<div>";
		component = "<span class='lrg-font waveComponent'> wave " + index +":</span><span> " + this.frequencyButtonForWave(wave) + "</span>";
		component += "<span>" + this.formButtonForWave(wave) + "</span>";
		component += "<span>" + this.closeButtonForWave(wave) + "</span>";
		//component += this.equationForWave(wave);
		component += "</div><br>";
		return component;		
	}

	frequencyButtonForWave(wave) {
		var btn = "<div class='btn-group btn-group-md' role='group'>";
		btn +=  "<button type='button' id='fmu_"+ wave.id + "' class='btn btn-secondary', onclick='increaseWaveNumerator(event)'>"; 
		btn += "<span class='glyphicon glyphicon-chevron-up lrg-font'></span>"
		btn += "</button>";
		btn +=  "<button type='button' id='fmd_"+ wave.id + "' class='btn btn-secondary', onclick='decreaseWaveNumerator(event)'>"; 
		btn += "<span class='glyphicon glyphicon-chevron-down lrg-font'></span>"
		btn += "</button>";
		btn += "</div>";
		return btn;
	}

	closeButtonForWave(wave) {
		var btn = "<div class='btn-group btn-group-md' role='group'>";
		btn +=  "<button type='button' id='x_"+ wave.id + "' class='btn btn-danger', onclick='removeWave(event)'>";
		btn += "<span class='glyphicon glyphicon-remove-sign lrg-font'></span>"
		btn += "</button></div>";
		return btn;	
	}

	formButtonForWave(wave) {
		var txt = "glyphicon glyphicon-unchecked";
		if (wave.closed) {
			txt = "glyphicon glyphicon-stop";
		}
		var btn = "<div class='btn-group btn-group-md' role='group'>";
		btn +=  "<button type='button' id='f_"+ wave.id + "' class='btn btn-primary', onclick='formWave(event)'>";
		btn += "<span class='glypicon " + txt + " lrg-font'></span>"
		btn += "</button></div>";
		return btn;		
	}

	equationForWave(wave) {
		var txt = wave.equation();
		return "<span class='equationBox'>\\(" + txt +"\\)</span>";
	}

	equationComponent() {
		var txt = this.pool.equation();
		return "<span class='equationBox'>\\[" + txt +"\\]</span>";
	}

	allComponents() {
		var comps = "";
		for (var i = 0; i < this.pool.waves.length; i ++) {
			comps += this.componentForWave(i, this.pool.waves[i]);
		}
		return comps;
	}
}

/**
* A WavePool and WaveController are created here for use on the page.
*/
var waves = new WavePool();
var waveController = new WaveController(waves);

/**
* Callbacks for the wave controller components.
*/
function increaseWaveNumerator(event) {
	var buttonId = event.target.id;
	if (buttonId == null || buttonId.length == 0) {
		buttonId = event.target.parentElement.id;
	}
	var waveId = buttonId.slice(4, buttonId.length);
	var wave = waveController.getWave(waveId);
	wave.fn += 1;
	waveController.invokeCallback();
}

function decreaseWaveNumerator(event) {
	var buttonId = event.target.id;
	if (buttonId == null || buttonId.length == 0) {
		buttonId = event.target.parentElement.id;
	}
	var waveId = buttonId.slice(4, buttonId.length);
	var wave = waveController.getWave(waveId);
	
	if (wave.fn >1 ) wave.fn -= 1;
	waveController.invokeCallback();
}
function removeWave(event) {
	var buttonId = event.target.id;
	if (buttonId == null || buttonId.length == 0) {
		buttonId = event.target.parentElement.id;
	}
	var waveId = buttonId.slice(2, buttonId.length);
	console.log("remove: " + waveId);
	var wave = waveController.getWave(waveId);	
	waveController.pool.remove(wave);
	waveController.invokeCallback();
}

function formWave(event) {
	var buttonId = event.target.id;
	if (buttonId == null || buttonId.length == 0) {
		buttonId = event.target.parentElement.id;
	}
	var waveId = buttonId.slice(2, buttonId.length);
	var wave = waveController.getWave(waveId);
	wave.closed = !wave.closed;
	waveController.invokeCallback();
}
