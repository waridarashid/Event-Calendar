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
	//$ctrl.items = ['item1', 'item2', 'item3'];
	$ctrl.items = new Object();

	/* event source that contains custom events on the scope */
    $scope.events = [
      {title: 'All Day Event',start: new Date(y, m, 1)},
      {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
      {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
      {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    ];


	/* loads all the events on page-load */
	$scope.loadEvents = function () {
		$scope.events.slice(0, $scope.events.length);
     
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

	$scope.loadEvents();

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
    };

    $scope.calEventsExt = {
       color: '#f00',
       textColor: 'yellow',
       events: [
          {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
          {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
          {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        ]
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
    };
	/* alert on dayClick */
	$scope.alertOnDayclick = function( date, jsEvent, view) {
		$scope.alertMessage = (date.format() + ' was clicked ');
		$ctrl.items.date = date;

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
    /* alert on Drop */
     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Dropped to make dayDelta ' + delta);
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
    /* add custom event*/
    $scope.addEvent = function() {
      $scope.events.push({
        title: 'Open Sesame',
        start: new Date(y, m, 28),
        end: new Date(y, m, 29),
        className: ['openSesame']
      });

		var newEvent = new Object();
		newEvent.name = "TEST";
		newEvent.phone = "123";
		newEvent.date = new Date(y, m, 18);
		$http.post('/api/appointments', newEvent).then(function (data){
			console.log("stored");
		},function (error){
	   console.log('Error: ' + error);

		});
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
        editable: true,
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
  $scope.eventName = "Default";
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

});
