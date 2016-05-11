var incidentsCall = $.ajax('https://o6c6px2doa.execute-api.us-west-2.amazonaws.com/prod/Incidents');

var phoneCountries = $.ajax('https://api.statuspage.io/sms_countries.json');

var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

var classTickTack = [{'cls': 'upwork', 'color': '#8eb01e', 'percent': 1},
                      {'cls': 'incident', 'color': '#ce4436', 'percent': 0},
                      {'cls': 'plannedWork', color: '#3872b0', 'percent': 0},
                      {'cls': 'critical', color: '#ce4436', 'percent': 0},
                      {'cls': 'major', color: '#ff6600', 'percent': 0.33},
                      {'cls': 'minor', color: '#f5c340', 'percent': 0.67}] 

var classTickTack1 = [{'cls': 'upwork', 'color': '#8eb01e', 'percent': 0},
                      {'cls': 'incident', 'color': '#ce4436', 'percent': 1},
                      {'cls': 'plannedWork', color: '#3872b0', 'percent': 1},
                      {'cls': 'critical', color: '#ce4436', 'percent': 1},
                      {'cls': 'major', color: '#ff6600', 'percent': 0.67},
                      {'cls': 'minor', color: '#f5c340', 'percent': 0.33}] 

$(function(){
  
  Promise.all([incidentsCall, phoneCountries]).then(function(data){

    var dateEnd = new Date().getHours()*3600 + new Date().getMinutes() *60 + new Date().getSeconds()

    var getIncident = [],
    infoPhoneCountries = [];

    var incidents = data[0],
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

for(var i in phone_countries){
  var prop_phone = phone_countries[i];
  infoPhoneCountries.push({'abr': i, 'code': prop_phone[0], 'country': prop_phone[1]});
}

    var infoIncident = getIncident.reverse().map(function(item){
      if(item.updated) item.updated = item.updated.sort(compareUpdate);
      return item;
    });

        

   	var template = $('#incidentsTemplate').html();

  	var output = Mustache.render(template, {});

  	 $('body').html(output);       

 
      
     

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
            if( d[t]['created'].getTime()>=arr[c][0]['timeData'].getTime() && d[t]['resolved'].getTime()<=arr[c][1]['timeData'].getTime()){
              if(!(~arr[c][0]['name'].indexOf(d[t]['name']))) arr[c][0]['name'].push(d[t]['name']);
              if(!(~arr[c][1]['name'].indexOf(d[t]['name']))) arr[c][1]['name'].push(d[t]['name']);
            }
          }

        }
        arr.sort(compareGraf)
        return (arr.length)?arr:[[{'timeData': new Date(new Date().setHours(new Date().getHours()-24)), 'color': classTickTack[0]['color'], 'percent': 1, 'name': []}, {'timeData': new Date(), 'percent': 1, 'name':[]}]];
      }

   function grafTimeHist(d){
        var arr = [];
        for(var i=0; i<d.length; i++){
          if((d[i]['graf_created_data'] || d[i]['graf_resolved_data'])){
            created = {'timeData': (d[i]['graf_created_data'])?d[i]['created']:null, 
                        'timeDataRes': (d[i]['graf_resolved_data'])?d[i]['resolved']:null,
                        'color': d[i]['color'], 
                        'percent': takePercent(d[i]['color'], classTickTack1),
                        'name': [d[i]['name']] };
            arr.push(created)
          }
        }
        
        for(var j=0; j<arr.length; j++){
          if(!arr[j]['timeDataRes'])  arr[j]['timeDataRes'] = new Date()
          if(arr[j]['timeData'].getTime()<new Date(new Date().setHours(new Date().getHours()-24)) && arr[j]['timeDataRes'].getTime()>=new Date().getTime()) console.log("")
          arr[j]['width'] = Math.round((arr[j]['timeDataRes'].getTime() - arr[j]['timeData'].getTime())/216000);
        }
        return arr;
      }
    
      console.log(grafTimeHist(filterDateForGraf(new Date())))

    var data =  grafTime(filterDateForGraf(new Date()))
    var colors = [];

    data.forEach(function(item){
      if(item[0]['color']) colors.push(item[0]['color'])
    })

    //Create Margins and Axis and hook our zoom function

    var margin = {top: 20, right: 100, bottom: 30, left: 150},
        width = 700- margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;


    var values1 = data.map(function(i){
      return i[0].percent;
    })
    console.log(values1)
    var x = d3.time.scale()
        .domain([new Date(new Date().setHours(new Date().getHours()-24)), new Date(new Date().setMinutes(new Date().getMinutes()+30))])
        .range([6, width+4]);
     
    var y = d3.scale.linear()
        .domain([-0.05, 1.05])
        .range([height-5, 0]);

    var format = d3.time.format("%I:%M %p");
    var formatAxis = function(d) { return (d==0)?"Outage /\n\nPlanned":(d==0.67)?"Interruption":(d==0.33)?"Significant\n\ndegradation":"Upwork"}
    var formatMobile = function(d) { return (d==0)?"Outage":(d==0.67)?"Interruption":(d==0.33)?"Significant\ndegradation":"Upwork"}


    var xAxis = d3.svg.axis()
      .scale(x)
      .ticks(d3.time.hours, 4)
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


      
    // Generate our SVG object

    var svg = d3.select("#graf").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr('id', 'chart')
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
     

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


     
    svg.append("g")
      .attr("class", "y axis")
      .append("text")
      .attr("class", "axis-label") 

     
    svg.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);


     
    var div = d3.select("#graf").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    // Create D3 line object and draw data on our SVG object

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
        svg.selectAll('.line').sort(function (a, b) { 
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
                    .style("left", positionX(left) + 48 + "px")   
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

      
      var dataH = [{'color': "#ce4436", 'name': "Incident #1", 'percent': 1, 'timeData': new Date(1462799997047), 'timeDataRes': new Date(1462830223578)},
      {'color': "#f5c340", 'name': "Incident #2", 'percent': 0.33, 'timeData': new Date(1462836223578), 'timeDataRes': new Date(1462865087710), 'width': 193}];

    dataH[0]['width'] = Math.round((dataH[0]['timeDataRes'].getTime() - dataH[0]['timeData'].getTime())/200000)
    dataH[1]['width'] = Math.round((dataH[1]['timeDataRes'].getTime() - dataH[1]['timeData'].getTime())/200000)

      function grafHide(d){
        for(var i=0; i<d.length; i++){
          if(d[i].timeData.getTime() <= new Date(new Date().setHours(new Date().getHours()-24)).getTime() && d[i].timeDataRes.getTime()>=new Date(new Date().setHours(new Date().getHours()-24)).getTime()){
            d[i].timeData = new Date(new Date().setHours(new Date().getHours()-24));
          }
        }
        return d;
      }

      var dataHist = grafHide(dataH);
      var dataHist = grafTimeHist(filterDateForGraf(new Date()));
      console.log(dataHist)

    var formatAxis = function(d) { return (d==1)?"Outage /\n\nPlanned":(d==0.33)?"Interruption":(d==0.67)?"Significant\n\ndegradation":"Upwork"} 

  var marginHistogram = {top: 15, right: 10, bottom: 30, left: 100},
      widthHistogram = 700- marginHistogram.left - marginHistogram.right,
      heightHistogram = 300 - marginHistogram.top - marginHistogram.bottom;

  var x1 = d3.time.scale()
        .domain([new Date(new Date().setHours(new Date().getHours()-24)), new Date(new Date().setMinutes(new Date().getMinutes()))])
        .range([0, widthHistogram]);
     
  var y1 = d3.scale.linear()
      .domain([0, 1.0])
      .range([heightHistogram - marginHistogram.top - marginHistogram.bottom, 0]);

  var xAxis1 = d3.svg.axis()
      .scale(x1)
      .ticks(d3.time.hours, 4)
      .tickFormat(d3.time.format("%I %p"))
      .tickPadding(8)   
      .orient("bottom");  
      
  var yAxis1 = d3.svg.axis()
    .scale(y1)
    .tickPadding(7)
    .ticks(4) 
    .tickValues([0, 0.33, 0.67, 1]) 
    .tickFormat(formatAxis)
    .orient("left"); 

var tip = d3.tip()
  .attr('class', 'tooltip')
  .offset([0, -200])
  .html(function(d) {
    return "<strong >"+d.name+"</strong> <br/> <p class='tip-top'>" + format(new Date(d.timeData))+ " - " + format(new Date(d.timeDataRes)) + "</p>";
  })

 var svg1 = d3.select("#grafHistogram").append("svg")
        .attr("width", widthHistogram + marginHistogram.left + marginHistogram.right)
        .attr("height", heightHistogram + marginHistogram.top + marginHistogram.bottom)
        .attr('id', 'chart')
        .append("g")
        .attr("transform", "translate(" + marginHistogram.left + "," + marginHistogram.top + ")");

svg1.call(tip);
      
svg1.selectAll('.chart')
    .data(dataHist)
  .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) { return x1(new Date(d.timeData)); })
    .attr('y', function(d) { return heightHistogram  - marginHistogram.top - marginHistogram.bottom - (heightHistogram  - marginHistogram.top - marginHistogram.bottom - y1(d.percent)) })
    .attr('width', function(d){console.log(d); return d.width;})
    .attr('fill', function(d){      
        return d.color;
      })
    .attr('height', function(d) { return heightHistogram  - marginHistogram.top - marginHistogram.bottom - y1(d.percent) })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);



svg1.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0, ' + (heightHistogram- marginHistogram.top - marginHistogram.bottom) + ')')
    .call(xAxis1);

svg1.append('g')
  .attr('class', 'y axis')
  .call(yAxis1);
       
svg1.selectAll(".y .tick text").each(function() {
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

  });



  
});


// additional functions
function positionX(t){
  return t - document.getElementById("graf").getBoundingClientRect().left - document.querySelector(".tooltip").offsetWidth/2;
}
function positionY(t){
  return t - document.getElementById("graf").getBoundingClientRect().top - document.querySelector(".tooltip").offsetHeight+68;
}

function posX(t){
  return t - document.getElementById("grafHistogram").getBoundingClientRect().left;
}
function posY(t){
  return t - document.getElementById("grafHistogram").getBoundingClientRect().top+10;
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
