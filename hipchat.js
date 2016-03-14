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
  	console.log(data)
  	var incidents = data[0];
  	var components = data[1];
  	var ticks = [];
  	for(var i=1; i<32; i++){
  		ticks.push({'i': i})
  	}
  	var template = $('#incidentsTemplate').html();
  	var output = Mustache.render(template, {incidents: incidents, components: components, ticks: ticks});
  	 $('body').html(output);
	});
});

