function randomRange(greaterThan, lessThan){
	var shifted = randomInt(lessThan - greaterThan);
	return lessThan - shifted; 
};


function randomInt(lessThan){
	var selection = Math.floor(Math.random()*(lessThan));
	return selection;
};


function hslColorChooser(level) {
	var l = (100 - Math.floor(level * 100)) + "%";
	return "hsl(150, 50%, " + l +")";
};

class RandomPoint {
	constructor(size) {
 		this.x = randomRange(0,size);
		this.y = randomRange(0,size);
		this.size = size;		
	}
}

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
}

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

	componentForWave(wave) {

		var component = "<div>";
		component = "<span class='lrg-font'> wave:</span><span> " + this.buttonForWave(wave) + "</span>";
		component += "<span>" + this.formButtonForWave(wave) + "</span>";
		component += "<span>" + this.closeButtonForWave(wave) + "</span>";
		component += "</div><br>";
		return component;		
	}

	buttonForWave(wave) {
		var btn = "<div class='btn-group btn-group-md' role='group'>";
		btn +=  "<button type='button' id='fm_"+ wave.id + "' class='btn btn-primary', onclick='updateWaveNumerator(event)'>"; 
		btn += "<span class='lrg-font'>" + wave.fn + "</span></button>";  		
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
		var txt = "glyphicon glyphicon-plus-sign";
		if (wave.closed) {
			txt = "glyphicon glyphicon-minus-sign";
		}
		var btn = "<div class='btn-group btn-group-md' role='group'>";
		btn +=  "<button type='button' id='f_"+ wave.id + "' class='btn btn-primary', onclick='formWave(event)'>";
		btn += "<span class='glypicon " + txt + " lrg-font'></span>"
		btn += "</button></div>";
		return btn;		
	}

	allComponents() {
		var comps = "";
		for (var i = 0; i < this.pool.waves.length; i ++) {
			comps += this.componentForWave(this.pool.waves[i]);
		}
		return comps;
	}
}

var waves = new WavePool();
var waveController = new WaveController(waves);

function updateWaveNumerator(event) {
	var buttonId = event.target.id;
	if (buttonId == null || buttonId.length == 0) {
		buttonId = event.target.parentElement.id;
	}
	var waveId = buttonId.slice(3, buttonId.length);
	var wave = waveController.getWave(waveId);
	wave.fn += 1;
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
	console.log(event);
	var buttonId = event.target.id;
	if (buttonId == null || buttonId.length == 0) {
		buttonId = event.target.parentElement.id;
	}
	console.log(buttonId);
	var waveId = buttonId.slice(2, buttonId.length);
	console.log("form: " + waveId);
	var wave = waveController.getWave(waveId);
	wave.closed = !wave.closed;
	waveController.invokeCallback();
}
