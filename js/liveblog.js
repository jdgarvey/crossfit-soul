var app = angular.module('olyLift', ['firebase', 'ui.bootstrap']);

app.constant('FIREBASE_URI', 'https://olylift.firebaseio.com/');

app.controller('LiveBlogCtrl', function ($scope, TimerService) {
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

    $scope.toggleCountDirection = function() {
        TimerService.toggleCountDirection();
    };

    $scope.updateTimer = function () {
        TimerService.updateTimer();
    };

    $scope.isPaused = function () {
        return TimerService.isTimerPaused();
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

    $scope.isCountingUp = function () {
        return TimerService.isCountingUp();
    };

    $scope.timer = TimerService.getTimer();
});

app.directive('liveBlog', function ($firebase, FIREBASE_URI) {
    var linker = function (scope, elem, attrs) {
        scope.blogger = attrs['blogger'];
        scope.getComments();
    };

    var controller = function ($scope) {
        $scope.newComment = '';

        $scope.getComments = function () {
            $scope.comments = $firebase(new Firebase(FIREBASE_URI + 'liveblog/' + $scope.blogger));
        };
    };

    return {
        controller: controller,
        link: linker,
        scope: true,
        templateUrl: 'liveblog.tpl.html'
    }
});

app.directive('liveBlogAdmin', function ($firebase, FIREBASE_URI) {
    var linker = function (scope, elem, attrs) {
        scope.blogger = attrs['blogger'];
        scope.getComments();
    };

    var controller = function ($scope) {
        $scope.newComment = '';

        $scope.getComments = function () {
            $scope.comments = $firebase(new Firebase(FIREBASE_URI + 'liveblog/' + $scope.blogger));
        };

        $scope.addComment = function () {
            $scope.comments.currentComment = $scope.newComment;
            $scope.comments.$save();
            $scope.newComment = '';
        };
    };

    return {
        controller: controller,
        link: linker,
        scope: true,
        templateUrl: 'liveblog-admin.tpl.html'

    }
});

app.factory('TimerService', function ($rootScope, $timeout, $firebase, FIREBASE_URI) {
    var timer = $firebase(new Firebase(FIREBASE_URI + 'liveblog_timer'));

    var isPaused = true,
        countingUp = false,
        pause = function () {
            isPaused = true;
        },
        resume = function () {
            isPaused = false;
            start();
        },
        countDown = function () {
            if (isPaused) return;
            timer.time -= 1;
            timer.$save();

            if (timer.time > 0) {
                $timeout(start, 1000);
            }
        },
        countUp = function () {
            if (isPaused) return;
            timer.time += 1;
            timer.$save();

            $timeout(start, 1000);
        },
        start = function () {
            (countingUp) ? countUp() : countDown();
        },
        toggle = function () {
            isPaused = !isPaused;
            start();
        },
        updateTimer = function () {
            timer.$save();
        },
        getTimer = function () {
            return timer;
        },
        isTimerPaused = function () {
            return isPaused;
        },
        toggleCountDirection = function () {
            countingUp = !countingUp;
        },
        isCountingUp = function () {
            return countingUp;
        };


    return {
        getTimer: getTimer,
        updateTimer: updateTimer,
        pause: pause,
        resume: resume,
        start: start,
        toggle: toggle,
        isTimerPaused: isTimerPaused,
        toggleCountDirection: toggleCountDirection,
        isCountingUp: isCountingUp
    }
});

// Hack for viewport-reliant font-size on Chrome

resetElements = $("h1, h2, h3, h4, h5");

$(window).resize(function () {
    resetElements.css("z-index", 1);
});
