/**
 * calendarDemoApp - 0.9.0
 */
var calendarDemoApp = angular.module('calendarDemoApp', ['ui.calendar', 'ui.bootstrap']);

calendarDemoApp.controller('CalendarCtrl',
   function($scope, $compile, $timeout, uiCalendarConfig, $http, $uibModal, $log, $document) {
	var $ctrl = this;
	
	var socket = io.connect();
	/* a broacast from the server indicates changes in database and the events are loaded */
	socket.on('broadcast', function(message) {
		$scope.loadEvents();
    })

	$ctrl.items = [];
	$scope.events = [];
	$scope.eventSource = [];


	/* loads events from database */
	$scope.loadEvents = function () {
		$scope.events.splice(0, $scope.events.length); //without it the events are loaded twice. Fullcalendar bug

		/*fetches events only on dates displayed on the current calendar view */
		var config = { headers:  {
					'start': $scope.viewStart,
					'end': $scope.viewEnd,
					}
		};
     
		$http.get('/api/appointments', config).then(response=>{
			appointments = response.data;
			
			for (var i = 0; i < appointments.length; ++i) {
				var x = appointments[i];
				var newEvent = new Object();
				newEvent.title = x.name;
				newEvent.id = x._id;
				newEvent.allDay = false;
				newEvent.start = x.date;
				newEvent.created_at = x.createdAt;
				newEvent.updated_at = x.updatedAt;
								
				$scope.events.push(newEvent);
				//console.log(x.name);
			}
		});
	};

    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
		console.log(date);
        $scope.alertMessage = (date.title + ' was clicked ');
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
		dayClick: $scope.alertOnDayclick,
		viewRender: function(view, element) {
            /*The range of dates that is displayed on a calendar view. Necessary to fetch events for only that range for efficiency*/
			$scope.viewStart = view.start._d;
			$scope.viewEnd = view.end._d;
			$scope.loadEvents();
        }
      }
    };

    /* event sources array*/
    $scope.eventSources = [$scope.events];
});

/* EOF */
calendarDemoApp.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, $http, items) {
  var $ctrl = this;
  $scope.eventName = "";
  $ctrl.items = items;

  /*formats date of create and update*/
  if ($ctrl.items.isEvent) {
	$ctrl.updatedOn = new Date ($ctrl.items.thisEvent.updated_at);
	created = new Date ($ctrl.items.thisEvent.created_at);
	updated = new Date ($ctrl.items.thisEvent.updated_at);
	$ctrl.createdOn = created.getDate() + '-' + (created.getMonth()+1) + '-' + created.getFullYear();
	$ctrl.updatedOn = updated.getDate() + '-' + (updated.getMonth()+1) + '-' + updated.getFullYear();
  }

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  /* functions to interact with the database on user command */

  $ctrl.save = function () {
    $uibModalInstance.close();

	var newEvent = new Object();
	newEvent.name = $scope.eventName
	newEvent.date = items.date;
	$http.post('/api/appointments', newEvent).then(function (data){
		console.log("stored");
	},function (error){
		console.log('Error: ' + error);
	});
	
  };

    $ctrl.delete = function () {
		$uibModalInstance.close();
		$http.delete('/api/appointments/'+items.thisEvent.id);	
    };

	$ctrl.edit = function () {
		$ctrl.updatedOn = new Date($ctrl.items.thisEvent.updated_at);
		$uibModalInstance.close();
		var newEvent = new Object();
		newEvent.name = $scope.eventName;
		$http.put('/api/appointments/'+ items.thisEvent.id, newEvent);
    };


});
