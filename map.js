// Global Variables
// Map
var map,
    pointLat,
    pointLon;
// Data
var dataLoad;
// Map marker
var marker;
// Last trip Point
var lastPoint;
// Flight Path
var flightPath;
// If Flight on map
var getTripPass = false;
// Last Select Value
var lastSelectValue;
// Socket
var socket = io.connect();


// Init Function
function init(){
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(-34.397, 150.644)
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  google.maps.event.addListener(map, 'tilesloaded', function(){
    document.getElementById('map-canvas').style.position = 'fixed';
  });

  socket.emit('searchMongo', '')
  socket.on('date', function (data){
    var select = document.getElementById("select");
    var i = 0
    for(index in data) {
      var date = new Date(index.match(/^[0-9]{10}/g)[0]*1000);
      select.options[select.options.length] = new Option(date, index);
      i++
    }
    select.value = index;
    getTrip(index);
  });
  document.getElementById('button').style.color = 'rgb(255, 69, 0)';
}

// GET all trip data
function getTrip(value){
  socket.emit('getTrip', value)
  if (getTripPass == true) {
    flightPath.setMap(null);
  }
  getTripPass = true
  dataLoad = new Array();
  dataLength = 0;
  var points = new Array();
  socket.on('drawTrip', function (data, end){
    dataLoad.push(data);
    if (data.gps.longitude != null && data.gps.latitude != null) {
      pointLat = data.gps.latitude;
      pointLon = data.gps.longitude;
      var diffLat = Math.abs(pointLat-dataLoad[dataLoad.length-2].gps.latitude);
      var diffLon = Math.abs(pointLon-dataLoad[dataLoad.length-2].gps.longitude);
      var diffDist = Math.sqrt(Math.pow(diffLat,2)+Math.pow(diffLon,2));
      var diffTime = (parseFloat(data.time)-parseFloat(dataLoad[dataLoad.length-2].time))/1000;
      // Remove strong values
      if (diffDist/diffTime > 0.0005 && data.odbSpeed < 201.6){
      }
      else {
        googlePoint = new google.maps.LatLng(pointLat, pointLon);
        points.push(googlePoint);
      }
    }
    // draw 1 minute path on shot (less lags)
    if (dataLoad.length%60 == 0) {
      if (flightPath != null) {
        flightPath.setMap(null);
        flightPath = null;
      }
      var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(pointLat, pointLon)
      };
      map.setOptions(mapOptions);
      flightPath = new google.maps.Polyline({
        path: points,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      flightPath.setMap(map);
    }
    if (end == true){
      if (flightPath != null) {
        flightPath.setMap(null);
        flightPath = null;
      }
      var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(pointLat, pointLon)
      };
      map.setOptions(mapOptions);
      flightPath = new google.maps.Polyline({
        path: points,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      flightPath.setMap(map);
    }
  });
  socket.on('drawGraph', function (){

      var dataEngineCoolantTemp = new Array(),
          datal100Instant = new Array(),
          dataodbSpeed = new Array(),
          dataengineRPM = new Array(),
          dataengineLoad = new Array(),
          datathrottlePosition = new Array(),
          dataturboBoost = new Array(),
          datamasseAirFlowRate = new Array(),
          dataintakeManifold = new Array(),
          dataintakeAirTemp = new Array(),
          dataengineCoolantTemp = new Array(),
          datavoltage = new Array();
      if (dataLoad[0].l100Instant == null){
        dataLoad[0].l100Instant = "0";
      }
      if (dataLoad[0].l100LongTerm == null){
        dataLoad[0].l100LongTerm = "0";
      }
      if (dataLoad[0].odbSpeed == null){
        dataLoad[0].odbSpeed = "0";
      }
      if (dataLoad[0].engineRPM == null){
        dataLoad[0].engineRPM = "0";
      }
      if (dataLoad[0].engineLoad == null){
        dataLoad[0].engineLoad = "0";
      }
      if (dataLoad[0].throttlePosition == null){
        dataLoad[0].throttlePosition = "0";
      }
      if (dataLoad[0].turboBoost == null){
        dataLoad[0].turboBoost = "0";
      }
      if (dataLoad[0].masseAirFlowRate == null){
        dataLoad[0].masseAirFlowRate = "0";
      }
      if (dataLoad[0].intakeManifold == null){
        dataLoad[0].intakeManifold = "0";
      }
      if (dataLoad[0].intakeAirTemp == null){
        dataLoad[0].intakeAirTemp = "0";
      }
      if (dataLoad[0].engineCoolantTemp == null){
        dataLoad[0].engineCoolantTemp = "0";
      }
      if (dataLoad[0].voltage == null){
        dataLoad[0].voltage = "0";
      }
      if (dataLoad[0].gps.speed == null){
        dataLoad[0].gps.speed = "0";
      }
      for (var i=0;i<dataLoad.length;i++) {
        // data for l100Instant graph
        if (dataLoad[i].l100Instant != null){
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = parseFloat(dataLoad[i].l100Instant);
          if (data.close > 100){
            data.close = 100
          }
          datal100Instant.push(data);
        }
        else {
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = 0
          datal100Instant.push(data);
        }
        // data for odbSpeed+gpsSpeed graph
        if (dataLoad[i].odbSpeed != null){
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = parseFloat(dataLoad[i].odbSpeed);
          dataodbSpeed.push(data);
        }
        else {
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = 0
          dataodbSpeed.push(data);
        }
        // data for engineRPM graph
        if (dataLoad[i].engineRPM != null){
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = parseFloat(dataLoad[i].engineRPM);
          dataengineRPM.push(data);
        }
        else {
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = 0
          dataengineRPM.push(data);
        }
        // data for engineLoad graph
        if (dataLoad[i].engineLoad != null){
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = parseFloat(dataLoad[i].engineLoad);
          dataengineLoad.push(data);
        }
        else {
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = 0
          dataengineLoad.push(data);
        }
        // data for throttlePosition graph
        if (dataLoad[i].engineLoad != null){
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = parseFloat(dataLoad[i].throttlePosition);
          datathrottlePosition.push(data);
        }
        else {
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = 0
          datathrottlePosition.push(data);
        }
        // data for turboBoost graph
        if (dataLoad[i].engineLoad != null){
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          var value = (parseFloat(dataLoad[i].turboBoost)+20)*2.5;
          data.close = value;
          dataturboBoost.push(data);
        }
        else {
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = 0
          dataturboBoost.push(data);
        }
        // data for masseAirFlowRate graph
        if (dataLoad[i].masseAirFlowRate != null){
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = parseFloat(dataLoad[i].masseAirFlowRate);
          datamasseAirFlowRate.push(data);
        }
        else {
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = 0
          datamasseAirFlowRate.push(data);
        }
        // data for intakeManifold graph
        if (dataLoad[i].intakeManifold != null){
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = parseFloat(dataLoad[i].intakeManifold);
          dataintakeManifold.push(data);
        }
        else {
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = 0
          dataintakeManifold.push(data);
        }
        // data for intakeAirTemp graph
        if (dataLoad[i].intakeAirTemp != null ){
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = parseFloat(dataLoad[i].intakeAirTemp);
          dataintakeAirTemp.push(data);
        }
        else {
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = 0
          dataintakeAirTemp.push(data);
        }
        // data for engineCoolantTemp graph
        if (dataLoad[i].engineCoolantTemp != null){
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = parseFloat(dataLoad[i].engineCoolantTemp);
          dataengineCoolantTemp.push(data);
        }
        else {
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = 0
          dataengineCoolantTemp.push(data);
        }
        if (dataLoad[i].voltage != null){
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = parseFloat(dataLoad[i].voltage);
          datavoltage.push(data);
        }
        else {
          var data = new Object();
          data.date = new Date(dataLoad[i].time.match(/^[0-9]{10}/g)[0]*1000)
          data.close = 0
          datavoltage.push(data);
        }
      }


      // l100Instant graph
      drawGraph(datal100Instant, "l/100 Instant", "#l100Instant")
      // odbSpeed graph
      drawGraph(dataodbSpeed, 'ODB Speed (km/h)', '#odbSpeed')
      // engineRPM graph
      drawGraph(dataengineRPM,'RPM','#engineRPM')
      // engineLoad graph
      drawGraph(dataengineLoad,'Engine Load (%)', '#engineLoad')
      // throttlePosition graph
      drawGraph(datathrottlePosition,'Throttle Position (%)','#throttlePosition')
      // turboBoost graph
      drawGraph(dataturboBoost,'Turbo Boost (%)','#turboBoost')
      // masseAirFlowRate graph
      drawGraph(datamasseAirFlowRate,'Masse Air Flow Rate (g/s)','#masseAirFlowRate')
      // intakeManifold graph
      drawGraph(dataintakeManifold,'Intake Manifold Pressure (kPa)','#intakeManifold')
      // intakeAirTemp graph
      drawGraph(dataintakeAirTemp,'Intake Air Temp (°C)', '#intakeAirTemp')
      // engineCoolantTemp graph
      drawGraph(dataengineCoolantTemp,'Engine Coolant Temp (°C)', '#engineCoolantTemp')
      // voltage graph
      drawGraph(datavoltage,'Voltage (V)','#voltage')
  });
}

function live(){
  var element = document.getElementById('select');
  var button = document.getElementById('button');
  if (button.style.color == 'rgb(255, 69, 0)'){
    button.style.color = 'rgb(107, 142, 35)';
    lastSelectValue = element.childNodes[element.childNodes.length-1].value;
    element.value = lastSelectValue;
    getTrip(lastSelectValue);
    setTimeout("askLastRecords()", 1000);
    setTimeout("askGraph()", 20000);
  }
  else {
    button.style.color = 'rgb(255, 69, 0)';
  }
  socket.on('live', function (data){
    if (data.time > dataLoad[dataLoad.length-1].time){
      var lat1 = dataLoad[dataLoad.length-1].gps.latitude;
      var lon1 = dataLoad[dataLoad.length-1].gps.longitude;
      var lat2 = data.gps.latitude;
      var lon2 = data.gps.longitude;
      googlePoint1 = new google.maps.LatLng(lat1, lon1);
      googlePoint1 = new google.maps.LatLng(lat2, lon2);
      points.push(googlePoint1);
      points.push(googlePoint2);
      var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(pointLat, pointLon)
      };
      map.setOptions(mapOptions);
      flightPath = new google.maps.Polyline({
        path: points,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      flightPath.setMap(map);
      dataLoad.push(data);
    }
  });
}

function askLastRecords(){
  if (document.getElementById('button').style.color == 'rgb(107, 142, 35)'){
    socket.emit('lastRecords', lastSelectValue);
    setTimeout("askLastRecords()", 1000);
  }
}

function askGraph(){
  if (document.getElementById('button').style.color == 'rgb(107, 142, 35)'){
    socket.emit('askDrawGraph');
    setTimeout("askGraph()", 20000);
  }
}

// ADD marker when moose hoover graph
function addMarker(index){
  var lat = dataLoad[index].gps.latitude;
  var lon = dataLoad[index].gps.longitude;
  var time = dataLoad[index].time;
  var myLatlng = new google.maps.LatLng(lat,lon);
  var mapOptions = {zoom: 12,center: myLatlng};
  if (marker != null){
      marker.setMap(null);
  }
  marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    title: ""
  });
  marker.setMap(map);
}

// Change map position when scroll
$(window).on("mousewheel", function(){
  var elem = document.getElementById("map-canvas");
  var top = $(window).scrollTop();
  elem.style.top = top+"px";
});

function clearBox(elementID)
{
    document.getElementById(elementID.substr(1)).innerHTML = "";
}
