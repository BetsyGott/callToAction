var app = angular.module('callToActionApp', ['ngRoute', 'ui.bootstrap', 'ngMap', 'ngAnimate', 'angularModalService', 'angular-storage']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/', {templateUrl: 'templates/home.html', controller: 'mainCtrl'})
        .when("/about", {templateUrl: "templates/about.html", controller: "mainCtrl"})
        .when("/issues", {templateUrl: "templates/issues.html", controller: "mainCtrl"})
        .when("/faq", {templateUrl: "templates/faq.html", controller: "mainCtrl"})
        .when("/call_to_action", {templateUrl: "templates/call_to_action.html", controller: "mainCtrl"})
        .when("/leadership", {templateUrl: "templates/leaders.html", controller: "mainCtrl"})
        .when("/committees", {templateUrl: "templates/committees.html", controller: "mainCtrl"})
        .when("/404", {templateUrl: "templates/404.html", controller: "mainCtrl"})
        .when("/reps", {templateUrl: "templates/reps.html", controller: "mainCtrl"})
        .when("/senators", {templateUrl: "templates/senators.html", controller: "mainCtrl"})
        .when("/tips", {templateUrl: "templates/tips.html", controller: "mainCtrl"})
        .when("/my_reps", {templateUrl: "templates/my_reps.html", controller: "repCtrl"})
        .otherwise({redirectTo: '/'});
});

app.controller('mainCtrl', function ($scope, $route, $routeParams, $location, $http, $q, NgMap, userDataService, issueService) {

    var userDataService = userDataService;
    var issueService = issueService;

    var mainCtrl = this;

    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
    $scope.collapseIssues = true;
    this.userFullName = userDataService.getNames();
    $scope.address = userDataService.getAddress();
    $scope.enterNameMsg = '';
    $scope.enterAddressMsg = '';

    $scope.checkWhatToShow = function(){
      if(mainCtrl.userFullName && $scope.address){
          $scope.showConfirmBox = true;
      }  else {
          $scope.showConfirmBox = false;
      }
    };

    $scope.saveName = function(){
        userDataService.saveName(mainCtrl.userFullName);
    };

    $scope.saveAddress = function(){
        userDataService.setAddress($scope.address);
    };

    $scope.placeChanged = function() {

        $scope.place = this.getPlace();

        userDataService.setAddress($scope.place.formatted_address);

        $scope.address = userDataService.getAddress();

    };

    $scope.submitInfo = function(){

            userDataService.getRepsFromApi( userDataService.getAddress() )
                .then(userDataService.setReps)
                .then(function(reps){
                    $scope.reps = reps;
                    $scope.changeToMyRepsPage();
                    $scope.showConfirmBox = true;
                });

    };

    $scope.changeToMyRepsPage = function(){
        $location.path('/my_reps');
    };

    $scope.clearInfo = function(){
        $scope.userFullName = '';
        $scope.address = '';
        userDataService.setAddress($scope.address);
        userDataService.saveName($scope.userFullName);
        $scope.showConfirmBox = false;
    };

    $scope.getIssues = function(){
        issueService.callForIssues()
            .then(function (response) {

               issueService.setIssues(response.data);

               $scope.issues = issueService.getIssues();

            });
    };

    $scope.getIssues();

});

app.controller('repCtrl', ['$scope','userDataService', 'issueService', 'ModalService', function ($scope, userDataService, issueService, ModalService) {

    var repCtrl = this;
    var userDataService = userDataService;
    var issueService = issueService;

    this.reps = userDataService.getReps();
    this.issues = issueService.getIssues();
    this.name = userDataService.getNames();
    this.address = userDataService.getAddress();

    console.log('issues in rep ctrl', this.issues);

    var getTwitter = function(object){

        console.log('get twitter');
        var scripts = object.scripts;
        for(var i = 0; i < scripts.length; i++){
            if ( scripts[i].type == 'twitter' ) {

                 $scope.twitter = {
                     text: scripts[i].text,
                     hashTags: scripts[i].hashTags
                 };

            }
        }
    };

    if(!this.issues.length){
        issueService.callForIssues()
            .then(function (response) {
                issueService.setIssues(response.data);
                self.issues = issueService.getIssues();
                try {
                    getTwitter(self.issues[0]);
                } catch(error){
                    console.log(error);
                }
            });
    } else {
        try {
            getTwitter(this.issues[0]);
        } catch(error){
            console.log(error);
        }
    }


    $scope.callRep = function(rep) {
        $scope.showModal(rep, 'phone', repCtrl.name);
    };

    $scope.faxRep = function(rep) {
        $scope.showModal(rep, 'fax', repCtrl.name);
    };

    $scope.showModal = function(repInfo, type, userName){
        ModalService.showModal({
            templateUrl: "templates/modal.html",
            controller: "modalCtrl",
            inputs: {
                rep: repInfo,
                type: type,
                name: userName
            }

        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                console.log(result);
            });
        }).catch(function(error) {
            // error contains a detailed error message.
            console.log(error);
        });
    }

}]);

app.controller('modalCtrl', ['$scope', 'formatPhoneFilter', 'issueService', 'userDataService', 'faxService', 'rep', 'type', 'name', 'close', function($scope, formatPhoneFilter, issueService, userDataService, faxService, rep, type, name, close){

    var self = this;

    var userDataService = userDataService;
    var issueService = issueService;

    $scope.type = type;
    $scope.rep = rep;
    this.issues = issueService.getIssues();
    $scope.address = userDataService.getAddress();
    $scope.name = userDataService.getNames();
    $scope.showSend = true;
    $scope.success = false;

    $scope.sendFax = function() {

        var body = $(".fax-body").text();

        var data = {
            bioguideId: $scope.rep.idInfo.bioguide,
            name: $scope.name,
            address: $scope.address,
            header: $scope.modifiedIssues[0].title,
            body: body
        };


        faxService.sendFax(data)
            .then(function(response) {
                console.log("success:", response);
            }, function(response) {
                if(response.status == '400' || response.status == '404' || response.status == '500') {
                    $(".fax-container").html("<p>Sorry, there was a problem trying to send your fax. Please try again later.</p>");
                    $scope.showSend = false;
                } else {
                    $(".fax-preview").html("<p>Fax sent! Thanks for making your voice heard!</p>");
                    $scope.showSend = false;
                    $scope.success = true;
                }
            });
    };

    $scope.modifyScripts = function() {

        $scope.modifiedIssues = JSON.parse(JSON.stringify(self.issues));

        for(var i = 0; i < $scope.modifiedIssues.length; i++) {
            for (var j = 0; j < $scope.modifiedIssues[i].scripts.length; j++) {
                if($scope.name){
                    var replaceName = $scope.modifiedIssues[i].scripts[j].text.replace(/\[name\]/g, $scope.name);
                    $scope.modifiedIssues[i].scripts[j].text = replaceName;
                }

                if($scope.rep.type == 'senate'){
                    var replaceRep = $scope.modifiedIssues[i].scripts[j].text.replace(/\[repName\]/g, 'Senator ' + $scope.rep.lastName);

                } else {
                    replaceRep = $scope.modifiedIssues[i].scripts[j].text.replace(/\[repName\]/g, 'Representative ' + $scope.rep.lastName);

                }

                $scope.modifiedIssues[i].scripts[j].text = replaceRep;


            }
        }
    };

    $scope.modifyScripts();


}]);

app.service('issueService', function($http){

    var self = this;

    this.issues = [];

    this.getIssues = function(){
        return this.issues;
    };

    this.setIssues = function (issues) {
        this.issues = issues;
    };

    this.callForIssues = function ( name, repName ) {
        if(name && repName){
            return $http.get('http://speakunited.us/api/issues?name='+name+'&repName='+repName);
        } else if (name && !repName){
            return $http.get('http://speakunited.us/api/issues?name='+name);
        } else {
            return $http.get('http://speakunited.us/api/issues');
        }

    };

});

app.service('faxService', function($http, $q){

    this.sendFax = function(data) {

        return $http.post('http://speakunited.us/api/fax', data);
    }

});

app.service('userDataService', function($http, $q, store){

    this.reps = store.get('reps') || [];
    this.address = store.get('address') || '';
    this.fullName = store.get('name') || '';
    var self = this;

    this.saveName = function(name){
        this.fullName = name;
        store.set('name', this.fullName);
    };

    this.getNames = function(){
        return this.fullName;

    };

    this.setAddress = function(address) {
        this.address = address;
        store.set('address', this.address);
    };

    this.getAddress = function(){
        return this.address;
    };

    this.getRepsFromApi = function(address){

        return $q.all(
            [
                $http.get('http://speakunited.us/api/contacts?address='+address+'&type=senate'),
                $http.get('http://speakunited.us/api/contacts?address='+address+'&type=house')
            ]
        );

    };

    this.setReps = function(result){

        self.reps = [];

        for(var i in result){

            var resultArr = result[i].data;

            for(var j in resultArr){
                self.reps.push(resultArr[j]);
            }
        }

        store.set('reps', self.reps);

        return $q.when(self.reps);

    };

    this.getReps = function(){
        return this.reps;
    }

});

app.filter('formatPhone', function() {
    return function(number) {
        number = number || '';
        var formattedNumber = '';

        var stripSpecialChars = number.replace(/[\(\)-\s]/g, '');

        var hyphen = "-";
        var position = 6;
        var output = [stripSpecialChars.slice(0, position), hyphen, stripSpecialChars.slice(position)].join('');

        var a = output;
        position = 3;
        formattedNumber = [a.slice(0, position), hyphen, a.slice(position)].join('');

        return formattedNumber;
    };
});

app.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    };
});
