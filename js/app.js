var app = angular.module('olyLift', ['firebase', 'ui.bootstrap']);

app.constant('FIREBASE_URI', 'https://olylift.firebaseio.com/');

app.controller('MainCtrl', function ($scope, $timeout, LiftService, TimerService, AthletesService) {
    $scope.judges = [
        {name:'Judge One', value:'judge01'},
        {name:'Judge Two', value:'judge02'},
        {name:'Judge Three', value:'judge03'}
    ];

    $scope.judge = $scope.judges[0];

    $scope.getAthletes = function () {
        $scope.athletes = AthletesService.getAthletes();
    };

    $scope.$on('athletesLoaded', $scope.getAthletes);

    $scope.approveLift = function (judge, approved) {
        $scope.lift[judge.value] = approved;
        $scope.updateLift();
    };

    $scope.getJudgeIcon = function (judge) {
        var icon = 'images/judge-start.svg';

        switch(judge) {
            case 'starting':
                icon = 'images/judge-start.svg';
                break;
            case 'approved':
                icon = 'images/judge-approve.svg';
                break;
            case 'rejected':
                icon = 'images/judge-reject.svg';
                break;
        }

        return icon;
    };

    $scope.convertKGtoLBS = function (kg) {
        var nearExact = kg/0.45359237;
        var lbs = Math.floor(nearExact);
        // var oz = (nearExact - lbs) * 16;

        return lbs;
    };

    $scope.updateLift = function () {
        LiftService.updateLift();
    };

    $scope.updateTimer = function () {
        TimerService.updateTimer();
    };

    $scope.isPaused = function () {
        return TimerService.isTimerPaused();
    };

    $scope.addTime = function (time) {
        $scope.timer.time += time;
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

app.controller('LiveBlogCtrl', function($scope, TimerService){
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

    $scope.timer = TimerService.getTimer();
});

app.directive('liveBlog', function($firebase, FIREBASE_URI){
    var linker = function(scope, elem, attrs) {
        scope.blogger = attrs['blogger'];
        scope.getComments();
    };

    var controller = function($scope) {
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

app.directive('liveBlogAdmin', function($firebase, FIREBASE_URI){
    var linker = function(scope, elem, attrs) {
        scope.blogger = attrs['blogger'];
        scope.getComments();
    };

    var controller = function($scope) {
        $scope.newComment = '';
        
        $scope.getComments = function () {
            $scope.comments = $firebase(new Firebase(FIREBASE_URI + 'liveblog/' + $scope.blogger));
        };

        $scope.addComment = function(){
            $scope.comments.$add($scope.newComment);
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

app.factory('AthletesService', function ($rootScope, $firebase, FIREBASE_URI) {
    var athletes = [];
    var athletesCollection = $firebase(new Firebase(FIREBASE_URI + 'athletes'));

    // Little bit of hoop jumping to make this collection work with ui-bootstrap lookahead
    athletesCollection.$on('loaded', function(){
        var keys = athletesCollection.$getIndex();
        keys.forEach(function(key, i) {
            athletes.push(athletesCollection[key]);
        });
        $rootScope.$broadcast('athletesLoaded');
    });

    var getAthletes = function() {
        return athletes;
    };

    return {
        getAthletes: getAthletes
    }
});

app.factory('TimerService', function ($rootScope, $timeout, $firebase, FIREBASE_URI) {
    var timer = $firebase(new Firebase(FIREBASE_URI + 'timer'));

    var isPaused = true,
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
        },
        isTimerPaused = function() {
            return isPaused;
        };

    return {
        getTimer: getTimer,
        updateTimer: updateTimer,
        pause: pause,
        resume: resume,
        start: start,
        toggle: toggle,
        isTimerPaused: isTimerPaused
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

// Hack for viewport-reliant font-size on Chrome

resetElements = $("h1, h2, h3, h4, h5");

$(window).resize(function() {
  resetElements.css("z-index", 1);
});
