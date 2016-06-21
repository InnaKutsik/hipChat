'use strict';
module.exports = function(){

var countOfshownMonth = 5,
sixty = 60,
first = 1,
hundred = 100,
thousand = 1000,
minsec = 59,
hourVal = 23,
zero = 0;
var lastNeedDate = new Date(new Date().setMonth(new Date().getMonth()-5));
var hashRoot = '';
function trigger(){
  if (window.location.hash === '#demo'){
    hashRoot = '/#demo';
    return {
      'incident': $.get('https://o6c6px2doa.execute-api.us-west-2.amazonaws.com/prod/Incidents', { month: lastNeedDate.getMonth(), year: lastNeedDate.getFullYear(), day: first}),
      'component': $.ajax('https://o6c6px2doa.execute-api.us-west-2.amazonaws.com/prod/Components'),
      'subscriber': 'https://o6c6px2doa.execute-api.us-west-2.amazonaws.com/prod/Subscribers'};
  } else {
    return {
      'incident': $.get('https://3k9om46ag9.execute-api.us-east-1.amazonaws.com/api/incidents', { month: lastNeedDate.getMonth(), year: lastNeedDate.getFullYear(), day: first}),
      'component': $.ajax('https://3k9om46ag9.execute-api.us-east-1.amazonaws.com/api/components'),
      'subscriber': 'https://3k9om46ag9.execute-api.us-east-1.amazonaws.com/api/subscribers'};
  }
}

var phoneCountries = $.ajax('https://api.statuspage.io/sms_countries.json');



var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

var classTickTack = [{'cls': 'upwork', 'color': '#8eb01e', 'percent': 1},
                     {'cls': 'incident', 'color': '#ce4436', 'percent': 0},
                     {'cls': 'plannedWork', 'color': '#3872b0', 'percent': 0},
                     {'cls': 'critical', 'color': '#ce4436', 'percent': 0},
                     {'cls': 'major', 'color': '#ff6600', 'percent': 0.5},
                     {'cls': 'minor', 'color': '#f5c340', 'percent': 0.75}];

var rememberOpen = null;
var lastMonthForButton = null;
var rememberOpenMobile = null;

function clearPanel(){
    $('#preload').css('display', 'none');
    $('#ready-json').css('display', 'none');
}


Path.map('#/:id').to(function(){
    var id = this.params.id;
    var loadJSON = trigger();
    var incidentsCall = loadJSON.incident;
    var subscribersCall = loadJSON.subscriber;

    Promise.all([incidentsCall, phoneCountries]).then(function(data){
      var infoPhoneCountries = [];

      var incidents = data[0],
      phone_countries = data[1];
      var incident = incidents.filter(function(item){
        return item.id === id;
      });
      var shownIncedent = [];
      incident.forEach(function(item){
        var createdMs = Date.parse(item.scheduled_for || item.created_at);
        var resolvedMs = Date.parse(item.scheduled_until || item.resolved_at || new Date());
        var created = new Date(createdMs);
        var resolved = new Date(resolvedMs);
        shownIncedent.push({
          'id': item.id,
          'name': item.name,
          'created': created,
          'status': item.status,
          'noInfo': 'isInfo',
          'impact': item.impact,
          'updated': [],
          'resolved': resolved,
          'time_created': function(){
                  return timeFormatter(this.created);
                },
          'time_resolved': function(){
                  return timeFormatter(this.resolved);
                },
          'postmorten': formatPostmorten(showPostmorten(item.incident_updates)),
          'tick_title': function(){
           if (item.scheduled_for) return 'Scheduled Maintenance Report for ';
           else return 'Incident Report for ';
          },
          'style_postmorten': (showPostmorten(item.incident_updates))?'display: block;':'display: none;',
          'color': (item.scheduled_for)?classTickTack[2].color:(item.impact == 'critical')?classTickTack[3].color:(item.impact == 'major')?classTickTack[4].color:((item.impact == 'minor'))?classTickTack[5].color:classTickTack[0].color});
      });
      incident[0].incident_updates.forEach(function(item){
          if (item.status != 'postmortem'){
            shownIncedent[0].updated.push({
              'id_update': item.id,
              'body': formatBodyUpdate(item.body),
              'status': (item.status.match('_'))?item.status.replace('_', ' '):item.status,
              'created': item.created_at,
              'updated': formatUpdateDate(item.updated_at),
              'update_days': differenceDays(item.updated_at)});
          }
      });
      function getPhoneCountries(){
        for (var i in phone_countries){
          var prop_phone = phone_countries[i];
          infoPhoneCountries.push({'abr': i, 'code': prop_phone[0], 'country': prop_phone[1]});
        }
      }
      getPhoneCountries(); 
      var template = $('#testTemplate').html();
      var output = Mustache.render(template, {incidents: incidents, ticks: shownIncedent, infoPhoneCountries: infoPhoneCountries});

      $('#test').html(output);
      $('#footer').css('display', 'block');

      $(document).ready(function(){
        $('#test .updates-dropdown-sections-container #updates-dropdown-email').css('display', 'block'); 
        $('#test .updates-dropdown-nav a.updates-dropdown-email-btn').addClass('active');
      });
      $('#test div.subscribe:first-child').on('click', function(e) {
        $('#test .updates-dropdown').toggle(); 
        e.stopPropagation();    
      });
      $('#test .updates-dropdown').on('click', function(e) {
        e.stopPropagation(); 
      }); 
      $('#test a#phone-country').on('click', function() {
        $('#test select.phone-country').css('display', 'block');      
        $('#test select.phone-country').val('us');
        $('#test div#updates-dropdown-sms p.help-block').css('display', 'none');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-email-btn').on('click', function() {
        $('#test .updates-dropdown-section').css('display', 'none'); 
        $('#test .updates-dropdown-sections-container #updates-dropdown-email').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-email-btn').addClass('active');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-sms-btn').on('click', function() { 
        $('#test .updates-dropdown-section').css('display', 'none');    
        $('#test .updates-dropdown-sections-container #updates-dropdown-sms').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-sms-btn').addClass('active');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-webhook-btn').on('click', function() {
        $('#test .updates-dropdown-section').css('display', 'none');
        $('#test .updates-dropdown-sections-container #updates-dropdown-webhook').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-webhook-btn').addClass('active');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-twitter-btn').on('click', function() {
        $('#test .updates-dropdown-section').css('display', 'none'); 
        $('#test .updates-dropdown-sections-container #updates-dropdown-twitter').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-twitter-btn').addClass('active');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-support-btn').on('click', function() {
        $('#test .updates-dropdown-section').css('display', 'none');
        $('#test .updates-dropdown-sections-container #updates-dropdown-support').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-support-btn').addClass('active');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-atom-btn').on('click', function(e) {
        $('#test .updates-dropdown-section').css('display', 'none');   
        $('#test .updates-dropdown-sections-container #updates-dropdown-atom').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-atom-btn').addClass('active');
        e.stopPropagation(); 
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-close-btn').on('click', function() {
        $('#test .updates-dropdown').hide();
      });
      $(document).click(function(){
        $('#test .updates-dropdown').hide();
      });
      $('#test #footer .footer-email-updates').on('click', function(e) {
        $('#test .updates-dropdown').toggle(); 
        e.stopPropagation();
        window.scrollTo(0, 0);
      });

      var regError409 = /('status':409)/;
      var regError422 = /('status':422)/;
      var regError201 = /('status':201)/;
    
      $('#test #subscribe-btn-email').click(function() {
        var emailElement = $('#test input#email');
        if (emailElement.is(':valid')){
          $.ajax({
            url: subscribersCall , 
            type: 'POST',
            crossdomain: true, 
            contentType: 'application/json',
            dataType: 'text',
            data: JSON.stringify({
              'subscriber': {    
                'email': emailElement.val()}}),
            complete: function(xhr) {
              if (xhr.responseText.search(regError409) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');              
                $('#test .infoLine span').html('This email is already subscribed to updates.');
                setTimeout('$(".infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError422) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#e74c3c');
                $('#test .infoLine').css('border', '1px solid #c92e1e');
                $('#test .infoLine span').html('Please enter a valid email or a phone number that you wish to have updates sent to.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError201) !==-1){
                $('#test input#email').val('');
                $('#test .updates-dropdown').hide();         
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');
                $('#test .infoLine span').html('Your email is now subscribed to updates! A confirmation message should arrive soon.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              }
            } 
          });
        }});

      $('#test select.phone-country').val('us');
      $('#test #subscribe-btn-sms').click(function() {
        var phoneElement = $('#test input#phone-number');    
        var codeCountry = $('#test select.phone-country option:selected').val();
        if (phoneElement.is(':valid')){
          $.ajax({
            url: subscribersCall, 
            type: 'POST',
            crossdomain: true, 
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify({
              'subscriber': {
                'phone_number': phoneElement.val(),
                'phone_country': codeCountry}}),       
            complete: function(xhr) {
              if (xhr.responseText.search(regError409) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');              
                $('#test .infoLine span').html('This phone is already subscribed to updates.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError422) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#e74c3c');
                $('#test .infoLine').css('border', '1px solid #c92e1e');
                $('#test .infoLine span').html('Please enter a valid email or a phone number that you wish to have updates sent to.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError201) !==-1){
                $('#test input#email').val('');
                $('#test .updates-dropdown').hide();         
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');
                $('#test .infoLine span').html('Your phone is now subscribed to updates! A confirmation message should arrive soon.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              }
            } 
          });
        }
      });

      $('#test #subscribe-btn-webhook').click(function() {
        var emailElement = $('#test input#email-webhooks');
        var endpointWebhooks = $('#test input#endpoint-webhooks');
        if (emailElement.is(':valid') && endpointWebhooks.is(':valid')){
          $.ajax({
            url: subscribersCall, 
            type: 'POST',
            crossdomain: true, 
            dataType: 'text', 
            contentType: 'application/json',
            data: JSON.stringify({
              'subscriber': {
                'email': emailElement.val(),
                'endpoint': endpointWebhooks.val()}}),
            complete: function(xhr) {
              if (xhr.responseText.search(regError409) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');              
                $('#test .infoLine span').html('Please enter an endpoint and a valid email at which you can be reached.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError422) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#e74c3c');
                $('#test .infoLine').css('border', '1px solid #c92e1e');
                $('#test .infoLine span').html('Please enter an endpoint and a valid email at which you can be reached.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError201) !==-1){
                $('#test input#email').val('');
                $('#test .updates-dropdown').hide();         
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');
                $('#test .infoLine span').html('Your endpoint is now subscribed to webhook updates. A confirmation message should arrive soon.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              }
            }});
        }
      });        
    });
}).enter(clearPanel);

Path.map('#/#demo/:id').to(function(){
    var id = this.params.id;
    function trigger(){
        hashRoot = '/#demo';
        return {
          'incident': $.get('https://o6c6px2doa.execute-api.us-west-2.amazonaws.com/prod/Incidents', { month: lastNeedDate.getMonth(), year: lastNeedDate.getFullYear(), day: first}),
          'component': $.ajax('https://o6c6px2doa.execute-api.us-west-2.amazonaws.com/prod/Components'),
          'subscriber': 'https://o6c6px2doa.execute-api.us-west-2.amazonaws.com/prod/Subscribers'};
    }
    var loadJSON = trigger();
    var incidentsCall = loadJSON.incident;
    var subscribersCall = loadJSON.subscriber;

    Promise.all([incidentsCall, phoneCountries]).then(function(data){
      var infoPhoneCountries = [];

      var incidents = data[0],
      phone_countries = data[1];
      var incident = incidents.filter(function(item){
        return item.id === id;
      });
      var shownIncedent = [];
      incident.forEach(function(item){
        var createdMs = Date.parse(item.scheduled_for || item.created_at);
        var resolvedMs = Date.parse(item.scheduled_until || item.resolved_at || new Date()); 
        var created = new Date(createdMs);
        var resolved = new Date(resolvedMs);
        shownIncedent.push({
          'id': item.id,
          'name': item.name,
          'created': created,
          'status': item.status,
          'noInfo': 'isInfo',
          'impact': item.impact,
          'updated': [],
          'resolved': resolved,
          'time_created': function(){
                  return timeFormatter(this.created);
                },
          'time_resolved': function(){
                  return timeFormatter(this.resolved);
                },
          'postmorten': formatPostmorten(showPostmorten(item.incident_updates)),
          'style_postmorten': (showPostmorten(item.incident_updates))?'display: block;':'display: none;',
          'color': (item.scheduled_for)?classTickTack[2].color:(item.impact == 'critical')?classTickTack[3].color:(item.impact == 'major')?classTickTack[4].color:((item.impact == 'minor'))?classTickTack[5].color:classTickTack[0].color,
          'tick_title': function(){
             if (item.scheduled_for) return 'Scheduled Maintenance Report for ';
             else return 'Incident Report for ';
          }
        });
      });
      incident[0].incident_updates.forEach(function(item){
          if (item.status != 'postmortem'){
            shownIncedent[0].updated.push({
              'id_update': item.id,
              'body': formatBodyUpdate(item.body),
              'status': (item.status.match('_'))?item.status.replace('_', ' '):item.status,
              'created': item.created_at,
              'updated': formatUpdateDate(item.updated_at),
              'update_days': differenceDays(item.updated_at)});
          }
      });
     function getPhoneCountries(){
        for (var i in phone_countries){
          var prop_phone = phone_countries[i];
          infoPhoneCountries.push({'abr': i, 'code': prop_phone[0], 'country': prop_phone[1]});
        }
      }
      getPhoneCountries(); 
      var template = $('#testTemplate').html();
      var output = Mustache.render(template, {incidents: incidents, ticks: shownIncedent, infoPhoneCountries: infoPhoneCountries});

      $('#test').html(output);
      $('#footer').css('display', 'block');   

      $(document).ready(function(){
        $('#test .updates-dropdown-sections-container #updates-dropdown-email').css('display', 'block'); 
        $('#test .updates-dropdown-nav a.updates-dropdown-email-btn').addClass('active');
      });
      $('#test div.subscribe:first-child').on('click', function(e) {
        $('#test .updates-dropdown').toggle(); 
        e.stopPropagation();    
      });
      $('#test .updates-dropdown').on('click', function(e) {
        e.stopPropagation(); 
      }); 
      $('#test a#phone-country').on('click', function() {
        $('#test select.phone-country').css('display', 'block');      
        $('#test select.phone-country').val('us');
        $('#test div#updates-dropdown-sms p.help-block').css('display', 'none');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-email-btn').on('click', function() {
        $('#test .updates-dropdown-section').css('display', 'none'); 
        $('#test .updates-dropdown-sections-container #updates-dropdown-email').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-email-btn').addClass('active');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-sms-btn').on('click', function() { 
        $('#test .updates-dropdown-section').css('display', 'none');    
        $('#test .updates-dropdown-sections-container #updates-dropdown-sms').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-sms-btn').addClass('active');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-webhook-btn').on('click', function() {
        $('#test .updates-dropdown-section').css('display', 'none');
        $('#test .updates-dropdown-sections-container #updates-dropdown-webhook').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-webhook-btn').addClass('active');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-twitter-btn').on('click', function() {
        $('#test .updates-dropdown-section').css('display', 'none'); 
        $('#test .updates-dropdown-sections-container #updates-dropdown-twitter').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-twitter-btn').addClass('active');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-support-btn').on('click', function() {
        $('#test .updates-dropdown-section').css('display', 'none');
        $('#test .updates-dropdown-sections-container #updates-dropdown-support').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-support-btn').addClass('active');
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-atom-btn').on('click', function(e) {
        $('#test .updates-dropdown-section').css('display', 'none');   
        $('#test .updates-dropdown-sections-container #updates-dropdown-atom').css('display', 'block');
        $('#test .updates-dropdown-nav a').removeClass('active');
        $('#test .updates-dropdown-nav a.updates-dropdown-atom-btn').addClass('active');
        e.stopPropagation(); 
      });
      $('#test .updates-dropdown-nav a.updates-dropdown-close-btn').on('click', function() {
        $('#test .updates-dropdown').hide();
      });
      $(document).click(function(){
        $('#test .updates-dropdown').hide();
      });
      $('#test #footer .footer-email-updates').on('click', function(e) {
        $('#test .updates-dropdown').toggle(); 
        e.stopPropagation();
        window.scrollTo(0, 0);
      });

      var regError409 = /('status':409)/;
      var regError422 = /('status':422)/;
      var regError201 = /('status':201)/;
    
      $('#test #subscribe-btn-email').click(function() {
        var emailElement = $('#test input#email');
        if (emailElement.is(':valid')){
          $.ajax({
            url: subscribersCall , 
            type: 'POST',
            crossdomain: true, 
            contentType: 'application/json',
            dataType: 'text',
            data: JSON.stringify({
              'subscriber': {    
                'email': emailElement.val()}}),
            complete: function(xhr) {
              if (xhr.responseText.search(regError409) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');              
                $('#test .infoLine span').html('This email is already subscribed to updates.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError422) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#e74c3c');
                $('#test .infoLine').css('border', '1px solid #c92e1e');
                $('#test .infoLine span').html('Please enter a valid email or a phone number that you wish to have updates sent to.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError201) !==-1){
                $('#test input#email').val('');
                $('#test .updates-dropdown').hide();         
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');
                $('#test .infoLine span').html('Your email is now subscribed to updates! A confirmation message should arrive soon.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              }
            } 
          });
        }});

      $('#test select.phone-country').val('us');
      $('#test #subscribe-btn-sms').click(function() {
        var phoneElement = $('#test input#phone-number');    
        var codeCountry = $('#test select.phone-country option:selected').val();
        if (phoneElement.is(':valid')){
          $.ajax({
            url: subscribersCall, 
            type: 'POST',
            crossdomain: true, 
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify({
              'subscriber': {
                'phone_number': phoneElement.val(),
                'phone_country': codeCountry}}),       
            complete: function(xhr) {
              if (xhr.responseText.search(regError409) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');              
                $('#test .infoLine span').html('This phone is already subscribed to updates.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError422) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#e74c3c');
                $('#test .infoLine').css('border', '1px solid #c92e1e');
                $('#test .infoLine span').html('Please enter a valid email or a phone number that you wish to have updates sent to.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError201) !==-1){
                $('#test input#email').val('');
                $('#test .updates-dropdown').hide();         
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');
                $('#test .infoLine span').html('Your phone is now subscribed to updates! A confirmation message should arrive soon.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              }
            } 
          });
        }
      });

      $('#test #subscribe-btn-webhook').click(function() {
        var emailElement = $('#test input#email-webhooks');
        var endpointWebhooks = $('#test input#endpoint-webhooks');
        if (emailElement.is(':valid') && endpointWebhooks.is(':valid')){
          $.ajax({
            url: subscribersCall, 
            type: 'POST',
            crossdomain: true, 
            dataType: 'text', 
            contentType: 'application/json',
            data: JSON.stringify({
              'subscriber': {
                'email': emailElement.val(),
                'endpoint': endpointWebhooks.val()}}),
            complete: function(xhr) {
              if (xhr.responseText.search(regError409) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');              
                $('#test .infoLine span').html('Please enter an endpoint and a valid email at which you can be reached.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError422) !== -1){
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#e74c3c');
                $('#test .infoLine').css('border', '1px solid #c92e1e');
                $('#test .infoLine span').html('Please enter an endpoint and a valid email at which you can be reached.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError201) !==-1){
                $('#test input#email').val('');
                $('#test .updates-dropdown').hide();         
                $('#test .infoLine').css('display', 'block');
                $('#test .infoLine').css('background-color', '#3498db');
                $('#test .infoLine').css('border', '1px solid #167abd');
                $('#test .infoLine span').html('Your endpoint is now subscribed to webhook updates. A confirmation message should arrive soon.');
                setTimeout('$("#test .infoLine").css("display", "none")', 7000);
              }
            }});
        }
      });   
    });
}).enter(clearPanel);


Path.root(hashRoot);

Path.listen();

function showPostmorten(arr){
  for (var i=0; i<arr.length; i++){
    if (arr[i].status == 'postmortem') return arr[i];
  }
  return false;
}
function formatPostmorten(obj){
  var result = [];
  if (obj){
    result.push({
          'id_update': obj.id,
          'body': formatBodyUpdate(obj.body),
          'status': obj.status,
          'created': obj.created_at,
          'updated': formatUpdateDate(obj.updated_at),
          'update_days': differenceDays(obj.updated_at)
        });
    return result;
  }
  return false;
}
 
$(function(){

    var infoIncident = [];

    $('#preload').parent().parent().css('overflow', 'hidden');
    var screen = $(window).innerHeight();
    var width = $(window).width();

    // function changeTitle(){
    //   return 'You can be sure - we are working stable.''
    // }    
        
    var getYear = function(){
      var date = new Date().getTime();
      for (var i=0; i<infoIncident.length; i++){
        var eventDate = Date.parse(infoIncident[i].created);
        if (date>eventDate) date = eventDate;
      }
      return [new Date(date).getFullYear(), new Date(date).getMonth()];
    };
    
    function getLastDayOfMonth(year, month) {
      var date = new Date(year, month + 1, zero);
      return date.getDate();
    }

    function getFirstDayOfMonth(date){
      return new Date(date.setDate(1)).getDay();
    }

    function countWeekPerMonth(date){
      var firstDay = getFirstDayOfMonth(date);
      var countDays = getLastDayOfMonth(date.getFullYear(), date.getMonth());
      var countDayInWeek = 7;
      var countWeeks = ((firstDay-1)+countDays)/countDayInWeek;
      return Math.ceil(countWeeks);
    }

    function MakePerMonthMob(date){
      var tick = [];
      var last = getLastDayOfMonth(date.getFullYear(), date.getMonth());
      var lastDay = new Date(date.setDate(last)).getDay();
      var lastSunday = last - lastDay;
      var countWeek = countWeekPerMonth(date);
      var firstDaysWeek = [lastSunday];
      var countDayInWeek = 7;
      for (var i=1; i<=countWeek; i++){
        var first = lastSunday - countDayInWeek*i;
        if (first>-6) firstDaysWeek.push(first);
      }
      firstDaysWeek.reverse();
      for (var j=0; j<firstDaysWeek.length; j++){
        tick.push({
          'num': j,
          'dayWeek': firstDaysWeek[j],
          'tickWeek': oneWeek(date, firstDaysWeek[j])
        });
      }
      return tick;
    }

    function oneWeek(date, numDay){
      var wTeack = [];
      var last = getLastDayOfMonth(date.getFullYear(), date.getMonth())+1;
      var beforeMonth = new Date(new Date().setMonth(date.getMonth()-1));
      var lastBeforeMohth = getLastDayOfMonth(beforeMonth.getFullYear(), beforeMonth.getMonth());
      if (date.getMonth()==new Date().getMonth() && date.getYear()===new Date().getYear()){
        for (var i=numDay; i<(+numDay + 7); i++){
          if (i<=0){      
            wTeack.push({'i': lastBeforeMohth + i, 'classTick': 'unactive_tick', 'numberOfTick': 'notick', 'noActiveInfos': 'noInfo'});
          } else if (i==new Date().getDate()){
            var detailEven = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
            wTeack.push({'i': i, 
              'day': i,
              'numberOfTick': 'tick'+i, 
              'infoEvents': detailEv,
              'noInfo': function(){
                var tick = this.infoEvents;
                return (tick[0].infoNoDate)?tick[0].noInfo:'';
              },
              'value': function(){
                var currentHour = new Date().getHours()*sixty*sixty + new Date().getMinutes()*sixty + new Date().getSeconds();
                var allDay = sixty*sixty*24;
                var percentFrom = currentHour*hundred/allDay;
                var value='background: linear-gradient(to right, #8eb01e ' + Math.round(percentFrom) + '%, #e9e9e9 ' + Math.round(percentFrom) + '%, #e9e9e9 100%);';
                return value;
              }
            });
          } else if (i<new Date().getDate()){
            detailEven = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
            wTeack.push({'i': i,
              'classTick': 'upwork', 
              'numberOfTick': 'tick'+i, 
              'day': i,
              'infoEvents': detailEv
              });
          } else if (i<last){
            var detailEv = (detailEvents(new Date(date.setDate(i)))[0]);
            if (detailEv.length>0){
              wTeack.push({'i': i,
                'classTick': '',
                'numberOfTick': 'tick'+i, 
                'infoEvents': detailEv,
                'day': i
              });
            } else {
              wTeack.push({'day': i, 'i': i, 'classTick': '', 'numberOfTick': 'notick', 'noActiveInfos': 'noInfo'});
            }
          } else if (i>=last){
            wTeack.push({'i': i+1-last, 'classTick': 'unactive_tick', 'numberOfTick': 'tick'+i, 'noActiveInfos': 'noInfo'});
          }
        }
      } else {
        for (i=numDay; i<(+numDay + 7); i++){
          if (i<=0){      
            wTeack.push({'i': lastBeforeMohth + i, 'classTick': 'unactive_tick', 'numberOfTick': 'notick', 'noActiveInfos': 'noInfo'});
          } else if (i<=getLastDayOfMonth(date.getYear(), date.getMonth())){
            detailEv = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEv.length>0)?detailEv:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
            wTeack.push({'i': i, 'classTick': 'upwork', 
              'day': i,
              'numberOfTick': 'tick'+i, 
              'infoEvents': detailEv,
              'noInfo': function(){
                var tick = this.infoEvents;
                return (tick[0].infoNoDate)?tick[0].noInfo:'';
              }
            });
          } else if (i>=last){
            wTeack.push({'i': i+1-last,'classText': 'unactive_tick', 'numberOfTick': 'notick'});
          }
        }
      }
      return wTeack;
    }

    function makeMonthTicks(date){
      var tick = [];
      var last = getLastDayOfMonth(date.getFullYear(), date.getMonth())+1;
      if (date.getMonth()==new Date().getMonth() && date.getYear()===new Date().getYear()){
        for (var i=1; i<last; i++){
          if (i==new Date().getDate()){
            var detailEven = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
            tick.push({'i': i, 
              'numberOfTick': 'tick'+i, 
              'infoEvents': detailEv,
              'noInfo': function(){
                var tick = this.infoEvents;
                return (tick[0].infoNoDate)?tick[0].noInfo:'';
              },
              'value': function(){
                var currentHour = new Date().getHours()*sixty*sixty + new Date().getMinutes()*sixty + new Date().getSeconds();
                var allDay = sixty*sixty*24;
                var percentFrom = currentHour*hundred/allDay;
                var value='background: linear-gradient(to right, #8eb01e ' + Math.round(percentFrom) + '%, #e9e9e9 ' + Math.round(percentFrom) + '%, #e9e9e9 100%);';
                return value;
              }
            });
          } else if (i<new Date().getDate()){
            detailEven = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
            tick.push({'i': i, 'classTick': 'upwork', 
              'numberOfTick': 'tick'+i, 
              'infoEvents': detailEv,
              'noInfo': function(){
                var tick = this.infoEvents;
                return (tick[0].infoNoDate)?tick[0].noInfo:'';
              }
            });
          } else {
            var detailEv = (detailEvents(new Date(date.setDate(i)))[0]);
            if (detailEv.length>0){
              tick.push({'i': i,
                'classTick': '', 
                'numberOfTick': 'tick'+i, 
                'infoEvents': detailEv
              });
            } else {
              tick.push({'i': i, 'classTick': 'noDataNoActive', 'numberOfTick': 'tick'+i, 'noActiveInfos': 'noInfo'});
            }
          }
        }
      } else {
        for (i=1; i<last; i++){
          if (i<=getLastDayOfMonth(date.getYear(), date.getMonth())){
            detailEv = (detailEvents(new Date(date.setDate(i)))[0]);
            detailEv = (detailEv.length>0)?detailEv:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
            tick.push({'i': i, 
              'classTick': 'upwork', 
              'numberOfTick': 'tick'+i, 
              'infoEvents': detailEv,
              'noInfo': function(){
                var tick = this.infoEvents;
                return (tick[0].infoNoDate)?tick[0].noInfo:'';
              }
            });
          } else {
            tick.push({'i': i, 'classText': 'unactive' , 'numberOfTick': 'tick'+i});
          }
        }
      }
      return tick;
    }

    function detailEvents(){
      var dayEv = [];
      var arr = dayEv;
      return [dayEv, arr];
    }

    function createTicks(date){
      return {
        'month': monthNames[date.getMonth()], 
        'monthClass': ('month' + date.getMonth()),
        'tick': makeMonthTicks(date)
      };
    }

    function createTicksMob(date){
      return {
        'month': monthNames[date.getMonth()], 
        'monthClass': ('month' + date.getMonth()),
        'tick': MakePerMonthMob(date),
        'weekTick': []
      };
    }
    
    function makeMonth(date){    
      var month=date.getMonth();
      var months = [];
      if (date.getFullYear() == new Date().getFullYear()){
        var lastMonth = month-2;
        for (var i=month; i>=lastMonth; i--){
          if (date.getMonth() == new Date(date.setMonth(i)).getMonth()){
            var currentMonth = new Date(date.setMonth(i));
          } else {
            currentMonth = new Date(date.getFullYear(), i, 1);
          }
          months.push(createTicks(currentMonth));
        }
      }
      return months;
    }

    function makeMonthMob(date){    
      var month=date.getMonth();
      var months = [];
      if (date.getFullYear() == new Date().getFullYear()){
        var lastMonth = month;
        for (var i=month; i>=lastMonth; i--){
          if (date.getMonth() == new Date(date.setMonth(i)).getMonth()){
            var currentMonth = new Date(date.setMonth(i));
          } else {
            currentMonth = new Date(date.getFullYear(), i, 1);
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
      for (var i=0; i<=length; i++){
        years.push({'year': date.getFullYear(),
                    'yearClass': date.getFullYear(),
                    'tickMonth': makeMonth(date)
                  });        
      }     
      return years;
    }

    function makeYearMob(date){
      var year=date.getFullYear();
      var length = year - getYear()[0];
      var years = [];
      for (var i=0; i<=length; i++){
        years.push({'year': date.getFullYear(),
                    'yearClass': date.getFullYear(),
                    'tickMonth': makeMonthMob(date)
                  });  
      }
      return years;
    }

    var ticks = makeYear(new Date());
    var ticksForMob = makeYearMob(new Date());
    $('#footer').css('display', 'none');
   
    var template12 = $('#incidentsImg').html();

    var output23 = Mustache.render(template12, {ticks: ticks, ticksForMob: ticksForMob});

    $('#preload').html(output23);

    $('.wait').css('height', screen);
    $('.wait').css('width', width);
    $('.wait .wait-spinner').css('margin-top', screen/2);

    $(window).resize(function(){
      var screen = $(window).innerHeight();
      var width = $(window).width();
      $('.wait').css('height', screen);
      $('.wait').css('width', width);
      $('.wait .wait-spinner').css('margin-top', screen/2);
    });
     
//CREATION OF GRAFIC
   
    // var data =  []
    
    // var colors = [];

    // data.forEach(function(item){
    //   if(item[0]['color']) colors.push(item[0]['color'])
    // })

    //Create Margins and Axis and hook our zoom function

    // var margin = {top: 20, right: 100, bottom: 30, left: 120},
    //     width = 700- margin.left - margin.right,
    //     height = 300 - margin.top - margin.bottom;

    // var marginMobile = {top: 15, right: 10, bottom: 30, left: 50},
    //     widthMobile = 500- margin.left - margin.right,
    //     heightMobile = 200 - margin.top - margin.bottom;

    // var x = d3.time.scale()
    //     .domain([new Date(new Date().setHours(new Date().getHours()-24)), new Date(new Date().setMinutes(new Date().getMinutes()))])
    //     .range([0, width]);

    // var xMobile = d3.time.scale()
    //     .domain([new Date(new Date().setHours(new Date().getHours() - 24)), new Date(new Date().setMinutes(new Date().getMinutes()))])
    //     .range([0, widthMobile]);
     
    // var y = d3.scale.linear()
    //     .domain([-0.05, 1.05])
    //     .range([height-5, 0]);

    // var yMobile = d3.scale.linear()
    //     .domain([-0.05, 1.07])
    //     .range([heightMobile, 0]);

    // var format = d3.time.format('%I:%M %p');
    // var formatterPercent = d3.format('.0%');

    // var xAxis = d3.svg.axis()
    //   .scale(x)
    //   .ticks(d3.time.hours, 4)
    //   .tickFormat(d3.time.format('%I %p'))
    //   .tickPadding(8)   
    //   .orient('bottom');  

    // var xAxisMob = d3.svg.axis()
    //   .scale(xMobile)
    //   .ticks(d3.time.hours, 8)
    //   .tickFormat(d3.time.format("%I:%M %p"))
    //   .tickPadding(8)   
    //   .orient('bottom'); 
      
    // var yAxis = d3.svg.axis()
    //   .scale(y)
    //   .tickPadding(7)
    //   .ticks(4)
    //   .tickValues([0, 0.5, 0.75, 1]) 
    //   .tickSize(-width, 0)
    //   .tickFormat(formatterPercent)
    //   .orient('left'); 

    // var yAxisMob = d3.svg.axis()
    //   .scale(yMobile)
    //   .tickPadding(7)
    //   .ticks(4)
    //   .tickValues([0, 0.5, 0.75, 1]) 
    //   .tickSize(-widthMobile, 0) 
    //   .tickFormat(formatterPercent)
    //   .orient('left'); 
      
    // Generate our SVG object

    // var svg = d3.select('#grafPreload').append('svg')
    //     .attr('width', width + margin.left + margin.right)
    //     .attr('height', height + margin.top + margin.bottom)
    //     .attr('id', 'chart')
    //   .append('g')
    //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // var svg1 = d3.select('#grafResizePreload').append('svg')
    //     .attr('width', widthMobile + marginMobile.left + marginMobile.right)
    //     .attr('height', heightMobile + marginMobile.top + marginMobile.bottom)
    //     .attr('id', 'chart')
    //   .append('g')
    //     .attr('transform', 'translate(' + marginMobile.left + ',' + marginMobile.top + ')');
     
    // svg.append('g')
    //     .attr('class', 'x axis')
    //     .attr('transform', 'translate(0,' + height + ')')
    //     .call(xAxis);
     
    // svg1.append('g')
    //     .attr('class', 'x axis')
    //     .attr('transform', 'translate(0,' + heightMobile + ')')
    //     .call(xAxisMob);

    // svg.append('g')
    //     .attr('class', 'y axis")
    //     .call(yAxis); 
        
  
    //  svg.selectAll('.y .tick text').each(function() {
    //     var text = d3.select(this);
    //     text.attr('opacity', function(){var t = d3.select(this).text(); if (t=='50%' || t == '75%') return '0';});
    //   });



    // svg1.append('g')
    //     .attr('class', 'y axis')
    //     .call(yAxisMob);

    // svg1.selectAll('.y .tick text').each(function() {
    //     var text = d3.select(this);
    //     text.attr('opacity', function(){var t = d3.select(this).text(); if (t=='50%' || t == '75%') return '0';});
    //   });
     
    // svg.append('g')
    //   .attr('class', 'y axis')
    //   .append('text')
    //   .attr('class', 'axis-label')
    //   .attr('transform', 'rotate(-90)')
    //   .attr('y', (-margin.left) + 10)
    //   .attr('x', -height/2); 

    // svg1.append('g')
    //   .attr('class', 'y axis')
    //   .append('text')
    //   .attr('class', 'axis-label')
    //   .attr('transform', 'rotate(-90)')
    //   .attr('y', (-marginMobile.left) + 10)
    //   .attr('x', -heightMobile/2);
     
    // svg.append('clipPath')
    //   .attr('id", 'clip')
    //   .append('rect')
    //   .attr('width', width)
    //   .attr('height', height);

    // svg1.append('clipPath')
    //   .attr('id', 'clip')
    //   .appen'('rect')
    //   .attr("width', widthMobile)
    //   .attr('height', heightMobile);
     
    // var div = d3.select('#grafPreload').append('div')
    //     .attr('class', 'tooltip')
    //     .style('opacity', 0);

    // var div1 = d3.select('#grafResizePreload').append('div')
    //     .attr('class', 'tooltip')
    //     .style('opacity', 0);

    // Create D3 line object and draw data on our SVG object

    // var line = d3.svg.line() 
    //     .interpolate('basis') 
    //     .x(function(d) { return x(new Date(d.timeData)); })
    //     .y(function(d) { return y(d.percent); });   

    // var line1 = d3.svg.line() 
    // .interpolate('basis')
    //     .x(function(d) { return xMobile(new Date(d.timeData)); })
    //     .y(function(d) { return yMobile(d.percent); });  
      
    // svg.selectAll('.line')
    //   .data(data)
    //   .enter()
    //   .append('path')
    //     .attr('class', 'line')
    //   .attr('clip-path', 'url(#clip)')
    //   .attr('stroke', '#000')
    //     .attr('d', line); 
    //     svg.selectAll('.line').sort(function (a, b) { 
    //       if (a[1].percent>b[1].percent || (a[1].percent==b[1].percent && a[1].color==classTickTack[2]['color'])) return -1;               
    //       else return 1;                             
    //   });
      
    // svg1.selectAll('.line')
    //   .data(data)
    //   .enter()
    //   .append('path')
    //     .attr('class', 'line')
    //   .attr('clip-path', 'url(#clip)')
    //   .attr('stroke', '#000')
    //     .attr('d', line1); 
    //     svg1.selectAll('.line').sort(function (a, b) { 
    //       if (a[1].percent>b[1].percent || (a[1].percent==b[1].percent && a[1].color==classTickTack[2]['color'])) return -1;               
    //       else return 1;                             
    //   });       


      
});


$(function(){
  function LoadPage(){
    var loadJSON = trigger();
    var incidentsCall = loadJSON.incident;
    var componentsCall = loadJSON.component;
    var subscribersCall = loadJSON.subscriber;

    Promise.all([incidentsCall, phoneCountries, componentsCall]).then(function(data){
      
      var getIncident = [],
      getСomponent = [],
      infoPhoneCountries = [];

      var incidents = data[0],
      phone_countries = data[1],
      components = data[2];

      function getIncidents(){
        for (var i=0; i<incidents.length; i++){
          getIncident[i] = {
            'id': ((window.location.hash == '#demo')?('#demo/'+incidents[i].id):incidents[i].id),
            'name': incidents[i].name,
            'created': incidents[i].created_at,
            'status': incidents[i].status,
            'planned_work': incidents[i].scheduled_for,
            'planned_work_created': incidents[i].scheduled_for,
            'planned_work_resolved': incidents[i].scheduled_until,
            'impact': incidents[i].impact,
            'monitoring': Date.parse(incidents[i].monitoring_at),
            'updated': [],
            'resolved': incidents[i].resolved_at,
            'color': (incidents[i].scheduled_for)?classTickTack[2].color:(incidents[i].impact == 'critical')?classTickTack[3].color:(incidents[i].impact == 'major')?classTickTack[4].color:((incidents[i].impact == 'minor'))?classTickTack[5].color:classTickTack[0].color,
            'z-index':(incidents[i].scheduled_for)?'z-index: 10;':(incidents[i].impact == 'critical')?'z-index: 50;':(incidents[i].impact == 'major')?'z-index: 30;':((incidents[i].impact == 'minor'))?'z-index: 20;':'z-index: 05;'
          };
          for (var j=0, x=incidents[i].incident_updates.length-1; j<incidents[i].incident_updates.length, x>=0; j++, x--){
            getIncident[i].updated[x] = {
              'id_update': incidents[i].incident_updates[j].id,
              'body': formatBodyUpdate(incidents[i].incident_updates[j].body),
              'status': incidents[i].incident_updates[j].status,
              'created': incidents[i].incident_updates[j].created_at,
              'updated': formatUpdateDate(incidents[i].incident_updates[j].updated_at),
              'update_days': differenceDays(incidents[i].incident_updates[j].updated_at)
            };
            if (getIncident[i].updated[x].status.match('_')){
                getIncident[i].updated[x].status = getIncident[i].updated[x].status.replace('_', ' ');
            }
          }
        }
        return getIncident;
      }
      getIncidents();      

      function takeOptions(status){
        if ((status == 'major_outage') && (currentIncedent() != false)){
          return {'color':classTickTack[3].color, 'content': 'Outage', 'fa_class': 'fa-times'};
        } else {
          return {'color':classTickTack[0].color, 'content': 'Operational', 'fa_class': 'fa-check'};
        }
      }      

      function unique(arr, prop){
        var flags = {};
        return arr.filter(function(entry) {
          if (flags[entry[prop]]) {
            return false;
          }
          flags[entry[prop]] = true;
          return true;
        });
      }

      function getPhoneCountries(){
        for (var i in phone_countries){
          var prop_phone = phone_countries[i];
          infoPhoneCountries.push({'abr': i, 'code': prop_phone[0], 'country': prop_phone[1]});
        }
      }
      getPhoneCountries();    

      var infoIncident = getIncident.reverse().map(function(item){
        if (item.updated) item.updated = item.updated.sort(compareUpdate);
        return item;
      });

      getСomponent.push({
        'name': 'Login',
        'color': '#8eb01e',
        'content': 'Operational',
        'fa_class': 'fa-check'
      },
      {
        'name': 'Receive message',
        'color': '#8eb01e',
        'content': 'Operational',
        'fa_class': 'fa-check'
      },{
        'name': 'Send message',
        'color': '#8eb01e',
        'content': 'Operational',
        'fa_class': 'fa-check'
      });

      function getComponents(){
        for (var i=0; i<components.length; i++){
          var status = components[i].status;
          var options = takeOptions(status);
          if (components[i].name == 'API' || components[i].name == 'Chat services / XMPP' || components[i].name == 'History and search' || components[i].name == 'Help site' || components[i].name == 'Notifications' || components[i].name == 'Website'  || components[i].name == 'Web chat' || components[i].name == 'Video chat' || components[i].name == 'Client connectivity'){
            continue;
          } else {
            getСomponent.push({
              'name': components[i].name,
              'color': options.color,
              'content': options.content,
              'fa_class': options.fa_class
            });
          }       
        }
        if (components[i].name == 'Login') {getСomponent.splice(0, 1);}
        else if (components[i].name == 'Receive message') {getСomponent.splice(1, 1);}
        else if (components[i].name == 'Send message') {getСomponent.splice(2, 1);}
        console.log(getСomponent);
        return getСomponent;
      }
      
      getComponents();

      var infoComponent = unique(getСomponent, 'name');

      var getYear = function(){
        var date = new Date().getTime();
        for (var i=0; i<infoIncident.length; i++){
          var eventDate = Date.parse(infoIncident[i].created);
          if (date>eventDate) date = eventDate;
        }
        return [new Date(date).getFullYear(), new Date(date).getMonth()];
      };
      function getLastDayOfMonth(year, month) {
        var date = new Date(year, month + 1, zero);
        return date.getDate();
      }

      function countWeekPerMonth(date){
        var firstDay = getFirstDayOfMonth(date);
        var countDays = getLastDayOfMonth(date.getFullYear(), date.getMonth());
        var countWeeks = ((firstDay-1)+countDays)/7;
        return Math.ceil(countWeeks);
      }

      function MakePerMonthMob(date){
        var tick = [];
        var last = getLastDayOfMonth(date.getFullYear(), date.getMonth());
        var lastDay = new Date(date.setDate(last)).getDay();
        var lastSunday = last - lastDay;
        var countWeek = countWeekPerMonth(date);
        var firstDaysWeek = [lastSunday];
        for (var i=1; i<=countWeek; i++){
          var first = lastSunday - 7*i;
          if (first>-6) firstDaysWeek.push(first);
        }
        firstDaysWeek.reverse();
        for (var j=0; j<firstDaysWeek.length; j++){
          tick.push({
            'num': j,
            'dayWeek': firstDaysWeek[j],
            'tickWeek': oneWeek(date, firstDaysWeek[j])
          });
        }
        return tick;
      }

      function oneWeek(date, numDay){
        var wTeack = [];
        var last = getLastDayOfMonth(date.getFullYear(), date.getMonth())+1;
        var beforeMonth = new Date(new Date().setMonth(date.getMonth()-1));
        var lastBeforeMohth = getLastDayOfMonth(beforeMonth.getFullYear(), beforeMonth.getMonth());
        if (date.getMonth()==new Date().getMonth() && date.getYear()===new Date().getYear()){
          for (var i=numDay; i<(+numDay + 7); i++){
            if (i<=0){      
              wTeack.push({'i': lastBeforeMohth + i, 'classTick': 'unactive_tick', 'numberOfTick': 'notick', 'noActiveInfos': 'noInfo'});
            } else if (i==new Date().getDate()){
              var detailEven = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
              detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
              wTeack.push({'i': i, 
                'day': i,
                'numberOfTick': 'tick'+i, 
                'infoEvents': detailEv,
                'noInfo': function(){
                  var tick = this.infoEvents;
                  return (tick[0].infoNoDate)?tick[0].noInfo:'';
                },
                'percent': function(){
                  var data = this.infoEvents;
                  var num = this.i;
                  return percentForDayToday(new Date(), data, num);
                },
                'value': function(){
                  var currentHour = new Date().getHours()*sixty*sixty + new Date().getMinutes()*sixty + new Date().getSeconds();
                  var allDay = sixty*sixty*24;
                  var percentFrom = currentHour*hundred/allDay;
                  var value='background: linear-gradient(to right, #8eb01e ' + Math.round(percentFrom) + '%, #e9e9e9 ' + Math.round(percentFrom) + '%, #e9e9e9 100%);';
                  return value;
                }
              });
            } else if (i<new Date().getDate()){
              detailEven = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
              detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
              wTeack.push({'i': i, 
                'classTick': 'upwork', 
                'numberOfTick': 'tick'+i, 
                'day': i,
                'infoEvents': detailEv,
                'noInfo': function(){
                  var tick = this.infoEvents;
                  return (tick[0].infoNoDate)?tick[0].noInfo:'';
                 },
                'percent': function(){
                  var data = this.infoEvents;
                  var num = this.i;
                  return percentForDay(new Date(), data, num);
                }
              });
            } else if (i<last){
              var detailEv = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
              if (detailEv.length>0){
                wTeack.push({'i': i, 
                  'classTick': '', 
                  'numberOfTick': 'tick'+i, 
                  'infoEvents': detailEv,
                  'day': i,
                  'percent': function(){
                    var data = this.infoEvents;
                    var num = this.i;
                    return percentForDay(new Date(date.setDate(num)), data, num);
                  }
                });
              } else {
                wTeack.push({'day': i, 'i': i, 'classTick': '', 'numberOfTick': 'notick', 'noActiveInfos': 'noInfo'});
              }
            } else if (i>=last){
              wTeack.push({'i': i+1-last, 'classTick': 'unactive_tick', 'numberOfTick': 'tick'+i, 'noActiveInfos': 'noInfo'});
            }
          }
        } else {
          for (i=numDay; i<(+numDay + 7); i++){
            if (i<=0){      
              wTeack.push({'i': lastBeforeMohth + i, 'classTick': 'unactive_tick', 'numberOfTick': 'notick', 'noActiveInfos': 'noInfo'});
            } else if (i<=getLastDayOfMonth(date.getYear(), date.getMonth())){
              detailEv = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
              detailEv = (detailEv.length>0)?detailEv:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
              wTeack.push({'i': i,
                'classTick': 'upwork', 
                'day': i,
                'numberOfTick': 'tick'+i, 
                'infoEvents': detailEv,
                'noInfo': function(){
                  var tick = this.infoEvents;
                  return (tick[0].infoNoDate)?tick[0].noInfo:'';
                },
                'percent': function(){
                  var data = this.infoEvents;
                  var num = this.i;
                  return percentForDay(new Date(date.setDate(num)), data, num);
                }
              });
            } else if (i>=last){
              wTeack.push({'i': i+1-last, 'classText': 'unactive_tick' , 'numberOfTick': 'notick'});
            }
          }
        }
        return wTeack;
      }

      function makeMonthTicks(date){
        var tick = [];
        var last = getLastDayOfMonth(date.getFullYear(), date.getMonth())+1;
        if (date.getMonth()==new Date().getMonth() && date.getYear()===new Date().getYear()){
          for (var i=1; i<last; i++){
            if (i==new Date().getDate()){
              var detailEven = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
              detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
              tick.push({'i': i, 
                'numberOfTick': 'tick'+i, 
                'infoEvents': detailEv,
                'noInfo': function(){
                  var tick = this.infoEvents;
                  return (tick[0].infoNoDate)?tick[0].noInfo:'';
                },
                'percent': function(){
                  var data = this.infoEvents;
                  var num = this.i;
                  return percentForDayToday(new Date(), data, num);
                },
                'value': function(){
                  var currentHour = new Date().getHours()*sixty*sixty + new Date().getMinutes()*sixty + new Date().getSeconds();
                  var allDay = sixty*sixty*24;
                  var percentFrom = currentHour*hundred/allDay;
                  var value='background: linear-gradient(to right, #8eb01e ' + Math.round(percentFrom) + '%, #e9e9e9 ' + Math.round(percentFrom) + '%, #e9e9e9 100%);';
                  return value;
                }
              });
            } else if (i<new Date().getDate()){
              detailEven = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
              detailEv = (detailEven.length)?detailEven:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
              tick.push({'i': i,
                'classTick': 'upwork', 
                'numberOfTick': 'tick'+i, 
                'infoEvents': detailEv,
                'noInfo': function(){
                  var tick = this.infoEvents;
                  return (tick[0].infoNoDate)?tick[0].noInfo:'';
                },
                'percent': function(){
                  var data = this.infoEvents;
                  var num = this.i;
                  return percentForDay(new Date(), data, num);
                }
              });
            } else {
              var detailEv = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
              if (detailEv.length>0){
                tick.push({'i': i, 
                  'classTick': '', 
                  'numberOfTick': 'tick'+i, 
                  'infoEvents': detailEv,
                  'percent': function(){
                    var data = this.infoEvents;
                    var num = this.i;
                    return percentForDay(new Date(date.setDate(num)), data, num);
                  }
                });
              } else {
                tick.push({'i': i, 'classTick': 'noDataNoActive', 'numberOfTick': 'tick'+i, 'noActiveInfos': 'noInfo'});
              }
            }
          }
        } else {
          for (i=1; i<last; i++){
            if (i<=getLastDayOfMonth(date.getYear(), date.getMonth())){
              detailEv = filterHours(detailEvents(new Date(date.setDate(i)))[0]);
              detailEv = (detailEv.length>0)?detailEv:[{'infoNoDate': 'All good here!', 'noInfo': 'noInfo'}];
              tick.push({'i': i, 
                'classTick': 'upwork', 
                'numberOfTick': 'tick'+i,
                'infoEvents': detailEv,
                'noInfo': function(){
                  var tick = this.infoEvents;
                  return (tick[0].infoNoDate)?tick[0].noInfo:'';
                },
               'percent': function(){
                  var data = this.infoEvents;
                  var num = this.i;
                  return percentForDay(new Date(date.setDate(num)), data, num);
                }
              });
            } else {
              tick.push({'i': i, 'classText': 'unactive' , 'numberOfTick': 'tick'+i});
            }
          }
        }
        return tick;
      }

      function detailEvents(date){
        var dayEv = [];
        for (var i=0; i<infoIncident.length; i++){
          if (!infoIncident[i].planned_work){
            var createdMs = Date.parse(infoIncident[i].created);
            var resolvedMs = Date.parse(infoIncident[i].resolved) || new Date(); 
            var created= new Date(createdMs);
            var resolved = new Date(resolvedMs);
            if (resolved.getFullYear()!=date.getFullYear() || resolved.getMonth()!=date.getMonth() || resolved.getDate()!=date.getDate()) resolved = new Date(resolved.getFullYear(), resolved.getMonth(), resolved.getDate(), hourVal, minsec, minsec);
            if (created.getFullYear()==date.getFullYear() && created.getMonth()==date.getMonth() && created.getDate()==date.getDate()) {
              dayEv.push({
                'id': infoIncident[i].id,
                'name': infoIncident[i].name,
                'created': created,
                'noInfo': 'isInfo',
                'color': infoIncident[i].color,
                'z-index': infoIncident[i]['z-index'],
                'time_created': function(){
                  return timeFormatter(this.created);
                },
                'time_resolved': function(){
                  return timeFormatter(this.resolved);
                },
                'percent_created': function(){
                  var hole = sixty*24;
                  var minutes = countOfTime(this.created);
                  return Math.round(minutes*hundred/hole);
                },
                'monitoring': infoIncident[i].monitoring,
                'percent_created_data': function(){
                  var hole = sixty*24;
                  var minutes = countOfTime(this.created);
                  if (this.created.getHours() == '00' && this.created.getMinutes() == '00') return 'left: 0%;';
                  if ((hoursCompare(this.created))<sixty*sixty) return 'left: 0%;';
                  if ((hoursCompare(this.resolved)-hoursCompare(this.created))<5400) return 'left: '+Math.round(minutes*hundred/hole-countOfshownMonth)+'%;';
                  return 'left: '+Math.round(minutes*hundred/hole-countOfshownMonth)+'%;';
                },
                'graf_created_data': true,
                'graf_resolved_data': true,
                'percent_resolved': function(){
                  var hole = sixty*24;
                  var minutes = countOfTime(this.resolved);
                  return Math.round(minutes*hundred/hole);
                },
                'percent_resolved_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  if (this.created.getHours() == '00' && this.created.getMinutes() == '00'){
                    if (this.resolved.getHours()==0) return 'left: 1%;';
                    if (this.resolved.getHours()<=1) return 'left: 3%;';
                    if (this.resolved.getHours()<=2) return 'left: 6%;';
                  }
                  if (endDate(this.resolved)) return 'left: '+Math.round(minutes*hundred/hole-4)+'%;';
                  return 'left: '+Math.round(minutes*hundred/hole-6)+'%;';
                },
                'impact': infoIncident[i].impact,
                'status': infoIncident[i].status,
                'updated': infoIncident[i].updated,
                'resolved': resolved,
                'planned_work': false
              });
            } else if ((createdMs<date.getTime() && date.getTime()<resolvedMs) || (resolved.getFullYear()==date.getFullYear() && resolved.getMonth()==date.getMonth() && resolved.getDate()==date.getDate())){
              if (created.getFullYear()!=date.getFullYear() || created.getMonth()!=date.getMonth() || created.getDate()!=date.getDate()) created = new Date(created.getFullYear(), created.getMonth(), created.getDate(), zero, zero, zero);
              dayEv.push({
                'id': infoIncident[i].id,
                'name': infoIncident[i].name,
                'created': created,
                'noInfo': 'isInfo',
                'color': infoIncident[i].color,
                'z-index': infoIncident[i]['z-index'],
                'time_created': function(){
                  return timeFormatter(this.created);
                },
                'monitoring': infoIncident[i].monitoring,
                'time_resolved': function(){
                  return timeFormatter(this.resolved);
                },
                'percent_created': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  return Math.round(minutes*hundred/hole);
                },
                'graf_created_data': true,
                'graf_resolved_data': true,
                'percent_created_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  if (this.created.getHours() == '00' && this.created.getMinutes() == '00') return 'left: 0%;';
                  if ((hoursCompare(this.created))<sixty*sixty) return 'left: 0%;';
                  if ((hoursCompare(this.resolved)-hoursCompare(this.created))<5400) return 'left: 0%;';
                  if ((hoursCompare(this.resolved)-hoursCompare(this.created))<sixty*sixty) return 'left: 0%;';
                  return 'left: '+Math.round(minutes*hundred/hole)+'%;';
                },
                'percent_resolved': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  return Math.round(minutes*hundred/hole);
                },
                'percent_resolved_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  if (this.created.getHours() == '00' && this.created.getMinutes() == '00'){
                    if (this.resolved.getHours()==0) return 'left: 1%;';
                    if (this.resolved.getHours()<=1) return 'left: 3%;';
                    if (this.resolved.getHours()<=2) return 'left: 6%;';
                  }
                  return 'left: '+Math.round(minutes*hundred/hole-6)+'%;';
                },
                'impact': infoIncident[i].impact,
                'status': infoIncident[i].status,
                'updated': infoIncident[i].updated,
                'resolved': resolved,
                'planned_work': false
              });
            }
          } else {
            createdMs = Date.parse(infoIncident[i].planned_work_created);
            resolvedMs = Date.parse(infoIncident[i].planned_work_resolved); 
            created = new Date(createdMs);
            resolved = new Date(resolvedMs);
            if (resolved.getFullYear()!=date.getFullYear() || resolved.getMonth()!=date.getMonth() || resolved.getDate()!=date.getDate()) resolved = new Date(resolved.getFullYear(), resolved.getMonth(), resolved.getDate(), hourVal, minsec, minsec);
            if (created.getFullYear()==date.getFullYear() && created.getMonth()==date.getMonth() && created.getDate()==date.getDate()) {
              dayEv.push({
                'id': infoIncident[i].id,
                'name': infoIncident[i].name,
                'created': created,
                'noInfo': 'isInfo',
                'impact': infoIncident[i].impact,
                'color': infoIncident[i].color,
                'z-index': infoIncident[i]['z-index'],
                'monitoring': infoIncident[i].monitoring,
                'time_created': function(){
                  return timeFormatter(this.created); 
                },
                'time_resolved': function(){
                  return timeFormatter(this.resolved);
                },
                'percent_created': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  return Math.round(minutes*hundred/hole);
                },
                'percent_created_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  if (this.created.getHours() == '00' && this.created.getMinutes() == '00') return 'left: 0%;';
                  if ((hoursCompare(this.created))<sixty*sixty) return 'left: 0%;';
                  if ((hoursCompare(this.resolved)-hoursCompare(this.created))<5400) return 'left: '+Math.round(minutes*hundred/hole-countOfshownMonth)+'%;';
                  return 'left: '+Math.round(minutes*hundred/hole-countOfshownMonth)+'%;';
                },
                'percent_resolved': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  return Math.round(minutes*hundred/hole);
                },
                'percent_resolved_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  if (endDate(this.resolved)) return 'left: '+Math.round(minutes*hundred/hole-4)+'%;';
                  if (this.created.getHours() == '00' && this.created.getMinutes() == '00'){
                    if (this.resolved.getHours()==0) return 'left: 1%;';
                    if (this.resolved.getHours()<=1) return 'left: 3%;';
                    if (this.resolved.getHours()<=2) return 'left: 6%;';
                  }
                  return 'left: "+Math.round(minutes*hundred/hole-6)+"%;';
                },
                'status': infoIncident[i].status,
                'updated': infoIncident[i].updated,
                'resolved': resolved,
                'graf_created_data': true,
                'graf_resolved_data': true,
                'planned_work': true
              });
            } else if ((createdMs<=date.getTime() && date.getTime()<=resolvedMs) || (resolved.getFullYear()==date.getFullYear() && resolved.getMonth()==date.getMonth() && resolved.getDate()==date.getDate())) {
              if (created.getFullYear()!=date.getFullYear() || created.getMonth()!=date.getMonth() || created.getDate()!=date.getDate()) created = new Date(created.getFullYear(), created.getMonth(), created.getDate(), zero, zero, zero);
              dayEv.push({
                'id': infoIncident[i].id,
                'name': infoIncident[i].name,
                'created': created,
                'noInfo': 'isInfo',
                'impact': infoIncident[i].impact,
                'color': infoIncident[i].color,
                'monitoring': infoIncident[i].monitoring,
                'time_created': function(){
                  return timeFormatter(this.created);
                },
                'time_resolved': function(){
                  return timeFormatter(this.resolved);
                },
                'percent_created': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  return Math.round(minutes*hundred/hole);
                },
                'percent_created_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.created);
                  if (this.created == new Date(created.getFullYear(), created.getMonth(), created.getDate(), zero, zero, zero)) return 'left: 0%;';
                  if ((hoursCompare(this.created))<sixty*sixty) return 'left: 0%;';
                  if ((hoursCompare(this.resolved)-hoursCompare(this.created))<5400) return 'left: 0%;';
                  if ((hoursCompare(this.resolved)-hoursCompare(this.created))<sixty*sixty) return 'left: 0%;';
                  return 'left: '+Math.round(minutes*hundred/hole)+'%;';
                },
                'percent_resolved': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  return Math.round(minutes*hundred/hole);
                },
                'percent_resolved_data': function(){
                  var hole = 1440;
                  var minutes = countOfTime(this.resolved);
                  if (this.created.getHours() == '00' && this.created.getMinutes() == '00'){
                    if (this.resolved.getHours()==0) return 'left: 1%;';
                    if (this.resolved.getHours()<=1) return 'left: 3%;';
                    if (this.resolved.getHours()<=2) return 'left: 6%;';
                  }
                  return 'left: '+Math.round(minutes*hundred/hole-6)+'%;';
                },
                'status': infoIncident[i].status,
                'updated': infoIncident[i].updated,
                'resolved': resolved,
                'z-index': infoIncident[i]['z-index'],
                'graf_created_data': true,
                'graf_resolved_data': true,
                'planned_work': true
              });
            }
          }
        }
        var arr = [];
        for (var u=0; u<dayEv.length; u++){
          if ((dayEv[u].graf_created_data || dayEv[u].graf_resolved_data)){
            arr.push(dayEv[u]);
          }
        }
        dayEv.sort(compareTime);
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
          'showPercent': function(){
            if (date.getMonth() == new Date().getMonth()){
              return 'display: none';
            }
          }
        };
      }

      function createTicksMob(date){
        return {
          'month': monthNames[date.getMonth()], 
          'monthClass': ('month' + date.getMonth()),
          'tick': MakePerMonthMob(date),
          'percentPerMonth': function(){
            var tick = this.tick;
            return percPerMonth(tick);
          },
          'weekTick': []
        };
      }

      function getFirstDayOfMonth(){
        return new Date(new Date().setDate(1)).getDay();
      }

      function filterHours(dayEv){
        dayEv.sort(compareTimeReverse);
        filterManyEvent(dayEv);
        for (var t=0; t<dayEv.length; t++){
          if (dayEv[t].impact=='none' && !dayEv[t].planned_work){
            dayEv[t].percent_created_data = 'display: none;';
            dayEv[t].percent_resolved_data= 'display: none;';
          }
          if ((hoursCompare(dayEv[t]['resolved'])-hoursCompare(dayEv[t]['created']))<3.5*sixty*sixty && (dayEv[t]['percent_created_data']!='display: none;' && dayEv[t]['percent_resolved_data']!='display: none;') && dayEv[t]['created'].getHours()=='00' && dayEv[t]['created'].getMinutes()=='00'){
            dayEv[t]['percent_created_data'] = 'display: none;';
          }
          if ((hoursCompare(dayEv[t]['resolved'])-hoursCompare(dayEv[t]['created']))<3.5*sixty*sixty && (dayEv[t]['percent_created_data']!='display: none;' && dayEv[t]['percent_resolved_data']!='display: none;')){
            dayEv[t]['percent_resolved_data'] = 'display: none;';
          }
          for (var z=t+1; z<dayEv.length; z++){
            if (hoursCompare(dayEv[t].created)<=hoursCompare(dayEv[z].created) && hoursCompare(dayEv[t].resolved)>=hoursCompare(dayEv[z].resolved) && (+dayEv[t]['z-index'].slice(-3, -1))>=(+dayEv[z]['z-index'].slice(-3, -1))){
              if (dayEv[t].percent_created_data!='display: none;' || hoursCompare(dayEv[t].created)<hoursCompare(dayEv[z].created)) dayEv[z].percent_created_data = 'display: none;';
              if (dayEv[t].percent_resolved_data!='display: none;' || hoursCompare(dayEv[t].resolved)>hoursCompare(dayEv[z].resolved)) dayEv[z].percent_resolved_data = 'display: none;';
            } else if (hoursCompare(dayEv[z].created)<=hoursCompare(dayEv[t].created) && hoursCompare(dayEv[z].resolved)>=hoursCompare(dayEv[t].resolved) && (+dayEv[z]['z-index'].slice(-3, -1))>=(+dayEv[t]['z-index'].slice(-3, -1))){
              if (dayEv[z].percent_created_data!='display: none;') dayEv[t].percent_created_data = 'display: none;';
              if (dayEv[z].percent_resolved_data!='display: none;') dayEv[t].percent_resolved_data = 'display: none;';
            } else if (hoursCompare(dayEv[t].created)<=hoursCompare(dayEv[z].created) && hoursCompare(dayEv[t].resolved)>=hoursCompare(dayEv[z].created) && hoursCompare(dayEv[t].resolved)<hoursCompare(dayEv[z].resolved) && (+dayEv[t]['z-index'].slice(-3, -1))>=(+dayEv[z]['z-index'].slice(-3, -1))){
              dayEv[z].percent_created_data = 'display: none;';
              if (Math.abs(hoursCompare(dayEv[t].resolved)-hoursCompare(dayEv[z].resolved))<6400){
                dayEv[t].percent_resolved_data = 'display: none;';
              }
            }
            if (Math.abs(hoursCompare(dayEv[t].resolved)-hoursCompare(dayEv[z].resolved))<5400 && (dayEv[t].percent_resolved_data!='display: none;' && dayEv[z].percent_resolved_data!='display: none;')){
              if (hoursCompare(dayEv[t].resolved)>=hoursCompare(dayEv[z].resolved)){
                dayEv[z].percent_resolved_data = 'display: none;';
              } else {
                dayEv[t].percent_resolved_data = 'display: none;';
              }
            }
            if (Math.abs(hoursCompare(dayEv[t].created)-hoursCompare(dayEv[z].created))<5400 && (dayEv[t].percent_created_data!='display: none;' && dayEv[z].percent_created_data!='display: none;')){
              if (hoursCompare(dayEv[t].created)>=hoursCompare(dayEv[z].created)){
                dayEv[t].percent_created_data = 'display: none;';
              } else {
                dayEv[z].percent_created_data = 'display: none;';
              }
            }
            if (Math.abs(hoursCompare(dayEv[t]['created'])-hoursCompare(dayEv[z].resolved))<5400){
              if (dayEv[t].percent_created_data!='display: none;' && dayEv[z].percent_resolved_data!='display: none;'){
                dayEv[z].percent_resolved_data = 'display: none;';
              }
            }
            if (Math.abs(hoursCompare(dayEv[z].created)-hoursCompare(dayEv[t].resolved))<5400){
              if (dayEv[z].percent_created_data!='display: none;' && dayEv[t].percent_resolved_data!='display: none;'){
                dayEv[t].percent_resolved_data = 'display: none;';
              }
            }
          }
        }
        dayEv.sort(compareTime);
        return dayEv;
      }

      function filterManyEvent(dayEv){
        for (var t=0; t<dayEv.length; t++){
          if ((t+1)<dayEv.length && (hoursCompare(dayEv[t+1]['created'])-hoursCompare(dayEv[t]['resolved']))<sixty*sixty && (hoursCompare(dayEv[t]['resolved'])-hoursCompare(dayEv[t]['created']))<sixty*sixty && (hoursCompare(dayEv[t+1]['resolved'])-hoursCompare(dayEv[t+1]['created']))<sixty*sixty){
            dayEv[t]['percent_resolved_data'] = 'display: none;';
            dayEv[t+1]['percent_created_data'] = 'display: none;';
            dayEv[t]['percent_created_data']= function(){
              var hole = 1440;
              var minutes = countOfTime(this.created);
              return 'left: '+Math.round(minutes*hundred/hole-countOfshownMonth)+'%;';
            };
            dayEv[t+1].percent_resolved_data = function(){
              var hole = 1440;
              var minutes = countOfTime(this.resolved);
              if (endDate(this.resolved)) return 'left: '+Math.round(minutes*hundred/hole-4)+'%;';
              return 'left: '+Math.round(minutes*hundred/hole-countOfshownMonth)+'%;';
            };
          }
        }
      }

      function makeMonth(date){    
        var month=date.getMonth();
        var months = [];
        if (date.getFullYear() == new Date().getFullYear()){
          var lastMonth = (date.getFullYear() == getYear()[0])?getYear()[1]:0;
          for (var i=month; i>=lastMonth; i--){
            if (date.getMonth() == new Date(date.setMonth(i)).getMonth()){
              var currentMonth = new Date(date.setMonth(i));
            } else {
              currentMonth = new Date(date.getFullYear(), i, 1);
            }
            months.push(createTicks(currentMonth));
          }
        } else if (date.getFullYear() != getYear()[0]){
          for (i=11; i>=0; i--){
            currentMonth = new Date(date.setMonth(i));
            months.push(createTicks(currentMonth));
          }
        } else {
          for (i=11; i>=getYear()[1]; i--){
            currentMonth = new Date(date.setMonth(i));
            months.push(createTicks(currentMonth));
          }
        }
        return months;
      }

      function makeMonthMob(date){    
        var month=date.getMonth();
        var months = [];
        if (date.getFullYear() == new Date().getFullYear()){
          var lastMonth = (date.getFullYear() == getYear()[0])?getYear()[1]:0;
          for (var i=month; i>=lastMonth; i--){
            if (date.getMonth() == new Date(date.setMonth(i)).getMonth()){
              var currentMonth = new Date(date.setMonth(i));
            } else {
              currentMonth = new Date(date.getFullYear(), i, 1);
            }
            months.push(createTicksMob(currentMonth));
          }
        } else if (date.getFullYear() != getYear()[0]){
          for (i=11; i>=0; i--){
            currentMonth = new Date(date.setMonth(i));
            months.push(createTicksMob(currentMonth));
          }
        } else {
          for (i=11; i>=getYear()[1]; i--){
            currentMonth = new Date(date.setMonth(i));
            months.push(createTicksMob(currentMonth));
          }
        }
        return months;
      }

      function makeYear(date){
        var year=date.getFullYear();
        var length = year - getYear()[0];
        var years = [];
        for (var i=0; i<=length; i++){
          date = new Date(date.setFullYear(year - i));
          years.push({'year': date.getFullYear(),
                      'yearClass': date.getFullYear(),
                      'tickMonth': makeMonth(date)
                    });        
        }     
        return years;
      }

      function makeYearMob(date){
        var year=date.getFullYear();
        var length = year - getYear()[0];
        var years = [];
        for (var i=0; i<=length; i++){
          date = new Date(date.setFullYear(year - i));
          years.push({'year': date.getFullYear(),
                      'yearClass': date.getFullYear(),
                      'tickMonth': makeMonthMob(date)
                    });      
        }
        return years;
      }

      var ticks = makeYear(new Date());
      var ticksForMob = makeYearMob(new Date());
      
      function currentIncedent(){
        var current = [];
        for (var i=0; i<infoIncident.length; i++){
          if (!infoIncident[i].planned_work && !infoIncident[i].resolved){
            var createdMs = Date.parse(infoIncident[i].created);
            var created= new Date(createdMs);
            current.push({
              'id': infoIncident[i].id,
              'name': infoIncident[i].name,
              'created': created,
              'noInfo': 'isInfo',
              'color': infoIncident[i].color,
              'time_created': function(){
                return timeFormatter(this.created);
              },
              'time_resolved': function(){
                return timeFormatter(this.resolved);
              },
              'impact': infoIncident[i].impact,
              'status': infoIncident[i].status,
              'updated': infoIncident[i].updated,
              'resolved': new Date()});
          } else if (infoIncident[i].planned_work){
            createdMs = Date.parse(infoIncident[i].planned_work_created);
            var resolvedMs = Date.parse(infoIncident[i].planned_work_resolved); 
            created = new Date(createdMs);
            var resolved = new Date(resolvedMs);
            if (resolvedMs > new Date().getTime() && createdMs <= new Date().getTime()){
              current.push({
                'id': infoIncident[i].id,
                'name': infoIncident[i].name,
                'created': created,
                'noInfo': 'isInfo',
                'color': infoIncident[i].color,
                'time_created': function(){
                  return timeFormatter(this.created);
                },
                'time_resolved': function(){
                  return timeFormatter(this.resolved);
                },
                'impact': infoIncident[i].impact,
                'status': infoIncident[i].status,
                'updated': infoIncident[i].updated,
                'resolved': resolved});
            }
          }
        }
        current.sort(compareTime);
        return (current.length)?current:false;
      }
      var currentUnsolved = [{
        'currentIncedents': currentIncedent(),
        'styleToShow': function(){
          return (this.currentIncedents)?'showTitle':'hiddenTitle';
        }}];

      var template = $('#incidentsTemplate').html();
      var output = Mustache.render(template, {incidents: incidents, ticks: ticks, ticksForMob: ticksForMob, infoComponent: infoComponent, infoPhoneCountries: infoPhoneCountries, currentUnsolved: currentUnsolved});

      $('#ready-json').html(output);
      // $('#ready-json .title').html(changeTitle());
      $('#footer').css('display', 'block');

      $(document).ready(function(){
        $('#ready-json').parent().css('overflow', 'visible');
        $('#preload').fadeOut(1500);
          $('#ready-json').animate({
            'opacity': 1,
            'overflow': 'visible'}, 2000);
          var monthCurrent = lastNeedDate.getMonth();
          var yearCurrent = lastNeedDate.getFullYear();
          if (monthCurrent==0){
            yearCurrent = yearCurrent -1;
            monthCurrent = 12;
          }
          $('.'+yearCurrent+' .tick-month'+(monthCurrent-1)).css('display', 'none');
          $('.'+yearCurrent+' .month'+(monthCurrent-1)).css('display', 'none');
      });


      function percPerlastThirtyDay(){
        var sum = 0;
        var arr=[];
        var tick = new Date().getDate();
        var s = makeMonthTicks(new Date());
        for (var i=0; i<tick; i++){
          if (s[i].percent){
            arr.push(+s[i].percent());
          }
        }
        if (tick < 30){
          var s1 = makeMonthTicks(new Date(new Date().setMonth(new Date().getMonth() - 1)));
          s1 = s1.reverse().slice(0, 30-tick);
          for (var k =0; k<s1.length; k++){
            arr.push(+s1[k].percent());
          }
        }
        for (var j=0; j<arr.length; j++){
          sum += arr[j];
        }
        var result = (sum/arr.length).toFixed(3);
        if (result.toString().charAt(result.toString().length - 1) == '0'){
          result = result.toString().slice(0, result.toString().length - 1);
        }
        return result;
      }

      $('.statusPercent .perceTitle').html(percPerlastThirtyDay());

      $('#target').tooltip({
        items: 'span.icon-indicator',
        content: function(){
          return $(this).prev().attr('data-content');
        },
        position: { my: 'center top', 
                    at: 'center-5 bottom-57'},
        show: null, 
        open: function(event, ui){
          if (typeof(event.originalEvent) === 'undefined'){
            return false;
          }
          var $id = $(ui.tooltip).attr('id');
          $('div.ui-tooltip').not('#' + $id).remove();
        },
        close: function(event, ui){
          ui.tooltip.hover(function(){
            $(this).stop(true).fadeTo(400, 1); 
          },
          function(){
            $(this).fadeOut('400', function(){
              $(this).remove();
            });
          });
        }});

      $(document).ready(function(){
        $('.updates-dropdown-sections-container #updates-dropdown-email').css('display', 'block'); 
        $('.updates-dropdown-nav a.updates-dropdown-email-btn').addClass('active');
      });
      $('div.subscribe:first-child').on('click', function(e) {
        $('.updates-dropdown').toggle(); 
        e.stopPropagation();    
      });
      $('.updates-dropdown').on('click', function(e) {
        e.stopPropagation(); 
      }); 
      $('a#phone-country').on('click', function() {
        $('select.phone-country').css('display', 'block');      
        $('select.phone-country').val('us');
        $('div#updates-dropdown-sms p.help-block').css('display', 'none');
      });
      $('.updates-dropdown-nav a.updates-dropdown-email-btn').on('click', function() {
        $('.updates-dropdown-section').css('display', 'none'); 
        $('.updates-dropdown-sections-container #updates-dropdown-email').css('display', 'block');
        $('.updates-dropdown-nav a').removeClass('active');
        $('.updates-dropdown-nav a.updates-dropdown-email-btn').addClass('active');
      });
      $('.updates-dropdown-nav a.updates-dropdown-sms-btn').on('click', function() { 
        $('.updates-dropdown-section').css('display', 'none');    
        $('.updates-dropdown-sections-container #updates-dropdown-sms').css('display', 'block');
        $('.updates-dropdown-nav a').removeClass('active');
        $('.updates-dropdown-nav a.updates-dropdown-sms-btn').addClass('active');
      });
      $('.updates-dropdown-nav a.updates-dropdown-webhook-btn').on('click', function() {
        $('.updates-dropdown-section').css('display', 'none');
        $('.updates-dropdown-sections-container #updates-dropdown-webhook').css('display', 'block');
        $('.updates-dropdown-nav a').removeClass('active');
        $('.updates-dropdown-nav a.updates-dropdown-webhook-btn').addClass('active');
      });
      $('.updates-dropdown-nav a.updates-dropdown-twitter-btn').on('click', function() {
        $('.updates-dropdown-section').css('display', 'none'); 
        $('.updates-dropdown-sections-container #updates-dropdown-twitter').css('display', 'block');
        $('.updates-dropdown-nav a').removeClass('active');
        $('.updates-dropdown-nav a.updates-dropdown-twitter-btn').addClass('active');
      });
      $('.updates-dropdown-nav a.updates-dropdown-support-btn').on('click', function() {
        $('.updates-dropdown-section').css('display', 'none');
        $('.updates-dropdown-sections-container #updates-dropdown-support').css('display', 'block');
        $('.updates-dropdown-nav a').removeClass('active');
        $('.updates-dropdown-nav a.updates-dropdown-support-btn').addClass('active');
      });
      $('.updates-dropdown-nav a.updates-dropdown-atom-btn').on('click', function(e) {
        $('.updates-dropdown-section').css('display', 'none');   
        $('.updates-dropdown-sections-container #updates-dropdown-atom').css('display', 'block');
        $('.updates-dropdown-nav a').removeClass('active');
        $('.updates-dropdown-nav a.updates-dropdown-atom-btn').addClass('active');
        e.stopPropagation(); 
      });
      $('.updates-dropdown-nav a.updates-dropdown-close-btn').on('click', function() {
        $('.updates-dropdown').hide();
      });
      $(document).click(function(){
        $('.updates-dropdown').hide();
      });
      $('#footer .footer-email-updates').on('click', function(e) {
        $('.updates-dropdown').toggle(); 
        e.stopPropagation();
        window.scrollTo(0, 0);
      });

      var regError409 = /('status':409)/;
      var regError422 = /('status':422)/;
      var regError201 = /('status':201)/;
    
      $('#subscribe-btn-email').click(function() {
        var emailElement = $('input#email');
        if (emailElement.is(':valid')){
          $.ajax({
            url: subscribersCall , 
            type: 'POST',
            crossdomain: true, 
            contentType: 'application/json',
            dataType: 'text',
            data: JSON.stringify({
              'subscriber': {    
                'email': emailElement.val()}}),
            complete: function(xhr) {
              if (xhr.responseText.search(regError409) !== -1){
                $('.infoLine').css('display', 'block');
                $('.infoLine').css('background-color', '#3498db');
                $('.infoLine').css('border', '1px solid #167abd');              
                $('.infoLine span').html('This email is already subscribed to updates.');
                setTimeout('$(".infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError422) !== -1){
                $('.infoLine').css('display', 'block');
                $('.infoLine').css('background-color', '#e74c3c');
                $('.infoLine').css('border', '1px solid #c92e1e');
                $('.infoLine span').html('Please enter a valid email or a phone number that you wish to have updates sent to.');
                setTimeout('$(".infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError201) !==-1){
                $('input#email').val('');
                $('.updates-dropdown').hide();         
                $('.infoLine').css('display', 'block');
                $('.infoLine').css('background-color', '#3498db');
                $('.infoLine').css('border', '1px solid #167abd');
                $('.infoLine span').html('Your email is now subscribed to updates! A confirmation message should arrive soon.');
                setTimeout('$(".infoLine").css("display", "none")', 7000);
              }
            } 
          });
        }});

      $('select.phone-country').val('us');
      $('#subscribe-btn-sms').click(function() {
        var phoneElement = $('input#phone-number');    
        var codeCountry = $('select.phone-country option:selected').val();
        if (phoneElement.is(':valid')){
          $.ajax({
            url: subscribersCall, 
            type: 'POST',
            crossdomain: true, 
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify({
              'subscriber': {
                'phone_number': phoneElement.val(),
                'phone_country': codeCountry}}),       
            complete: function(xhr) {
              if (xhr.responseText.search(regError409) !== -1){
                $('.infoLine').css('display', 'block');
                $('.infoLine').css('background-color', '#3498db');
                $('.infoLine').css('border', '1px solid #167abd');              
                $('.infoLine span').html('This phone is already subscribed to updates.');
                setTimeout('$(".infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError422) !== -1){
                $('.infoLine').css('display', 'block');
                $('.infoLine').css('background-color', '#e74c3c');
                $('.infoLine').css('border', '1px solid #c92e1e');
                $('.infoLine span').html('Please enter a valid email or a phone number that you wish to have updates sent to.');
                setTimeout('$(".infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError201) !==-1){
                $('input#email').val('');
                $('.updates-dropdown').hide();         
                $('.infoLine').css('display', 'block');
                $('.infoLine').css('background-color', '#3498db');
                $('.infoLine').css('border', '1px solid #167abd');
                $('.infoLine span').html('Your phone is now subscribed to updates! A confirmation message should arrive soon.');
                setTimeout('$(".infoLine").css("display", "none")', 7000);
              }
            } 
          });
        }
      });

      $('#subscribe-btn-webhook').click(function() {
        var emailElement = $('input#email-webhooks');
        var endpointWebhooks = $('input#endpoint-webhooks');
        if (emailElement.is(':valid') && endpointWebhooks.is(':valid')){
          $.ajax({
            url: subscribersCall, 
            type: 'POST',
            crossdomain: true, 
            dataType: 'text', 
            contentType: 'application/json',
            data: JSON.stringify({
              'subscriber': {
                'email': emailElement.val(),
                'endpoint': endpointWebhooks.val()}}),
            complete: function(xhr) {
              if (xhr.responseText.search(regError409) !== -1){
                $('.infoLine').css('display', 'block');
                $('.infoLine').css('background-color', '#3498db');
                $('.infoLine').css('border', '1px solid #167abd');              
                $('.infoLine span').html('Please enter an endpoint and a valid email at which you can be reached.');
                setTimeout('$(".infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError422) !== -1){
                $('.infoLine').css('display', 'block');
                $('.infoLine').css('background-color', '#e74c3c');
                $('.infoLine').css('border', '1px solid #c92e1e');
                $('.infoLine span').html('Please enter an endpoint and a valid email at which you can be reached.');
                setTimeout('$(".infoLine").css("display", "none")', 7000);
              } else if (xhr.responseText.search(regError201) !==-1){
                $('input#email').val('');
                $('.updates-dropdown').hide();         
                $('.infoLine').css('display', 'block');
                $('.infoLine').css('background-color', '#3498db');
                $('.infoLine').css('border', '1px solid #167abd');
                $('.infoLine span').html('Your endpoint is now subscribed to webhook updates. A confirmation message should arrive soon.');
                setTimeout('$(".infoLine").css("display", "none")', 7000);
              }
            }});
        }
      });        

      //function to get json by month
      function makeMonthsEvents(date){
        var year=date.getFullYear();
        var length = year - getYear()[0];
        for (var j=0; j<=length; j++){
          for (var i=13; i>=0; i--){
            var eventData = getPerMonth(new Date(new Date(date.getFullYear()-j, i, 1)), infoIncident);
            addShaduleWork(eventData);
            addIncident(eventData);
          }
        }
      }
      
      makeMonthsEvents(new Date());

      function addIncident(data){
        if (data){
          for (var t=0; t<data.length; t++){
            if (!data[t].planned_work_created){
              var eventDay = dateEvent(data[t].created);
              var createdDate = hourInSec(data[t].created);
              var resolvedDate = hourInSec(data[t].resolved) || hourInSec(new Date());
              var countDay = countOfDay(data[t].created, data[t].resolved);
              if (countDay==0){
                $('#ready-json .'+ yearEvent(data[t].created) +' .month'+ monthEvent(data[t].created) + ' .tick'+eventDay).parent().append('<li style="'+gradient(createdDate, data[t].color, resolvedDate)+data[t]['z-index']+'" class="tick-tacks tick'+eventDay+'"></li>');
              } else {
                for (var j=0; j<=countDay; j++){
                  var creat = new Date(Date.parse(data[t].created));
                  var creatShift = new Date(creat.setDate(creat.getDate()+j));
                  if (j==0){
                    $('#ready-json .'+ yearEvent(data[t].created) +' .month'+ monthEvent(data[t].created) + ' .tick'+eventDay).parent().append('<li style="'+gradient(createdDate, data[t].color)+data[t]['z-index']+'" class="tick-tacks tick'+eventDay+'" ></li>');
                    $('#ready-json .'+yearEvent(data[t].created)+' #'+monthEvent(data[t].created)+'-'+eventDay+'-'+yearEvent(data[t].created)+' .tick-tacks_line .line').append('<div style="'+gradient(createdDate, data[t].color)+data[t]['z-index']+'" ></div>');
                  } else if (j<(countDay)){
                    $('#ready-json .'+ creatShift.getFullYear() +' .month'+ creatShift.getMonth() + ' .tick'+ creatShift.getDate()).parent().append('<li style="'+gradient(zero, data[t].color, zero)+data[t]['z-index']+'" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
                  } else {
                    $('#ready-json .'+ creatShift.getFullYear() +' .month'+ creatShift.getMonth() + ' .tick'+ creatShift.getDate()).parent().append('<li style="'+gradient(zero, data[t].color, resolvedDate)+data[t]['z-index']+'" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
                  }
                }
              }
            }  
          }
        }
      }

        function addShaduleWork(data){
          if (data){
            for (var t=0; t<data.length; t++){
              if (data[t].planned_work_created){
                var eventDay = dateEvent(data[t].planned_work_created);
                var createdDate = hourInSec(data[t].planned_work_created);
                var resolvedDate = hourInSec(data[t].planned_work_resolved) || hourInSec(new Date());
                var countDay = countOfDay(data[t].planned_work_created, data[t].planned_work_resolved);
                if (countDay==0){
                  $('#ready-json .'+ yearEvent(data[t].planned_work_created) +' .month'+ monthEvent(data[t].planned_work_created) + ' .tick'+eventDay).parent().append('<li style="'+gradient(createdDate, data[t].color, resolvedDate)+data[t]['z-index']+'" class="tick-tacks tick'+eventDay+'"></li>');
                } else {
                  for (var j=0; j<=countDay; j++){
                    var creat = new Date(Date.parse(data[t].planned_work_created));
                    var creatShift = new Date(creat.setDate(creat.getDate()+j));
                    if (j==0){
                      $('#ready-json .'+ yearEvent(data[t].planned_work_created) +' .month'+ monthEvent(data[t].planned_work_created) + ' .tick'+eventDay).parent().append('<li style="'+gradient(createdDate, data[t].color)+data[t]['z-index']+'" class="tick-tacks tick'+eventDay+'"></li>');
                    } else if (j<(countDay)){
                      $('#ready-json .'+ creatShift.getFullYear() +' .month'+ creatShift.getMonth() + ' .tick'+ creatShift.getDate()).parent().append('<li style="'+gradient(0, data[t].color, 0)+data[t]['z-index']+'" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
                    } else {
                      $('#ready-json .'+ creatShift.getFullYear() +' .month'+ creatShift.getMonth() + ' .tick'+ creatShift.getDate()).parent().append('<li style="'+gradient(0, data[t].color, resolvedDate)+data[t]['z-index']+'" class="tick-tacks tick'+creatShift.getDate()+'"></li>');
                    }
                  }
                }
              }
            } 
          }
        }
        if (rememberOpen){
            $(rememberOpen.tickBlock).addClass('active');
            $.each($(rememberOpen.tick), function(){
              $(this).addClass('active');
            });    
            $(rememberOpen.element).css('height', rememberOpen.height);
          } else {
            $.each($('.block_item_general'), function(){
              $(this).css('height', zero);
            });    
          }
        if (rememberOpenMobile){
            $(rememberOpenMobile.tickBlock).addClass('active');
            $.each($(rememberOpenMobile.tick), function(){
              $(this).addClass('active');
            }); 
          } else {
            $('.mainBlockforMobile .tick-tacks_detailed').removeClass('active');
          }
        //dropdown for the tick-tacks
        $('<style type="text/css" id="dynamic" />').appendTo('head');
        $('div.mainBlockYear ul.tick-tacks_block .tick-tacks').not('ul.noDataNoActive .tick-tacks').on('click', function(){
          var elemPrevious = $('div.mainBlockYear ul.tick-tacks_block .tick-tacks').filter('.active');
          var blockPrevious = $('.mainBlockYear .tick-tacks_detailed').filter('.active');
          if (elemPrevious.is(':visible')){
            var monthPrev = elemPrevious.parent().parent().prop('className').split(' ')[1];
            var monthNumberPrev = takeNumber(monthPrev.slice(-2));
            var yearPrev = elemPrevious.parent().parent().parent().prop('className').slice(-4);
            var heightPrevElem = blockPrevious.outerHeight();
          }
          var month = $(this).parent().parent().prop('className').split(' ')[1];
          var year = $(this).parent().parent().parent().prop('className').slice(-4);
          var monthNumber = takeNumber(month.slice(-2));
          var day = takeNumber($(this).prop('className').split(' ')[1]); 
          $('.'+year+' #'+month+'-'+day+'-'+year).toggleClass('active');  
          $('.mainBlockYear .tick-tacks_detailed').not($('.'+year+' #'+month+'-'+day+'-'+year)).removeClass('active');
          var heightElement = parseInt($('.'+year+' #'+month+'-'+day+'-'+year).css('height')) + 75 +'px';
          var monthElem = $(this).parent().parent().prop('className').split(' ')[1];
          var yearElem = $(this).parent().parent().parent().prop('className').slice(-4);
          var scrollTime = 1500;
          if ($(this).hasClass('active')){
            rememberOpen = null;
            $.each($('.block_item_general'), function(){
              var timer = 1000;
              if (heightPrevElem<200) timer = 300; scrollTime=500;
              if (heightPrevElem>3000) timer = 1500; scrollTime=1700;
              $(this).animate({
                height: 0}, timer );
            });    
          } else if (elemPrevious.is(':visible') && monthPrev != monthElem){
            $.each($('.block_item_general').not($('.block_item_general-'+monthElem+'-'+yearElem)), function(){
              var timer = 1000;
              if (heightPrevElem<200) timer = 700; 
              if (heightPrevElem>3000) timer = 1000;
              $(this).animate({
                height: 0}, timer );
            }); 
            $('.block_item_general-'+monthElem+'-'+yearElem).animate({
              height: heightElement}, 900 );
            rememberOpen = {
              tickBlock: '.'+year+' #'+month+'-'+day+'-'+year,
              tick: '.'+year+' .'+month+' .tick'+day,
              height: heightElement,
              element: '.block_item_general-'+monthElem+'-'+yearElem};
          } else if (elemPrevious.is(':visible') && yearElem != yearPrev){
            $.each($('.block_item_general').not($('.block_item_general-'+monthElem+'-'+yearElem)), function(){
              var timer = 1000;
              if (heightPrevElem<200) timer = 700;
              if (heightPrevElem>3000) timer = 1000;
              $(this).animate({
                height: 0}, timer );
            }); 
            $('.block_item_general-'+monthElem+'-'+yearElem).animate({
              height: heightElement}, 900 );
            rememberOpen = {
              tickBlock: '.'+year+' #'+month+'-'+day+'-'+year,
              tick: '.'+year+' .'+month+' .tick'+day,
              height: heightElement,
              element: '.block_item_general-'+monthElem+'-'+yearElem};
          } else {
            var timer = 1000;
            if (heightElement<200) timer = 300; 
            $('.block_item_general-'+monthElem+'-'+yearElem).animate({
              height: heightElement}, timer );
            rememberOpen = {
              tickBlock: '.'+year+' #'+month+'-'+day+'-'+year,
              tick: '.'+year+' .'+month+' .tick'+day,
              height: heightElement, 
              element: '.block_item_general-'+monthElem+'-'+yearElem};
          }
          var anchor = $(this).parent().parent().prev().offset().top;
          if (elemPrevious.is(':visible')){
            if (yearPrev>yearElem || (yearPrev==yearElem && +monthNumberPrev > +monthNumber)){
              anchor = $(this).parent().parent().prev().offset().top - heightPrevElem - 10;
            }
          }
          $('body, html').animate({ 'scrollTop': anchor }, scrollTime);
          $('.'+year+' .'+month+' .tick'+day).toggleClass('active');
          $('ul.tick-tacks_block .tick-tacks').not($('.'+year+' .'+month+' .tick'+day)).removeClass('active');
          if ($('.'+year+' #'+month+'-'+day+'-'+year).hasClass('active')){
            var sel = '#'+month+'-'+day+'-'+year;
            var left = $(this).parent().position().left+19;
            $('#dynamic').text('.mainBlockYear '+sel+ '.tick-tacks_detailed.active:after, .mainBlockYear '+sel+'.tick-tacks_detailed.active:before {left:'+left +'px;}');
            var self = $(this);
            $(window).resize(function(){
              var left = self.parent().position().left+19;
              $('#dynamic').text('.mainBlockYear '+sel+ '.tick-tacks_detailed.active:after, .mainBlockYear '+sel+'.tick-tacks_detailed.active:before {left:'+left +'px;}');
            });
          }
        });
      
        $('.mainBlockforMobile .tick-tacks').on('click', function(){
          var month = $(this).parent().parent().parent().parent().prop('className').split(" ")[1];
          var year = $(this).parent().parent().parent().parent().parent().parent().prop('className').slice(-4);
          var day = takeNumber($(this).prop('className').split(" ")[1]);
          rememberOpenMobile = {
            tickBlock: '.mainBlockforMobile.'+year+' #mob-'+month+'-'+day+'-'+year,
            tick: '.'+month+' .tick'+day};
          if ($('.mainBlockforMobile.'+year+' #mob-'+month+'-'+day+'-'+year).hasClass('active')){
            rememberOpenMobile = null;
          }
          $('.mainBlockforMobile.'+year+' #mob-'+month+'-'+day+'-'+year).toggleClass('active');  
          $('.mainBlockforMobile .tick-tacks_detailed').not($('.'+year+' #mob-'+month+'-'+day+'-'+year)).removeClass('active');
          $('.mainBlockforMobile.'+month+' .tick'+day).toggleClass('active');
          $('tr.tick-tacks_block .tick-tacks').not($('.'+month+' .tick'+day)).removeClass('active');
        });

        var year = new Date().getFullYear(); 
        var month = new Date().getMonth();

        function hideTableMonth(){
          for (var i=year; i>=2000; i--){
            if (i==year){
              for (var j =0; j<month; j++){
                $('.show-month'+j).css('display', 'none');
              }
            } else {
              $('#ready-json .mainBlockforMobile.'+ i +' table').css('display', 'none');
            }
          }
        }

        var getMonthTable = 1;
        

        function showmonths(){
          if (lastMonthForButton){
            var lastOpenYear = lastMonthForButton.year;
            var lastOpenMonth = lastMonthForButton.month + 1;
            if (lastOpenYear == new Date().getFullYear()){
              for (var i = month; i>= lastOpenMonth; i--){
                $('#ready-json .mainBlockforMobile.'+ year +' table.show-month' + i).css('display', 'table');
                var currentMonth = lastMonthForButton.month + 1;  
                $('.pervious_month').addClass(' displayNone');            
                $('.pervious_month.month' + currentMonth+'-'+year).addClass(' displayBlock');                 
              }
            } else {
              for ( var y = year; y>=lastOpenYear; y--){
                if (y == year){
                  for (var l = month; l>=0; l--){
                    $('#ready-json .mainBlockforMobile.'+ year +' table.show-month' + l).css('display', 'table');
                    currentMonth = lastMonthForButton.month + 1;  
                    $('.pervious_month').addClass(' displayNone');            
                    $('.pervious_month.month' + currentMonth+'-'+y).addClass(' displayBlock');                 
                  }
                } else if (y!=lastOpenYear){
                  for (var j = 11; j>=0; j--){
                    $('#ready-json .mainBlockforMobile.'+ y +' table.show-month' + j).css('display', 'table');
                    currentMonth = lastMonthForButton.month + 1;  
                    $('.pervious_month').addClass(' displayNone');            
                    $('.pervious_month.month' + currentMonth+'-'+y).addClass(' displayBlock');                 
                  }
                } else {
                  for (var k = 11; k>=lastOpenMonth; k--){
                    $('#ready-json .mainBlockforMobile.'+ y +' table.show-month' + k).css('display', 'table');
                    currentMonth = lastMonthForButton.month + 1;  
                    $('.pervious_month').addClass(' displayNone');            
                    $('.pervious_month.month' + currentMonth+'-'+y).addClass(' displayBlock');                 
                  }
                }
              }
            }
          }
        }

        function hideButtonPrevMonth(){    
          var buttonMonth = $('#ready-json .mainBlockforMobile').find('.pervious_month');
          var currentYear =$('#ready-json .mainBlockforMobile.'+year+' table:nth-of-type(' + getMonthTable+') td').html().match(/\d+/g); 
          var currentMonth = $('#ready-json .mainBlockforMobile.'+currentYear+' table:nth-of-type(' + getMonthTable+')').prop('className').match(/\d+/g);
          if (lastMonthForButton){
            currentYear =$('#ready-json .mainBlockforMobile.'+lastMonthForButton.year+' table:nth-of-type(' + getMonthTable+') td').html().match(/\d+/g);
            currentMonth = lastMonthForButton.month+1;
          }
          for (var j = 0; j<buttonMonth.length; j++){
            var getMonth = parseInt(buttonMonth[j].className.slice(20, 22));
            var getYear = buttonMonth[j].className.split('-')[1].match(/\d+/g);
            if (currentMonth == '0'){
              if (currentYear-getYear == 1){
                $('.pervious_month.month11-'+getYear).removeClass(' displayNone').addClass(' displayBlock');
                $('.pervious_month.month0-'+currentYear).removeClass(' displayBlock').addClass(' displayNone');
                getMonthTable = 0;
                year--;
                break;
              } else if (lastMonthForButton && lastMonthForButton.month<0){
                $('.pervious_month.month0-'+currentYear).removeClass(' displayBlock').addClass(' displayNone');
              }
             continue;               
            }
            if (lastMonthForButton && lastMonthForButton.month>0){
              buttonMonth.removeClass(' displayBlock').addClass(' displayNone');
              $('.pervious_month.month' + lastMonthForButton.month+'-' + lastMonthForButton.year).removeClass(' displayNone').addClass(' displayBlock'); 
            } else if (currentMonth-getMonth == 1 && currentYear-getYear ==0){
              $(buttonMonth[j]).removeClass(' displayNone').addClass(' displayBlock');         
            } else $(buttonMonth[j]).removeClass(' displayBlock').addClass(' displayNone');
          }
          getMonthTable+=1;       
        }
        

        hideTableMonth();        
        showmonths();
        hideButtonPrevMonth(); 
        

        $('.pervious_month').on('click', function () {
          lastMonthForButton = null;
          var monthClass = $(this).prop('className').split(' ')[1];
          var monthNumber = monthClass.split('-')[0].match(/\d+/g);
          var year = monthClass.split('-')[1];
          ticksForMob = makeYearMob(new Date(new Date().setMonth(monthNumber)));
          makeMonthsEvents(new Date(new Date().setMonth(monthNumber)));
          $('#ready-json .mainBlockforMobile.'+ year +' table.show-month' + monthNumber).css('display', 'table');
          lastMonthForButton = {
            month : monthNumber - 1,
            year: year};
          if (lastMonthForButton.month == (getYear()[1] - 1)){
            $('.showMoreMonths').css('display', 'block');
          }
          hideButtonPrevMonth();
          $('.mainBlockforMobile .tick-tacks').on('click', function(){
            var month = $(this).parent().parent().parent().parent().prop('className').split(' ')[1];
            var year = $(this).parent().parent().parent().parent().parent().parent().prop('className').slice(-4);
            var day = takeNumber($(this).prop('className').split(' ')[1]);
            $('.mainBlockforMobile.'+year+' #mob-'+month+'-'+day+'-'+year).toggleClass('active');  
            $('.mainBlockforMobile .tick-tacks_detailed').not($('.'+year+' #mob-'+month+'-'+day+'-'+year)).removeClass('active');
            $('.'+month+' .tick'+day).toggleClass('active');
            $('tr.tick-tacks_block .tick-tacks').not($('.'+month+' .tick'+day)).removeClass('active');
          });
        });
      
      $('#prev_six_month').on('click', function (){
          lastNeedDate = new Date(lastNeedDate.setMonth(lastNeedDate.getMonth()-6));
          LoadPage();
          $('#prev_six_month').css('display', 'none');
          $('.wait-block').css('display', 'inline-block');
          $('.wait-loader').css('display', 'inline-block');
      });
      $('#prev_six_month_mob').on('click', function (){
          lastNeedDate = new Date(lastNeedDate.setMonth(lastNeedDate.getMonth()-6));
          LoadPage();
          $('#prev_six_month_mob').css('display', 'none');
          $('.wait-block').css('display', 'inline-block');
          $('.wait-loader').css('display', 'inline-block');
      });
      // //CREATION OF GRAFIC

      // //function for filter enter json by dates
      // function filterDateForGraf(date){
      //   var dayEv = []
      //   var end = Date.parse(date);
      //   var begin = date.setHours(date.getHours()-24);
      //   for(var i=0; i<infoIncident.length; i++){
      //     if(!infoIncident[i]['planned_work'] && infoIncident[i]['impact']!="none"){
      //       var createdMs = Date.parse(infoIncident[i]['created']);
      //       var resolvedMs = Date.parse(infoIncident[i]['resolved']) || Date.parse(new Date()); 
      //       var created= new Date(createdMs);
      //       var resolved = new Date(resolvedMs);
      //       if(resolvedMs>=begin){
      //         resolved = (resolvedMs<=end)?resolved:new Date(end)
      //         if(createdMs>=begin){
      //           dayEv.push({
      //             'id': infoIncident[i]['id'],
      //             'name': infoIncident[i]['name'],
      //             'created': created,
      //             'color': infoIncident[i]['color'],
      //             'z-index': infoIncident[i]['z-index'],
      //             'graf_created_data': true,
      //             'graf_resolved_data': true,
      //             'resolved': resolved
      //           });
      //         }else if(createdMs<begin){
      //           created = new Date(begin);
      //           dayEv.push({
      //             'id': infoIncident[i]['id'],
      //             'name': infoIncident[i]['name'],
      //             'created': created,
      //             'color': infoIncident[i]['color'],
      //             'z-index': infoIncident[i]['z-index'],
      //             'graf_created_data': true,
      //             'graf_resolved_data': true,
      //             'resolved': resolved
      //           });
      //         }
      //       }          
      //     }else{
      //       createdMs = Date.parse(infoIncident[i]['planned_work_created']);
      //       resolvedMs = Date.parse(infoIncident[i]['planned_work_resolved']); 
      //       created = new Date(createdMs);
      //       resolved = new Date(resolvedMs);
      //       if(resolvedMs>=begin && createdMs<end){
      //         resolved = (resolvedMs<=end)?resolved:new Date(end);
      //         if(createdMs>=begin){
      //           dayEv.push({
      //             'id': infoIncident[i]['id'],
      //             'name': infoIncident[i]['name'],
      //             'created': created,
      //             'color': infoIncident[i]['color'],
      //             'z-index': infoIncident[i]['z-index'],
      //             'graf_created_data': true,
      //             'graf_resolved_data': true,
      //             'resolved': resolved
      //           });
      //         }else if(createdMs<begin){
      //           created = new Date(begin);
      //           dayEv.push({
      //             'id': infoIncident[i]['id'],
      //             'name': infoIncident[i]['name'],
      //             'created': created,
      //             'color': infoIncident[i]['color'],
      //             'z-index': infoIncident[i]['z-index'],
      //             'graf_created_data': true,
      //             'graf_resolved_data': true,
      //             'resolved': resolved
      //           });
      //         }
      //       }
      //     }
      //   }
      //   dayEv.sort(compareTimeReverse);
      //   comapereDateForGraf(dayEv, 'graf_created_data', 'graf_resolved_data', false);
      //   dayEv.sort(compareTimeReverse);
      //   return dayEv;
      // }
      // function changeGraf(){
      //   var filter = filterDateForGraf(new Date);
      //   if(filter.length == 0){
      //     $('#grafResize').css('display', 'none');
      //     $('#graf').css('display', 'none');
      //     $('.topMobile').css('display', 'none');
      //     $('#titleStableWork').css('display', 'block');
      //   }
      // }
      // changeGraf();
      // //check events. if one event is in another, then one of the value 'graf_created_data', 'graf_resolved_data' would be false.
      // function comapereDateForGraf(dayEv, start, end, value){
      //   for(var t=0; t<dayEv.length; t++){
      //     for(var z=t+1; z<dayEv.length; z++){
      //       if(dayEv[t]['created'].getTime()<=dayEv[z]['created'].getTime() && dayEv[t]['resolved'].getTime()>=dayEv[z]['resolved'].getTime() && (+dayEv[t]['z-index'].slice(-3, -1))>=(+dayEv[z]['z-index'].slice(-3, -1))){
      //         dayEv[z][start] = value;
      //         dayEv[z][end] = value;
      //       }
      //       if(dayEv[t]['created'].getTime()<=dayEv[z]['created'].getTime() && dayEv[z]['created'].getTime()<=dayEv[t]['resolved'].getTime() && dayEv[z]['resolved'].getTime()>dayEv[t]['resolved'].getTime()){
      //         if((+dayEv[t]['z-index'].slice(-3, -1))>(+dayEv[z]['z-index'].slice(-3, -1))){
      //           dayEv[z][start] = value;
      //         }else if((+dayEv[t]['z-index'].slice(-3, -1))<(+dayEv[z]['z-index'].slice(-3, -1))){
      //           dayEv[t][end] = value;
      //         }else if((+dayEv[t]['z-index'].slice(-3, -1))==(+dayEv[z]['z-index'].slice(-3, -1))){
      //           dayEv[z][start] = value;
      //           dayEv[t][end] = value;
      //         }
      //       }
      //     }
      //   }
      // }

      // //create json for grafic
      // function grafTime(d){
      //   var arr = [];
      //   for(var i=0; i<d.length; i++){
      //     if((d[i]['graf_created_data'] || d[i]['graf_resolved_data'])){
      //       created = {'timeData': (d[i]['graf_created_data'])?d[i]['created']:null, 
      //         'color': d[i]['color'], 
      //         'percent': takePercent(d[i]['color'], classTickTack),
      //         'name': [d[i]['name']],
      //         'pointDate': [d[i]['created'], d[i]['resolved']]
      //       };
      //       resolved = {'timeData': (d[i]['graf_resolved_data'])?d[i]['resolved']:null, 
      //         'color': d[i]['color'], 
      //         'percent': takePercent(d[i]['color'], classTickTack),
      //         'name': [d[i]['name']]
      //       };
      //       arr.push([created, resolved])
      //     }
      //   }
      //   mapArray(arr);
      //   for(var x=0; x<arr.length; x++){
      //     for(var e=x+1; e<arr.length; e++){
      //       if(arr[x][0]['timeData'] == arr[e][0]['timeData'] && arr[x][1]['timeData'] == arr[e][1]['timeData'] && arr[x][0]['percent'] == arr[e][0]['percent'] && arr[x][1]['percent'] == arr[e][1]['percent'] && arr[x][0]['color'] == arr[e][0]['color'] && arr[x][1]['color'] == arr[e][1]['color']){
      //         arr.splice(e, 1);
      //         e--;
      //       }
      //     }
      //   }
      //   arr.forEach(function(item){
      //     if((item[1].timeData.getTime() - item[0].timeData.getTime()) > 6*60*60*1000){
      //       item.splice(1, 0, {'timeData': new Date(item[0].timeData.getTime() + (item[1].timeData.getTime() - item[0].timeData.getTime())/3), 
      //         'percent': item[0].percent,
      //         'name': item[0].name
      //       }, 
      //       {
      //         'timeData': new Date(item[1].timeData.getTime() - (item[1].timeData.getTime() - item[0].timeData.getTime())/3), 
      //         'percent': item[0].percent,
      //         'name': item[0].name
      //       })
      //     }
      //   })
      //   if(arr.length>0 && startDate(arr[0][0]['timeData']) && arr[0][0]['timeData'].getTime()>new Date(new Date().setHours(new Date().getHours()-24))){
      //     var startPoint = arr[0][0]['timeData'];
      //     if(new Date(arr[0][0]['timeData'].getTime() - new Date().setHours(new Date().getHours()-24)) > 7*60*60*1000){
      //       arr[0][0]['timeData'] = new Date(arr[0][0]['timeData'].getTime() + 5*60*1000);
      //       arr[0].unshift({'timeData': new Date(new Date().setHours(new Date().getHours()-24)), 'percent': 1, 'color': classTickTack[0]['color']},
      //                      {'timeData': new Date(new Date().setHours(new Date().getHours()-24) + (startPoint.getTime()-new Date().setHours(new Date().getHours()-24))/3), 'percent': 1, 'name': []},
      //                      {'timeData': new Date(startPoint.getTime() -(startPoint.getTime()-new Date().setHours(new Date().getHours()-24))/3), 'percent': 1, 'name': []}, 
      //                      {'timeData': startPoint, 'percent': 1, 'name': []}, 
      //                      {'timeData': new Date(startPoint.getTime() - 2*60*60*1000), 'percent': 1, 'name': []}, 
      //                      {'timeData': startPoint, 'percent': 1, 'name': []}, 
      //                      {'timeData': arr[0][0]['timeData'], 'percent': 0.92, 'name': []},
      //                      {'timeData': new Date(startPoint.getTime() + 5*60*1000), 'percent': arr[0][0]['percent']+0.05, 'name': [arr[0][0]['name']]});
      //     }else if(new Date(arr[0][0]['timeData'].getTime() - new Date().setHours(new Date().getHours()-24)) > 3*60*60*1000){
      //       arr[0][0]['timeData'] = new Date(arr[0][0]['timeData'].getTime() + 5*60*1000);
      //       arr[0].unshift({'timeData': new Date(new Date().setHours(new Date().getHours()-24)), 'percent': 1, 'color': classTickTack[0]['color']},
      //                      {'timeData': new Date(new Date().setHours(new Date().getHours()-24) + (startPoint.getTime() - new Date().setHours(new Date().getHours()-24))/2), 'percent': 1, 'name': []},
      //                      {'timeData': startPoint, 'percent': 1, 'name': []}, 
      //                      {'timeData': new Date(startPoint.getTime() + 5*60*1000), 'percent': 0.9, 'name': [arr[0][0]['name']]},
      //                      {'timeData': new Date(startPoint.getTime() + 5*60*1000), 'percent': arr[0][0]['percent']+0.05, 'name': [arr[0][0]['name']]});
      //     }
      //     else if(new Date(arr[0][0]['timeData'].getTime() - new Date().setHours(new Date().getHours()-24)) > 2*60*60*1000){
      //       arr[0].unshift({'timeData': new Date(new Date().setHours(new Date().getHours()-24)), 'percent': 1, 'color': classTickTack[0]['color']},
      //                      {'timeData': new Date(startPoint.getTime() - (startPoint.getTime() - new Date().setHours(new Date().getHours()-24))/2), 'percent': 1, 'name': []},
      //                      {'timeData': startPoint, 'percent': 1, 'name': []}, 
      //                      {'timeData': new Date(startPoint.getTime() + 5*60*1000), 'percent': 0.9, 'name': [arr[0][0]['name']]},
      //                      {'timeData': new Date(startPoint.getTime() + 5*60*1000), 'percent': arr[0][0]['percent']+0.05, 'name': [arr[0][0]['name']]});
      //     }else {
      //       arr[0][0]['timeData'] = new Date(arr[0][0]['timeData'].getTime() + 5*60*1000);
      //       arr[0].unshift({'timeData': new Date(new Date().setHours(new Date().getHours()-24)), 'percent': 1, 'color': classTickTack[0]['color']},
      //                      {'timeData': startPoint, 'percent': 1, 'name': []}, 
      //                      {'timeData': new Date(startPoint.getTime() + 5*60*1000), 'percent': 0.9, 'name': [arr[0][0]['name']]},
      //                      {'timeData': new Date(startPoint.getTime() + 5*60*1000), 'percent': arr[0][0]['percent']+0.05, 'name': [arr[0][0]['name']]});
      //     }          
      //   }
      //   var newArr = [];
      //   for(var t=0; t<arr.length; t++){
      //     if((t+1)<arr.length){
      //       var elemLast = arr[t].length - 1;
      //       if(arr[t][elemLast]['timeData'].getTime()<arr[t+1][0]['timeData'].getTime()){
      //         var endPoint = arr[t][elemLast]['timeData'];
      //         arr[t][elemLast]['timeData'] = new Date(arr[t][elemLast]['timeData'].getTime() - 5*60*1000);
      //         if((arr[t+1][0]['timeData'].getTime() - arr[t][elemLast]['timeData'].getTime()) > 6*60*60*1000){
      //           arr[t].push({'timeData': arr[t][elemLast]['timeData'], 'percent': arr[t][elemLast]['percent']+0.05, 'name': [arr[t][0]['name']]}, 
      //                       {'timeData': arr[t][elemLast]['timeData'], 'percent': 1 - (1 - arr[t][elemLast]['percent'])/2, 'name': [arr[t][0]['name']]},
      //                       {'timeData': endPoint, 'percent': 0.92, 'name': []}, 
      //                       {'timeData': endPoint, 'percent': 1, 'name': []}, 
      //                       {'timeData': new Date(endPoint.getTime() + 2*60*60*1000), 'percent': 1, 'name': []},
      //                       {'timeData': new Date(endPoint.getTime() + (arr[t+1][0]['timeData'].getTime() - endPoint.getTime())/3), 'percent': 1, 'name': []},
      //                       {'timeData': new Date(arr[t+1][0]['timeData'].getTime() - (arr[t+1][0]['timeData'].getTime() - endPoint.getTime())/3), 'percent': 1, 'name': []},
      //                       {'timeData': new Date(arr[t+1][0]['timeData'] - 2*60*60*1000), 'percent': 1, 'name': []},
      //                       {'timeData': arr[t+1][0]['timeData'], 'percent': 1, 'name': []},
      //                       {'timeData': arr[t+1][0]['timeData'], 'percent': 0.9, 'name': []},
      //                       {'timeData': new Date(arr[t+1][0]['timeData'].getTime() + 5*60*1000), 'percent': arr[t+1][0]['percent']+0.05, 'name': []})
      //           arr[t+1][0]['timeData'] = new Date(arr[t+1][0]['timeData'].getTime() + 5*60*1000);
      //         }else if((arr[t+1][0]['timeData'].getTime() - arr[t][elemLast]['timeData'].getTime()) > 10*60*1000){
      //           arr[t].push({'timeData': arr[t][elemLast]['timeData'], 'percent': arr[t][elemLast]['percent']+0.05, 'name': [arr[t][0]['name']]}, 
      //                       {'timeData': arr[t][elemLast]['timeData'], 'percent': 1 - (1 - arr[t][elemLast]['percent'])/2, 'name': [arr[t][0]['name']]},
      //                       {'timeData': endPoint, 'percent': 0.9, 'name': []}, 
      //                       {'timeData': endPoint, 'percent': 1, 'name': []}, 
      //                       {'timeData': new Date(endPoint.getTime() + (arr[t+1][0]['timeData'].getTime() - endPoint.getTime())/2), 'percent': 1, 'name': []},
      //                       {'timeData': new Date(endPoint.getTime() + (arr[t+1][0]['timeData'].getTime() - endPoint.getTime())/2), 'percent': 1, 'name': []},
      //                       {'timeData': arr[t+1][0]['timeData'], 'percent': 1, 'name': []},
      //                       {'timeData': arr[t+1][0]['timeData'], 'percent': 0.9, 'name': []},
      //                       {'timeData': new Date(arr[t+1][0]['timeData'].getTime() + 5*60*1000), 'percent': takePercent(arr[t+1][0]['color'], classTickTack) +0.05, 'name': []})
      //           arr[t+1][0]['timeData'] = new Date(arr[t+1][0]['timeData'].getTime() + 5*60*1000);
      //         }else{
      //           arr[t][elemLast]['timeData'] = new Date(arr[t][elemLast]['timeData'].getTime() - 2*60*1000);
      //           arr[t].push({'timeData': arr[t][elemLast]['timeData'], 'percent': arr[t][elemLast]['percent']+0.05, 'name': [arr[t][0]['name']]}, 
      //                        {'timeData': endPoint, 'percent': 1, 'name': []}, 
      //                        {'timeData': new Date(endPoint.getTime() + (arr[t+1][0]['timeData'].getTime() - endPoint.getTime())/2), 'percent': 1, 'name': []},
      //                        {'timeData': arr[t+1][0]['timeData'], 'percent': 1, 'name': []},
      //                        {'timeData': new Date(arr[t+1][0]['timeData'].getTime() + 2*60*1000), 'percent': arr[t+1][0]['percent']+0.05, 'name': []})
      //           arr[t+1][0]['timeData'] = new Date(arr[t+1][0]['timeData'].getTime() + 2*60*1000);
      //         }
      //       }
      //     }
      //   }  
      //   var latestDate = findLatesDate(arr)
      //   if(arr.length>0 && endDateGraf(arr[latestDate][arr[latestDate].length-1]['timeData'], new Date())){
      //     var needDate = arr[latestDate][arr[latestDate].length-1]['timeData'];
      //     var dataPlusMin = new Date(arr[latestDate][arr[latestDate].length-1]['timeData'].getTime() - 5*60*1000)
      //     arr[latestDate][arr[latestDate].length-1]['timeData'] = dataPlusMin;
      //     var lastPercent = arr[latestDate][arr[latestDate].length-1]['percent'];
      //     if(new Date().getTime()-needDate.getTime()>=6*60*60*1000){
      //       if((arr[latestDate][0]['timeData'] - needDate.getTime()) > 1*60*60*1000){
      //         arr[latestDate].push({'timeData': dataPlusMin, 'percent': lastPercent + 0.05, 'name': []}, 
      //                              {'timeData': needDate, 'percent': 1, 'name': []}, 
      //                              {'timeData': new Date(needDate.getTime()+30*60*1000), 'percent': 1, 'name': []}, 
      //                              {'timeData': new Date(), 'percent': 1, 'name': []});
      //       }else{
      //         arr[latestDate].push({'timeData': dataPlusMin, 'percent': lastPercent + 0.05, 'name': []}, 
      //                              {'timeData': needDate, 'percent': 1 - (1 -lastPercent)/2, 'name': []},  
      //                              {'timeData': needDate, 'percent': 0.9, 'name': []}, 
      //                              {'timeData': needDate, 'percent': 1, 'name': []}, 
      //                              {'timeData': new Date(needDate.getTime() + 2*60*60*1000), 'percent': 1, color: classTickTack[0]['color'], 'name': []},
      //                              {'timeData': new Date(new Date().getTime() - (new Date().getTime() - dataPlusMin.getTime())/2), 'percent': 1, color: classTickTack[0]['color'], 'name': []}, 
      //                              {'timeData': new Date(), 'percent': 1, 'name': []});
      //       }
      //     }else if(new Date().getTime()-needDate.getTime()>=2*60*60*1000){
      //       if((arr[latestDate][0]['timeData'] - needDate.getTime()) > 1*60*60*1000){
      //         arr[latestDate].push({'timeData': dataPlusMin, 'percent': lastPercent + 0.05, 'name': []}, 
      //                              {'timeData': needDate, 'percent': 1, 'name': []}, 
      //                              {'timeData': new Date(needDate.getTime()+30*60*1000), 'percent': 1, 'name': []}, 
      //                              {'timeData': new Date(), 'percent': 1, 'name': []});
      //       }else{
      //         arr[latestDate].push({'timeData': dataPlusMin, 'percent': lastPercent + 0.05, 'name': []}, 
      //                              {'timeData': needDate, 'percent': 1 - (1 -lastPercent)/2, 'name': []},  
      //                              {'timeData': needDate, 'percent': 0.9, 'name': []}, 
      //                              {'timeData': needDate, 'percent': 1, 'name': []}, 
      //                              {'timeData': new Date(new Date().getTime() - (new Date().getTime() - dataPlusMin.getTime())/2), 'percent': 1, color: classTickTack[0]['color'], 'name': []}, 
      //                              {'timeData': new Date(), 'percent': 1, 'name': []});
      //       }
      //     }else if(new Date().getTime()-needDate.getTime()>=10*60*1000){
      //       if((arr[latestDate][0]['timeData'] - needDate.getTime()) > 1*60*60*1000){
      //         arr[latestDate].push({'timeData': dataPlusMin, 'percent': lastPercent, 'name': []}, 
      //                              {'timeData': dataPlusMin, 'percent': lastPercent + 0.05, 'name': []}, 
      //                              {'timeData': needDate, 'percent': 1, 'name': []}, 
      //                              {'timeData': new Date(), 'percent': 1, 'name': []});
      //       }else{
      //         arr[latestDate].push({'timeData': dataPlusMin, 'percent': lastPercent + 0.05, 'name': []}, 
      //                              {'timeData': needDate, 'percent': 0.9, 'name': []}, 
      //                              {'timeData': needDate, 'percent': 1, 'name': []}, 
      //                              {'timeData': new Date(), 'percent': 1, 'name': []});
      //       }
      //     }
      //   }      
      //   var newArray = [];
      //   arr.forEach(function(elem){
      //     elem.forEach(function(item){
      //       newArray.push(item);
      //     });
      //   });
      //   arr = newArray;
      //   return (arr.length)?arr:[{'timeData': new Date(new Date().setHours(new Date().getHours()-24)), 'color': classTickTack[0]['color'], 'percent': 1, 'name': []}, {'timeData': new Date(), 'percent': 1, 'name':[]}];
      // }

      // var data =  [grafTime(filterDateForGraf(new Date()))];    
      // var colors = [];

      // data.forEach(function(item){
      //   if(item[0]['color']) colors.push(item[0]['color'])
      // })

      // //Create Margins and Axis and hook our zoom function

      // var margin = {top: 20, right: 100, bottom: 30, left: 120},
      //     width = 700- margin.left - margin.right,
      //     height = 300 - margin.top - margin.bottom;

      // var marginMobile = {top: 15, right: 10, bottom: 30, left: 50},
      //     widthMobile = 500- margin.left - margin.right,
      //     heightMobile = 200 - margin.top - margin.bottom;

      // var x = d3.time.scale()
      //     .domain([new Date(new Date().setHours(new Date().getHours()-24)), new Date(new Date().setMinutes(new Date().getMinutes()))])
      //     .range([0, width]);

      // var xMobile = d3.time.scale()
      //     .domain([new Date(new Date().setHours(new Date().getHours() - 24)), new Date(new Date().setMinutes(new Date().getMinutes()))])
      //     .range([0, widthMobile]);
       
      // var y = d3.scale.linear()
      //     .domain([-0.05, 1.05])
      //     .range([height-5, 0]);

      // var yMobile = d3.scale.linear()
      //     .domain([-0.05, 1.07])
      //     .range([heightMobile-5, 0]);

      // var format = d3.time.format("%I:%M %p");
      // var formatterPercent = d3.format(".0%");

      // var xAxis = d3.svg.axis()
      //   .scale(x)
      //   .ticks(d3.time.hours, 4)
      //   .tickFormat(d3.time.format("%I %p"))
      //   .tickPadding(8)   
      //   .orient("bottom");  

      // var xAxisMob = d3.svg.axis()
      //   .scale(xMobile)
      //   .ticks(d3.time.hours, 5)
      //   .tickFormat(d3.time.format("%I %p"))
      //   .tickPadding(8)   
      //   .orient("bottom"); 
        
      // var yAxis = d3.svg.axis()
      //   .scale(y)
      //   .tickPadding(7)
      //   .ticks(4)
      //   .tickValues([0, 0.5, 0.75, 1]) 
      //   .tickSize(-width, 0)
      //   .tickFormat(formatterPercent)
      //   .orient("left"); 

      // var yAxisMob = d3.svg.axis()
      //   .scale(yMobile)
      //   .tickPadding(7)
      //   .ticks(4)
      //   .tickValues([0, 0.5, 0.75, 1]) 
      //   .tickSize(-widthMobile, 0) 
      //   .tickFormat(formatterPercent)
      //   .orient("left"); 
        
      // // Generate our SVG object

      // var svg = d3.select("#graf").append("svg")
      //     .attr("width", width + margin.left + margin.right)
      //     .attr("height", height + margin.top + margin.bottom)
      //     .attr('id', 'chart')
      //   .append("g")
      //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // var svg1 = d3.select("#grafResize").append("svg")
      //     .attr("width", widthMobile + marginMobile.left + marginMobile.right)
      //     .attr("height", heightMobile + marginMobile.top + marginMobile.bottom)
      //     .attr('id', 'chart')
      //   .append("g")
      //     .attr("transform", "translate(" + marginMobile.left + "," + marginMobile.top + ")");
       
      // svg.append("g")
      //     .attr("class", "x axis")
      //     .attr("transform", "translate(0," + height + ")")
      //     .call(xAxis);
       
      // svg1.append("g")
      //     .attr("class", "x axis")
      //     .attr("transform", "translate(0," + heightMobile + ")")
      //     .call(xAxisMob);

      // svg.append("g")
      //     .attr("class", "y axis")
      //     .call(yAxis); 
          
      // var div = d3.select("#graf").append("div")
      //           .attr("class", "tooltip")
      //           .style("opacity", 0);
      // var onePost = div.append("div").attr("class", "tooltip_title");
      //     onePost.append("p").attr('style', 'margin: 0 0 5px 0').text('100% for Operational.')
      //     onePost.append("p").attr('style', 'margin: 0').text('HipChat is working stable. No ongoing incidents observed.')
      // var secondPost = div.append("div").attr("class", "tooltip_title");
      //     secondPost.append("p").attr('style', 'margin: 0 0 5px 0').text('75% for Degraded Performance.')
      //     secondPost.append("p").attr('style', 'margin: 0').text('Some issues with HipChat subsystems are observed.');
      // var thirdPost = div.append("div").attr("class", "tooltip_title");
      //     thirdPost.append("p").attr('style', 'margin: 0 0 5px 0').text('50% for Partial Outage.')
      //     thirdPost.append("p").attr('style', 'margin: 0').text('Some HipChat subsystems are down, but the overall messaging service is not halted.');
      // var forthPost = div.append("div").attr("class", "tooltip_title");
      //     forthPost.append("p").attr('style', 'margin: 0 0 5px 0').text('0% for Major Outage.')
      //     forthPost.append("p").attr('style', 'margin: 0').text('Subsystems critical for messaging service are down.');


      // svg.selectAll(".y .tick text").each(function() {
      //     var text = d3.select(this);
      //     text.attr('opacity', function(){var t = d3.select(this).text(); if (t=='50%' || t == '75%') return '0';});
      //     var y = text.attr("y"),
      //         dy = parseFloat(text.attr("dy")),
      //         parentText = d3.select(this).text();
      //     if(parentText == '100%'){
      //       var tspan = text.append("tspan").attr('class', 'toolt').attr('font-family', 'FontAwesome').attr('font-size', '0.9em').text('\uf29c').attr("x", -55).attr("y", 0).attr("dy", dy + "em")
      //       tspan.on("mouseover", function() {  
      //             div.transition()    
      //                 .duration(200)    
      //                 .style("opacity", .9);  
      //             var top = d3.select(this).node().getBoundingClientRect().top;
      //             var left = d3.select(this).node().getBoundingClientRect().left;
      //             div .style("left", positionX(left) - 250 + "px")   
      //                 .style("top", positionY(top) - 40 + "px");  
      //             })  
      //             .on("mouseout", function() {   
      //                       div.transition()    
      //                           .duration(500)    
      //                           .style("opacity", 0); 
      //             })   
      //       }
      //   });



      // svg1.append("g")
      //     .attr("class", "y axis")
      //     .call(yAxisMob);

      // svg1.selectAll(".y .tick text").each(function() {
      //     var text = d3.select(this);
      //     text.attr('opacity', function(){var t = d3.select(this).text(); if (t=='50%' || t == '75%') return '0';});
      //   });
       
      // svg.append("g")
      //   .attr("class", "y axis")
      //   .append("text")
      //   .attr("class", "axis-label")
      //   .attr("transform", "rotate(-90)")
      //   .attr("y", (-margin.left) + 10)
      //   .attr("x", (-height/2)-10); 

      // svg1.append("g")
      //   .attr("class", "y axis")
      //   .append("text")
      //   .attr("class", "axis-label")
      //   .attr("transform", "rotate(-90)")
      //   .attr("y", (-marginMobile.left) + 10)
      //   .attr("x", -heightMobile/2);
       
      // svg.append("clipPath")
      //   .attr("id", "clip")
      //   .append("rect")
      //   .attr("width", width)
      //   .attr("height", height);

      // svg1.append("clipPath")
      //   .attr("id", "clip")
      //   .append("rect")
      //   .attr("width", widthMobile)
      //   .attr("height", heightMobile);

      // // Create D3 line object and draw data on our SVG object
      // var area = d3.svg.area()
      // .interpolate("basis") 
      //   .x(function(d) { return x(new Date(d.timeData)); })
      //   .y0(height)
      //   .y1(function(d) { return y(d.percent); });

      // var area1 = d3.svg.area()
      // .interpolate("basis") 
      //   .x(function(d) { return xMobile(new Date(d.timeData)); })
      //   .y0(heightMobile)
      //   .y1(function(d) { return yMobile(d.percent); });

      // var line = d3.svg.line() 
      //     .interpolate("basis") 
      //     .x(function(d) { return x(new Date(d.timeData)); })
      //     .y(function(d) { return y(d.percent); });   

      // var line1 = d3.svg.line() 
      // .interpolate("basis")
      //     .x(function(d) { return xMobile(new Date(d.timeData)); })
      //     .y(function(d) { return yMobile(d.percent); });  
      


      // svg.append("path")
      //   .data(data)
      //   .attr("class", "area")
      //   .attr("d", area);

      // svg.selectAll('.line')
      //   .data(data)
      //   .enter()
      //   .append("path")
      //     .attr("class", "line")
      //   .attr("clip-path", "url(#clip)")
      //   .attr('stroke', "#000")
      //     .attr("d", line); 
      //     svg.selectAll('.line').sort(function (a, b) { 
      //       if (a[1].percent>b[1].percent || (a[1].percent==b[1].percent && a[1].color==classTickTack[2]['color'])) return -1;               
      //       else return 1;                             
      //   });

      // svg1.append("path")
      //   .data(data)
      //   .attr("class", "area")
      //   .attr("d", area1); 

      // svg1.selectAll('.line')
      //   .data(data)
      //   .enter()
      //   .append("path")
      //     .attr("class", "line")
      //   .attr("clip-path", "url(#clip)")
      //   .attr('stroke', "#000")
      //     .attr("d", line1); 
      //     svg1.selectAll('.line').sort(function (a, b) { 
      //       if (a[1].percent>b[1].percent || (a[1].percent==b[1].percent && a[1].color==classTickTack[2]['color'])) return -1;               
      //       else return 1;                             
      //   });      
    }); 
    setTimeout(LoadPage, 30000);
  } 
  LoadPage();    
});


// additional functions
// function positionX(t){
//   return t - document.getElementById('graf').getBoundingClientRect().left - document.querySelector('.tooltip').offsetWidth;
// }
// function positionY(t){
//   return t - document.getElementById('graf').getBoundingClientRect().top - document.querySelector('.tooltip').offsetHeight/2;
// }

function takeNumber(elem){
  var result = [];
  elem = elem.split('');
  for (var i=0; i<elem.length; i++){
    if (!isNaN(elem[i])) result.push(elem[i]);
  }
  return result.join('');
}

//function to get json by month
function getPerMonth(date, arr){
  var result = [];
  if (arr.length>0){
  for (var i=0; i<arr.length; i++){
    var created = new Date(Date.parse(arr[i].created));
    if (created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear()){
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
  return (date.getHours()*sixty+date.getMinutes());
}

function differenceDays(date){
  date = new Date(Date.parse(date));
  var days = Math.round((new Date(new Date()).getTime() - new Date(date).getTime())/thousand/sixty/sixty/24);
  if (days === 1){
    return '1 day ago.';
  } else if (days === 0){
    return 'today.';
  } else if (days>1){
    return days+' days ago.';
  }
}

function countOfTime(date){
  return date.getHours()*sixty+(+date.getMinutes());
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
  return (dateMs.getHours()*sixty*sixty + dateMs.getMinutes() *sixty + dateMs.getSeconds());
}

function gradient(timeFrom, color, timeTo){
  var hole = 86400;
  var percentFrom = timeFrom*hundred/hole;
  var percentTo = timeTo ? (timeTo*hundred/hole) : hundred;
  var value='background: linear-gradient(to right, transparent ' + Math.round(percentFrom) + '%, ' + color + ' ' + Math.round(percentFrom) + '%, ' + color + ' ' + Math.round(percentTo)+ '%, transparent ' +Math.round(percentTo)+ '%);';
  return value;
}

function countOfDay(start, end){
  var ONE_DAY = thousand * sixty * sixty * 24;
  start = new Date(Date.parse(start));
  var hourStart = start.getHours();
  if (!end){  
    end = new Date(new Date().setHours(hourStart));
  } else {
    end = new Date(new Date(Date.parse(end)).setHours(hourStart));
  }
  return Math.round((end.getTime()-start.getTime())/ONE_DAY);
}

function formatUpdateDate(date){
  date = new Date(Date.parse(date));
  var hour = (date.getHours()<10)?('0'+date.getHours()):date.getHours();
  var min = (date.getMinutes()<10)?('0'+date.getMinutes()):date.getMinutes();
  return monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' - ' +hour + ':' + min +' UTC';
}

function percentForDay(date, arr, num){
  var timer = [];
  for (var t=0; t<24*sixty; t++){
    timer.push(t);
  }
  for (var j=0; j<arr.length; j++){
    if (arr[j].monitoring || arr[j].planned_work){
      var created = (arr[j].created)?arr[j].created:arr[j].planned_work_created;
      var resolved = (!arr[j].planned_work) ? new Date(Date.parse(lastMonitoring(arr[j])[0].created)) : new Date(arr[j].resolved);
      if (created.getDate()!==num){
        created = new Date(date.getFullYear(), date.getMonth(), num, zero, zero, zero);
      }
      if (resolved.getDate()!==num){
        resolved = new Date(date.getFullYear(), date.getMonth(), num, hourVal, minsec, minsec);
      }
      timer = timer.filter(function(item){
        return (getNumberOfTime(created)>item || item>getNumberOfTime(resolved));
      });
    }
  }
  var result = (timer.length*hundred/(24*sixty)).toFixed(3);
  if (result.toString().charAt(result.toString().length - 1) === '0'){
    result = result.toString().slice(zero, result.toString().length - 1);
  }
  return result;
}
function lastMonitoring(elem){
  var monitoring = elem.updated.filter(function(item){
    return item.status == 'monitoring'; 
  });
  monitoring.sort(compareUpdate);
  return monitoring;
}
function percentForDayToday(date, array, num){
  var arr = array;
  var timer = [];
  var nowHour = new Date().getHours();
  var nowMin = new Date().getMinutes();
  for (var t=0; t<(nowHour*sixty + nowMin); t++){
    timer.push(t);
  }
  for (var j=0; j<arr.length; j++){
    if (arr[j].monitoring || arr[j].planned_work){
      var created = (arr[j].created)?arr[j].created:arr[j].planned_work_created;
      var resolved = (!arr[j].planned_work) ? new Date(Date.parse(lastMonitoring(arr[j])[0].created)) : new Date(arr[j].resolved);
      if (created.getDate()!==num){
        created = new Date(date.getFullYear(), date.getMonth(), num, zero, zero, zero);
      }
      if (resolved.getDate()!==num){
        resolved = new Date(date.getFullYear(), date.getMonth(), num);
      }
      timer = timer.filter(function(item){
        return (getNumberOfTime(created)>item || item>getNumberOfTime(resolved));
      });
    }
  }
  var result = (timer.length*hundred/(nowHour*sixty+nowMin)).toFixed(3);
  if (result.toString().charAt(result.toString().length - 1) === '0'){
    result = result.toString().slice(zero, result.toString().length - 1);
  }
  return result;
}

//count percent of time without events per month
function percPerMonth(tick){
  var sum = 0;
  var arr=[];
  for (var i=0; i<tick.length; i++){
    if (tick[i].percent){
      arr.push(+tick[i].percent());
    }
  }
  for (var j=0; j<arr.length; j++){
    sum += arr[j];
  }
  var result = (sum/arr.length).toFixed(3);
  if (result.toString().charAt(result.toString().length - 1) === '0'){
    result = result.toString().slice(zero, result.toString().length - 1);
  }
  return result;
}

// function takePercent(item, arr){
//   for (var i=0; i<arr.length; i++){
//     if (arr[i]['color'] == item) return arr[i]['percent'];
//   }
// }
// function mapArray(arr){
//   for (var j=0; j<arr.length; j++){
//     if ((j+1)<arr.length){
//       if (!arr[j+1][0].timeData){
//         arr[j+1][0].timeData = arr[j][0].timeData;
//       }
//       if (!arr[j][1].timeData){
//         arr[j][1].timeData = arr[j+1][1].timeData;
//       }
//     }
//   }
//   return arr;
// }

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

// function findLatesDate(d){
//   var last =0;
//   var index = 0;
//   for (var w=0; w<d.length; w++){
//     if (last<d[w][1]['timeData'].getTime()){
//       last = d[w][1]['timeData'].getTime();
//       index = w;
//     }
//   }
//   return index;
// }
function formatBodyUpdate(text){
  // console.log(emo)
  var arr = text.split(/\r\n\r\n|####/g);
  for (var i=0; i<arr.length; i++){
    if (!!(~arr[i].search(/:\s/))){
      if (arr[i].split(/:\s/)[0].length<25){
        arr[i] = [arr[i].split(/:\s[^.!;]/)[0] + ':' , arr[i].slice(arr[i].search(/:\s/) + 1)];
      } else {
        arr[i] = [, arr[i]];
      }
    } else {
      arr[i] = [, arr[i]];
    }
  }
//   for(var j=0; j<arr.length; j++){
//     var result;
//     if(!!(~arr[j][1].search(/\(([^)\s]+)\)/))){
//       arr[j][1] = arr[j][1].replace(/\(([^)\s]+)\)/, function (match, name, offset, s) {
//         var emotionsData = $.ajax({
//           type: "GET",
//           url: "https://api.hipchat.com/v2/emoticon/"+name+"?auth_token=OCtbKgZYEL5zcuRhsUawczMQkwTg2o90AVQuOA96",
//         })
//         Promise.all([emotionsData]).then(function(data){
//           var emo = data[0]
//           result = emo.shortcut
//         // console.log(result)
//         });
//         console.log(result)
//         return result;
//     });
//   }
// }
  return arr;
}   
//check if event start in the start of grafic
// function startDate(data){
//   return (data.getDate() + '-' + data.getHours() + ':' + data.getMinutes() ) != (new Date(new Date().setDate(new Date().getDate()-1)).getDate() + '-' + new Date().getHours(new Date().getHours()-24) + ':' + new Date().getMinutes(new Date().getHours()-24) + '');
// }

function hoursCompare(data1){
  return data1.getHours()*sixty*sixty + data1.getMinutes()*sixty + data1.getSeconds();
}

//check if event finish in the end of grafic
// function endDateGraf(data1){
//   return (data1.getHours() + ':' + data1.getMinutes() )!= ('' + new Date().getHours() + ':' + new Date().getMinutes() + '');
// }

function endDate(data1){
  return (data1.getHours() + ':' + data1.getMinutes() )!== '23:59';
}
};