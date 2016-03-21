var PAGE_ID = 'p6jhb5cgjvly';
var API_KEY = '4969c432-bbb5-4d75-bcfe-ab712aaef85b';

var incidentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/incidents.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});

var componentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/components.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});

function dateEvent(date){
  		var day = new Date(Date.parse(date)).getDate();
      return day;
  	}

function hourInSec(date){
      var dateMs = new Date(Date.parse(date));
  		var hours = dateMs.getHours() + ":" + dateMs.getMinutes() + ":" + dateMs.getSeconds();
  		return hours.split(":")[0]*360 + hours.split(":")[1]*60 + hours.split(":")[2];
  	}

function gradient(timeFrom, color, timeTo){
  		var hole = 5184000;
  		var percentFrom = timeFrom*100/hole;
  		var percentTo = timeTo ? (timeTo*100/hole) : 100;
  		var value="background: linear-gradient(to right, #8eb01e " + Math.round(percentFrom) + "%, " + color + " " + Math.round(percentFrom) + "%, " + color + " " + Math.round(percentTo)+ "%, #8eb01e " +Math.round(percentTo)+ "%);";
  		return value;
  	}

$(function(){
  
  Promise.all([incidentsCall, componentsCall]).then(function(data){
    console.log(data);
  	var today = new Date().getDate();

  	var incidents = data[0];
  	var components = data[1];
  	var info = {
  		'created': incidents[0]['created_at'],
  		'status': incidents[0]['status'],
  		'resolved': incidents[0]['resolved_at'],
  		'investigating': incidents[0]['incident_updates'][1]['body'],
  		'resolved_title': incidents[0]['incident_updates'][0]['body']
  	}
  	console.log(dateEvent(info['created']));
  	console.log(hourInSec(info['created']));

  	var eventDay = dateEvent(info['created'])

  	// var classTickTack = ['upwork', 'incident'];
  	var classTickTack = [{'cls': 'upwork', 'color': '#8eb01e'},
  											{'cls': 'incident', 'color': '#ce4436'}]
  											
  	var ticks = [];
  	for(var i=1; i<32; i++){
  		if(i==eventDay){
  			ticks.push({'i': i, 'classTick': classTickTack[1]['cls'], 'value': gradient(hourInSec(info['created']), classTickTack[1]['color'])});
  		}else if(i<=today){
  			ticks.push({'i': i, 'classTick': classTickTack[0]['cls']})
  		}else{
  		ticks.push({'i': i, 'classTick': ''})
  		}
  	}

  	var template = $('#incidentsTemplate').html();
  	var output = Mustache.render(template, {incidents: incidents, components: components, ticks: ticks, info: info});
  	 $('body').html(output);
  	 

	});
	
});

