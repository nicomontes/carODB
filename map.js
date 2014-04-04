// Global Variables
var map;
var dataLoad;
var marker;
var lastPoint;

// Init Function
function init(){
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(-34.397, 150.644)
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  var socket = io.connect()
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
}

// GET all trip data
function getTrip(value){
  var socket = io.connect()
  socket.emit('getTrip', value)
  socket.on('drawTrip', function (data){
    var points = new Array();
    var dataEngineCoolantTemp = '[';
    var datal100Instant = '[';
    var dataodbSpeed = '[';
    var dataengineRPM = '[';
    var dataengineLoad = '[';
    var datathrottlePosition = '[';
    var dataturboBoost = '[';
    var datamasseAirFlowRate = '[';
    var dataintakeManifold = '[';
    var dataintakeAirTemp = '[';
    var datavoltage = '[';
    dataLoad = data;
    if (data[0].l100Instant == null){
      data[0].l100Instant = "0";
    }
    if (data[0].l100LongTerm == null){
      data[0].l100LongTerm = "0";
    }
    if (data[0].odbSpeed == null){
      data[0].odbSpeed = "0";
    }
    if (data[0].engineRPM == null){
      data[0].engineRPM = "0";
    }
    if (data[0].engineLoad == null){
      data[0].engineLoad = "0";
    }
    if (data[0].throttlePosition == null){
      data[0].throttlePosition = "0";
    }
    if (data[0].turboBoost == null){
      data[0].turboBoost = "0";
    }
    if (data[0].masseAirFlowRate == null){
      data[0].masseAirFlowRate = "0";
    }
    if (data[0].intakeManifold == null){
      data[0].intakeManifold = "0";
    }
    if (data[0].intakeAirTemp == null){
      data[0].intakeAirTemp = "0";
    }
    if (data[0].engineCoolantTemp == null){
      data[0].engineCoolantTemp = "0";
    }
    if (data[0].voltage == null){
      data[0].voltage = "0";
    }
    if (data[0].gps.speed == null){
      data[0].gps.speed = "0";
    }
    for (var i=0;i<data.length;i++) {
      // longitude + latitude for MAP
      if (data[i].gps.longitude != null && data[i].gps.latitude != null && i != 0){
        pointLat = data[i].gps.latitude;
        pointLon = data[i].gps.longitude;
        if (data[i-1].gps.longitude != null && data[i-1].gps.latitude != null){
          var diffLat=Math.abs(pointLat-data[i-1].gps.latitude);
          var diffLon=Math.abs(pointLon-data[i-1].gps.longitude);
          var diffDist = Math.sqrt(Math.pow(diffLat,2)+Math.pow(diffLon,2));
          var diffTime = (parseFloat(data[i].time)-parseFloat(data[i-1].time))/1000;
          // Remove strong values
          if ( diffDist/diffTime > 0.0005 && parseInt(data[i].odbSpeed) < 200){
            console.log(data[i].gps.speed);
            console.log(diffDist/diffTime);
          }
          else {
            googlePoint = new google.maps.LatLng(pointLat, pointLon);
            points.push(googlePoint);
          }
        }
      }
      else if (data[i].gps.longitude != null && data[i].gps.latitude != null) {
        pointLat = data[i].gps.latitude;
        pointLon = data[i].gps.longitude;
        googlePoint = new google.maps.LatLng(pointLat, pointLon);
        points.push(googlePoint);
      }

      // data for l100Instant graph
      if (data[i].l100Instant != null){
        datal100Instant = datal100Instant + '{"time":'+ parseInt(data[i].time) +', "value1":'+ parseFloat(data[i].l100Instant) +', "value2":'+ parseFloat(data[i].l100LongTerm) +'},';
      }
      // data for odbSpeed+gpsSpeed graph
      if (data[i].odbSpeed != null && data[i].gps.speed != null){
        dataodbSpeed = dataodbSpeed + '{"time":'+ parseInt(data[i].time) +', "value1":'+ parseFloat(data[i].odbSpeed) +', "value2":'+ parseFloat(data[i].gps.speed) +'},';
      }
      // data for engineRPM graph
      if (data[i].engineRPM != null){
        dataengineRPM = dataengineRPM + '{"time":'+ parseInt(data[i].time) +', "value":'+ parseFloat(data[i].engineRPM) +'},';
      }
      // data for engineLoad+throttlePosition+turboBoost graph
      if (data[i].engineLoad != null){
        dataengineLoad = dataengineLoad + '{"time":'+ parseInt(data[i].time) +', "value":'+ parseFloat(data[i].engineLoad) +'},';
      }
      // data for throttlePosition graph
      if (data[i].throttlePosition != null){
        datathrottlePosition = datathrottlePosition + '{"time":'+ parseInt(data[i].time) +', "value":'+ parseFloat(data[i].throttlePosition) +'},';
      }
      // data for turboBoost graph
      if (data[i].turboBoost != null){
        var value=(parseFloat(data[i].turboBoost)+20)*100/20;
        dataturboBoost = dataturboBoost + '{"time":'+ parseInt(data[i].time) +', "value":'+ value +'},';
      }
      // data for masseAirFlowRate graph
      if (data[i].masseAirFlowRate != null){
        datamasseAirFlowRate = datamasseAirFlowRate + '{"time":'+ parseInt(data[i].time) +', "value":'+ parseFloat(data[i].masseAirFlowRate) +'},';
      }
      // data for intakeManifold graph
      if (data[i].intakeManifold != null){
        dataintakeManifold = dataintakeManifold + '{"time":'+ parseInt(data[i].time) +', "value":'+ parseFloat(data[i].intakeManifold) +'},';
      }
      // data for intakeAirTemp+engineCoolantTemp graph
      if (data[i].intakeAirTemp != null && data[i].engineCoolantTemp != null){
        dataintakeAirTemp = dataintakeAirTemp + '{"time":'+ parseInt(data[i].time) +', "value1":'+ parseFloat(data[i].intakeAirTemp) +', "value2":'+ parseInt(data[i].engineCoolantTemp) +'},';
      }
      if (data[i].voltage != null){
        datavoltage = datavoltage + '{"time":'+ parseInt(data[i].time) +', "value":'+ parseFloat(data[i].voltage) +'},';
      }
    }

    // Parse JSON
    datal100Instant = datal100Instant.substring(0, datal100Instant.length - 1) + ']'
    var datal100InstantJSON = JSON.parse(datal100Instant);
    dataodbSpeed = dataodbSpeed.substring(0, dataodbSpeed.length - 1) + ']'
    var dataodbSpeedJSON = JSON.parse(dataodbSpeed);
    dataengineRPM = dataengineRPM.substring(0, dataengineRPM.length - 1) + ']'
    var dataengineRPMJSON = JSON.parse(dataengineRPM);
    dataengineLoad = dataengineLoad.substring(0, dataengineLoad.length - 1) + ']'
    var dataengineLoadJSON = JSON.parse(dataengineLoad);
    datathrottlePosition = datathrottlePosition.substring(0, datathrottlePosition.length - 1) + ']'
    var datathrottlePositionJSON = JSON.parse(datathrottlePosition);
    dataturboBoost = dataturboBoost.substring(0, dataturboBoost.length - 1) + ']'
    var dataturboBoostJSON = JSON.parse(dataturboBoost);
    datamasseAirFlowRate = datamasseAirFlowRate.substring(0, datamasseAirFlowRate.length - 1) + ']'
    var datamasseAirFlowRateJSON = JSON.parse(datamasseAirFlowRate);
    dataintakeManifold = dataintakeManifold.substring(0, dataintakeManifold.length - 1) + ']'
    var dataintakeManifoldJSON = JSON.parse(dataintakeManifold);
    dataintakeAirTemp = dataintakeAirTemp.substring(0, dataintakeAirTemp.length - 1) + ']'
    var dataintakeAirTempJSON = JSON.parse(dataintakeAirTemp);
    datavoltage = datavoltage.substring(0, datavoltage.length - 1) + ']'
    var datavoltageJSON = JSON.parse(datavoltage);

    // l100Instant graph
    drawDoubleGraph(datal100InstantJSON,'l/100 Instant (l/100)', 'l/100 Average (l/100)', 'value1', 'value2','l100Instant')
    // odbSpeed graph
    drawDoubleGraph(dataodbSpeedJSON,'ODB Speed (km/h)', 'GPS Speed (km/h)', 'value1', 'value2','odbSpeed')
    // engineRPM graph
    drawGraph(dataengineRPMJSON,'RPM','engineRPM')
    // engineLoad graph
    drawGraph(dataengineLoadJSON,'Engine Load (%)','engineLoad')
    // throttlePosition graph
    drawGraph(datathrottlePositionJSON,'Throttle Position (%)','throttlePosition')
    // turboBoost graph
    drawGraph(dataturboBoostJSON,'Turbo Boost (%)','turboBoost')
    // masseAirFlowRate graph
    drawGraph(datamasseAirFlowRateJSON,'Masse Air Flow Rate (g/s)','masseAirFlowRate')
    // intakeManifold graph
    drawGraph(dataintakeManifoldJSON,'Intake Manifold Pressure (kPa)','intakeManifold')
    // intakeAirTemp graph
    drawDoubleGraph(dataintakeAirTempJSON,'Intake Air Temp (°C)', 'Engine Coolant Temp (°C)', 'value1', 'value2','intakeAirTemp')
    // voltage graph
    drawGraph(datavoltageJSON,'Voltage (V)','voltage')

    // Map options
    var mapOptions = {zoom: 12,center: new google.maps.LatLng(pointLat, pointLon)};
    map.setOptions(mapOptions);
    var flightPath = new google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
  // draw trip on map
  flightPath.setMap(map);
  });
}

// ADD marker when moose hoover graph
function addMarker(index, options){
  var lat = dataLoad[index].gps.latitude;
  var lon = dataLoad[index].gps.longitude;
  var time = options.data[index].time;
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

function drawGraph(JSON, label, element){
  new Morris.Line({
    element: element,
    data: JSON,
    xkey: 'time',
    ykeys: ['value'],
    labels: [label],
    pointSize: 0,
    hoverCallback: function (index, options, y){addMarker(index, options);return y.toString();},
  });
}

function drawDoubleGraph(JSON, labelA, labelB, ykeyA, ykeyB, element){
  new Morris.Line({
    element: element,
    data: JSON,
    xkey: 'time',
    ykeys: [ykeyA, ykeyB],
    labels: [labelA, labelB],
    pointSize: 0,
    hoverCallback: function (index, options, y){addMarker(index, options);return y.toString();},
  });
}

// Change map position when scroll
$(window).on("mousewheel", function(){
  var elem = document.getElementById("map-canvas");
  var top = $(window).scrollTop();
  elem.style.top = top+"px";
});
