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
  		return dateMs.getHours()*360 + dateMs.getMinutes() *60 + dateMs.getSeconds();
  	}

function gradient(timeFrom, color, timeTo){
  		var hole = 86400;
  		var percentFrom = timeFrom*100/hole;
  		var percentTo = timeTo ? (timeTo*100/hole) : 100;
  		var value="background: linear-gradient(to right, #8eb01e " + Math.round(percentFrom) + "%, " + color + " " + Math.round(percentFrom) + "%, " + color + " " + Math.round(percentTo)+ "%, #8eb01e " +Math.round(percentTo)+ "%);";
  		return value;
  	}

function countOfDay(sec){
  var holeDay = 86400;
  if(sec<=holeDay){
    return 1;
  }
  return sec/holeday;
}
function countOfDay(start, end){
  var dif = new Date(Date.parse(end)).getDate() - new Date(Date.parse(start)).getDate()
  return dif+1;
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
    var coundDay = countOfDay(info['created'], info['resolved']);

  	var eventDay = dateEvent(info['created'])

  	// var classTickTack = ['upwork', 'incident'];
  	var classTickTack = [{'cls': 'upwork', 'color': '#8eb01e'},
  											{'cls': 'incident', 'color': '#ce4436'}]
  											
  	var ticks = [];
  	for(var i=1; i<32; i++){
  		if(i<=today){
  			ticks.push({'i': i, 'classTick': classTickTack[0]['cls']})
  		}else{
  		ticks.push({'i': i, 'classTick': ''})
  		}
  	}
    for(var j=0; j<coundDay; j++){
      if(j==0){
      ticks[eventDay+j] ={'i': i, 'classTick': classTickTack[1]['cls'], 'value': gradient(hourInSec(info['created']), classTickTack[1]['color'])}
      } else if(j<(coundDay-1)){
        ticks[eventDay+j] ={'i': i, 'classTick': classTickTack[1]['cls'], 'value': gradient(0, classTickTack[1]['color'], 0)}
      }else{
        ticks[eventDay+j] ={'i': i, 'classTick': classTickTack[1]['cls'], 'value': gradient(0, classTickTack[1]['color'], hourInSec(info['resolved']))}
      }
    }

  	var template = $('#incidentsTemplate').html();
  	var output = Mustache.render(template, {incidents: incidents, components: components, ticks: ticks, info: info});
  	 $('body').html(output);
  	 

	});
	
});

