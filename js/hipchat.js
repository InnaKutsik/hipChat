var PAGE_ID = 'k2pdwh3sqf6b';
var API_KEY = 'cb8e499e-d958-42d8-a6aa-8d8dffc74c62';

var incidentsCall = $.ajax('https://3k9om46ag9.execute-api.us-east-1.amazonaws.com/api/incidents');

var phoneCountries = $.ajax('https://api.statuspage.io/sms_countries.json');

var componentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/components.json', {
  headers: { Authorization: "OAuth " + API_KEY }
 });


var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

var classTickTack = [{'cls': 'upwork', 'color': '#8eb01e', 'percent': 1},
                      {'cls': 'incident', 'color': '#ce4436', 'percent': 0},
                      {'cls': 'plannedWork', color: '#3872b0', 'percent': 0},
                      {'cls': 'critical', color: '#ce4436', 'percent': 0},
                      {'cls': 'major', color: '#ff6600', 'percent': 0.33},
                      {'cls': 'minor', color: '#f5c340', 'percent': 0.67}] 


$(function(){
  
  Promise.all([incidentsCall, phoneCountries, componentsCall]).then(function(data){

    var dateEnd = new Date().getHours()*3600 + new Date().getMinutes() *60 + new Date().getSeconds()

    var getIncident = [],
     getСomponent = [],
    infoPhoneCountries = [];

    var incidents = data[0],
    components = data[2],
    phone_countries = data[1];  
  
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
      var status = components[i]['status'];
      getСomponent[i] = {
        'name': components[i]['name'],
        'color': takeColor(status)
      }       
     //  if(getСomponent[i]['status'].match('_'))
     //    getСomponent[i]['status'] = getСomponent[i]['status'].replace('_', ' ');
     }


     function takeColor(status){
        if(status == 'degraded_performance') return classTickTack[5]['color'];
        else if(status == 'partial_outage') return classTickTack[4]['color'];
        else if(status == 'major_outage') return classTickTack[3]['color'];
      }

var uniqueProperties = {};

for(var object in getСomponent){
   uniqueProperties[getСomponent[object]['name']] = getСomponent[object]['color'];
}

var infoComponent = [];

for(var uniqueName in uniqueProperties){
   infoComponent.push(
     {color:uniqueProperties[uniqueName],name:uniqueName});
}
    

for(var i in phone_countries){
  var prop_phone = phone_countries[i];
  infoPhoneCountries.push({'abr': i, 'code': prop_phone[0], 'country': prop_phone[1]});
}

    var infoIncident = getIncident.reverse().map(function(item){
      if(item.updated) item.updated = item.updated.sort(compareUpdate);
      return item;
    });

        
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
    function oneWeek(date){
      var wTeack = [];

    }
    function makeMonthTicks(date){
      var tick = []
      var last = getLastDayOfMonth(date.getFullYear(), date.getMonth())+1;
      if(date.getMonth()==new Date().getMonth() && date.getYear()===new Date().getYear()){
        for(var i=1; i<last; i++){
          if(i==new Date().getDate()){
            var detailEven = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'Stable work', 'noInfo': 'noInfo'}];
            tick.push({'i': i, 
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
                  },
                'value': function(){
                  var currentHour = new Date().getHours()*3600 + new Date().getMinutes()*60 + new Date().getSeconds();
                  var allDay = 3600*24;
                  var percentFrom = currentHour*100/allDay;
                  var value="background: linear-gradient(to right, #8eb01e " + Math.round(percentFrom) + "%, #e9e9e9 " + Math.round(percentFrom) + "%, #e9e9e9 100%);";
                  return value;
                  }
                })
          }else if(i<new Date().getDate()){
            var detailEven = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
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
            var detailEv = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
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
            var detailEv = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
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
                  var hole = 60*24;
                  var minutes = countOfTime(this.created);
                  if((hoursCompare(this.resolved)-hoursCompare(this.created))<5400) return "left: "+Math.round(minutes*100/hole-5)+"%;";
                  return "left: "+Math.round(minutes*100/hole-5)+"%;";
                },
                'graf_created_data': true,
                'graf_resolved_data': true,
                'percent_resolved': function(){
                  var hole = 60*24;
                  var minutes = countOfTime(this.resolved);
                  return Math.round(minutes*100/hole);
                },
                 'percent_resolved_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  if(endDate(this.resolved)) return "left: "+Math.round(minutes*100/hole-4)+"%;";
                  return "left: "+Math.round(minutes*100/hole-6)+"%;";
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
                'graf_created_data': true,
                'graf_resolved_data': true,
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
                  if((hoursCompare(this.resolved)-hoursCompare(this.created))<5400) return "left: "+Math.round(minutes*100/hole-5)+"%;";
                  return "left: "+Math.round(minutes*100/hole-5)+"%;";
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
                'status': infoIncident[i]['status'],
                'updated': infoIncident[i]['updated'],
                'resolved': resolved,
                'graf_created_data': true,
                'graf_resolved_data': true
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
                  return "left: "+Math.round(minutes*100/hole-6)+"%;";
                },
                'status': infoIncident[i]['status'],
                'updated': infoIncident[i]['updated'],
                'resolved': resolved,
                'z-index': infoIncident[i]['z-index'],
                'graf_created_data': true,
                'graf_resolved_data': true
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
      var arr = [];
      for(var u=0; u<dayEv.length; u++){
        if((dayEv[u]['graf_created_data'] || dayEv[u]['graf_resolved_data'])){
          arr.push(dayEv[u]);
        }
      }
      dayEv.sort(compareTime)
      return [dayEv, arr];
    }


    function createTicks(date){
      return {
        'month': monthNames[date.getMonth()], 
        'monthClass': ('month' + date.getMonth()),
        'tick': makeMonthTicks(date),
        'percentPerMonth': function(){
          var tick = this.tick;
          return percPerMonth(tick);
        },
        'weekTick': []
      }
    }

    function countWeekPerMonth(date){
      var firstDay = getFirstDayOfMonth(date);
      var countDays = getLastDayOfMonth(date.getFullYear(), date.getMonth());
      var countWeeks = ((firstDay-1)+countDays)/7;
      return Math.ceil(countWeeks);
    }

     function getFirstDayOfMonth(date){
        return new Date(new Date().setDate(1)).getDay()
      }


    function filterHours(dayEv){
      dayEv.sort(compareTimeReverse);
      filterManyEvent(dayEv)
      for(var t=0; t<dayEv.length; t++){
        if((hoursCompare(dayEv[t]['resolved'])-hoursCompare(dayEv[t]['created']))<5400 && (dayEv[t]['percent_created_data']!='display: none;' && dayEv[t]['percent_resolved_data']!='display: none;')){
            // if(endDate(dayEv[t]['resolved'])) dayEv[t]['percent_created_data'] = 'display: none;';
            dayEv[t]['percent_resolved_data'] = 'display: none;'
          }
        for(var z=t+1; z<dayEv.length; z++){
          if(hoursCompare(dayEv[t]['created'])<=hoursCompare(dayEv[z]['created']) && hoursCompare(dayEv[t]['resolved'])>=hoursCompare(dayEv[z]['resolved']) && (+dayEv[t]['z-index'].slice(-3, -1))>=(+dayEv[z]['z-index'].slice(-3, -1))){
              if(dayEv[t]['percent_created_data']!='display: none;' || hoursCompare(dayEv[t]['created'])<hoursCompare(dayEv[z]['created'])) dayEv[z]['percent_created_data'] = 'display: none;';
              if (dayEv[t]['percent_resolved_data']!='display: none;' || hoursCompare(dayEv[t]['resolved'])>hoursCompare(dayEv[z]['resolved'])) dayEv[z]['percent_resolved_data'] = 'display: none;';
          }else if(hoursCompare(dayEv[z]['created'])<=hoursCompare(dayEv[t]['created']) && hoursCompare(dayEv[z]['resolved'])>=hoursCompare(dayEv[t]['resolved']) && (+dayEv[z]['z-index'].slice(-3, -1))>=(+dayEv[t]['z-index'].slice(-3, -1))){
              if(dayEv[z]['percent_created_data']!='display: none;') dayEv[t]['percent_created_data'] = 'display: none;';
              if (dayEv[z]['percent_resolved_data']!='display: none;') dayEv[t]['percent_resolved_data'] = 'display: none;';
          }else if(hoursCompare(dayEv[t]['created'])<=hoursCompare(dayEv[z]['created']) && hoursCompare(dayEv[t]['resolved'])>=hoursCompare(dayEv[z]['created']) && hoursCompare(dayEv[t]['resolved'])<hoursCompare(dayEv[z]['resolved']) && (+dayEv[t]['z-index'].slice(-3, -1))>=(+dayEv[z]['z-index'].slice(-3, -1))){
              dayEv[z]['percent_created_data'] = 'display: none;';
              if(Math.abs(hoursCompare(dayEv[t]['resolved'])-hoursCompare(dayEv[z]['resolved']))<6400){
                dayEv[t]['percent_resolved_data'] = 'display: none;';
              }
          }

          if(Math.abs(hoursCompare(dayEv[t]['resolved'])-hoursCompare(dayEv[z]['resolved']))<5400 && (dayEv[t]['percent_resolved_data']!='display: none;' && dayEv[z]['percent_resolved_data']!='display: none;')){
            if(hoursCompare(dayEv[t]['resolved'])>=hoursCompare(dayEv[z]['resolved'])){
              dayEv[z]['percent_resolved_data'] = 'display: none;';
            }else{
              dayEv[t]['percent_resolved_data'] = 'display: none;';
            }
          }
          if(Math.abs(hoursCompare(dayEv[t]['created'])-hoursCompare(dayEv[z]['created']))<5400 && (dayEv[t]['percent_created_data']!='display: none;' && dayEv[z]['percent_created_data']!='display: none;')){
            if(hoursCompare(dayEv[t]['created'])>=hoursCompare(dayEv[z]['created'])){
              dayEv[t]['percent_created_data'] = 'display: none;';
            }else{
              dayEv[z]['percent_created_data'] = 'display: none;';
            }
          }
          if(Math.abs(hoursCompare(dayEv[t]['created'])-hoursCompare(dayEv[z]['resolved']))<5400){
            // if(Math.abs(hoursCompare(dayEv[t]['created'])-hoursCompare(dayEv[z]['created']))<7000){
            //   dayEv[z]['percent_created_data'] = 'display: none;';
            // }
            if(dayEv[t]['percent_created_data']!='display: none;' && dayEv[z]['percent_resolved_data']!='display: none;'){
              dayEv[z]['percent_resolved_data'] = 'display: none;';
            }
          }
          if(Math.abs(hoursCompare(dayEv[z]['created'])-hoursCompare(dayEv[t]['resolved']))<5400){
            // if(Math.abs(hoursCompare(dayEv[t]['created'])-hoursCompare(dayEv[z]['created']))<7000){
            //   dayEv[z]['percent_created_data'] = 'display: none;';
            // }
            if(dayEv[z]['percent_created_data']!='display: none;' && dayEv[t]['percent_resolved_data']!='display: none;'){
              dayEv[t]['percent_resolved_data'] = 'display: none;';
            }
          }
        }
      }
      dayEv.sort(compareTime)
      return dayEv;
    }

    function filterManyEvent(dayEv){
      for(var t=0; t<dayEv.length; t++){
        if((t+1)<dayEv.length && (hoursCompare(dayEv[t+1]['created'])-hoursCompare(dayEv[t]['resolved']))<3600 && (hoursCompare(dayEv[t]['resolved'])-hoursCompare(dayEv[t]['created']))<3600 && (hoursCompare(dayEv[t+1]['resolved'])-hoursCompare(dayEv[t+1]['created']))<3600){
          dayEv[t]['percent_resolved_data'] = 'display: none;';
          dayEv[t+1]['percent_created_data'] = 'display: none;';
          dayEv[t]['percent_created_data']= function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  return "left: "+Math.round(minutes*100/hole-5)+"%;";
                }
          dayEv[t+1]['percent_resolved_data'] = function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  if(endDate(this.resolved)) return "left: "+Math.round(minutes*100/hole-4)+"%;";
                  return "left: "+Math.round(minutes*100/hole-5)+"%;";
                }
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
                    'yearClass': date.getFullYear(),
                    'tickMonth': makeMonth(date)});
      }
      return years;
    }
    var ticks = makeYear(new Date());

    function currentIncedent(){
      var current = [];
      for(var i=0; i<infoIncident.length; i++){
        if(!infoIncident[i]['planned_work'] && !infoIncident[i]['resolved']){
          var createdMs = Date.parse(infoIncident[i]['created']);
          var created= new Date(createdMs);
          current.push({
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
            'impact': infoIncident[i]['impact'],
            'status': infoIncident[i]['status'],
            'updated': infoIncident[i]['updated'],
            'resolved': new Date()
          })
        }else if(infoIncident[i]['planned_work']){
          createdMs = Date.parse(infoIncident[i]['planned_work_created']);
          resolvedMs = Date.parse(infoIncident[i]['planned_work_resolved']); 
          created = new Date(createdMs);
          resolved = new Date(resolvedMs);
          if(resolvedMs>new Date().getTime() && createdMs<=new Date().getTime()){
            current.push({
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
              'impact': infoIncident[i]['impact'],
              'status': infoIncident[i]['status'],
              'updated': infoIncident[i]['updated'],
              'resolved': resolved
            })
          }
        }
      }
      current.sort(compareTime)
      return (current.length)?current:false;
    }
    currentUnsolved = [{
      "currentIncedents": currentIncedent(),
      "styleToShow": function(){
        return (this.currentIncedents)?"showTitle":"hiddenTitle";
      }
    }]
    console.log(currentUnsolved)
   	var template = $('#incidentsTemplate').html();

  	var output = Mustache.render(template, {incidents: incidents, /*getСomponent: getСomponent,*/ /*components: components,*/ ticks: ticks, /*, infoIncident: infoIncident,*/infoComponent: infoComponent, infoPhoneCountries: infoPhoneCountries, currentUnsolved: currentUnsolved});

  	 $('body').html(output);


$('#target').tooltip({
    items: 'span.icon-indicator',
    content: 'Operational',
    position: { my: 'center top', at: 'center-5 bottom-57' },
    show: null, 
    open: function(event, ui)
    {
        if (typeof(event.originalEvent) === 'undefined')
        {
            return false;
        }
        
        var $id = $(ui.tooltip).attr('id');
        
        $('div.ui-tooltip').not('#' + $id).remove();
       
    },
    close: function(event, ui)
    {
        ui.tooltip.hover(function()
        {
            $(this).stop(true).fadeTo(400, 1); 
        },
        function()
        {
            $(this).fadeOut('400', function()
            {
                $(this).remove();
            });
        });
    }
});

  $(document).ready(function(){
    $('.updates-dropdown-sections-container #updates-dropdown-email').css('display', 'block'); 
    $('.updates-dropdown-nav a.updates-dropdown-email-btn').addClass('active');
  });
  $('div.subscribe').on("click", function(e) {
    $('.updates-dropdown').toggle(); 
    e.stopPropagation();    
  });
  $('.updates-dropdown').on("click", function(e) {
    e.stopPropagation(); 
  }); 
  $('a#phone-country').on("click", function() {
    $('select.phone-country').css("display", "block");      
    $("select.phone-country").val("us");
    $('div#updates-dropdown-sms p.help-block').css("display", "none");
  });
  $('.updates-dropdown-nav a.updates-dropdown-email-btn').on("click", function() {
    $('.updates-dropdown-section').css("display", "none"); 
    $('.updates-dropdown-sections-container #updates-dropdown-email').css("display", "block");
    $('.updates-dropdown-nav a').removeClass('active');
    $('.updates-dropdown-nav a.updates-dropdown-email-btn').addClass('active');
  });
  $('.updates-dropdown-nav a.updates-dropdown-sms-btn').on("click", function() { 
    $('.updates-dropdown-section').css("display", "none");    
    $('.updates-dropdown-sections-container #updates-dropdown-sms').css("display", "block");
    $('.updates-dropdown-nav a').removeClass('active');
    $('.updates-dropdown-nav a.updates-dropdown-sms-btn').addClass('active');
  });
  $('.updates-dropdown-nav a.updates-dropdown-webhook-btn').on("click", function() {
    $('.updates-dropdown-section').css("display", "none");
    $('.updates-dropdown-sections-container #updates-dropdown-webhook').css("display", "block");
    $('.updates-dropdown-nav a').removeClass('active');
    $('.updates-dropdown-nav a.updates-dropdown-webhook-btn').addClass('active');
  });
  $('.updates-dropdown-nav a.updates-dropdown-twitter-btn').on("click", function() {
    $('.updates-dropdown-section').css("display", "none"); 
    $('.updates-dropdown-sections-container #updates-dropdown-twitter').css("display", "block");
    $('.updates-dropdown-nav a').removeClass('active');
    $('.updates-dropdown-nav a.updates-dropdown-twitter-btn').addClass('active');
  });
  $('.updates-dropdown-nav a.updates-dropdown-support-btn').on("click", function() {
    $('.updates-dropdown-section').css("display", "none");
    $('.updates-dropdown-sections-container #updates-dropdown-support').css("display", "block");
    $('.updates-dropdown-nav a').removeClass('active');
    $('.updates-dropdown-nav a.updates-dropdown-support-btn').addClass('active');
  });
  $('.updates-dropdown-nav a.updates-dropdown-atom-btn').on("click", function(e) {
    $('.updates-dropdown-section').css("display", "none");   
    $('.updates-dropdown-sections-container #updates-dropdown-atom').css("display", "block");
    $('.updates-dropdown-nav a').removeClass('active');
    $('.updates-dropdown-nav a.updates-dropdown-atom-btn').addClass('active');
    e.stopPropagation(); 
  });
  $('.updates-dropdown-nav a.updates-dropdown-close-btn').on("click", function() {
    $(".updates-dropdown").hide();
  });
  $(document).click(function(){
    $(".updates-dropdown").hide();
  });

  var regError409  = /("status":409)/;
  var regError422  = /("status":422)/;
  var regError201  = /("status":201)/;
  
  $("#subscribe-btn-email").click(function(event) {
    var xhr = new XMLHttpRequest();
    var emailElement = $('input#email');
    if(emailElement.is(":valid")){
      $.ajax({
        url: 'https://o6c6px2doa.execute-api.us-west-2.amazonaws.com/prod/Subscribers', 
        type: 'POST',
        crossdomain: true, 
        contentType: "application/json",
        dataType: 'text',
        data: JSON.stringify({
                  "subscriber": {    
                    "email": emailElement.val()  
                  }
                }),
        complete: function(xhr, textStatus) {
          if(xhr.responseText.search(regError409) !== -1){
            $('.infoLine').css('display', 'block');
            $('.infoLine').css('background-color', '#3498db');
            $('.infoLine').css('border', '1px solid #167abd');              
            $('.infoLine span').html('This email is already subscribed to updates.');
            setTimeout("$('.infoLine').css('display', 'none')", 7000);
          }else if(xhr.responseText.search(regError422) !== -1){
            $('.infoLine').css('display', 'block');
            $('.infoLine').css('background-color', '#e74c3c');
            $('.infoLine').css('border', '1px solid #c92e1e');
            $('.infoLine span').html('Please enter a valid email or a phone number that you wish to have updates sent to.');
            setTimeout("$('.infoLine').css('display', 'none')", 7000);
          }else if(xhr.responseText.search(regError201) !==-1){
            $('input#email').val('');
            $(".updates-dropdown").hide();         
            $('.infoLine').css('display', 'block');
            $('.infoLine').css('background-color', '#3498db');
            $('.infoLine').css('border', '1px solid #167abd');
            $('.infoLine span').html('Your email is now subscribed to updates! A confirmation message should arrive soon.');
            setTimeout("$('.infoLine').css('display', 'none')", 7000);
          }
        } 
      })
    }
  });
  $("select.phone-country").val("us");
  $("#subscribe-btn-sms").click(function(event) {
    var phoneElement = $('input#phone-number');    
    var codeCountry = $("select.phone-country option:selected").val();
    if(phoneElement.is(":valid")){
      $.ajax({
        url: 'https://o6c6px2doa.execute-api.us-west-2.amazonaws.com/prod/Subscribers', 
        type: 'POST',
        crossdomain: true, 
        dataType: 'text',
        contentType: "application/json",
        data: JSON.stringify({
                  "subscriber": {
                    "phone_number": phoneElement.val(),
                    "phone_country": codeCountry
                  }
                }),       
        complete: function(xhr, textStatus) {
          if(xhr.responseText.search(regError409) !== -1){
            $('.infoLine').css('display', 'block');
            $('.infoLine').css('background-color', '#3498db');
            $('.infoLine').css('border', '1px solid #167abd');              
            $('.infoLine span').html('This phone is already subscribed to updates.');
            setTimeout("$('.infoLine').css('display', 'none')", 7000);
          }else if(xhr.responseText.search(regError422) !== -1){
            $('.infoLine').css('display', 'block');
            $('.infoLine').css('background-color', '#e74c3c');
            $('.infoLine').css('border', '1px solid #c92e1e');
            $('.infoLine span').html('Please enter a valid email or a phone number that you wish to have updates sent to.');
            setTimeout("$('.infoLine').css('display', 'none')", 7000);
          }else if(xhr.responseText.search(regError201) !==-1){
            $('input#email').val('');
            $(".updates-dropdown").hide();         
            $('.infoLine').css('display', 'block');
            $('.infoLine').css('background-color', '#3498db');
            $('.infoLine').css('border', '1px solid #167abd');
            $('.infoLine span').html('Your phone is now subscribed to updates! A confirmation message should arrive soon.');
            setTimeout("$('.infoLine').css('display', 'none')", 7000);
          }
        } 
      })
    }
  });

  $("#subscribe-btn-webhook").click(function(event) {
    var emailElement = $('input#email-webhooks');
    var endpointWebhooks = $("input#endpoint-webhooks");
    if(emailElement.is(":valid") && endpointWebhooks.is(":valid")){
      $.ajax({
        url: 'https://o6c6px2doa.execute-api.us-west-2.amazonaws.com/prod/Subscribers', 
        type: 'POST',
        crossdomain: true, 
        dataType: 'text', 
        contentType: "application/json",
        data: JSON.stringify({
                  "subscriber": {
                    "email": emailElement.val(),
                    "endpoint": endpointWebhooks.val()
                  }
                }),
        complete: function(xhr, textStatus) {
          if(xhr.responseText.search(regError409) !== -1){
            $('.infoLine').css('display', 'block');
            $('.infoLine').css('background-color', '#3498db');
            $('.infoLine').css('border', '1px solid #167abd');              
            $('.infoLine span').html('Please enter an endpoint and a valid email at which you can be reached.');
            setTimeout("$('.infoLine').css('display', 'none')", 7000);
          }else if(xhr.responseText.search(regError422) !== -1){
            $('.infoLine').css('display', 'block');
            $('.infoLine').css('background-color', '#e74c3c');
            $('.infoLine').css('border', '1px solid #c92e1e');
            $('.infoLine span').html('Please enter an endpoint and a valid email at which you can be reached.');
            setTimeout("$('.infoLine').css('display', 'none')", 7000);
          }else if(xhr.responseText.search(regError201) !==-1){
            $('input#email').val('');
            $(".updates-dropdown").hide();         
            $('.infoLine').css('display', 'block');
            $('.infoLine').css('background-color', '#3498db');
            $('.infoLine').css('border', '1px solid #167abd');
            $('.infoLine span').html('Your endpoint is now subscribed to webhook updates. A confirmation message should arrive soon.');
            setTimeout("$('.infoLine').css('display', 'none')", 7000);
          }
        } 
      })
    }
  });        

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

      //dropdown for the tick-tacks
      $("<style type='text/css' id='dynamic' />").appendTo("head");
      $('div.mainBlockYear ul.tick-tacks_block .tick-tacks').on("click", function(e){
        var elemPrevious = $(".tick-tacks").filter(".active");
        var blockPrevious = $(".mainBlockYear .tick-tacks_detailed").filter(".active");
        if(elemPrevious.is(":visible")){
          var monthPrev = elemPrevious.parent().parent().prop('className').split(" ")[1];
          var monthNumberPrev = takeNumber(monthPrev.slice(-2));
          var yearPrev = elemPrevious.parent().parent().parent().prop('className').slice(-4);
          var dayPrev = takeNumber(elemPrevious.prop('className').split(" ")[1]);
          var heightPrevElem = blockPrevious.outerHeight();
        }
        var month = $(this).parent().parent().prop('className').split(" ")[1];
        var year = $(this).parent().parent().parent().prop('className').slice(-4);
        var monthNumber = takeNumber(month.slice(-2));
        var day = takeNumber($(this).prop('className').split(" ")[1]); 
         $("."+year+" #"+month+"-"+day+"-"+year).toggleClass("active");  
        $(".mainBlockYear .tick-tacks_detailed").not($("."+year+" #"+month+"-"+day+"-"+year)).removeClass("active");
        var anchor = $(this).parent().parent().prev().offset().top;
        console.log()
        if(elemPrevious.is(":visible")){
          if(+yearPrev >= +year && +monthNumberPrev > +monthNumber){
            anchor = $(this).parent().parent().prev().offset().top - heightPrevElem - 10;
          }
        }
        var timeScroll = 2000
        if($("."+year+" #"+month+"-"+day+"-"+year).height()>1000 || (elemPrevious.is(":visible") && Math.abs($("."+year+" #"+month+"-"+day+"-"+year).height() - heightPrevElem)>700)){
          console.log("kkk");
          timeScroll = 4000
        }
        $('body, html').animate({ 'scrollTop': anchor }, timeScroll);
        $('.'+month+' .tick'+day).toggleClass("active");
        $('ul.tick-tacks_block .tick-tacks').not($('.'+month+' .tick'+day)).removeClass("active");
        if($("."+year+" #"+month+"-"+day+"-"+year).hasClass('active')){
          var sel = "#"+month+"-"+day+"-"+year;
          var left = $(this).parent().position().left+19;
          $("#dynamic").text(".mainBlockYear "+sel+ ".tick-tacks_detailed.active:after, .mainBlockYear "+sel+".tick-tacks_detailed.active:before {left:"+left +"px;}");
          self = $(this);
          $(window).resize(function(){
            var left = self.parent().position().left+19;
            $("#dynamic").text(".mainBlockYear "+sel+ ".tick-tacks_detailed.active:after, .mainBlockYear "+sel+".tick-tacks_detailed.active:before {left:"+left +"px;}");
          });
        }

      });

      $('.mainBlockforMobile .tick-tacks').on("click", function(){
        var month = $(this).parent().parent().parent().parent().prop('className').split(" ")[1];
        var year = $(this).parent().parent().parent().parent().parent().parent().prop('className').slice(-4);
        var monthNumber = takeNumber(month.slice(-2));
        var day = takeNumber($(this).prop('className').split(" ")[1]);
        $(".mainBlockforMobile."+year+" #mob-"+month+"-"+day+"-"+year).toggleClass("active");  
        $(".mainBlockforMobile .tick-tacks_detailed").not($("."+year+" #mob-"+month+"-"+day+"-"+year)).removeClass("active");
        $('.'+month+' .tick'+day).toggleClass("active");
        $('tr.tick-tacks_block .tick-tacks').not($('.'+month+' .tick'+day)).removeClass("active");
      });
      
     

//CREATION OF GRAFIC


    //function for filter enter json by dates
    function filterDateForGraf(date){
      var dayEv = []
      var end = Date.parse(date);
      var begin = date.setHours(date.getHours()-24);
      for(var i=0; i<infoIncident.length; i++){
        if(!infoIncident[i]['planned_work']){
          var createdMs = Date.parse(infoIncident[i]['created']);
          var resolvedMs = Date.parse(infoIncident[i]['resolved']) || Date.parse(new Date()); 
          var created= new Date(createdMs);
          var resolved = new Date(resolvedMs);
          if(resolvedMs>=begin){
            resolved = (resolvedMs<=end)?resolved:new Date(end)
            if(createdMs>=begin){
              dayEv.push({
                'id': infoIncident[i]['id'],
                'name': infoIncident[i]['name'],
                'created': created,
                'color': infoIncident[i]['color'],
                'z-index': infoIncident[i]['z-index'],
                'graf_created_data': true,
                'graf_resolved_data': true,
                'resolved': resolved
              });
            }else if(createdMs<begin){
              created = new Date(begin);
              dayEv.push({
                'id': infoIncident[i]['id'],
                'name': infoIncident[i]['name'],
                'created': created,
                'color': infoIncident[i]['color'],
                'z-index': infoIncident[i]['z-index'],
                'graf_created_data': true,
                'graf_resolved_data': true,
                'resolved': resolved
              });
            }
          }          
        }else{
          createdMs = Date.parse(infoIncident[i]['planned_work_created']);
          resolvedMs = Date.parse(infoIncident[i]['planned_work_resolved']); 
          created = new Date(createdMs);
          resolved = new Date(resolvedMs);
          if(resolvedMs>=begin && createdMs<end){
            resolved = (resolvedMs<=end)?resolved:new Date(end);
            if(createdMs>=begin){
              dayEv.push({
                'id': infoIncident[i]['id'],
                'name': infoIncident[i]['name'],
                'created': created,
                'color': infoIncident[i]['color'],
                'z-index': infoIncident[i]['z-index'],
                'graf_created_data': true,
                'graf_resolved_data': true,
                'resolved': resolved
              });
            }else if(createdMs<begin){
              created = new Date(begin);
              dayEv.push({
                'id': infoIncident[i]['id'],
                'name': infoIncident[i]['name'],
                'created': created,
                'color': infoIncident[i]['color'],
                'z-index': infoIncident[i]['z-index'],
                'graf_created_data': true,
                'graf_resolved_data': true,
                'resolved': resolved
              });
            }
          }
        }
      }
      dayEv.sort(compareTimeReverse);
      comapereDateForGraf(dayEv, 'graf_created_data', 'graf_resolved_data', false);
      dayEv.sort(compareTimeReverse);
      console.log(dayEv)
      return dayEv;
    }

    //check events. if one event is in another, then one of the value 'graf_created_data', 'graf_resolved_data' would be false.
    function comapereDateForGraf(dayEv, start, end, value){
      for(var t=0; t<dayEv.length; t++){
        for(var z=t+1; z<dayEv.length; z++){
          if(dayEv[t]['created'].getTime()<=dayEv[z]['created'].getTime() && dayEv[t]['resolved'].getTime()>=dayEv[z]['resolved'].getTime() && (+dayEv[t]['z-index'].slice(-3, -1))>=(+dayEv[z]['z-index'].slice(-3, -1))){
              dayEv[z][start] = value;
              dayEv[z][end] = value;
          }
          if(dayEv[t]['created'].getTime()<=dayEv[z]['created'].getTime() && dayEv[z]['created'].getTime()<=dayEv[t]['resolved'].getTime() && dayEv[z]['resolved'].getTime()>dayEv[t]['resolved'].getTime()){
            if((+dayEv[t]['z-index'].slice(-3, -1))>(+dayEv[z]['z-index'].slice(-3, -1))){
              dayEv[z][start] = value;
            }else if((+dayEv[t]['z-index'].slice(-3, -1))<(+dayEv[z]['z-index'].slice(-3, -1))){
              dayEv[t][end] = value;
            }else if((+dayEv[t]['z-index'].slice(-3, -1))==(+dayEv[z]['z-index'].slice(-3, -1))){
              dayEv[z][start] = value;
              dayEv[t][end] = value;
            }
          }
        }
      }
    }


    //create json for grafic
    function grafTime(d){
        var arr = [];
        for(var i=0; i<d.length; i++){
          if((d[i]['graf_created_data'] || d[i]['graf_resolved_data'])){
            created = {'timeData': (d[i]['graf_created_data'])?d[i]['created']:null, 
                        'color': d[i]['color'], 
                        'percent': takePercent(d[i]['color'], classTickTack),
                        'name': [d[i]['name']]};
            resolved = {'timeData': (d[i]['graf_resolved_data'])?d[i]['resolved']:null, 
                        'color': d[i]['color'], 
                        'percent': takePercent(d[i]['color'], classTickTack),
                        'name': [d[i]['name']]};
            arr.push([created, resolved])
          }
        }
        mapArray(arr);
        if(arr.length>0 && startDate(arr[0][0]['timeData']) && arr[0][0]['timeData'].getTime()>new Date(new Date().setHours(new Date().getHours()-24))){
          //   for(var z=0; z<arr.length; z++){
          //     if(arr.length==1){
          //       if(endDateGraf(arr[0][1]['timeData'])){
          //         arr.splice(1, 0, [{'timeData': arr[0][1]['timeData'], 'color': classTickTack[0]['color'], 'percent': arr[0][1]['percent'], 'name': []}, {'timeData': arr[0][1]['timeData'], 'percent': 1, 'color': null, 'name': []}], [{'timeData': arr[0][1]['timeData'], 'color': classTickTack[0]['color'], 'percent': 1, 'name': []}, {'timeData': new Date(new Date().getHours(new Date().getHours()-24)), 'percent': 1, 'color': null, 'name': []}])
          //       }
          //     }else if((z+1)<arr.length && arr[z][1]['timeData'].getTime()<arr[z+1][0]['timeData'].getTime()){
          //       arr.splice(1, 0, [{'timeData': arr[z][1]['timeData'], 'color': classTickTack[0]['color'], 'percent': arr[z][0]['percent'], 'name': []}, {'timeData': arr[z][1]['timeData'], 'percent': 1, 'color': null, 'name': []}], [{'timeData': arr[z][1]['timeData'], 'color': classTickTack[0]['color'], 'percent': 1, 'name': []}, {'timeData': arr[z+1][0]['timeData'], 'percent': 1, 'name': []}], [{'timeData': arr[z+1][0]['timeData'], 'color': arr[z+1][0]['color'], 'percent': 1, 'name': []}, {'timeData': arr[z+1][0]['timeData'], 'percent': arr[z+1][0]['percent'], 'name': []}])
          //     }else if((z+1)<arr.length && arr[z][1]['timeData'].getTime()>=arr[z+1][0]['timeData'].getTime()){
          //       if(arr[z][0]['percent']>arr[z+1][0]['percent']){ 
          //         arr.splice(z+1, 0, [{'timeData': arr[z][1]['timeData'], 'color': arr[z+1][1]['color'], 'percent': arr[z][1]['percent'], 'name': []}, {'timeData': arr[z][1]['timeData'], 'percent': arr[z+1][0]['percent'], 'color': null, 'name': []}])
          //       }else if(arr[z][0]['percent']==arr[z+1][0]['percent'] && arr[z][0]['color']==classTickTack[2]['color'] && arr[z+1][0]['color']==classTickTack[1]['color']){
          //         arr.splice(z+1, 0, [{'timeData': arr[z+1][0]['timeData'], 'color': arr[z+1][0]['color'], 'percent': arr[z+1][0]['percent'], 'name': []}, {'timeData': arr[z+1][1]['timeData'], 'percent': arr[z+1][0]['percent'], 'color': null, 'name': []}])

          //       }
          //     }
          // }
          arr.unshift([{'timeData': new Date(new Date().setHours(new Date().getHours()-24)), 'color': classTickTack[0]['color'], 'percent': 1, 'name': []}, {'timeData': arr[0][0]['timeData'], 'percent': 1, 'color': null, 'name': []}],
              [{'timeData': arr[0][0]['timeData'], 'color': arr[0][0]['color'], 'percent': 1, 'name': []}, {'timeData': arr[0][0]['timeData'], 'percent': arr[0][0]['percent'], 'color': null, 'name': [arr[0][0]['name']]}]);
        }
        var newArr = [];
        for(var t=0; t<arr.length; t++){
          if((t+1)<arr.length){
            if(arr[t][1]['timeData'].getTime()<arr[t+1][0]['timeData'].getTime()){
              newArr.push([{'timeData': arr[t][1]['timeData'], 'color': classTickTack[0]['color'], 'percent': arr[t][0]['percent'], 'name': [arr[t][0]['name']]}, {'timeData': arr[t][1]['timeData'], 'color': classTickTack[0]['color'], 'percent': 1, 'name': []}], [{'timeData': arr[t][1]['timeData'], 'color': classTickTack[0]['color'], 'percent': 1, 'name': []}, {'timeData': arr[t+1][0]['timeData'], 'color': classTickTack[0]['color'], 'percent': 1, 'name': []}],
                [{'timeData': arr[t+1][0]['timeData'], 'color': arr[t+1][0]['color'], 'percent': 1, 'name': []}, {'timeData': arr[t+1][0]['timeData'], 'color': arr[t+1][0]['color'], 'percent': arr[t+1][0]['percent'], 'name': [arr[t+1][0]['name']]}])
            }else if(arr[t][1]['timeData'].getTime()>=arr[t+1][0]['timeData'].getTime()){

              
              if(arr[t][0]['percent']>arr[t+1][0]['percent']){ 
                arr[t][1]['timeData']=arr[t+1][0]['timeData'];
                arr.splice(t+1, 0, [{'timeData': arr[t][1]['timeData'], 'color': arr[t+1][1]['color'], 'percent': arr[t][1]['percent'], 'name': [arr[t][1]['name']]}, {'timeData': arr[t][1]['timeData'], 'percent': arr[t+1][0]['percent'], 'color': null, 'name': 1, 'name': [arr[t][1]['name']]}])
              }else if(arr[t][0]['percent']<arr[t+1][0]['percent']){
                arr[t+1][0]['timeData']=arr[t][1]['timeData'];
                arr.splice(t+1, 0, [{'timeData': arr[t][1]['timeData'], 'color': arr[t][0]['color'], 'percent': arr[t][1]['percent'], 'name': [arr[t][1]['name']]}, {'timeData': arr[t][1]['timeData'], 'percent': arr[t+1][0]['percent'], 'color': null, 'name': [arr[t][1]['name']]}])
              
              }else if(arr[t][0]['percent']==arr[t+1][0]['percent'] && arr[t][0]['color']==classTickTack[2]['color'] && arr[t+1][0]['color']==classTickTack[1]['color']){
                
                arr.splice(t+1, 0, [{'timeData': arr[t+1][0]['timeData'], 'color': arr[t+1][0]['color'], 'percent': arr[t+1][0]['percent'], 'name': [arr[t+1][0]['name']]}, {'timeData': arr[t+1][1]['timeData'], 'percent': arr[t+1][0]['percent'], 'color': null, 'name': [arr[t+1][1]['name']]}])

              }
            }else if(arr[t][1]['timeData'].getTime()<=arr[t+1][1]['timeData'].getTime()){
              if(arr[t][0]['timeData'].getTime()<=arr[t+1][0]['timeData'].getTime()){
                if(arr[t][0]['percent']>arr[t+1][0]['percent']){ 
                  arr[t+1][0]['timeData']=arr[t][1]['timeData'];
                } 
              }

            }
          }
          newArr.push(arr[t])
        }  
        arr = newArr;
        var latestDate = findLatesDate(arr)
        if(arr.length>0 && endDateGraf(arr[latestDate][1]['timeData'], new Date())){
          arr.push([{'timeData': arr[latestDate][1]['timeData'], 'color': classTickTack[0]['color'], 'percent': arr[latestDate][1]['percent'], 'name': arr[latestDate][1]['name']}, {'timeData': arr[latestDate][1]['timeData'], 'percent': 1, 'name': []}], [{'timeData': arr[latestDate][1]['timeData'], 'percent': 1, color: classTickTack[0]['color'], 'name': []}, {'timeData': new Date(), 'percent': 1, 'name': []}]);
        }
        for(var x=0; x<arr.length; x++){
          for(var e=x+1; e<arr.length; e++){
            if(arr[x][0]['timeData'] == arr[e][0]['timeData'] && arr[x][1]['timeData'] == arr[e][1]['timeData'] && arr[x][0]['percent'] == arr[e][0]['percent'] && arr[x][1]['percent'] == arr[e][1]['percent'] && arr[x][0]['color'] == arr[e][0]['color'] && arr[x][1]['color'] == arr[e][1]['color']){
              arr.splice(e, 1);
              e--;
            }
          }
        }
        
          for(var t=0; t<d.length; t++){
            for(var c=0; c<arr.length; c++){
            // if((c+1)<arr.length && arr[c][0]['percent'] == arr[c+1][0]['percent'] && arr[c][0]['color']==classTickTack[2]['color'] && arr[c+1][0]['color']==classTickTack[1]['color']){
            //   if(d[t]['created'].getTime()==arr[c][0]['timeData'].getTime() && d[t]['resolved'].getTime()==arr[c][1]['timeData'].getTime()){
                
            //     if(!(~arr[c][0]['name'].indexOf(d[t]['name']))) arr[c][0]['name'].push(d[t]['name']);
                
            //     if(!(~arr[c+1][0]['name'].indexOf(d[t]['name']))) arr[c+1][0]['name'].push(d[t]['name']);
            //     if((c-1)>0){
            //       if(!(~arr[c-1][1]['name'].indexOf(d[t]['name']))) arr[c-1][1]['name'].push(d[t]['name']);
            //       if(!(~arr[c-1][0]['name'].indexOf(d[t]['name']))) arr[c-1][0]['name'].push(d[t]['name']);
            //     }
            //     if((c-2)>0){
            //       if(!(~arr[c-2][1]['name'].indexOf(d[t]['name']))) arr[c-2][1]['name'].push(d[t]['name']);
            //       if(!(~arr[c-2][0]['name'].indexOf(d[t]['name']))) arr[c-2][0]['name'].push(d[t]['name']);
            //     }
            //   }
            // }
            // if((c+1)<arr.length && arr[c][0]['percent'] == arr[c+1][0]['percent'] && arr[c+1][0]['color']==classTickTack[2]['color'] && arr[c][0]['color']==classTickTack[1]['color']){
            //   if(d[t]['created'].getTime()==arr[c][0]['timeData'].getTime() && d[t]['resolved'].getTime()==arr[c][1]['timeData'].getTime()){
            //     if(!(~arr[c][0]['name'].indexOf(d[t]['name']))) arr[c][0]['name'].push(d[t]['name']);
            //     if(!(~arr[c][1]['name'].indexOf(d[t]['name']))) arr[c][1]['name'].push(d[t]['name']);
            //   }
            // }
            if( d[t]['created'].getTime()>=arr[c][0]['timeData'].getTime() && d[t]['resolved'].getTime()<=arr[c][1]['timeData'].getTime()){
              if(!(~arr[c][0]['name'].indexOf(d[t]['name']))) arr[c][0]['name'].push(d[t]['name']);
              if(!(~arr[c][1]['name'].indexOf(d[t]['name']))) arr[c][1]['name'].push(d[t]['name']);
              // if((c+1)<arr.length){
              //   if(!(~arr[c+1][0]['name'].indexOf(d[t]['name']))) arr[c+1][0]['name'].push(d[t]['name']);
              // }
              // if((c-1)>0){
              //   if(!(~arr[c-1][1]['name'].indexOf(d[t]['name']))) arr[c-1][1]['name'].push(d[t]['name']);
              //   if(!(~arr[c-1][0]['name'].indexOf(d[t]['name']))) arr[c-1][0]['name'].push(d[t]['name']);
              // }
              // if((c-2)>0){
              //   if(!(~arr[c-2][1]['name'].indexOf(d[t]['name']))) arr[c-2][1]['name'].push(d[t]['name']);
              //   if(!(~arr[c-2][0]['name'].indexOf(d[t]['name']))) arr[c-2][0]['name'].push(d[t]['name']);
              // }
            }
          }

        }
        arr.sort(compareGraf)
        return (arr.length)?arr:[[{'timeData': new Date(new Date().setHours(new Date().getHours()-24)), 'color': classTickTack[0]['color'], 'percent': 1, 'name': []}, {'timeData': new Date(), 'percent': 1, 'name':[]}]];
      }

   
    var data =  grafTime(filterDateForGraf(new Date()))

    var colors = [];

    data.forEach(function(item){
      if(item[0]['color']) colors.push(item[0]['color'])
    })

    //Create Margins and Axis and hook our zoom function

    var margin = {top: 20, right: 100, bottom: 30, left: 150},
        width = 700- margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var marginMobile = {top: 15, right: 60, bottom: 30, left: 40},
        widthMobile = 500- margin.left - margin.right,
        heightMobile = 200 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .domain([new Date(new Date().setHours(new Date().getHours()-24)), new Date(new Date().setMinutes(new Date().getMinutes()+30))])
        .range([6, width+4]);

    var xMobile = d3.time.scale()
        .domain([new Date(new Date().setHours(new Date().getHours() - 24)), new Date(new Date().setMinutes(new Date().getMinutes()+30))])
        .range([10, widthMobile-6]);
     
    var y = d3.scale.linear()
        .domain([-0.05, 1.05])
        .range([height-5, 0]);

    var yMobile = d3.scale.linear()
        .domain([-0.05, 1.07])
        .range([heightMobile, 0]);

    var format = d3.time.format("%I:%M %p");
    var formatAxis = function(d) { return (d==0)?"Outage /\n\nPlanned":(d==0.67)?"Interruption":(d==0.33)?"Significant\n\ndegradation":"Upwork"}
    var formatMobile = function(d) { return (d==0)?"Outage":(d==0.67)?"Interruption":(d==0.33)?"Significant\ndegradation":"Upwork"}


    var xAxis = d3.svg.axis()
      .scale(x)
      .ticks(d3.time.hours, 4)
      .tickFormat(d3.time.format("%I %p"))
      .tickPadding(8)   
      .orient("bottom");  

    var xAxisMob = d3.svg.axis()
      .scale(xMobile)
      .ticks(d3.time.hours, 6)
      .tickFormat(d3.time.format("%I %p"))
      .tickPadding(8)   
      .orient("bottom"); 
      
    var yAxis = d3.svg.axis()
      .scale(y)
      .tickPadding(7)
      .ticks(4)
      .tickValues([0, 0.33, 0.67, 1]) 
      .tickSize(-width, 0)
      .tickFormat(formatAxis)  
      .orient("left"); 

    var yAxisMob = d3.svg.axis()
      .scale(yMobile)
      .tickPadding(7)
      .ticks(4)
      .tickValues([0, 0.33, 0.67, 1]) 
      .tickSize(-widthMobile, 0) 
      .orient("left"); 
      
    // Generate our SVG object

    var svg = d3.select("#graf").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr('id', 'chart')
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var svg1 = d3.select("#grafResize").append("svg")
        .attr("width", widthMobile + marginMobile.left + marginMobile.right)
        .attr("height", heightMobile + marginMobile.top + marginMobile.bottom)
        .attr('id', 'chart')
      .append("g")
        .attr("transform", "translate(" + marginMobile.left + "," + marginMobile.top + ")");
     
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
     
    svg1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightMobile + ")")
        .call(xAxisMob);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll("#graf .tick text")


    // function wrap(text, width) {
     svg.selectAll(".y .tick text").each(function() {
        var width = 50;
        var text = d3.select(this),
            words = text.text().split(/\s[^ /]/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", -7).attr("y", -21).attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word).attr('fill', function(){var t = d3.select(this).text(); return (t=='Outage /')?'#ce4436':(t=='Planned')?classTickTack[2]["color"]:(t=='Significant' || t=='degradation')?'#ff6600':(t=='Interruption')?'#f5c340':'#8eb01e'});
          }
        }
      });


    svg1.append("g")
        .attr("class", "y axis")
        .call(yAxisMob)
        .selectAll("#grafResize .tick text")

    svg1.selectAll(".y .tick").each( function(d) {
             var p = d3.select(this);
             p.append('circle')
            .attr('fill',function(){return (d=='0.0')?'#ce4436':(d=='0.33')?'#ff6600':(d=='0.67')?'#f5c340':'#8eb01e'})
            .attr("r", 5)
         });
     
    svg.append("g")
      .attr("class", "y axis")
      .append("text")
      .attr("class", "axis-label") 

    svg1.append("g")
      .attr("class", "y axis")
      .append("text")
      .attr("class", "axis-label") 
     
    svg.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    svg1.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", widthMobile)
      .attr("height", heightMobile);
     
    var div = d3.select("#graf").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var div1 = d3.select("#grafResize").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Create D3 line object and draw data on our SVG object

    var line = d3.svg.line()
        .interpolate("linear")  
        .x(function(d) { return x(new Date(d.timeData)); })
        .y(function(d) { return y(d.percent); });   

    var line1 = d3.svg.line()
        .interpolate("linear")  
        .x(function(d) { return xMobile(new Date(d.timeData)); })
        .y(function(d) { return yMobile(d.percent); });  
      
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
        svg.selectAll('.line').sort(function (a, b) { 
          if (a[1].percent>b[1].percent || (a[1].percent==b[1].percent && a[1].color==classTickTack[2]['color'])) return -1;               
          else return 1;                             
      });
      
    svg1.selectAll('.line')
      .data(data)
      .enter()
      .append("path")
        .attr("class", "line")
      .attr("clip-path", "url(#clip)")
      .attr('stroke', function(d,i){      
        return colors[i%colors.length];
      })
        .attr("d", line1); 
        svg1.selectAll('.line').sort(function (a, b) { 
          if (a[1].percent>b[1].percent || (a[1].percent==b[1].percent && a[1].color==classTickTack[2]['color'])) return -1;               
          else return 1;                             
      });

    // Draw points on SVG object based on the data given

    var points = svg.selectAll('.dots')
      .data(data)
      .enter()
      .append("g")
        .attr("class", "dots")
      .attr("clip-path", "url(#clip)"); 

    var points1 = svg1.selectAll('.dots')
      .data(data)
      .enter()
      .append("g")
        .attr("class", "dots")
      .attr("clip-path", "url(#clip)"); 
     
    points.selectAll('.dot')
      .data(function(d, index){     
        var a = [];
        d.forEach(function(point,i, arr){
          a.push({'index': index, 'point': point});
        });   
        return a;
      })
      .enter()
      .append('circle')
      .attr('class','dot')
      .attr("r", 3)
      .on("mouseover", function(d) {  
                div.transition()    
                    .duration(200)    
                    .style("opacity", .9);   
                var word =  (d.point.name)?d.point.name.join(",").replace(',', ', '):"";
                var top = d3.select(this).node().getBoundingClientRect().top;
                var left = d3.select(this).node().getBoundingClientRect().left;
                div .html(format(new Date(d.point.timeData)) + "<br/> "  + word) 
                    .style("left", positionX(left) + 13 + "px")   
                    .style("top", positionY(top) + "px");  
                })  
      .on("mouseout", function(d) {   
                div.transition()    
                    .duration(500)    
                    .style("opacity", 0); 
            }) 
      .attr('stroke', function(d,i){  
        return colors[d.index%colors.length];
      }) 
      .attr("transform", function(d) { 
        return "translate(" + x(d.point.timeData) + "," + y(d.point.percent) + ")"; }
      );
      svg.selectAll('.dot').sort(function (a, b) { 
          if(+countZIndex(a.point.color) > +countZIndex(b.point.color) || (a.point.percent==b.point.percent && a.point.color==classTickTack[2]['color'])) return -1;               
          else return 1;                             
      });

    points1.selectAll('.dot')
      .data(function(d, index){     
        var a = [];
        d.forEach(function(point,i, arr){
          a.push({'index': index, 'point': point});
        });   
        return a;
      })
      .enter()
      .append('circle')
      .attr('class','dot')
      .attr("r", 3)
      .on("mouseover", function(d) {    
                div1.transition()    
                    .duration(200)    
                    .style("opacity", .9); 
                var word =  (d.point.name)?d.point.name.join(",").replace(',', ', '):"";
                var top = d3.select(this).node().getBoundingClientRect().top;
                var left = d3.select(this).node().getBoundingClientRect().left;
                div1.html(format(new Date(d.point.timeData)) + "<br/> "  + word) 
                    .style("left", posX(left) + 10 + "px")   
                    .style("top", posY(top) + "px");  
                })  
      .on("mouseout", function(d) {   
                div1.transition()    
                    .duration(500)    
                    .style("opacity", 0); 
            }) 
      .attr('stroke', function(d,i){  
        return colors[d.index%colors.length];
      }) 
      .attr("transform", function(d) { 
        return "translate(" + xMobile(d.point.timeData) + "," + yMobile(d.point.percent) + ")"; }
      );
      svg1.selectAll('.dot').sort(function (a, b) { 
          if (countZIndex(a.point.color)>countZIndex(b.point.color) || (a.point.percent==b.point.percent && a.point.color==classTickTack[2]['color'])) return -1;               
          else return 1;                             
      });

       
  });

    	
});


// additional functions
function positionX(t){
  return t - document.getElementById("graf").getBoundingClientRect().left - document.querySelector(".tooltip").offsetWidth/2;
}
function positionY(t){
  return t - document.getElementById("graf").getBoundingClientRect().top - document.querySelector(".tooltip").offsetHeight+22;
}

function posX(t){
  return t - document.getElementById("grafResize").getBoundingClientRect().left;
}
function posY(t){
  return t - document.getElementById("grafResize").getBoundingClientRect().top+10;
}
function countZIndex(color){
  for(var i=0; i<classTickTack.length; i++){
    if(classTickTack[i]['color'] == color) return classTickTack[i]['percent'];
  }
}

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
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + '' + ampm;
  return strTime;
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

function todayHours(param){
      return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), param.getHours(), param.getMinutes(), param.getSeconds())
    }

function mapArray(arr){
  for(var j=0; j<arr.length; j++){
    if((j+1)<arr.length){
      if(!arr[j+1][0].timeData){
        arr[j+1][0].timeData = arr[j][0].timeData;
      }
      if(!arr[j][1].timeData){
        arr[j][1].timeData = arr[j+1][1].timeData
      }
    }
  }
  // console.log(arr)
  return arr;
}
function compareTime(a, b){
  if (Date.parse(a.updated[0].created) > Date.parse(b.updated[0].created)) return -1;
  if (Date.parse(a.updated[0].created) < Date.parse(b.updated[0].created)) return 1;
}
function compareUpdate(a, b){
  if (Date.parse(a.created) > Date.parse(b.created)) return -1;
  if (Date.parse(a.created) < Date.parse(b.created)) return 1;
}
function compareTimeReverse(a, b){
  if (a.created.getTime() > b.created.getTime()) return 1;
  if (a.created.getTime() < b.created.getTime()) return -1;
}
function compareGraf(a, b){
  if (a[0].timeData.getTime() > b[0].timeData.getTime()) return 1;
  if (a[0].timeData.getTime() < b[0].timeData.getTime()) return -1;
}
function findLatesDate(d){
  var last =0;
  var index = 0;
  for(var w=0; w<d.length; w++){
        if(last<d[w][1]['timeData'].getTime()){
          last = d[w][1]['timeData'].getTime();
          index = w;
        }
      }
  return index;
}
//check if event start in the start of grafic
function startDate(data){
  return (data.getDate() + "-" + data.getHours() + ":" + data.getMinutes() ) != (new Date(new Date().setDate(new Date().getDate()-1)).getDate() + "-" + new Date().getHours(new Date().getHours()-24) + ":" + new Date().getMinutes(new Date().getHours()-24) + "");
}
function hoursCompare(data1){
  return data1.getHours()*60*60 + data1.getMinutes()*60 + data1.getSeconds();
}
//check if event finish in the end of grafic
function endDateGraf(data1){
  return (data1.getHours() + ":" + data1.getMinutes() )!= ("" + new Date().getHours() + ":" + new Date().getMinutes() + "");
}
function endDate(data1){
  return (data1.getHours() + ":" + data1.getMinutes() )!= "23:59";
}
