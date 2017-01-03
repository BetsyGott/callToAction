var app = angular.module('callToActionApp', ['ngRoute', 'ui.bootstrap', 'ngMap']);

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

app.controller('mainCtrl', function ($scope, $route, $routeParams, $location, $http, $q, NgMap, userDataService) {

    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.visitorName = '';
    $scope.representative = '';
    $scope.senators = [];

    $scope.issues = [
        {
            title: "Health Care",
            content: [
                {contentType: "pro", content: "I'm [name], a constituent calling to thank Senator/Rep _______ for supporting affordable health care and ask for continued support. I'm one of 20 million Americans who count on a marketplace plan for insurance. If the Affordable Care Act is overturned, I will lose access to health care. I want the Senator/Representative to block attempts to repeal the ACA."},
                {contentType: "anti", content: "I'm [name], a constituent calling to ask Senator/Rep _______ to support affordable health care. I'm one of 20 million Americans who count on a marketplace plan for insurance. If the Affordable Care Act is overturned, I will lose access to health care. I want the Senator/Representative to vote against repealing the ACA."}
                ]
        },
        {
            title: "Immigration",
            content: [
                {contentType: "pro", content: "I'm [name], a constituent calling to thank Senator/Rep ______ for supporting compassionate immigration policies, and ask for continued support. I ask that he/she put pressure on the Trump transition team to keep the previous Administration's immigration plans in place, particularly DACA. I ask that the he/she publicly oppose any attempts to overturn Obama's executive orders on immigration."},
                {contentType: "anti", content: "I'm [name], a constituent who supports compassionate immigration policies. I ask that Senator/Rep _______ urge the Trump transition team to keep the previous Administration's immigration policies in place, particularly DACA. America is a nation of immigrants. We do not close our doors on people in need."}
                ]
        },
        {title: "Reproductive Rights",
            content: [
                {contentType: "pro", content: "I'm [name], a constituent calling to thank Senator/Rep ______ for supporting women's reproductive rights. I fully support a woman's right to make her own health care decisions and I am afraid Donald Trump puts that right in jeopardy. I want the Senator/Rep to let the Trump transition team know publicly that he/she will not support anti-choice policies or SCOTUS nominees proposed by the Trump Administration."},
                {contentType: "anti", content: "I'm [name], a constituent calling to let Senator/Rep ______ know that I support a woman's right to make her own health care decisions. I am appalled by Donald Trump's promise to "+'"'+"overturn Roe v. Wade."+'"'+" 70% of American's support this landmark decision. I call on my Senator/Rep to publicly support the will of the people."}
            ]
        },
        {
            title: "Civil Liberties/First Amendment",
            content: [
                {contentType: "neutral", content: "I'm [name], a constituent calling to ask Senator/Rep ______ to publicly denounce Donald Trump's direct attacks on the First Amendment. Specifically, the Senator/Representative should denounce Trump's hostility toward the press and repeated threats to make a"+'"'+ "database of Muslims."+'"'+" A free press is essential to a free society; religious freedom is America's most essential value. Please ask the Senator/Representative to pressure the Trump transition team to observe tradition and allow journalists reasonable access to the White House and the President-Elect and to stop attacking freedom of religion."}
            ]
        },
        {
            title: "Marriage Equality",
            content: [
                {contentType: "pro", content: "I'm [name], a constituent calling to thank Senator/Rep ______ for supporting marriage equality, and ask that he/she publicly reiterate this support in light of the recent election. I would like the Senator/Rep to make it clear to Trump's transition team that SCOTUS nominees who are anti-marriage equality will not be confirmed."},
                {contentType: "anti", content: "I'm calling to let the Senator/Rep know that I support marriage equality as the law of the land. The Supreme Court has spoken. I would like the Senator/Rep to make it clear that he will uphold the will of court and the American people. Please ask the Senator to change his position and declare to Trump's transition team that SCOTUS nominees who are anti-marriage equality will be blocked."},
                {contentType: "neutral", content: ""}
            ]
        },
        {
            title: "Police Brutality/Criminal Justice",
            content: [
                {contentType: "pro", content: "I'm [name], a constituent calling to thank Senator/Rep ______ for working toward racial equality, and ask that he/she publicly remind the Trump administration that Congress will not stand for policies that promote institutional racism. Specifically, I would like the Senator/Representative to condemn Trump's stance on stop-and-frisk immediately and repeatedly as we transition to Trump's presidency."},
                {contentType: "anti", content: "I'm [name], a constituent calling to remind Senator/Rep _______ that racial equality is a cornerstone of American values. I want him/her to publicly denounce our President-Elect's racism and reassure the American people that Congress will not stand for policies that promote institutional racism. Specifically, I would like the Senator/Representative to condemn Trump's stance on stop-and-frisk immediately and repeatedly as we transition to Trump's presidency."}
            ]
        },
        {
            title: "Refugees",
            content: [
                {contentType: "pro", content: "I'm [name], a constituent calling to thank Senator/Rep ______ for supporting the state department's refugee program, and ask for continued support. I request that he/she put pressure on President-Elect Trump to continue to allow refugees into the U.S. The public is not educated about the State Department's refugee program. Please ask Senator/Rep ______ to spread awareness about the extensive vetting of refugees."},
                {contentType: "anti", content: "I'm [name], a constituent calling to ask Senator/Rep ______ to put pressure on President-Elect Trump to continue to allow refugees into the U.S. The State Department vets all refugees extensively. Turning away people in need does not reflect American values. Please ask the Senator/Representative to denounce any plans to deport refugees or eliminate programs to accept new refugees."}
            ]
        },
        {
            title: "Gun Violence Prevention",
            content: [
                {contentType: "pro", content: "I'm [name], a constituent concerned about the 91 Americans who are killed with guns every day. Senator/Rep ______ has supported common-sense gun laws, and we need his/her help more than ever. Trump has promised never to let the NRA down, so we need congress to step up. I'm calling to ask Senator/Rep _______ to continue to fight for common-sense gun laws, especially background checks for every gun sale. Please ask the Senator/Rep to let the American people know when the bill for background checks is coming."},
                {contentType: "anti", content: "I'm [name], a constituent concerned about the 91 Americans who are killed with guns every day. Since Trump has promised never to let the NRA down, we need Congress to step up. I'm calling to ask Senator/Rep _______ to change his/her position on background checks that 90% of Americans support. Senator/Rep ________ needs to start fighting for common-sense gun laws. Please ask the Senator/Rep to let the American people know when the bill for background checks is coming."}
            ]
        },
        {
            title: "Climate Change",
            content: [
                {contentType: "neutral", content: "I’m [name], a constituent concerned about the President-Elect’s record of denying climate change. I ask that the Senator/Representative publicly condemn Trump’s threats to repeal the Clean Power Plan and withdraw from the Paris agreement. I want the Senator/Representative to refuse to compromise with the President-Elect if he appoints climate change deniers."}
            ]
        }
    ];

    // $scope.address = userDataService.getAddress();

    $scope.placeChanged = function() {

        $scope.place = this.getPlace();
        userDataService.setAddress($scope.place.formatted_address);

        console.log("a;flkajs;df");
        console.log(userDataService.getAddress());

        //todo save address in localStorage

        userDataService.getRepsFromApi( userDataService.getAddress() )
           .then(userDataService.setReps)
           .then(function(reps){
               $scope.reps = reps;
               $scope.changeToMyRepsPage();
           });

    };

    $scope.changeToMyRepsPage = function(){
        $location.path('/my_reps');
    }

});

app.controller('repCtrl', function ($scope, userDataService) {

    $scope.reps = userDataService.getReps();

});

app.service('userDataService', function($http, $q){

    this.reps = [];
    this.address = '';
    var self = this;

    this.setUserName = function(first, last){
        this.firstName = first;
        this.lastName = last;
        this.fullName = first + " " + last;
    };

    this.getNames = function(){
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.fullName
        }
    };

    this.setAddress = function(address) {
        this.address = address;
    };

    this.getAddress = function(){
        return this.address;
    };

    this.getRepsFromApi = function(address){

        return $q.all(
            [
                $http.get('http://api.speakunited.us:8080/contacts?address='+address+'&type=senate'),
                $http.get('http://api.speakunited.us:8080/contacts?address='+address+'&type=house')
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

        return $q.when(self.reps);

    };

    this.getReps = function(){
        return this.reps;
    }

});