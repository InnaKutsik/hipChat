

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
  
  Promise.all([]).then(function(data){

    var dateEnd = new Date().getHours()*3600 + new Date().getMinutes() *60 + new Date().getSeconds();

    var infoIncident = [],
    getСomponent = [],
    infoPhoneCountries = [];
    function changeTitle(){
      return 'You can be sure - we are working stable:&nbsp';
    }    
        
    var getYear = function(){
      var date = new Date().getTime();
      for(var i=0; i<infoIncident.length; i++){
        var eventDate = Date.parse(infoIncident[i]['created']);
        if(date>eventDate) date = eventDate;
      }
      return [new Date(date).getFullYear(), new Date(date).getMonth()];
    }
    
    function getLastDayOfMonth(year, month) {
      var date = new Date(year, month + 1, 0);
      return date.getDate();
    }
    function getFirstDayOfMonth(date){
        return new Date(new Date().setDate(1)).getDay()
      }
    function countWeekPerMonth(date){
      var firstDay = getFirstDayOfMonth(date);
      var countDays = getLastDayOfMonth(date.getFullYear(), date.getMonth());
      var countWeeks = ((firstDay-1)+countDays)/7;
      return Math.ceil(countWeeks);
    }

    function MakePerMonthMob(date){
      var tick = []
      var last = getLastDayOfMonth(date.getFullYear(), date.getMonth());
      var lastDay = new Date(date.setDate(last)).getDay();
      // var lastMonday = last - lastDay+1;
      var lastSunday = last - lastDay;
      var countWeek = countWeekPerMonth(date);
      var firstDaysWeek = [lastSunday];
      for(var i=1; i<=countWeek; i++){
        var first = lastSunday - 7*i;
        if(first>-6) firstDaysWeek.push(first);
      }
      firstDaysWeek.reverse();
      for(var j=0; j<firstDaysWeek.length; j++){
        tick.push({
          "num": j,
          "dayWeek": firstDaysWeek[j],
          "tickWeek": oneWeek(date, firstDaysWeek[j])
        })
      }
      return tick;
    }

    function oneWeek(date, numDay){
      var wTeack = [];
      var last = getLastDayOfMonth(date.getFullYear(), date.getMonth())+1;
      var beforeMonth = new Date(new Date().setMonth(date.getMonth()-1))
      var lastBeforeMohth = getLastDayOfMonth(beforeMonth.getFullYear(), beforeMonth.getMonth());
      if(date.getMonth()==new Date().getMonth() && date.getYear()===new Date().getYear()){
        for(var i=numDay; i<(+numDay + 7); i++){
          if(i<=0){      
            wTeack.push({'i': lastBeforeMohth + i, 'classTick': 'unactive_tick', 'numberOfTick': 'notick', 'noActiveInfos': 'noInfo'})
          }else if(i==new Date().getDate()){
            var detailEven = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'Stable work', 'noInfo': 'noInfo'}];
            wTeack.push({'i': i, 
              'day': i,
                'numberOfTick': 'tick'+i, 
                'infoEvents': detailEv,
                'noInfo': function(){
                  var tick = this.infoEvents;
                  return (tick[0]['infoNoDate'])?tick[0]['noInfo']:'';
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
            var detailEven = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'Stable work', 'noInfo': 'noInfo'}];
            wTeack.push({'i': i, 'classTick': 'upwork', 
                'numberOfTick': 'tick'+i, 
                'day': i,
                'infoEvents': detailEv
                })
          }else if(i<last){
            var detailEv = (detailEvents(new Date(date.setDate(i)))[0]);
            if (detailEv.length>0){
              wTeack.push({'i': i, 'classTick': '', 
                          'numberOfTick': 'tick'+i, 
                          'infoEvents': detailEv,
                          'day': i,
                        })
            }else{
              wTeack.push({'day': i, 'i': i, 'classTick': '', 'numberOfTick': 'notick', 'noActiveInfos': 'noInfo'})
            }
          }else if(i>=last){
            wTeack.push({'i': i+1-last, 'classTick': 'unactive_tick', 'numberOfTick': 'tick'+i, 'noActiveInfos': 'noInfo'})
          }
        }
      }else{
        for(var i=numDay; i<(+numDay + 7); i++){
          if(i<=0){      
                wTeack.push({'i': lastBeforeMohth  + i, 'classTick': 'unactive_tick', 'numberOfTick': 'notick', 'noActiveInfos': 'noInfo'})
           }else if(i<=getLastDayOfMonth(date.getYear(), date.getMonth())){
            var detailEv = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEv.length>0)?detailEv:[{'infoNoDate': 'Stable work', 'noInfo': 'noInfo'}];
            wTeack.push({'i': i, 'classTick': 'upwork', 
                        'day': i,
                       'numberOfTick': 'tick'+i, 'noInfo': '', 
                       'infoEvents': detailEv,
                       'noInfo': function(){
                        var tick = this.infoEvents;
                        return (tick[0]['infoNoDate'])?tick[0]['noInfo']:'';
                       }
                        })
          }else if(i>=last){
            wTeack.push({'i': i+1-last, 'classText': 'unactive_tick' , 'numberOfTick': 'notick'})
          }
        }
      }
      return wTeack;
    }

    function makeMonthTicks(date){
      var tick = []
      var last = getLastDayOfMonth(date.getFullYear(), date.getMonth())+1;
      if(date.getMonth()==new Date().getMonth() && date.getYear()===new Date().getYear()){
        for(var i=1; i<last; i++){
          if(i==new Date().getDate()){
            var detailEven = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'Stable work', 'noInfo': 'noInfo'}];
            tick.push({'i': i, 
                'numberOfTick': 'tick'+i, 
                'infoEvents': detailEv,
                'noInfo': function(){
                        var tick = this.infoEvents;
                        return (tick[0]['infoNoDate'])?tick[0]['noInfo']:'';
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
            var detailEven = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'Stable work', 'noInfo': 'noInfo'}];
            tick.push({'i': i, 'classTick': 'upwork', 
                'numberOfTick': 'tick'+i, 
                'infoEvents': detailEv,
                'noInfo': function(){
                        var tick = this.infoEvents;
                        return (tick[0]['infoNoDate'])?tick[0]['noInfo']:'';
                       }
                })
          }else{
            var detailEv = (detailEvents(new Date(date.setDate(i)))[0]);
            if (detailEv.length>0){
              tick.push({'i': i, 'classTick': '', 
                          'numberOfTick': 'tick'+i, 
                          'infoEvents': detailEv
                        })
            }else{
              tick.push({'i': i, 'classTick': 'noDataNoActive', 'numberOfTick': 'tick'+i, 'noActiveInfos': 'noInfo'})
            }
          }
        }
      }else{
        for(var i=1; i<last; i++){
          if(i<=getLastDayOfMonth(date.getYear(), date.getMonth())){
            var detailEv = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEv.length>0)?detailEv:[{'infoNoDate': 'Stable work', 'noInfo': 'noInfo'}];
            tick.push({'i': i, 'classTick': 'upwork', 
                       'numberOfTick': 'tick'+i, 'noInfo': '', 
                       'infoEvents': detailEv,
                       'noInfo': function(){
                        var tick = this.infoEvents;
                        return (tick[0]['infoNoDate'])?tick[0]['noInfo']:'';
                       }
                        })
          }else{
            tick.push({'i': i, 'classText': 'unactive' , 'numberOfTick': 'tick'+i})
          }
        }
      }
      return tick;
    }

    function detailEvents(date){
      var dayEv = []
      var arr = dayEv;
      return [dayEv, arr];
    }

    function createTicks(date){
      return {
        'month': monthNames[date.getMonth()], 
        'monthClass': ('month' + date.getMonth()),
        'tick': makeMonthTicks(date)
      }
    }

    function createTicksMob(date){
      return {
        'month': monthNames[date.getMonth()], 
        'monthClass': ('month' + date.getMonth()),
        'tick': MakePerMonthMob(date),
        'weekTick': []
      }
    }

    
    function makeMonth(date){    
      var month=date.getMonth()
      var months = []
      if(date.getFullYear() == new Date().getFullYear()){
        var lastMonth = month-2;
        for(var i=month; i>=lastMonth; i--){
            if(date.getMonth() == new Date(date.setMonth(i)).getMonth()){
              var currentMonth = new Date(date.setMonth(i));
            }else{
              var currentMonth = new Date(date.getFullYear(), i, 1);
            }
            months.push(createTicks(currentMonth));
          }
      }
          return months;
    }
    function makeMonthMob(date){    
      var month=date.getMonth();
      var months = [];
      if(date.getFullYear() == new Date().getFullYear()){
        var lastMonth = month;
        for(var i=month; i>=lastMonth; i--){
            if(date.getMonth() == new Date(date.setMonth(i)).getMonth()){
              var currentMonth = new Date(date.setMonth(i));
            }else{
              var currentMonth = new Date(date.getFullYear(), i, 1);
            }
            months.push(createTicksMob(currentMonth));
          }
      }
        return months;
    }

    function makeYear(date){
      var year=date.getFullYear();
      var length = year - getYear()[0];
      var years = [];
      for(var i=0; i<=length; i++){
        var currentYear = new Date(date.setFullYear(year - i));
        years.push({'year': date.getFullYear(),
                  'yearClass': date.getFullYear(),
                  'tickMonth': makeMonth(date)});        
      }     
      return years;
    }

    function makeYearMob(date){
      var year=date.getFullYear();
      var length = year - getYear()[0];
      var years = [];
      for(var i=0; i<=length; i++){
        var currentYear = new Date(date.setFullYear(year - i));
        years.push({'year': date.getFullYear(),
                  'yearClass': date.getFullYear(),
                  'tickMonth': makeMonthMob(date)})      
      }
      return years;
    }

    var ticks = makeYear(new Date());
    var ticksForMob = makeYearMob(new Date());
    
   
    var template12 = $('#incidentsImg').html();

    var output23 = Mustache.render(template12, {ticks: ticks, ticksForMob: ticksForMob});

     $('body').html(output23);
     $('body .title p').html(changeTitle());
     
//CREATION OF GRAFIC

   
    var data =  []
    
    var colors = [];

    data.forEach(function(item){
      if(item[0]['color']) colors.push(item[0]['color'])
    })

    //Create Margins and Axis and hook our zoom function

    var margin = {top: 20, right: 100, bottom: 30, left: 120},
        width = 700- margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var marginMobile = {top: 15, right: 10, bottom: 30, left: 50},
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
    var formatterPercent = d3.format(".0%");

    var xAxis = d3.svg.axis()
      .scale(x)
      .ticks(d3.time.hours, 4)
      .tickFormat(d3.time.format("%I %p"))
      .tickPadding(8)   
      .orient("bottom");  

    var xAxisMob = d3.svg.axis()
      .scale(xMobile)
      .ticks(d3.time.hours, 8)
      .tickFormat(d3.time.format("%I:%M %p"))
      .tickPadding(8)   
      .orient("bottom"); 
      
    var yAxis = d3.svg.axis()
      .scale(y)
      .tickPadding(7)
      .ticks(4)
      .tickValues([0, 0.33, 0.67, 1]) 
      .tickSize(-width, 0)
      .tickFormat(formatterPercent)
      .orient("left"); 

    var yAxisMob = d3.svg.axis()
      .scale(yMobile)
      .tickPadding(7)
      .ticks(4)
      .tickValues([0, 0.33, 0.67, 1]) 
      .tickSize(-widthMobile, 0) 
      .tickFormat(formatterPercent)
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
        .call(yAxis); 
        
  
     svg.selectAll(".y .tick text").each(function() {
        var text = d3.select(this);
        text.attr('opacity', function(){var t = d3.select(this).text(); if (t=='33%' || t == '67%') return '0';});
      });



    svg1.append("g")
        .attr("class", "y axis")
        .call(yAxisMob);

    svg1.selectAll(".y .tick text").each(function() {
        var text = d3.select(this);
        text.attr('opacity', function(){var t = d3.select(this).text(); if (t=='33%' || t == '67%') return '0';});
      });
     
    svg.append("g")
      .attr("class", "y axis")
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", (-margin.left) + 10)
      .attr("x", -height/2); 

    svg1.append("g")
      .attr("class", "y axis")
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", (-marginMobile.left) + 10)
      .attr("x", -heightMobile/2);
     
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
        .interpolate("basis") 
        .x(function(d) { return x(new Date(d.timeData)); })
        .y(function(d) { return y(d.percent); });   

    var line1 = d3.svg.line() 
    .interpolate("basis")
        .x(function(d) { return xMobile(new Date(d.timeData)); })
        .y(function(d) { return yMobile(d.percent); });  
      
    svg.selectAll('.line')
      .data(data)
      .enter()
      .append("path")
        .attr("class", "line")
      .attr("clip-path", "url(#clip)")
      .attr('stroke', "#000")
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
      .attr('stroke', "#000")
        .attr("d", line1); 
        svg1.selectAll('.line').sort(function (a, b) { 
          if (a[1].percent>b[1].percent || (a[1].percent==b[1].percent && a[1].color==classTickTack[2]['color'])) return -1;               
          else return 1;                             
      });       
  });

      
});


function getLastDayOfMonth(year, month) {
      var date = new Date(year, month + 1, 0);
      return date.getDate();
}

function gradient(timeFrom, color, timeTo){
      var hole = 86400;
      var percentFrom = timeFrom*100/hole;
      var percentTo = timeTo ? (timeTo*100/hole) : 100;
      var value="background: linear-gradient(to right, transparent " + Math.round(percentFrom) + "%, " + color + " " + Math.round(percentFrom) + "%, " + color + " " + Math.round(percentTo)+ "%, transparent " +Math.round(percentTo)+ "%);";
      return value;
    }











