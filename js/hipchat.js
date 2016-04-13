var PAGE_ID = 'k2pdwh3sqf6b';
var API_KEY = 'cb8e499e-d958-42d8-a6aa-8d8dffc74c62';

var incidentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/incidents.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});

var componentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/components.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});


var classTickTack = [{'cls': 'upwork', 'color': '#8eb01e', 'percent': 100},
                      {'cls': 'incident', 'color': '#ce4436', 'percent': 0},
                      {'cls': 'plannedWork', color: '#3872b0', 'percent': 90},
                      {'cls': 'critical', color: '#ce4436', 'percent': 0},
                      {'cls': 'major', color: '#ff6600', 'percent': 70},
                      {'cls': 'minor', color: '#f5c340', 'percent': 40}] 

$(function(){
  
  Promise.all([incidentsCall, componentsCall]).then(function(data){

    var dateEnd = new Date().getHours()*3600 + new Date().getMinutes() *60 + new Date().getSeconds()

    var getIncident = [],
    getСomponent = [];

  	var incidents = data[0],
    components = data[1];

    for(var i=0; i<incidents.length; i++){
      getIncident[i] = {
        'id': incidents[i]['id'],
        'name': incidents[i]['name'],
        'created': incidents[i]['created_at'],
        'status': incidents[i]['status'],
        'planned_work': incidents[i]['scheduled_for'],
        'planned_work_created': incidents[i]['scheduled_for'],
        'planned_work_resolved': incidents[i]['scheduled_until'],
        'impact': incidents[i]['impact'],
        'updated': [],
        'resolved': incidents[i]['resolved_at'],
        'color': (!!incidents[i]['scheduled_for'])?classTickTack[2]['color']:(incidents[i]['impact'] == 'critical')?classTickTack[3]['color']:(incidents[i]['impact'] == 'major')?classTickTack[4]['color']:((incidents[i]['impact'] == 'minor'))?classTickTack[5]['color']:classTickTack[0]['color'],
        "z-index":(incidents[i]['scheduled_for'])?'z-index: 10;':(incidents[i]['impact'] == 'critical')?'z-index: 50;':(incidents[i]['impact'] == 'major')?'z-index: 30;':((incidents[i]['impact'] == 'minor'))?'z-index: 20;':'05'
      }
      for(var j=0, x=incidents[i]['incident_updates'].length-1; j<incidents[i]['incident_updates'].length, x>=0; j++, x--){
        getIncident[i]['updated'][x] = {
          'id_update': incidents[i]['incident_updates'][j]['id'],
          'body': incidents[i]['incident_updates'][j]['body'],
          'status': incidents[i]['incident_updates'][j]['status'],
          'created': incidents[i]['incident_updates'][j]['created_at'],
          'updated': formatUpdateDate(incidents[i]['incident_updates'][j]['updated_at']),
          'update_days': differenceDays(incidents[i]['incident_updates'][j]['updated_at'])
        }
        if(getIncident[i]['updated'][x]['status'].match('_'))
          getIncident[i]['updated'][x]['status'] = getIncident[i]['updated'][x]['status'].replace('_', ' ');
      }
    }

    for(var i=0; i<components.length; i++){
      getСomponent[i] = {
        'id': components[i]['id'],
        'name': components[i]['name'],
        'created': components[i]['created_at'],
        'status': components[i]['status'],
        'updated': components[i]['updated_at']
      }
      if(getСomponent[i]['status'].match('_'))
        getСomponent[i]['status'] = getСomponent[i]['status'].replace('_', ' ');
    }

    var infoIncident = getIncident.reverse(),
    infoComponent = getСomponent;
    console.log(infoIncident);

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
      var last = getLastDayOfMonth(date.getFullYear(), date.getMonth())+1;
      if(date.getMonth()==new Date().getMonth() && date.getYear()===new Date().getYear()){
        for(var i=1; i<last; i++){
          if(i<=new Date().getDate()){
            var detailEven = detailEvents(new Date(date.setDate(i)))[0];
            detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'Stable work', 'noInfo': 'noInfo'}];
            tick.push({'i': i, 'classTick': 'upwork', 
                'numberOfTick': 'tick'+i, 
                'infoEvents': detailEv,
                'noInfo': function(){
                        var tick = this.infoEvents;
                        return (tick[0]['infoNoDate'])?tick[0]['noInfo']:'';
                       },
                'percent': function(){
                  var data = this.infoEvents;
                  var num = this.i;
                  return percentForDay(new Date(), data, num);
                  }
                })
          }else{
            var detailEv = detailEvents(new Date(date.setDate(i)))[0];
            if (detailEv.length>0){
              tick.push({'i': i, 'classTick': '', 
                          'numberOfTick': 'tick'+i, 
                          'infoEvents': detailEv,
                          'perc': function(){
                            var data = this.infoEvents;
                            var num = this.i;
                            return percentForDay(new Date(date.setDate(num)), data, num)
                            }
                        })
            }else{
              tick.push({'i': i, 'classTick': '', 'numberOfTick': 'tick'+i, 'noActiveInfos': 'noInfo'})
            }
          }
        }
      }else{
        for(var i=1; i<last; i++){
          if(i<=getLastDayOfMonth(date.getYear(), date.getMonth())){
            var detailEv = detailEvents(new Date(date.setDate(i)))[0];
            detailEv = (detailEv.length>0)?detailEv:[{'infoNoDate': 'Stable work', 'noInfo': 'noInfo'}];
            tick.push({'i': i, 'classTick': 'upwork', 
                       'numberOfTick': 'tick'+i, 'noInfo': '', 
                       'infoEvents': detailEv,
                       'noInfo': function(){
                        var tick = this.infoEvents;
                        return (tick[0]['infoNoDate'])?tick[0]['noInfo']:'';
                       },
                       'percent': function(){
                          var data = this.infoEvents;
                          var num = this.i;
                          /*console.log(num, data)*/
                          return percentForDay(new Date(date.setDate(num)), data, num)
                          }
                        })
          }else{
            tick.push({'i': i, 'classText': 'unactive' , 'numberOfTick': 'tick'+i})
          }
        }
      }
      return tick
    }

    function detailEvents(date){
      var dayEv = []
      for(var i=0; i<infoIncident.length; i++){
        if(!infoIncident[i]['planned_work']){
          var createdMs = Date.parse(infoIncident[i]['created']);
          var resolvedMs = Date.parse(infoIncident[i]['resolved']) || new Date(); 
          var created= new Date(createdMs);
          var resolved = new Date(resolvedMs);
          if(resolved.getFullYear()!=date.getFullYear() || resolved.getMonth()!=date.getMonth() || resolved.getDate()!=date.getDate()) resolved = new Date(resolved.getFullYear(), resolved.getMonth(), resolved.getDate(), 23, 59, 59)
          if(created.getFullYear()==date.getFullYear() && created.getMonth()==date.getMonth() && created.getDate()==date.getDate()) {
              dayEv.push({
                'id': infoIncident[i]['id'],
                'name': infoIncident[i]['name'],
                'created': created,
                'noInfo': 'isInfo',
                'color': infoIncident[i]['color'],
                'z-index': infoIncident[i]['z-index'],
                'time_created': function(){
                   return timeFormatter(this.created);
                  },
                'time_resolved': function(){
                   return timeFormatter(this.resolved);
                  },
                'percent_created': function(){
                  var hole = 60*24;
                  var minutes = countOfTime(this.created);
                  return Math.round(minutes*100/hole);
                },
                'percent_created_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  if((this.resolved.getHours()-this.created.getHours())<1) return "left: "+Math.round(minutes*100/hole-7)+"%;";
                  return "left: "+Math.round(minutes*100/hole-7)+"%;";
                },
                'percent_resolved': function(){
                  var hole = 60*24;
                  var minutes = countOfTime(this.resolved);
                  return Math.round(minutes*100/hole);
                },
                 'percent_resolved_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  return "left: "+Math.round(minutes*100/hole-6)+"%;";
                },
                'show_time': function(){
                  if((this.resolved.getHours()-this.created.getHours())<=1) return 'none';
                 },
                'impact': infoIncident[i]['impact'],
                'status': infoIncident[i]['status'],
                'updated': infoIncident[i]['updated'],
                'resolved': resolved
              });
          }else if((createdMs<date.getTime() && date.getTime()<resolvedMs) || (resolved.getFullYear()==date.getFullYear() && resolved.getMonth()==date.getMonth() && resolved.getDate()==date.getDate())){
            if(created.getFullYear()!=date.getFullYear() || created.getMonth()!=date.getMonth() || created.getDate()!=date.getDate()) created = new Date(created.getFullYear(), created.getMonth(), created.getDate(), 00, 00, 00)
            dayEv.push({
              'id': infoIncident[i]['id'],
              'name': infoIncident[i]['name'],
              'created': created,
              'noInfo': 'isInfo',
              'color': infoIncident[i]['color'],
              'z-index': infoIncident[i]['z-index'],
              'time_created': function(){
                 return timeFormatter(this.created);
                },
              'time_resolved': function(){
                 return timeFormatter(this.resolved);
                },
              'percent_created': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  return Math.round(minutes*100/hole);
                },
                'percent_created_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  if((this.resolved.getHours()-this.created.getHours())<1) return "left: "+Math.round(minutes*100/hole-10)+"%;";
                  return "left: "+Math.round(minutes*100/hole)+"%;";
                },
                'percent_resolved': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  return Math.round(minutes*100/hole);
                },
                'percent_resolved_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  return "left: "+Math.round(minutes*100/hole-6)+"%;";
                },
                'show_time': function(){
                  if((this.resolved.getHours()-this.created.getHours())<=1) return 'none';
                 },
                'impact': infoIncident[i]['impact'],
              'status': infoIncident[i]['status'],
              'updated': infoIncident[i]['updated'],
              'resolved': resolved
            });
          }
        }else{
          var createdMs = Date.parse(infoIncident[i]['planned_work_created']);
          var resolvedMs = Date.parse(infoIncident[i]['planned_work_resolved']); 
          var created = new Date(createdMs);
          var resolved = new Date(resolvedMs);
          if(resolved.getFullYear()!=date.getFullYear() || resolved.getMonth()!=date.getMonth() || resolved.getDate()!=date.getDate()) resolved = new Date(resolved.getFullYear(), resolved.getMonth(), resolved.getDate(), 23, 59, 59)
          if(created.getFullYear()==date.getFullYear() && created.getMonth()==date.getMonth() && created.getDate()==date.getDate()) {
              dayEv.push({
                'id': infoIncident[i]['id'],
                'name': infoIncident[i]['name'],
                'created': created,
                'noInfo': 'isInfo',
                'color': infoIncident[i]['color'],
                'z-index': infoIncident[i]['z-index'],
                'time_created': function(){
                   return timeFormatter(this.created); 
                  },
                'time_resolved': function(){
                   return timeFormatter(this.resolved);
                  },
                'percent_created': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  return Math.round(minutes*100/hole);
                },
                'percent_created_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  return "left: "+Math.ceil(minutes*100/hole)+"%;";
                },
                'percent_resolved': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  return Math.round(minutes*100/hole);
                },
                'percent_resolved_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  return "left: "+Math.round(minutes*100/hole-7)+"%;";
                },
                'show_time': function(){
                  if((this.resolved.getHours()-this.created.getHours())<=1) return 'none';
                 },
                'status': infoIncident[i]['status'],
                'updated': infoIncident[i]['updated'],
                'resolved': resolved
              });
          }else if((createdMs<=date.getTime() && date.getTime()<=resolvedMs) || (resolved.getFullYear()==date.getFullYear() && resolved.getMonth()==date.getMonth() && resolved.getDate()==date.getDate())) {
            if(created.getFullYear()!=date.getFullYear() || created.getMonth()!=date.getMonth() || created.getDate()!=date.getDate()) created = new Date(created.getFullYear(), created.getMonth(), created.getDate(), 00, 00, 00);
            dayEv.push({
                'id': infoIncident[i]['id'],
                'name': infoIncident[i]['name'],
                'created': created,
                'noInfo': 'isInfo',
                'color': infoIncident[i]['color'],
                'time_created': function(){
                   return timeFormatter(this.created);
                  },
                'time_resolved': function(){
                   return timeFormatter(this.resolved);
                  },
                'percent_created': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  return Math.round(minutes*100/hole);
                },
                'percent_created_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  return "left: "+Math.round(minutes*100/hole)+"%;";
                },
                'percent_resolved': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  return Math.round(minutes*100/hole);
                },
                'percent_resolved_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  return "left: "+Math.round(minutes*100/hole-7)+"%;";
                },
                'show_time': function(){
                  if((this.resolved.getHours()-this.created.getHours())<=1) return 'none';
                 },
                'status': infoIncident[i]['status'],
                'updated': infoIncident[i]['updated'],
                'resolved': resolved,
                'z-index': infoIncident[i]['z-index']
            });
          }
        }
      }
      for(var k = 0; k<dayEv.length; k++){          
       if(dayEv[k]['impact'] == 'none'){
         dayEv.splice(k,1);
          k--;
        }
      }
      for (var j=0; j<dayEv.length; j++){
        for(var l=0; l<dayEv.length; l++){
          if(l!=j){
            var diffIndex = dayEv[j]['created'].getHours()<=dayEv[l]['created'].getHours() && dayEv[j]['resolved'].getHours()>=dayEv[l]['resolved'].getHours() && (+dayEv[j]['z-index'].slice(-3, -1))>(+dayEv[l]['z-index'].slice(-3, -1));
            var diffCreated = dayEv[j]['created'].getHours()<dayEv[l]['created'].getHours() && dayEv[j]['resolved'].getHours()>=dayEv[l]['resolved'].getHours() && (+dayEv[j]['z-index'].slice(-3, -1))>=(+dayEv[l]['z-index'].slice(-3, -1));
            var diffResolved = dayEv[j]['created'].getHours()<=dayEv[l]['created'].getHours() && dayEv[j]['resolved'].getHours()>dayEv[l]['resolved'].getHours() && (+dayEv[j]['z-index'].slice(-3, -1))>=(+dayEv[l]['z-index'].slice(-3, -1));
            if(diffIndex || diffCreated || diffResolved){
              dayEv[l]['percent_created_data'] = "display: none;";
              dayEv[l]['percent_resolved_data'] = "display: none;";
            }else if(dayEv[j]['resolved'].getHours()>=dayEv[l]['resolved'].getHours() && (+dayEv[j]['z-index'].slice(-3, -1))>(+dayEv[l]['z-index'].slice(-3, -1))){
              dayEv[l]['percent_resolved_data'] = "display: none;";
            }
          }
        }
        for(var n=j+1; n<dayEv.length; n++){
          if(dayEv[j]['created'].getHours()<=dayEv[n]['created'].getHours() && dayEv[j]['resolved'].getHours()>=dayEv[n]['resolved'].getHours() && (+dayEv[j]['z-index'].slice(-3, -1))>=(+dayEv[n]['z-index'].slice(-3, -1))){
              dayEv[n]['percent_created_data'] = "display: none;";
              dayEv[n]['percent_resolved_data'] = "display: none;";
            }
        }
      }
      var arr = [];
      for(var u=0; u<dayEv.length; u++){
        if(dayEv[u]['percent_created_data']!="display: none;" || dayEv[u]['percent_resolved_data']!="display: none;"){
          arr.push(dayEv[u]);
        }
      }
      return [dayEv, arr];
    }

    var timePeriod = detailEvents(new Date(new Date().setDate(12)))[1];
    function grafTime(d){
      var arr = [];
      for(var i=0; i<d.length; i++){
        if(d[i]['percent_created_data']!="display: none;") arr.push({'timeData': todayHours(d[i]['created']), 'percent': takePercent(d[i]['color'], classTickTack), 'color': d[i]['color']});
        if(d[i]['percent_resolved_data']!="display: none;") arr.push({'timeData': todayHours(d[i]['resolved']), 'percent': takePercent(d[i]['color'], classTickTack), 'color': d[i]['color']});
      }
      arr = arr.sort(compareNumeric)
      var result = []
      // for(var t=0; t<arr.length; t++){
      //   if(arr[t]['time'].getHours()!=0 || arr[t]['time'].getHours()!=0)
      // } 
      if(arr[0]['timeData'].getHours()!=0 && arr[0]['timeData'].getHours()!=0){
        result.push([{'timeData': new Date(new Date().getFullYear(), new Date().getMonth(), 12, 00, 00, 00), 'percent': 100, 'color': classTickTack[0]['color']}, {'timeData': arr[0]['timeData'], 'percent': 100}])
      }
      for(var j=0; j<arr.length-1; j++){
        if(j=0 && arr[0]['timeData'].getHours()!=0 && arr[t]['timeData'].getHours()!=0){
          result.push([{'timeData': arr[j]['timeData'], 'color': arr[j]['color'], 'percent': 100}, {'timeData': arr[j+1]['timeData'], 'percent': arr[j]['percent']}])
        }
        result.push([arr[j], {'timeData': arr[j+1]['timeData'], 'percent': arr[j+1]['percent']}])
      }
      console.log(result)
      return result;
    }


    function todayHours(param){
      return new Date(new Date().getFullYear(), new Date().getMonth(), param.getHours(), param.getMinutes(), 00)
    }



    function createTicks(date){
      return {
        'month': date.toLocaleString("en-US", {month: 'long'}), 
        'monthClass': ('month' + date.getMonth()),
        'tick': makeMonthTicks(date),
        'percentPerMonth': function(){
          var tick = this.tick;
          return percPerMonth(tick);
        }
      }
    }

    function makeMonth(date){
      var month=date.getMonth()
      var months = []
      if(date.getFullYear() == new Date().getFullYear()){
        var lastMonth = (date.getFullYear() == getYear()[0])?getYear()[1]:0;
        for(var i=month; i>=lastMonth; i--){
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
        years.push({'year': date.getFullYear(),
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
            var resolvedDate = hourInSec(data[t]['resolved']) || hourInSec(new Date());
            var countDay = countOfDay(data[t]['created'], data[t]['resolved']);
            if (countDay==0){
              $("."+ yearEvent(data[t]['created']) +" .month"+ monthEvent(data[t]['created']) + " .tick"+eventDay).parent().append('<li style="'+gradient(createdDate, data[t]['color'], resolvedDate)+data[t]["z-index"]+'" class="tick-tacks tick'+eventDay+'"></li>');
            } else {
              for(var j=0; j<=countDay; j++){
                var creat = new Date(Date.parse(data[t]['created']));
                var creatShift = new Date(creat.setDate(creat.getDate()+j));
                if(j==0){
                  $("."+ yearEvent(data[t]['created']) +" .month"+ monthEvent(data[t]['created']) + " .tick"+eventDay).parent().append('<li style="'+gradient(createdDate, data[t]['color'])+data[t]["z-index"]+'" class="tick-tacks tick'+eventDay+'" ></li>');
                  $("."+yearEvent(data[t]['created'])+" #"+monthEvent(data[t]['created'])+"-"+eventDay+"-"+yearEvent(data[t]['created'])+" .tick-tacks_line .line").append('<div style="'+gradient(createdDate, data[t]['color'])+data[t]["z-index"]+'" ></div>');
                } else if(j<(countDay)){
                    $("."+ creatShift.getFullYear() +" .month"+ creatShift.getMonth() + " .tick"+ creatShift.getDate()).parent().append('<li style="'+gradient(0, data[t]['color'], 0)+data[t]["z-index"]+'" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
                }else{
                    $("."+ creatShift.getFullYear() +" .month"+ creatShift.getMonth() + " .tick"+ creatShift.getDate()).parent().append('<li style="'+gradient(0, data[t]['color'], resolvedDate)+data[t]["z-index"]+'" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
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
                $("."+ yearEvent(data[t]['planned_work_created']) +" .month"+ monthEvent(data[t]['planned_work_created']) + " .tick"+eventDay).parent().append('<li style="'+gradient(createdDate, data[t]['color'], resolvedDate)+data[t]["z-index"]+'" class="tick-tacks tick'+eventDay+'"></li>');
              } else {
                for(var j=0; j<=countDay; j++){
                  var creat = new Date(Date.parse(data[t]['planned_work_created']));
                  var creatShift = new Date(creat.setDate(creat.getDate()+j));
                  if(j==0){
                    $("."+ yearEvent(data[t]['planned_work_created']) +" .month"+ monthEvent(data[t]['planned_work_created']) + " .tick"+eventDay).parent().append('<li style="'+gradient(createdDate, data[t]['color'])+data[t]["z-index"]+'" class="tick-tacks tick'+eventDay+'"></li>');
                  } else if(j<(countDay)){
                      $("."+ creatShift.getFullYear() +" .month"+ creatShift.getMonth() + " .tick"+ creatShift.getDate()).parent().append('<li style="'+gradient(0, data[t]['color'], 0)+data[t]["z-index"]+'" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
                  }else{
                      $("."+ creatShift.getFullYear() +" .month"+ creatShift.getMonth() + " .tick"+ creatShift.getDate()).parent().append('<li style="'+gradient(0, data[t]['color'], resolvedDate)+data[t]["z-index"]+'" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
                    }
                }
              }
            }
          } 
        }
      }
      $("<style type='text/css' id='dynamic' />").appendTo("head");
      $('.tick-tacks_block .tick-tacks').on("click", function(){
        var month = $(this).parent().parent().prop('className').split(" ")[1];
        var year = $(this).parent().parent().parent().prop('className').slice(-4);
        var monthNumber = takeNumber(month.slice(-2));
        var day = takeNumber($(this).prop('className').split(" ")[1]);
        $("."+year+" #"+month+"-"+day+"-"+year).toggleClass("active");        $(".tick-tacks_detailed").not($("."+year+" #"+month+"-"+day+"-"+year)).removeClass("active");
        $('.'+month+' .tick'+day).toggleClass("active");
        $('.tick-tacks').not($('.'+month+' .tick'+day)).removeClass("active");
        if($("."+year+" #"+month+"-"+day+"-"+year).hasClass("active")){
          var sel = "#"+month+"-"+day+"-"+year;
          var left = $(this).parent().position().left+18;
          $("#dynamic").text(sel+".tick-tacks_detailed:after, "+sel+".tick-tacks_detailed:before {left:"+left +"px;}");
          var self = $(this);
          $(window).resize(function(){
            var left = self.parent().position().left+18;
            $("#dynamic").text(sel+".tick-tacks_detailed:after, "+sel+".tick-tacks_detailed:before {left:"+left +"px;}");
          });

        }

      });
      // Data notice the structure of diagrama
      var data =  grafTime(timePeriod)
console.log(data)
    var colors = [];

    data[0].forEach(function(item){
      if(item['color']) colors.push(item['color']);
    })

    console.log(colors)
    
 
 
//************************************************************
// Create Margins and Axis and hook our zoom function
//************************************************************
var margin = {top: 20, right: 30, bottom: 30, left: 50},
    width = 700 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;


  
var x = d3.time.scale()
    .domain([new Date(new Date(new Date().getFullYear(), new Date().getMonth(), 12, 00, 00, 00)), new Date(new Date().getFullYear(), new Date().getMonth(), 12, 24, 00, 00)])
    .range([0, width]);
 
var y = d3.scale.linear()
    .domain([0, 105])
    .range([height, 0]);
  
var xAxis = d3.svg.axis()
  .scale(x)
  .ticks(d3.time.hours, 4)
  .tickFormat(d3.time.format("%I %p"))
  .tickPadding(8)  
  .tickSubdivide(true)  
  .orient("bottom");  
  
var yAxis = d3.svg.axis()
  .scale(y)
  .tickPadding(10)
  .ticks(5)
  .tickSize(-width)  
  .orient("left");
  
var zoom = d3.behavior.zoom()
    .x(x)
    .y(y)
    .scaleExtent([1, 10])
    .on("zoom", zoomed);  
  
  
 
  
  
//************************************************************
// Generate our SVG object
//************************************************************  
var svg = d3.select("#graf").append("svg")
  .call(zoom)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
 
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
 
svg.append("g")
  .attr("class", "y axis")
  .append("text")
  .attr("class", "axis-label")
  .attr("transform", "rotate(-90)")
  .attr("y", (-margin.left) + 10)
  .attr("x", -height/2)
  .text('Percent %');  
 
svg.append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", width)
  .attr("height", height);
  
  
var format = d3.time.format("%I %p")  
  
  
//************************************************************
// Create D3 line object and draw data on our SVG object
//************************************************************
var line = d3.svg.line()
    .interpolate("linear")  
    .x(function(d) { return x(new Date(d.timeData)); })
    .y(function(d) { return y(d.percent); });   
  
svg.selectAll('.line')
  .data(data)
  .enter()
  .append("path")
    .attr("class", "line")
  .attr("clip-path", "url(#clip)")
  .attr('stroke', function(d,i){      
    return colors[i%colors.length];
  })
    .attr("d", line);   
  
  
  
  
//************************************************************
// Draw points on SVG object based on the data given
//************************************************************
var points = svg.selectAll('.dots')
  .data(data)
  .enter()
  .append("g")
    .attr("class", "dots")
  .attr("clip-path", "url(#clip)"); 
 
points.selectAll('.dot')
  .data(function(d, index){     
    var a = [];
    d.forEach(function(point,i){
      a.push({'index': index, 'point': point});
    });   
    return a;
  })
  .enter()
  .append('circle')
  .attr('class','dot')
  .attr("r", 2.5)
  .attr('fill', function(d,i){  
    return colors[d.index%colors.length];
  })  
  .attr("transform", function(d) { 
    return "translate(" + x(d.point.timeData) + "," + y(d.point.percent) + ")"; }
  );
  
 
  
  
  
  
//************************************************************
// Zoom specific updates
//************************************************************
function zoomed() {
  svg.select(".x.axis").call(xAxis);
  svg.select(".y.axis").call(yAxis);   
  svg.selectAll('path.line').attr('d', line);  
 
  points.selectAll('circle').attr("transform", function(d) { 
    return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
  );  
}
     
    
	});

	
});

function getLastDayOfMonth(year, month) {
      var date = new Date(year, month + 1, 0);
      return date.getDate();
}
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
function timeFormatter(date){
  if(date.toTimeString().split(' ')[0].slice(0, -6)>=12){
    return (+date.toTimeString().split(' ')[0].slice(0, -6)-12)+":"+date.toTimeString().split(' ')[0].slice(3, -3)+"PM"
  }
  return date.toTimeString().split(' ')[0].slice(0, -6)+":"+date.toTimeString().split(' ')[0].slice(3, -3)+"AM"
}
function getNumberOfTime(date){
  return (date.getHours()*60+date.getMinutes())
}
function differenceDays(date){
  date = new Date(Date.parse(date))
  var days = Math.round((new Date(new Date()).getTime() - new Date(date).getTime())/1000/60/60/24)
  if (days == 1){
    return "1 day ago.";
  }else if(days == 0){
    return "today.";
  }else if(days>1){
    return days+" days ago."
  }
}

function countOfTime(date){
  return date.getHours()*60+(+date.getMinutes())
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

function formatUpdateDate(date){
  date = new Date(Date.parse(date))
  var options = {
    hour12: false,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timezone: 'UTC',
    hour: 'numeric',
    minute: 'numeric'
  };
  return date.toLocaleString("en-US", options).split(",").slice(0, 2).join(",") + " -" + date.toLocaleString("en-US", options).split(",")[2] + " UTC"
}

function percentForDay(date, array, num){
  var arr = array;
  var timer = [];
  for (var t=0; t<24*60; t++){
    timer.push(t);
  }
  for(var j=0; j<arr.length; j++){
    if(arr[j]['created'] || arr[j]['planned_work_created']){
      var created = (arr[j]['created'])?arr[j]['created']:arr[j]['planned_work_created'];
      var resolved = (arr[j]['resolved'])?arr[j]['resolved']:arr[j]['planned_work_resolved'];
      if(created.getDate()!=num){
        created = new Date(date.getFullYear(), date.getMonth(), num, 0, 0, 0);
      }
      if(resolved.getDate()!=num){
        resolved = new Date(date.getFullYear(), date.getMonth(), num, 23, 59, 59);
      }
      timer = timer.filter(function(item){
        return (getNumberOfTime(created)>item || item>getNumberOfTime(resolved));
      });
    }
  }
  return Math.round(timer.length*100/(24*60));
}

//count percent of time without events per month
function percPerMonth(tick){
      var sum = 0;
      var arr=[]
      for(var i=0; i<tick.length; i++){
        if(tick[i]['percent']){
          arr.push(+tick[i]['percent']())
        }
      }
      for(var j=0; j<arr.length; j++){
        sum += arr[j]
      }
      return ((sum/arr.length).toFixed(2))
    }

function compareNumeric(a, b) {
  if (countOfTime(a['timeData']) > countOfTime(b['timeData'])) return 1;
  if (countOfTime(a['timeData']) < countOfTime(b['timeData'])) return -1;
}

function takePercent(item, arr){
  for(var i=0; i<arr.length; i++){
    if (arr[i]['color'] == item) return arr[i]['percent'];
  }
}

