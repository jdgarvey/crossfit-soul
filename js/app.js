var app = angular.module('olyLift', ['firebase', 'ui.bootstrap']);

app.constant('FIREBASE_URI', 'https://olylift.firebaseio.com/');

app.controller('MainCtrl', function ($scope, $timeout, LiftService, TimerService) {
    $scope.convertLBStoKG = function (lbs) {
        return Math.floor(lbs * 0.453592);
    };

    $scope.updateLift = function () {
        LiftService.updateLift();
    };

    $scope.updateTimer = function () {
        TimerService.updateTimer();
    };

    $scope.startTimer = function () {
        TimerService.start();
    };

    $scope.pauseTimer = function () {
        TimerService.pause();
    };

    $scope.toggleTimer = function () {
        TimerService.toggle();
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

    $scope.$on('liftLoaded', function () {
        $scope.lift = LiftService.getLift();
        $scope.timer = TimerService.getTimer();
    });
});

app.factory('TimerService', function ($rootScope, $timeout, $firebase, FIREBASE_URI) {
    var timer = $firebase(new Firebase(FIREBASE_URI + 'timer'));

    var loaded = false,
        isPaused = false,
        pause = function () {
            isPaused = true;
        },
        resume = function () {
            isPaused = false;
            start();
        },
        start = function () {
            if (isPaused) return;
            timer.time -= 1;
            timer.$save();

            if (timer.time > 0) {
                $timeout(start, 1000);
            }
        },
        toggle = function () {
            isPaused = !isPaused;
            start();
        },
        updateTimer = function (t) {
            timer.$save();
        },
        getTimer = function () {
            return timer;
        };

    return {
        getTimer: getTimer,
        updateTimer: updateTimer,
        pause: pause,
        resume: resume,
        start: start,
        toggle: toggle
    }
});

app.factory('LiftService', function ($rootScope, $firebase, FIREBASE_URI) {
    var lift = $firebase(new Firebase(FIREBASE_URI + 'lift'));

    lift.$on('loaded', function () {
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
