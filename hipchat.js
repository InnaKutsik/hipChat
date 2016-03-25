var PAGE_ID = 'p6jhb5cgjvly';
var API_KEY = '4969c432-bbb5-4d75-bcfe-ab712aaef85b';

var incidentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/incidents.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});

/*var componentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/components.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});*/


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
        'planned_work_created': incidents[i]['scheduled_for'],        
        'planned_work_resolved': incidents[i]['scheduled_until'],
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
    var dataMarch = getPerMonth(new Date(), infoIncident);
    
  	var classTickTack = [{'cls': 'upwork', 'color': '#8eb01e'},
  											{'cls': 'incident', 'color': '#ce4436'}]            
    
  	//creation tick-tacks								
  	var ticks = [];
  	for(var i=1; i<32; i++){
  		if(i<=today){
  			ticks.push({'i': i, 'classTick': classTickTack[0]['cls'], 'numberOfTick': 'tick'+i})
  		}else{
  		ticks.push({'i': i, 'classTick': '', 'numberOfTick': 'tick'+i})
  		}
  	}

  	var template = $('#incidentsTemplate').html();

  	var output = Mustache.render(template, {incidents: incidents, /*components: components,*/ ticks: ticks, infoIncident: infoIncident/*, infoComponent: infoComponent*/});

  	 $('body').html(output);
     
  	 function addIncident(data){
        for (var t=0; t<data.length; t++){
          var eventDay = dateEvent(data[t]['created']);
          var createdDate = hourInSec(data[t]['created']);
          var resolvedDate = hourInSec(data[t]['resolved']);
          var countDay = countOfDay(data[t]['created'], data[t]['resolved']);
          if (countDay==0){
            $(".tick"+eventDay).parent().append('<li style="'+gradient(createdDate, classTickTack[1]['color'], resolvedDate)+' z-index: 20;" class="tick-tacks"></li>');
          } else {
            for(var j=0; j<=countDay; j++){
              if(j==0){
                $(".tick"+eventDay).parent().append('<li style="'+gradient(createdDate, classTickTack[1]['color'])+' z-index: 20;" class="tick-tacks"></li>');
              } else if(j<(countDay)){
                  $(".tick"+(eventDay+j)).parent().append('<li style="'+gradient(0, classTickTack[1]['color'], 0)+' z-index: 20;" class="tick-tacks"></li>');
              }else{
                  $(".tick"+(eventDay+j)).parent().append('<li style="'+gradient(0, classTickTack[1]['color'], resolvedDate)+' z-index: 20;" class="tick-tacks"></li>');
                }
            }
          }
        }
      }
      addIncident(dataMarch);
	});
	
});

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

function dateEvent(date){
      var day = new Date(Date.parse(date)).getDate();
      return day;
    }

function hourInSec(date){
      var dateMs = new Date(Date.parse(date));
      return (dateMs.getHours()*3600 + dateMs.getMinutes() *60 + dateMs.getSeconds());
    }

function gradient(timeFrom, color, timeTo){
      var hole = 86400;
      var percentFrom = timeFrom*100/hole;
      var percentTo = timeTo ? (timeTo*100/hole) : 100;
      var value="background: linear-gradient(to right, transparent " + Math.round(percentFrom) + "%, " + color + " " + Math.round(percentFrom) + "%, " + color + " " + Math.round(percentTo)+ "%, transparent " +Math.round(percentTo)+ "%);";
      return value;
    }

function countOfDay(start, end){
  var dif = (new Date(Date.parse(end))).getDate() - new Date(Date.parse(start)).getDate();
  return dif;
}

