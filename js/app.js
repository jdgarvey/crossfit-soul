var app = angular.module('olyLift', ['firebase', 'ui.bootstrap']);

app.constant('FIREBASE_URI', 'https://olylift.firebaseio.com/lift');

app.controller('MainCtrl', function ($scope, $timeout, LiftService, TimerService) {
    $scope.convertLBStoKG = function (lbs) {
        return Math.floor(lbs * 0.453592);
    };

    $scope.updateLift = function () {
        LiftService.updateLift();
    };

    var padNumber = function (nr, n, str) {
        return Array(n - String(nr).length + 1).join(str || '0') + nr;
    };

    $scope.getRemainingMinutes = function (time) {
        var minutes = Math.floor(time / 60);
        return padNumber(minutes, 2);
    };

    $scope.getRemainingSeconds = function (time) {
        var minutes = Math.floor(time / 60);
        var seconds = time - minutes * 60;
        return padNumber(seconds, 2);
    };

    $scope.countDown = 0;
    $scope.lift = {};

    $scope.$on('timerTick', function() {
        $scope.countDown = TimerService.getCountdown();
    });

    $scope.$on('liftLoaded',function() {
        $scope.lift = LiftService.getLift();
        TimerService.setCountdown(parseInt($scope.lift.timer, 10));
        TimerService.start();
    });
});

app.factory('TimerService', function ($rootScope, $timeout) {
    var isPaused = false,
        countDown = 120,
        pause = function () {
            isPaused = true;
        },
        resume = function () {
            isPaused = false;
            start();
        },
        start = function () {
            if (isPaused) return;
            countDown -= 1;
            $rootScope.$broadcast('timerTick', countDown);
            if (countDown > 0) {
                $timeout(start, 1000);
            }
        },
        toggle = function () {
            isPaused = !isPaused;
            start();
        },
        setCountdown = function (count) {
            countDown = count;
        },
        getCountdown = function () {
            return countDown;
        };
    
    return {
        setCountdown: setCountdown,
        getCountdown: getCountdown,
        pause: pause,
        resume: resume,
        start: start,
        toggle: toggle
    }
});

app.factory('LiftService', function ($rootScope, $firebase, FIREBASE_URI) {
    var lift = $firebase(new Firebase(FIREBASE_URI));

    lift.$on('loaded', function(){
        $rootScope.$broadcast('liftLoaded');
    });

    var getLift = function () {
        return lift;
    };

    var updateLift = function () {
        lift.$save();
    };

    return {
        getLift: getLift,
        updateLift: updateLift
    }
});
