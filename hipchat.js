var PAGE_ID = 'p6jhb5cgjvly';
var API_KEY = '4969c432-bbb5-4d75-bcfe-ab712aaef85b';

var incidentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/incidents.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});

/*var componentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/components.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});*/
function clickMe(i){
      alert(i);
    }
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
  
  Promise.all([incidentsCall/*, componentsCall*/]).then(function(data){
  	var today = new Date().getDate();

    var getIncident = [];

  	var incidents = data[0];
/*  	var components = data[1];*/

    for(var i=0; i<incidents.length; i++){
      getIncident[i] = {
        'id': incidents[i]['id'],
        'name': incidents[i]['name'],
        'created': incidents[i]['created_at'],
        'status': incidents[i]['status'],
        'planned_work': incidents[i]['scheduled_for'],
        'updated': [],
        'resolved': incidents[i]['resolved_at']
      }
      for(var j=0, x=incidents[i]['incident_updates'].length-1; j<incidents[i]['incident_updates'].length, x>=0; j++, x--){
        getIncident[i]['updated'][x] = {
          'id_update': incidents[i]['incident_updates'][j]['id'],
          'body': incidents[i]['incident_updates'][j]['body'],
          'status': incidents[i]['incident_updates'][j]['status'],
          'created': incidents[i]['incident_updates'][j]['created_at'],
          'updated': incidents[i]['incident_updates'][j]['updated_at']
        }
      }
      
    }
    var infoIncident = getIncident.reverse();
    console.log(infoIncident);

    //function to get json by month
    function getPerMonth(date, arr){
      var result = [];
      for(var i=0; i<arr.length; i++){
        var created = new Date(Date.parse(arr[i]['created']));
        if(created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear()){
          result.push(arr[i]);
        }
      }
      return result;
    }
    var dataMarch = getPerMonth(new Date(), infoIncident);

/*  	var eventDay = dateEvent(info['created'])*/


  	// var eventDay = dateEvent(info['created'])

  	var classTickTack = [{'cls': 'upwork', 'color': '#8eb01e'},
  											{'cls': 'incident', 'color': '#ce4436'}]
  	//creation tick-tacks								
  	var ticks = [];
  	for(var i=1; i<32; i++){
  		if(i<=today){
  			ticks.push({'i': i, 'classTick': classTickTack[0]['cls']})
  		}else{
  		ticks.push({'i': i, 'classTick': ''})
  		}
  	}
   //  for(var j=0; j<coundDay; j++){
   //    if(j==0){
   //    ticks[eventDay+j] ={'i': i, 'classTick': classTickTack[1]['cls'], 'value': gradient(hourInSec(info['created']), classTickTack[1]['color'])}
   //    } else if(j<(coundDay-1)){
   //      ticks[eventDay+j] ={'i': i, 'classTick': classTickTack[1]['cls'], 'value': gradient(0, classTickTack[1]['color'], 0)}
   //    }else{
   //      ticks[eventDay+j] ={'i': i, 'classTick': classTickTack[1]['cls'], 'value': gradient(0, classTickTack[1]['color'], hourInSec(info['resolved']))}
   //    }
   //  }

    
  	var template = $('#incidentsTemplate').html();

  	var output = Mustache.render(template, {incidents: incidents, /*components: components,*/ ticks: ticks, infoIncident: infoIncident/*, infoComponent: infoComponent*/});

  	 $('body').html(output);
  	 

	});
	
});

