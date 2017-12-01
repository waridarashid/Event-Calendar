/**
 * calendarDemoApp - 0.9.0
 */
var calendarDemoApp = angular.module('calendarDemoApp', ['ui.calendar', 'ui.bootstrap']);

calendarDemoApp.controller('CalendarCtrl',
   function($scope, $compile, $timeout, uiCalendarConfig, $http, $uibModal, $log, $document) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
	var $ctrl = this;

	var socket = io.connect();
	socket.on();
	socket.on('broadcast', function(message) {
        console.log('Message from server: ' + message);
		$scope.loadEvents();
    })

	$ctrl.items = [];
	$scope.events = [];


	/* loads all the events from database */
	$scope.loadEvents = function () {
		$scope.events.splice(0, $scope.events.length); //without it the events are loaded twice. Fullcalendar bug
     
		$http.get('/api/appointments').then(response=>{
			appointments = response.data;
			
			for (var i = 0; i < appointments.length; ++i) {
				var x = appointments[i];
				var newEvent = new Object();
				newEvent.title = x.name;
				newEvent.id = x._id;
				newEvent.allDay = false;
				newEvent.start = new Date(x.date);
				
				$scope.events.push(newEvent);
			}
		});
	};

    $scope.changeTo = 'Hungarian';
    /* event source that pulls from google.com */
    $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event',           // an option!
            currentTimezone: 'America/Chicago' // an option!
    };

    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
      var s = new Date(start).getTime() / 1000;
      var e = new Date(end).getTime() / 1000;
      var m = new Date(start).getMonth();
      var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
      callback(events);
	  $scope.loadEvents();
    };


    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
		console.log(date);
		$ctrl.items.isEvent = true;
		$ctrl.items.thisEvent = date;

		var modalInstance = $uibModal.open({
			templateUrl: 'myModalContent.html',
			controller: 'ModalInstanceCtrl',
			controllerAs: '$ctrl',
			resolve: {
				items: function () {
				return $ctrl.items;
				}
			}
		});
		modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
			}, function () {
				 $log.info('Modal dismissed at: ' + new Date());
		});
	};
	/* alert on dayClick */
	$scope.alertOnDayclick = function( date, jsEvent, view) {
		$scope.alertMessage = (date.format() + ' was clicked ');
		$ctrl.items.date = date;
		$ctrl.items.isEvent = false;

    var modalInstance = $uibModal.open({
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      resolve: {
        items: function () {
          return $ctrl.items;
        }
      }
    });
	modalInstance.result.then(function (selectedItem) {
		$scope.selected = selectedItem;
		}, function () {
			  $log.info('Modal dismissed at: ' + new Date());
	});


	};

    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
      var canAdd = 0;
      angular.forEach(sources,function(value, key){
        if(sources[key] === source){
          sources.splice(key,1);
          canAdd = 1;
        }
      });
      if(canAdd === 0){
        sources.push(source);
      }
    };

    /* remove event */
    $scope.remove = function(index) {
      $scope.events.splice(index,1);
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };
    /* Change View */
    $scope.renderCalendar = function(calendar) {
      $timeout(function() {
        if(uiCalendarConfig.calendars[calendar]){
          uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
      });
    };
     /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) {
        element.attr({'tooltip': event.title,
                      'tooltip-append-to-body': true});
        $compile(element)($scope);
    };
    /* config object */
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: false,
        header:{
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        eventClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender,
		dayClick: $scope.alertOnDayclick
      }
    };

    $scope.changeLang = function() {
      if($scope.changeTo === 'Hungarian'){
        $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
        $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
        $scope.changeTo= 'English';
      } else {
        $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        $scope.changeTo = 'Hungarian';
      }
    };
    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
    $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];
});

/* EOF */
calendarDemoApp.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, $http, items) {
  var $ctrl = this;
  $scope.eventName = "";
  $ctrl.items = items;

  $ctrl.selected = {
    item: $ctrl.items[0]
  };
  
  $ctrl.ok = function () {
    $uibModalInstance.close();
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  /* functions to interact with the database on user command */

  $ctrl.save = function () {
	console.log(items.date.format());
	console.log($scope.eventName);
    $uibModalInstance.close();

	var newEvent = new Object();
	newEvent.name = $scope.eventName
	newEvent.phone = "123";
	newEvent.date = items.date;
	$http.post('/api/appointments', newEvent).then(function (data){
		console.log("stored");
	},function (error){
		console.log('Error: ' + error);
	});
	
  };

    $ctrl.delete = function () {
		$uibModalInstance.close();
		console.log (items.thisEvent);
		$http.delete('/api/appointments/'+items.thisEvent.id);	
    };

	$ctrl.edit = function () {
		$uibModalInstance.close();
		console.log (items.thisEvent);
		var newEvent = new Object();
		newEvent.name = $scope.eventName;
		$http.put('/api/appointments/'+ items.thisEvent.id, newEvent);
    };


});
