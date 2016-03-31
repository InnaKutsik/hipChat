var PAGE_ID = 'k2pdwh3sqf6b';
var API_KEY = 'cb8e499e-d958-42d8-a6aa-8d8dffc74c62';

var incidentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/incidents.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});

/*var componentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/components.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});*/
// function detail(i){
//         console.log(this)
//         for(var j=0; j<31; j++){
//           if($("#tick"+j).hasClass("active") && j!=i){
//             $("#tick"+j).removeClass("active");
//           }
//         }
//         $("#tick"+i).toggleClass("active");
// }



var classTickTack = [{'cls': 'upwork', 'color': '#8eb01e'},
                      {'cls': 'incident', 'color': '#ce4436'},
                      {'cls': 'plannedWork', color: '#3872b0'}] 

$(function(){
  
  Promise.all([incidentsCall/*, componentsCall*/]).then(function(data){

    var dateEnd = new Date().getHours()*3600 + new Date().getMinutes() *60 + new Date().getSeconds()

    var getIncident = [];

  	var incidents = data[0];
    console.log(incidents)
  	var components = data[1];


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
    
    console.log(infoIncident)

//     infoIncident = [{created: "2016-03-23T17:29:05.835+02:00",
//         id: "hkc6cnpg9tqx",
//         name: "Incident #4",
//         planned_work: null,
//         planned_work_created: null,
//         planned_work_resolved: null,
//         resolved: "2016-03-23T20:29:06.147+02:00",
//         status: "resolved"
//         }, {created: "2016-03-15T10:38:31.340+02:00",
// id: "8svcgyb55xdp",
// name: "Test maintenance 2",
// planned_work: "2016-03-15T10:00:00.000+02:00",
// planned_work_created: "2016-03-15T10:00:00.000+02:00",
// planned_work_resolved: "2016-03-20T22:30:00.000+02:00",
// resolved: "2016-03-23T22:30:41.878+02:00",
// status: "completed"},{created: "2016-02-15T17:38:31.340+02:00",
// id: "8svcgyb55xdp",
// name: "Test maintenance 2",
// planned_work: "2016-03-15T20:00:00.000+02:00",
// planned_work_created: "2016-02-15T20:00:00.000+02:00",
// planned_work_resolved: "2016-02-20T22:30:00.000+02:00",
// resolved: "2016-02-23T22:30:41.878+02:00",
// status: "completed"},{created: "2015-12-30T17:29:05.835+02:00",
//         id: "hkc6cnpg9tqx",
//         name: "Incident #4",
//         planned_work: "2015-12-30T17:29:05.835+02:00",
//         planned_work_created: "2015-12-30T17:29:05.835+02:00",
//         planned_work_resolved: "2016-01-02T17:29:06.147+02:00",
//         resolved: "2016-01-02T17:29:06.147+02:00",
//         status: "resolved"
//         }, {created: "2016-01-03T17:29:05.835+02:00",
//         id: "hkc6cnpg9tqx",
//         name: "Incident #4",
//         planned_work: null,
//         planned_work_created: null,
//         planned_work_resolved: null,
//         resolved: "2016-01-23T17:29:06.147+02:00",
//         status: "resolved"
//         }, {created: "2016-01-31T17:29:05.835+02:00",
//         id: "hkc6cnpg9tqx",
//         name: "Incident #4",
//         planned_work: null,
//         planned_work_created: null,
//         planned_work_resolved: null,
//         resolved: "2016-02-02T17:29:06.147+02:00",
//         status: "resolved"
//         }, {created: "2015-07-03T17:29:05.835+02:00",
//         id: "hkc6cnpg9tqx",
//         name: "Incident #4",
//         planned_work: null,
//         planned_work_created: null,
//         planned_work_resolved: null,
//         resolved: "2015-07-23T17:29:06.147+02:00",
//         status: "resolved"
//         }]

    var getYear = function(){
      var date = new Date().getTime()
      for(var i=0; i<infoIncident.length; i++){
        var eventDate = Date.parse(infoIncident[i]['created'])
        if(date>eventDate) date = eventDate;
      }
      return [new Date(date).getFullYear(), new Date(date).getMonth()];
    }
    
    function getLastDayOfMonth(year, month) {
      var date = new Date(year, month + 1, 0);
      return date.getDate();
    }

    function makeMonthTicks(date){
      var tick = []
      var last = getLastDayOfMonth(date.getFullYear(), date.getMonth()) + 1;
      if(date.getMonth()==new Date().getMonth() && date.getYear()===new Date().getYear()){
        for(var i=1; i<last; i++){
          if(i<=new Date().getDate()){
            tick.push({'i': i, 'classTick': classTickTack[0]['cls'], 'numberOfTick': 'tick'+i, 'infoEvents': detailEvents(new Date(date.setDate(i)))})
          }else{
            tick.push({'i': i, 'classTick': '', 'numberOfTick': 'tick'+i, 'infoEvents': detailEvents(new Date(date.setDate(i)))})
          }
        }
      }else{
        for(var i=1; i<last; i++){
          if(i<=getLastDayOfMonth(date.getYear(), date.getMonth())){
            tick.push({'i': i, 'classTick': classTickTack[0]['cls'], 'numberOfTick': 'tick'+i, 'infoEvents': detailEvents(new Date(date.setDate(i)))})
          }else{
            tick.push({'i': i, 'classText': 'unactive' , 'numberOfTick': 'tick'+i, 'infoEvents': detailEvents(new Date(date.setDate(i)))})
          }
        }
      }
      return tick
    }

    // function detailEvents(date){
    //   var dayEv = []
    //   for(var i=0; i<infoIncident.length; i++){
    //     if(!infoIncident[i]['planned_work']){
    //       var createdMs = Date.parse(infoIncident[i]['created']);
    //       var resolvedMs = Date.parse(infoIncident[i]['resolved']) || new Date;
    //     } else {
    //       var createdMs = Date.parse(infoIncident[i]['planned_work_created']);
    //       var resolvedMs = Date.parse(infoIncident[i]['planned_work_resolved']) || new Date;
    //     }
    //     var created= new Date(createdMs);
    //     if(created.getFullYear()==date.getFullYear() && created.getMonth()==date.getMonth() && created.getDate()==date.getDate()) dayEv.push(infoIncident[i]);
    //     if(createdMs<date.getTime() && date.getTime()<resolvedMs) {
    //       dayEv.push(infoIncident[i]);}
    //   }
    //   return (dayEv.length)?dayEv:false;
    // }

    function detailEvents(date){
      var dayEv = []
      for(var i=0; i<infoIncident.length; i++){
        if(!infoIncident[i]['planned_work']){
          var createdMs = Date.parse(infoIncident[i]['created']);
          var resolvedMs = Date.parse(infoIncident[i]['resolved']) || new Date; 
          var created= new Date(createdMs);
          var resolved = new Date(resolvedMs);
          if(resolved.getFullYear()!=date.getFullYear() || resolved.getMonth()!=date.getMonth() || resolved.getDate()!=date.getDate()) resolved = new Date(resolved.getFullYear(), resolved.getMonth(), resolved.getDate(), 23, 59)
          if(created.getFullYear()==date.getFullYear() && created.getMonth()==date.getMonth() && created.getDate()==date.getDate()) {
              dayEv.push({
                'id': infoIncident[i]['id'],
                'name': infoIncident[i]['name'],
                'created': created,
                'color': classTickTack[1]['color'],
                'time_created': function(){
                   return this.created.getHours()+":"+this.created.getMinutes()
                  },
                'time_resolved': function(){
                   return this.resolved.getHours()+":"+this.resolved.getMinutes()
                  },
                'percent_created': function(){
                  var hole = 1440;
                  var minutes=this.time_created().split(":")[0]*60+(+this.time_created().split(":")[1]);
                  return Math.round(minutes*100/hole);
                },
                'percent_resolved': function(){
                  var hole = 1440;
                  var minutes=this.time_resolved().split(":")[0]*60+(+this.time_resolved().split(":")[1]);
                  return Math.round(minutes*100/hole);
                },
                'status': infoIncident[i]['status'],
                'updated': infoIncident[i]['updated'],
                'resolved': resolved
              });
          }else if(createdMs<date.getTime() && date.getTime()<resolvedMs) {
            if(created.getFullYear()!=date.getFullYear() || created.getMonth()!=date.getMonth() || created.getDate()!=date.getDate()) created = new Date(created.getFullYear(), created.getMonth(), created.getDate(), 00, 00)
            dayEv.push({
              'id': infoIncident[i]['id'],
              'name': infoIncident[i]['name'],
              'created': created,
              'color': classTickTack[1]['color'],
              'time_created': function(){
                 return this.created.getHours()+":"+this.created.getMinutes()
                },
              'time_resolved': function(){
                 return this.resolved.getHours()+":"+this.resolved.getMinutes()
                },
              'percent_created': function(){
                  var hole = 1440;
                  var minutes=this.time_created().split(":")[0]*60+(+this.time_created().split(":")[1]);
                  return Math.round(minutes*100/hole);
                },
                'percent_resolved': function(){
                  var hole = 1440;
                  var minutes=this.time_resolved().split(":")[0]*60+(+this.time_resolved().split(":")[1]);
                  return Math.round(minutes*100/hole);
                },
              'status': infoIncident[i]['status'],
              'updated': infoIncident[i]['updated'],
              'resolved': resolved
            });
          }
        }else{
          var createdMs = Date.parse(infoIncident[i]['planned_work_created']);
          var resolvedMs = Date.parse(infoIncident[i]['planned_work_resolved']) || new Date; 
          var created= new Date(createdMs);
          var resolved = new Date(resolvedMs);
          if(resolved.getFullYear()!=date.getFullYear() || resolved.getMonth()!=date.getMonth() || resolved.getDate()!=date.getDate()) resolved = new Date(resolved.getFullYear(), resolved.getMonth(), resolved.getDate(), 23, 59)
          if(created.getFullYear()==date.getFullYear() && created.getMonth()==date.getMonth() && created.getDate()==date.getDate()) {
              dayEv.push({
                'id': infoIncident[i]['id'],
                'name': infoIncident[i]['name'],
                'created': false,
                'planned_work_created': created,
                'planned_work_resolved': resolved,
                'color': classTickTack[2]['color'],
                'time_created': function(){
                   return this.planned_work_created.getHours()+":"+this.planned_work_created.getMinutes()
                  },
                'time_resolved': function(){
                   return this.planned_work_resolved.getHours()+":"+this.planned_work_resolved.toLocaleString("en-US",{minute: 'numeric'})
                  },
                'percent_created': function(){
                  var hole = 1440;
                  var minutes=this.time_created().split(":")[0]*60+(+this.time_created().split(":")[1]);
                  return Math.round(minutes*100/hole);
                },
                'percent_resolved': function(){
                  var hole = 1440;
                  var minutes=this.time_resolved().split(":")[0]*60+(+this.time_resolved().split(":")[1]);
                  return Math.round(minutes*100/hole);
                },
                'status': infoIncident[i]['status'],
                'updated': infoIncident[i]['updated'],
                'resolved': false
              });
          }else if(createdMs<date.getTime() && date.getTime()<resolvedMs) {
            if(created.getFullYear()!=date.getFullYear() || created.getMonth()!=date.getMonth() || created.getDate()!=date.getDate()) created = new Date(created.getFullYear(), created.getMonth(), created.getDate(), 00, 00)
            dayEv.push({
                'id': infoIncident[i]['id'],
                'name': infoIncident[i]['name'],
                'created': false,
                'planned_work_created': created,
                'planned_work_resolved': resolved,
                'color': classTickTack[2]['color'],
                'time_created': function(){
                   return this.planned_work_created.getHours()+":"+this.planned_work_created.getMinutes()
                  },
                'time_resolved': function(){
                   return this.planned_work_resolved.getHours()+":"+this.planned_work_resolved.toLocaleString("en-US",{minute: 'numeric'})
                  },
                'percent_created': function(){
                  var hole = 1440;
                  var minutes=this.time_created().split(":")[0]*60+(+this.time_created().split(":")[1]);
                  return Math.round(minutes*100/hole);
                },
                'percent_resolved': function(){
                  var hole = 1440;
                  var minutes=this.time_resolved().split(":")[0]*60+(+this.time_resolved().split(":")[1]);
                  return Math.round(minutes*100/hole);
                },
                'status': infoIncident[i]['status'],
                'updated': infoIncident[i]['updated'],
                'resolved': false
            });
          }
        }
      }
      return (dayEv.length)?dayEv:false;
    }


    function createTicks(date){
      return {
        'month': date.toLocaleString("en-US", {month: 'long'}), 
        'monthClass': ('month' + date.getMonth()),
        'tick': makeMonthTicks(date)
      }
    }

    function makeMonth(date){
      var month=date.getMonth()
      var months = []
      if(date.getFullYear() == new Date().getFullYear() ){
        for(var i=month; i>=0; i--){
            if(date.getMonth() == new Date(date.setMonth(i)).getMonth()){
              var currentMonth = new Date(date.setMonth(i));
            }else{
              var currentMonth = new Date(date.getFullYear(), i, 1);
            }
            months.push(createTicks(currentMonth));
          }
      }else if(date.getFullYear() != getYear()[0]){
        for(var i=11; i>=0; i--){
          var currentMonth = new Date(date.setMonth(i));
          months.push(createTicks(currentMonth));
        }
      }else{
        for(var i=11; i>=getYear()[1]; i--){
          var currentMonth = new Date(date.setMonth(i));
          months.push(createTicks(currentMonth));
        }
      }
      return months;
    }
    function makeYear(date){
      var year=date.getFullYear()
      var length = year - getYear()[0]
      var years = []
      for(var i=0; i<=length; i++){
        var currentYear = new Date(date.setFullYear(year - i));
        years.push({'year': date.toLocaleString("en-US", {year: 'numeric'}),
                    'yearClass': date.toLocaleString("en-US", {year: 'numeric'}),
                    'tickMonth': makeMonth(date)});
      }
      return years;
    }
    var ticks = makeYear(new Date());

   
  	var template = $('#incidentsTemplate').html();

  	var output = Mustache.render(template, {incidents: incidents, /*components: components,*/ ticks: ticks /*, infoIncident: infoIncident, infoComponent: infoComponent*/});

  	 $('body').html(output);


    //function to get json by month
    function makeMonthsEvents(date){
      var year=date.getFullYear()
      var length = year - getYear()[0]
      var years = []
      var month=date.getMonth()
      for(var j=0; j<=length; j++){
        for(var i=13; i>=0; i--){
          var eventData = getPerMonth(new Date(new Date(date.getFullYear()-j, i, 1)), infoIncident);
          addShaduleWork(eventData);
          addIncident(eventData);
        }
      }
    }
    
    makeMonthsEvents(new Date())

  	function addIncident(data){
      if(data){
        for (var t=0; t<data.length; t++){
          if(!data[t]['planned_work_created']){
            var eventDay = dateEvent(data[t]['created']);
            var createdDate = hourInSec(data[t]['created']);
            var resolvedDate = hourInSec(data[t]['resolved']) || hourInSec(new Date());;
            var countDay = countOfDay(data[t]['created'], data[t]['resolved']);
            if (countDay==0){
              $("."+ yearEvent(data[t]['created']) +" .month"+ monthEvent(data[t]['created']) + " .tick"+eventDay).parent().append('<li style="'+gradient(createdDate, classTickTack[1]['color'], resolvedDate)+' z-index: 20;" class="tick-tacks tick'+eventDay+'"></li>');
            } else {
              for(var j=0; j<=countDay; j++){
                var creat = new Date(Date.parse(data[t]['created']));
                var creatShift = new Date(creat.setDate(creat.getDate()+j));
                if(j==0){
                  $("."+ yearEvent(data[t]['created']) +" .month"+ monthEvent(data[t]['created']) + " .tick"+eventDay).parent().append('<li style="'+gradient(createdDate, classTickTack[1]['color'])+' z-index: 20;" class="tick-tacks tick'+eventDay+'" ></li>');
                } else if(j<(countDay)){
                    $("."+ creatShift.getFullYear() +" .month"+ creatShift.getMonth() + " .tick"+ creatShift.getDate()).parent().append('<li style="'+gradient(0, classTickTack[1]['color'], 0)+' z-index: 20;" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
                }else{
                    $("."+ creatShift.getFullYear() +" .month"+ creatShift.getMonth() + " .tick"+ creatShift.getDate()).parent().append('<li style="'+gradient(0, classTickTack[1]['color'], resolvedDate)+' z-index: 20;" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
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
              var resolvedDate = hourInSec(data[t]['planned_work_resolved']) || hourInSec(new Date());
              var countDay = countOfDay(data[t]['planned_work_created'], data[t]['planned_work_resolved']);
              if (countDay==0){
                $("."+ yearEvent(data[t]['planned_work_created']) +" .month"+ monthEvent(data[t]['planned_work_created']) + " .tick"+eventDay).parent().append('<li style="'+gradient(createdDate, classTickTack[2]['color'], resolvedDate)+'" class="tick-tacks tick'+eventDay+'"></li>');
              } else {
                for(var j=0; j<=countDay; j++){
                  var creat = new Date(Date.parse(data[t]['planned_work_created']));
                  var creatShift = new Date(creat.setDate(creat.getDate()+j));
                  if(j==0){
                    $("."+ yearEvent(data[t]['planned_work_created']) +" .month"+ monthEvent(data[t]['planned_work_created']) + " .tick"+eventDay).parent().append('<li style="'+gradient(createdDate, classTickTack[2]['color'])+'" class="tick-tacks tick'+eventDay+'"></li>');
                  } else if(j<(countDay)){
                      $("."+ creatShift.getFullYear() +" .month"+ creatShift.getMonth() + " .tick"+ creatShift.getDate()).parent().append('<li style="'+gradient(0, classTickTack[2]['color'], 0)+'" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
                  }else{
                      $("."+ creatShift.getFullYear() +" .month"+ creatShift.getMonth() + " .tick"+ creatShift.getDate()).parent().append('<li style="'+gradient(0, classTickTack[2]['color'], resolvedDate)+'" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
                    }
                }
              }
            }
          } 
        }
      }
      $("<style type='text/css' id='dynamic' />").appendTo("head");
      $('.tick-tacks_block li').on("click", function(){
        var month = $(this).parent().parent().prop('className').split(" ")[1];
        var year = $(this).parent().parent().parent().prop('className').slice(-4);
        var day = takeNumber($(this).prop('className').split(" ")[1]);
        $("."+year+" #"+month+"-"+day+"-"+year).toggleClass("active");
        $(".tick-tacks_detailed").not($("."+year+" #"+month+"-"+day+"-"+year)).removeClass("active");

        if($("."+year+" #"+month+"-"+day+"-"+year).hasClass("active")){
          var sel = "#"+month+"-"+day+"-"+year;
          var percent = 3.22 * (day-0.5);
          $("#dynamic").text(sel+".tick-tacks_detailed:after, "+sel+".tick-tacks_detailed:before {left:"+percent +"%;}");
        }

      });
      
	});
	
});

function takeNumber(elem){
  result = []
  elem = elem.split("");
  for(var i=0; i<elem.length; i++){
    if(!isNaN(elem[i])) result.push(elem[i]);
  }
  return result.join("");
}
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
function monthEvent(date){
      var month = new Date(Date.parse(date)).getMonth();
      return month;
    }
function yearEvent(date){
      var year = new Date(Date.parse(date)).getFullYear();
      return year;
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
  var ONE_DAY = 1000 * 60 * 60 * 24;
  start = new Date(Date.parse(start));
  hourStart = start.getHours()
  if(!end){  
    end = new Date(new Date().setHours(hourStart));
  }else{
    end = new Date(new Date(Date.parse(end)).setHours(hourStart));
  }
  return Math.round((end.getTime()-start.getTime())/ONE_DAY);
}


