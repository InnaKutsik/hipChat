var PAGE_ID = 'k2pdwh3sqf6b';
var API_KEY = 'cb8e499e-d958-42d8-a6aa-8d8dffc74c62';

var incidentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/incidents.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});

/*var componentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/components.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});*/

var classTickTack = [{'cls': 'upwork', 'color': '#8eb01e'},
                        {'cls': 'incident', 'color': '#ce4436'},
                        {'cls': 'plannedWork', color: '#3872b0'},
                        {'cls': 'noDate', color: '#e3e3e3'}] 
var today = new Date();

$(function(){
  
  Promise.all([incidentsCall/*, componentsCall*/]).then(function(data){

    var dateEnd = new Date().getHours()*3600 + new Date().getMinutes() *60 + new Date().getSeconds()

    var getIncident = [];

  	var incidents = data[0];
  	var components = data[1];

    console.log(incidents);

    for(var i=0; i<incidents.length; i++){
      getIncident[i] = {
        'id': incidents[i]['id'],
        'name': incidents[i]['name'],
        'created': incidents[i]['created_at'],
        'status': incidents[i]['status'],
        'planned_work': incidents[i]['scheduled_for'],
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

    var getYear = function(){
      var year = 0
      for(var i=0; i<infoIncident.length; i++){
        if(infoIncident[i]['created'] || infoIncident[i]['planned_work_created']){
          var creat = (new Date(Date.parse(infoIncident[i]['created']))).getFullYear() || (new Date(Date.parse(infoIncident[i]['planned_work_created']))).getFullYear()
          if(year<creat) year = creat;
        }
      }
      return year;
    }
    
    function getLastDayOfMonth(year, month) {
      var date = new Date(year, month + 1, 0);
      return date.getDate();
    }

    function makeMonthTicks(date){
      var tick=[]
      if(date.getMonth()==new Date().getMonth() && date.getYear()===new Date().getYear()){
        for(var i=1; i<32; i++){
          if(i<=today.getDate()){
            tick.push({'i': i, 'classTick': classTickTack[0]['cls'], 'numberOfTick': 'tick'+i})
          }else{
            tick.push({'i': i, 'classTick': '', 'numberOfTick': 'tick'+i})
          }
        }
      }else{
        for(var i=1; i<32; i++){
          if(i<=getLastDayOfMonth(date.getYear(), date.getMonth())){
            tick.push({'i': i, 'classTick': classTickTack[0]['cls'], 'numberOfTick': 'tick'+i})
          }else{
            tick.push({'i': i, 'classText': 'unactive' , 'numberOfTick': 'tick'+i})
          }
        }
      }
      return tick
    }

    function createTicks(date){
      return {
        'month': date.toLocaleString("en-US", {month: 'long'}), 
        'tick': makeMonthTicks(date)
      }
    }

    function makeMonth(date){
      var month=date.getMonth()
      var months = []
      if(date.getFullYear() == new Date().getFullYear() ){
        for(var i=0; i<=month; i++){
          var currentMonth = new Date(date.setMonth(month - i));
          months.push(createTicks(currentMonth));
        }
      } else{
        for(var i=11; i>=0; i--){
          var currentMonth = new Date(date.setMonth(i));
          months.push(createTicks(currentMonth));
        }
      }
      return months;
    }
    function makeYear(date){
      var year=date.getFullYear()
      var length = year - getYear()
      console.log(year)
      var years = []
      for(var i=0; i<=length; i++){
        var currentYear = new Date(date.setFullYear(year - i));
        years.push({'year': date.toLocaleString("en-US", {year: 'numeric'}),
                    'yearClass': 'year' + date.toLocaleString("en-US", {year: 'numeric'}),
                    'tickMonth': makeMonth(date)});
      }
      return years;
    }
    var ticks = makeYear(today);

   
  	var template = $('#incidentsTemplate').html();

  	var output = Mustache.render(template, {incidents: incidents, /*components: components,*/ ticks: ticks, infoIncident: infoIncident/*, infoComponent: infoComponent*/});

  	 $('body').html(output);

    //function to get json by month
    function makeMonthsEvents(date){
      var month=date.getMonth()
      for(var i=0; i<4; i++){
        var eventData = getPerMonth(new Date(date.setMonth(month - i)), infoIncident);
        addShaduleWork(eventData);
        addIncident(eventData);
      }
    }
    
    makeMonthsEvents(new Date())

  	 function addIncident(data){
      if(data){
        for (var t=0; t<data.length; t++){
          if(!data[t]['planned_work_created']){
            var eventDay = dateEvent(data[t]['created']);
            var createdDate = hourInSec(data[t]['created']);
            var resolvedDate = hourInSec(data[t]['resolved']) || dateEnd;
            var countDay = countOfDay(data[t]['created'], data[t]['resolved']);
            if (countDay==0){
              $(".tick"+eventDay).parent().append('<li style="'+gradient(createdDate, classTickTack[1]['color'], resolvedDate)+' z-index: 20;" class="tick-tacks"></li>');
            } else {
              for(var j=0; j<=countDay; j++){
                if(j==0){
                  $(".tick"+eventDay).parent().append('<li style="'+gradient(createdDate, classTickTack[1]['color'])+' z-index: 20;" class="tick-tacks" ></li>');
                } else if(j<(countDay)){
                    $(".tick"+(eventDay+j)).parent().append('<li style="'+gradient(0, classTickTack[1]['color'], 0)+' z-index: 20;" class="tick-tacks"></li>');
                }else{
                    $(".tick"+(eventDay+j)).parent().append('<li style="'+gradient(0, classTickTack[1]['color'], resolvedDate)+' z-index: 20;" class="tick-tacks"></li>');
                  }
              }
            }
          }  
        }
      }
      }

      function addShaduleWork(data){
        if(data){
          for (var t=0; t<data.length; t++){
            if(data[t]['planned_work_created']){
              var eventDay = dateEvent(data[t]['planned_work_created']);
              var createdDate = hourInSec(data[t]['planned_work_created']);
              var resolvedDate = hourInSec(data[t]['planned_work_resolved']) || dateEnd;
              var countDay = countOfDay(data[t]['planned_work_created'], data[t]['planned_work_resolved']);
              if (countDay==0){
                $(".tick"+eventDay).parent().append('<li style="'+gradient(createdDate, classTickTack[2]['color'], resolvedDate)+'" class="tick-tacks"></li>');
              } else {
                for(var j=0; j<=countDay; j++){
                  if(j==0){
                    $(".tick"+eventDay).parent().append('<li style="'+gradient(createdDate, classTickTack[2]['color'])+'" class="tick-tacks"></li>');
                  } else if(j<(countDay)){
                      $(".tick"+(eventDay+j)).parent().append('<li style="'+gradient(0, classTickTack[2]['color'], 0)+'" class="tick-tacks"></li>');
                  }else{
                      $(".tick"+(eventDay+j)).parent().append('<li style="'+gradient(0, classTickTack[2]['color'], resolvedDate)+'" class="tick-tacks"></li>');
                    }
                }
              }
            }
          } 
        }
      }
      
	});
	
});

//function to get json by month
function getPerMonth(date, arr){
  var result = [];
  if (arr.length>0){
  for(var i=0; i<arr.length; i++){
    var created = new Date(Date.parse(arr[i]['created']));
    if(created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear()){
      result.push(arr[i]);
    }
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
  if(end){
    return (new Date(Date.parse(end))).getDate() - (new Date(Date.parse(start))).getDate()
  }
  return (new Date()).getDate() - (new Date(Date.parse(start))).getDate();
}

function clickMe(i){
  console.log(i);
}

