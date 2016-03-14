var PAGE_ID = 'p6jhb5cgjvly';
var API_KEY = '4969c432-bbb5-4d75-bcfe-ab712aaef85b';

var incidentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/incidents.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});

var componentsCall = $.ajax('https://api.statuspage.io/v1/pages/' + PAGE_ID + '/components.json', {
  headers: { Authorization: "OAuth " + API_KEY }
});

$(function(){
  
  Promise.all([incidentsCall, componentsCall]).then(function(data){
  	var today = new Date().getDate();
  	var classTickTack = ['upwork'];
  	var incidents = data[0];
  	var components = data[1];
  	var ticks = [];
  	for(var i=1; i<32; i++){
  		if(i<=today){
  			ticks.push({'i': i, 'classTick': classTickTack[0]})
  		}else{
  		ticks.push({'i': i, 'classTick': ''})
  		}
  	}

  	var template = $('#incidentsTemplate').html();
  	var output = Mustache.render(template, {incidents: incidents, components: components, ticks: ticks});
  	 $('body').html(output);
	});
});

