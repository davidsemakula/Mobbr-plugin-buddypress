!function(){return angular.module("mobbr-lightbox.config",[]).constant("lightboxUrl","https://mobbr.com/lightbox/#").constant("uiUrl","https://mobbr.com").constant("apiUrl","https://api.mobbr.com").constant("environment","production")}(),angular.module("mobbr-lightbox.controllers",["mobbrApi","mobbrSession","mobbr-lightbox.config"]),angular.module("mobbr-lightbox.directives",[]),angular.module("mobbr-lightbox.filters",["mobbrSession","mobbr-lightbox.config"]),angular.module("mobbr-lightbox.configuration",[]),angular.module("mobbr-lightbox",["mobbrApi","mobbrMsg","mobbrSession","angularMoment","ui.router","ui.bootstrap","mobbr-lightbox.config","mobbr-lightbox.directives","mobbr-lightbox.controllers","mobbr-lightbox.filters"]).config(["$stateProvider","$urlRouterProvider",function($stateProvider,$urlRouterProvider){$stateProvider.state("main",{url:"/"}).state("payment",{url:"/hash/:hash",templateUrl:"views/payment.html",controller:"PaymentController",resolve:{task:function($rootScope,$window,$stateParams,mobbrSession,MobbrUri){var url=$rootScope.script||$window.atob($stateParams.hash);return MobbrUri.info({url:url,base_currency:mobbrSession.isAuthorized()&&$rootScope.$mobbrStorage.user.currency_iso||"EUR"}).$promise}}}).state("payment.login",{url:"/login",templateUrl:"views/login.html",controller:"LoginController"}).state("login",{url:"/login",templateUrl:"views/login.html",controller:"LoginController"}).state("logout",{url:"/logout",controller:"LogoutController"}).state("payment.payments",{url:"/payments",templateUrl:"views/payments.html",controller:"PaymentsController"}).state("payment.receivers",{url:"/receivers",templateUrl:"views/receivers.html",controller:"ReceiversController"}).state("payment.related",{url:"/related",templateUrl:"views/related.html",controller:"RelatedController"}).state("payment.logout",{url:"/logout",controller:"LogoutController"}).state("error",{url:"/error/:error",controller:"ErrorController",templateUrl:"views/error.html"}),$urlRouterProvider.otherwise("/")}]).run(["$http","$rootScope","$state","$timeout","$location","$window","MobbrApi","MobbrUser","environment","mobbrSession","MobbrBalance","uiUrl","filterFilter",function($http,$rootScope,$state,$timeout,$location,$window,MobbrApi,MobbrUser,environment,mobbrSession,MobbrBalance,uiUrl,filterFilter){function setCurrencies(){mobbrSession.isAuthorized()?MobbrBalance.get(function(response){$rootScope.userCurrencies=response.result.balances}):$rootScope.userCurrencies=$rootScope.networkCurrencies}function listener(event){event&&event.data&&event.data.url&&!(event&&event.data&&event.data.url&&-1===event.data.url.indexOf(event.origin))&&($rootScope.script=event.data)}$rootScope.mobbrSession=mobbrSession,$rootScope.$state=$state,$rootScope.uiUrl=uiUrl,$rootScope.$on("$stateChangeSuccess",function(event,toState,toParams,fromState){("main"!==toState.name||fromState&&"^"!==fromState.url)&&$window.ga("send","pageview",{page:$location.path()})}),$rootScope.handleMessage=function(response){var message;message=response.data&&response.data.message||response.message,message&&($rootScope.message=message,$rootScope.message.type=2===response.status[0]?"success":"danger",$timeout(function(){$rootScope.message=null},3e3))},window.addEventListener?addEventListener("message",listener,!1):attachEvent("onmessage",listener),$rootScope.logout=function(){MobbrUser.logout().$promise.then(function(){$state.includes("payment")?$state.go("payment.login"):$state.go("login")})},$rootScope.encodeTask=function(url){return $window.btoa(url)},$rootScope.$on("mobbrApi:authchange",function(e,user){$window.parent&&$window.parent.postMessage&&$window.parent.postMessage(user&&[user.username,user.email].join("|")||"logout","*")}),$rootScope.currencies=MobbrApi.currencies({base_currency:"BTC"},function(response){$rootScope.networkCurrencies=filterFilter($rootScope.currencies.result,{wallet_support:!0}),response.result.forEach(function(item){$rootScope.currenciesMap[item.currency_iso]=item}),setCurrencies()}),$rootScope.getLanguage=function(){return $rootScope.$mobbrStorage.user&&$rootScope.$mobbrStorage.user.language_iso||($window.navigator.userLanguage||$window.navigator.language).toUpperCase()},$rootScope.$on("mobbrApi:authchange",setCurrencies),$rootScope.linkUrl=function(url){return"/#/url/"+window.btoa(url)},$rootScope.isTest=function(){return"production"!==environment},$rootScope.currenciesMap={},MobbrApi.currencies(function(response){null!=response.result||null!=response.message,$rootScope.currenciesMap.MBR="Mobbr"}),$rootScope.linkUrl=function(url){return"/#/url/"+window.btoa(url)},$rootScope.isTest=function(){return"production"!==environment},$rootScope.currenciesMap={},MobbrApi.currencies(function(response){null!=response.result||null!=response.message,$rootScope.currenciesMap.MBR="Mobbr"}),$rootScope.$on("$stateChangeStart",function(){$rootScope.loading=!0}),$rootScope.$on("$stateChangeSuccess",function(){$rootScope.loading=!1})}]),angular.module("mobbr-lightbox.services.timeout",["ngStorage"]).factory("idleTimeout",["$rootScope","$timeout","$sessionStorage",function($rootScope,$timeout,$sessionStorage){function resetIdleTime(){$sessionStorage.idletime=0}function activityInterval(){$sessionStorage.idletime<idletime&&(idletime=0),idletime+=interval,$sessionStorage.idletime=idletime,$sessionStorage.idletime>timeout&&($rootScope.$emit("idleTimeout:timeout"),$sessionStorage.idletime=0),running===!0&&(timer=$timeout(activityInterval,interval))}function start(){resetIdleTime(),running=!0,activityInterval()}function stop(){running=!1,$timeout.cancel(timer)}var timer,timeout=36e5,interval=1e3,idletime=0,running=!1;return $rootScope.$on("mobbrApi:authchange",function(user){user&&start()||stop()}),{start:start,stop:stop,reset:resetIdleTime}}]).directive("idleTimeout",["idleTimeout",function(idleTimeout){return{restrict:"A",link:function(scope,element,attrs){element.bind("mousemove keypress mousewheel wheel DOMMouseScroll",idleTimeout.reset)}}}]),angular.module("mobbr-lightbox.filters").filter("mobbrcurrency",["$rootScope","$sce",function($rootScope,$sce){var separator,safari,ua=navigator.userAgent.toLowerCase();return-1!=ua.indexOf("safari")&&(safari=ua.indexOf("chrome")>-1?!1:!0),function(amount,currency,is_html,decorate){var negative,localestring;if(separator=Number("1.2").toLocaleString&&Number("1.2").toLocaleString($rootScope.getLanguage()).substr(1,1)||".",is_html=is_html||!1,decorate=decorate||!1,void 0!==amount){if(negative=0>amount,amount=Number(amount),amount.toLocaleString&&!safari&&(localestring=(currency||"")+amount.toLocaleString($rootScope.getLanguage(),{minimumFractionDigits:2,maximumFractionDigits:2})),!localestring){var fixed_amount=(Math.abs(amount).toFixed(2)+"").split(".");localestring=(negative?"-":"")+(currency||"")+(""+fixed_amount[0]+separator+fixed_amount[1])}if(is_html){var number=localestring.replace(currency,"")+"test",localeparts=number.split(separator),frac=localestring.substr(-2,2).toString();localestring='<span class="nice-amount '+(decorate&&(negative?"text-warning":"text-success")||"")+'">'+(currency&&'<span class="iso">'+currency+"</span>"||"")+'<span class="sig">'+localeparts[0]+separator+'</span><span class="frac">'+frac+"</span></span>",localestring=$sce.trustAsHtml(localestring)}}return localestring}}]),angular.module("mobbr-lightbox.filters").filter("decodeuri",["$window",function($window){return function(input){return input&&$window.decodeURIComponent((input+"").replace(/\+/g,"%20"))||null}}]),angular.module("mobbr-lightbox.directives").directive("formAutofillFix",function(){return function(scope,elem,attrs){elem.prop("method","POST"),attrs.ngSubmit&&setTimeout(function(){elem.unbind("submit").submit(function(e){e.preventDefault(),elem.find("input, textarea, select").trigger("input").trigger("change").trigger("keydown"),scope.$apply(attrs.ngSubmit)})},0)}}),angular.module("mobbr-lightbox.directives").directive("decorateAmount",["$rootScope",function($rootScope){return{restrict:"C",scope:!0,link:function(scope,element,attrs){var settings=$rootScope.$mobbrStorage.user,value=parseFloat(element.text());0>value&&element.addClass("text-error"),void 0!==value.toLocaleString&&(value=value.toLocaleString(settings&&settings.language_iso||"EUR",{minimumFractionDigits:4,maximumFractionDigits:4}),element.text(value))}}}]),angular.module("mobbr-lightbox.directives").directive("placeholder",["$timeout",function($timeout){var i=document.createElement("input");return"placeholder"in i?{}:{link:function(scope,elm,attrs){"password"!==attrs.type&&$timeout(function(){elm.val(attrs.placeholder),elm.bind("focus",function(){elm.val()==attrs.placeholder&&elm.val("")}).bind("blur",function(){""==elm.val()&&elm.val(attrs.placeholder)})})}}}]),angular.module("mobbr-lightbox.controllers").controller("ErrorController",["$scope","$stateParams",function($scope,$stateParams){"use strict";$scope.errormessage=$stateParams.error}]),angular.module("mobbr-lightbox.controllers").controller("LoginController",["$scope","$rootScope","MobbrUser","$state","$timeout",function($scope,$rootScope,MobbrUser,$state,$timeout){"use strict";$scope.login=function(username,password){$scope.authenticating=MobbrUser.passwordLogin({username:username,password:password}).$promise.then(function(){$state.is("payment.login")&&$state.go("payment")},function(response){$rootScope.handleMessage(response),$scope.authenticating=!1})}}]),angular.module("mobbr-lightbox.controllers").controller("LogoutController",["MobbrUser","$state","$scope",function(MobbrUser,$state,$scope){"use strict";$scope.logout()}]),angular.module("mobbr-lightbox.controllers").controller("PaymentController",["$scope","$rootScope","$location","$state","$timeout","$window","$filter","MobbrPayment","MobbrPerson","MobbrBalance","MobbrUri","MobbrUser","mobbrSession","uiUrl","task",function($scope,$rootScope,$location,$state,$timeout,$window,$filter,MobbrPayment,MobbrPerson,MobbrBalance,MobbrUri,MobbrUser,mobbrSession,uiUrl,task){"use strict";function confirm(hash){$scope.confirmLoading=MobbrPayment.confirm({hash:hash},function(response){response.result&&response.result.payment_id&&($rootScope.handleMessage(response),$scope.amount=null,$state.go("payment.payments"))},function(response){$rootScope.handleMessage(response)})}function perform(){$scope.preview(!1,confirm)}var url=$rootScope.script||window.atob($state.params.hash);$scope.form={},$scope.loginform={},$scope.formHolder={},$scope.taskUrl=$state.params.hash,$scope.task=task,$rootScope.scriptType=task.result.script.type,$scope.pay_currency="USD",$scope.pay_amount=0,$scope.currency="BTC",$scope.amount=0,$scope.convertPayAmountToBTC=function(currency,amount){var btc_exchange_rate=parseFloat($rootScope.currenciesMap[currency].exchange_rate.replace(",","."));$scope.amount=$filter("number")(amount/btc_exchange_rate,6),$scope.preview(!0)},task.result.script&&task.result.script.url&&task.result.script.url!==url&&($scope.query=task.result.script.url,url=$scope.query),task.result.script&&0!==task.result.script.length||($rootScope.noScript=!0,$state.go("payment.related")),url!==window.document.referrer&&($scope.showTitle=!0),$scope.url=url,$scope.taskUrl=$window.btoa(url),$scope.preview=function(showPreview,callBack){$scope.showPreview=showPreview;var currency=$scope.currency&&$scope.currency.currency_iso||$scope.currency;$scope.amount&&currency&&($scope.previewLoading=MobbrPayment.preview({data:$rootScope.script&&JSON.stringify($rootScope.script)||$scope.url,currency:currency,amount:$scope.amount,invoiced:$scope.wantInvoices},function(response){callBack&&callBack(response.result.hash),$scope.previewScript=response.result.script},function(response){$scope.showPreview=!1,$rootScope.handleMessage(response)}))},$scope.performPayment=function(){$scope.performing=!0,$scope.formHolder.pledgeForm&&$scope.formHolder.pledgeForm.$valid&&perform()},$scope.uiUrl=uiUrl}]),angular.module("mobbr-lightbox.controllers").controller("PaymentsController",["$scope","$state","$window","MobbrPayment",function($scope,$state,$window,MobbrPayment){"use strict";$scope.payments=MobbrPayment.uri({url:$window.atob($state.params.hash)})}]),angular.module("mobbr-lightbox.controllers").controller("ReceiversController",["$scope","$window","$state","MobbrPerson","mobbrSession",function($scope,$window,$state,MobbrPerson,mobbrSession){"use strict";$scope.receivers=MobbrPerson.uri({url:$window.atob($state.params.hash),base_currency:mobbrSession.isAuthorized()&&$scope.$mobbrStorage.user.currency_iso||"EUR"})}]),angular.module("mobbr-lightbox.controllers").controller("RelatedController",["$scope","$rootScope","mobbrSession","MobbrUri",function($scope,$rootScope,mobbrSession,MobbrUri){"use strict";$scope.relatedTasks=MobbrUri.get({keywords:$scope.task.result.metadata.keywords,base_currency:mobbrSession.isAuthorized()&&$scope.$mobbrStorage.user.currency_iso||"EUR"},function(response){},$rootScope.handleMessage)}]),angular.module("mobbr-lightbox").run(["$templateCache",function($templateCache){"use strict";$templateCache.put("views/error.html",'<h2 ng-bind=errormessage></h2><fieldset><legend>Checklist for webmasters of <span ng-bind="json[\'url\']"></span></legend><div class=error><ul><li>The syntax of the script is invalid, use a JSON-validator&rarr; <a target=_blank href="http://www.jsonlint.com/">http://www.jsonlint.com/</a></li><li>The schema of the script is invalid, use the Mobbr script validator&rarr; <a target=_blank href=/#/validate>#/validate</a></li><li>Values are out-of-range , check the specifications&rarr; <a target=_blank href=http://mobbr.com/protocol.html>http://mobbr.com/protocol.html</a></li></ul>Visit <a href=/#/integration>the website</a> for instructions on using the buttons and widgets.</div></fieldset>'),$templateCache.put("views/login.html",'<div class="row page"><form name=login_form ng-submit="login(username, password)" ng-show="mobbrSession && !mobbrSession.isAuthorized()"><fieldset class=form-group><div class=col-xs-12><input ng-model=username auto-fill-sync class=form-control name=username placeholder=username required></div></fieldset><fieldset class=form-group><div class=col-xs-12><input ng-model=password auto-fill-sync class=form-control type=password name=password placeholder=password required></div></fieldset><fieldset class=form-group><div class=col-xs-12><button ng-disabled="authenticating && !authenticating.$resolved" class="btn btn-block btn-success" type=submit>Log in</button></div></fieldset><fieldset class=form-group><div class=col-xs-12><a ng-href="{{ uiUrl }}/#/recover" target=_blank>Recover password</a></div></fieldset><fieldset class=form-group><div class=col-xs-12><a ng-href="{{ uiUrl }}/#/join" ng-disabled="authenticating && !authenticating.$resolved" target=_blank class="btn btn-block btn-success">Register me now</a></div></fieldset></form><div ng-show="mobbrSession && mobbrSession.isAuthorized()" class=col-xs-12>Logged in as {{ $mobbrStorage.user.username }}, click <a ng-click=logout()>here</a> to logout</div></div>'),$templateCache.put("views/payment.html",'<div ui-view></div><div class=row><div ng-show="$state.is(\'payment\')" id=payment class="page col-xs-12"><h1 ng-if=showTitle ng-bind=task.result.script.title></h1><div class="row page" ng-show="task.$resolved && task.result.statistics.amount_total > 0"><div class=col-md-12><span ng-bind="task.result.statistics.is_pledge == \'1\' ? \'Pledged\' : \'Paid\'"></span> <span>on this so far</span> <strong ng-bind="task.result.statistics.amount_total | mobbrcurrency :task.result.statistics.amount_currency"></strong></div></div><div class="row page" ng-show="task.$resolved && task.result.statistics.amount_total == 0"><div class=col-md-12><span>No payments yet</span></div></div><div><a ng-href="{{ task.result.script.url }}" class="btn btn-primary btn-block" target=_blank>View this task</a></div><div class=taskMessage ng-bind=task.result.script.message ng-if=task.result.script.message></div><div>Pay for this task by sending money to the bitcoin address below or via your Mobbr bitcoin wallet. The money will be distributed to the contributor(s) who worked on the task.</div><div class=row ng-show="task.result.addresses.length > 0"><fieldset class="form-group task-address"><div class=col-xs-12><h2>Enter an amount</h2></div><div class=col-xs-6><select class=form-control required ng-init="pay_currency = \'USD\'" ng-model=pay_currency ng-change="convertPayAmountToBTC(pay_currency, pay_amount)" ng-options="curr as curr for curr in [\'USD\', \'EUR\']"></select></div><div class=col-xs-6><input class=form-control required type=number ng-init="pay_amount = 0" ng-model=pay_amount ng-change="convertPayAmountToBTC(pay_currency, pay_amount)" step=any min=0 max=1000000000></div><div class=col-xs-12><h4><img src=https://mobbr.com/img/bitcoin-icon.png width=18> BTC <span ng-bind=amount></span></h4></div></fieldset><fieldset class="form-group task-address" ng-repeat="address in task.result.addresses"><div class=col-xs-12><div><h2>Pay from any bitcoin wallet</h2></div><div>BTC address</div><a ng-href="{{ \'bitcoin:\' + address.address + \'?amount=\' + amount }}" class="btn btn-bitcoin btn-block"><img src=https://mobbr.com/img/bitcoin-icon.png width=16> <span ng-bind="address.address + \'?amount=\' + amount"></span></a><div>BTC QR code</div><div class=row><div class="col-xs-8 col-sm-4"><img ng-src="https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=bitcoin:{{ address.address + \'?amount=\' + amount }}" style="width:100%;max-width: 300px"></div></div></div></fieldset></div><form name=formHolder.pledgeForm ng-show="task.$resolved && !paymentId && !noScript"><div><fieldset ng-show=mobbrSession.isAuthorized() ng-disabled="!task.$resolved || paymentId || (showPreview && !paymentId) || (previewLoading && !previewLoading.$resolved) || (confirmLoading && !confirmLoading.$resolved)"><div class=row><div class=col-xs-12><h2>Pay from your Mobbr wallet</h2></div></div></fieldset><fieldset class=buttons ng-disabled="(previewLoading && !previewLoading.$resolved) || (confirmLoading && !confirmLoading.$resolved)"><div class=row ng-show=!mobbrSession.isAuthorized()><div class=col-xs-12><button class="btn btn-success btn-block" ng-click="$state.go(\'payment.login\')">Login to pay with Mobbr</button></div></div><div class=row ng-show="(showPreview || task.result.script.type == \'pledge\') && mobbrSession.isAuthorized()"><div class=col-xs-12><button class="btn btn-success btn-block" ng-click=performPayment() ng-disabled=!formHolder.pledgeForm.$valid ng-bind="(task.result.script.type == \'pledge\' ? \'Pledge\' : \'Pay\')"></button></div></div><div ng-show="(amount == 0 && mobbrSession.isAuthorized())" class="alert alert-danger">Enter an amount to see <span ng-bind="(task.result.script.type == \'pledge\' ? \'Pledge\' : \'Pay\')"></span> button</div><div class=row ng-show="showPreview && mobbrSession.isAuthorized()"><div class=col-xs-12><button class="btn btn-danger btn-block" ng-click="showPreview = null;">Cancel</button></div></div><div class=row><div class=col-xs-12><a ng-href="{{ uiUrl }}/#/task/{{ taskUrl }}/view" class="btn btn-primary btn-block" target=_blank>View this task on Mobbr</a></div></div><br><div class=row ng-show="amount > 0"><div class=col-xs-12><button class="btn btn-success btn-block" ng-click=preview(true) ng-show="task.result.script.type != \'pledge\'" ng-disabled="(!amount || !currency)">Update Recipients <i class="glyphicon mobbrloader" ng-show="!performing && previewLoading && !previewLoading.$resolved"></i></button></div></div></fieldset></div></form></div><div class=col-xs-12 ng-show="(previewLoading && !previewLoading.$resolved) || (confirmLoading && !confirmLoading.$resolved)"><div class=loader>Loading...</div></div><div ng-show="$state.is(\'payment\') && showPreview && !paymentId" class=page><table class=table ng-show=previewScript><thead><tr><th colspan=4>RECIPIENTS</th></tr><tr class=hidden><th></th><th>NAME</th><th>%</th><th>AMOUNT<div>currency</div></th></tr></thead><tbody><tr ng-repeat="participant in previewScript.participants"><td><img ng-src="https://secure.gravatar.com/avatar/{{ participant[\'.gravatar\'] }}?s=50&default=https://mobbr.com/img/default-gravatar.png" width=50 height=50></td><td class=username>{{participant[\'id\'] | decodeuri}}<div ng-bind=participant.role></div></td><td ng-bind="(participant[\'.percentage\'] | number : 0) + \'%\'"></td><td>{{participant[\'.amount\'] | mobbrcurrency:\'\'}}<div>{{previewScript[\'.currency\']}}</div></td></tr></tbody></table></div></div>'),$templateCache.put("views/payments.html",'<div class="row page" ng-show="task.$resolved && task.result.statistics.amount_total > 0"><div class=col-md-12><span>Paid on this so far</span> <strong ng-bind="task.result.statistics.amount_total | mobbrcurrency :task.result.statistics.amount_currency"></strong></div></div><div class="row page" ng-show="task.$resolved && task.result.statistics.amount_total == 0"><div class=col-md-12><span>No payments yet</span></div></div><div class="row page"><table ng-show="payments.result.length > 0" class=table><thead class=hidden><tr><th></th><th>NAME<div>TIME</div></th><th>AMOUNT<div>currency</div></th></tr></thead><tbody><tr ng-repeat="payment in payments.result"><td><img ng-src="https://secure.gravatar.com/avatar/{{ payment.senders[0].gravatar }}?s=50&default=https://mobbr.com/img/default-gravatar.png" width=50 height=50></td><td class=username>{{payment.senders[0].username}} <time am-time-ago=payment.datetime></time></td><td>{{payment[\'amount\'] | mobbrcurrency:\'\'}}<div>{{payment[\'currency_iso\']}}</div></td></tr></tbody></table><div ng-show="payments.result.length == 0">No payments yet</div></div>'),$templateCache.put("views/receivers.html",'<div class="row page"><table ng-show="receivers.result.length > 0" class=table><thead class=hidden><tr><th></th><th>NAME<div>TIME</div></th><th>AMOUNT<div>currency</div></th></tr></thead><tbody><tr ng-repeat="receiver in receivers.result"><td><img ng-src="https://secure.gravatar.com/avatar/{{ receiver.gravatar }}?s=50&default=https://mobbr.com/img/default-gravatar.png" width=50 height=50></td><td class=username>{{receiver.username}}<div ng-bind=receiver.role></div></td><td>{{receiver[\'amount\'] | mobbrcurrency:\'\'}}<div>{{ $mobbrStorage.user.currency_iso || \'EUR\' }}</div></td></tr></tbody></table><div ng-show="receivers.result.length == 0">No payments yet</div></div>'),$templateCache.put("views/related.html",'<div class=row ng-show=noScript><div class="page col-xs-12"><h1>This URL has no Mobbr support... Yet.</h1><p>Mobbr is a payment system for online collaboration.</p><a ng-href="{{ uiUrl + \'/#/task/\' + encodeTask(url) + \'/script\' }}" target=_blank class="btn btn-success btn-block">Add crowd-funding and -paying now</a> <a ng-href="{{ uiUrl + \'/#/tasks/\' }}" target=_blank class="btn btn-primary btn-block">Join these tasks, earn money</a></div></div><div class="row grayfield related-tasks"><a ng-repeat="url in relatedTasks.result" ng-href="{{ uiUrl + \'/#/task/\' + encodeTask(url.url) }}" target=_blank><div class="col-xs-12 col-sm-4 col-md-3 data-card-container"><div class=data-card ng-class="{ \'data-card-highlight\': url.is_pledge == \'1\' }"><div class=top><h3 ng-bind=url.title></h3><p ng-bind=url.description></p></div><div class=bottom><div class="item large tasks"><span ng-bind="url.match_percentage + \'%\'"></span> <span class="mobbricon mobbricon-tag"></span></div><div class="item large amount"><span ng-bind-html="url.amount_total | mobbrcurrency:url.currency_iso:true"></span> <span class="mobbricon mobbricon-payments"></span></div><div class=item><span ng-bind=url.domain></span> <span class="mobbricon mobbricon-domain"></span></div></div></div></div></a></div>'),$templateCache.put("views/directives/mobbrtable.html",'<div class=mobbrtable><div ng-show="noEntries && !entries || entries.length == 0" ng-bind=noEntriesMsg class="alert alert-info"></div><div class=toolbar><div ng-show="hasLimiter && entries.length > 10" class="form-inline pull-right"><div class=form-group><label for=show>Entries:</label><select ng-model=showEntries class=input-small id=show><option value=10>10</option><option value=25>25</option><option value=50>50</option><option value=100>100</option></select></div></div><div ng-show="hasSearch && entries.length > 0" class="pull-right searchbox"><input ng-model=searchEntries placeholder=Search class=search-query type=search id=search></div></div><table ng-show="entries.length > 0" class="table table-striped pull-left"><thead ng-show=hasHeader><tr><th ng-repeat="column in columns" ng-bind=labels[column] ng-click="canSort && sort(column)" type=column></th></tr></thead><tbody><tr ng-repeat="entry in entries | orderBy: sortEntries: sortOrder | limitTo: hasLimiter && showEntries || entries.length | filter: searchEntries"><td ng-repeat="column in columns" type=column ng-switch on=column title="{{ entry.description }}"><time ng-switch-when=datetime datetime="{{ entry.datetime }}"><small>{{ entry.datetime }}</small></time><div ng-switch-when=senders><img ng-repeat="sender in entry.senders" ng-src="https://secure.gravatar.com/avatar/{{ sender.gravatar }}?s=20&default=https://mobbr.com/img/default-gravatar.png" class="gravatar small img-rounded"></div><div ng-switch-when=receivers><img ng-repeat="receive in entry.receivers" ng-src="https://secure.gravatar.com/avatar/{{ sender.gravatar }}?s=20&default=https://mobbr.com/img/default-gravatar.png" class="gravatar small img-rounded"></div><img ng-switch-when=gravatar ng-src="https://secure.gravatar.com/avatar/{{ entry.gravatar }}?s=50&default=https://mobbr.com/img/default-gravatar.png" class="gravatar img-rounded" width=50 height=50> <img ng-switch-when=.gravatar ng-src="https://secure.gravatar.com/avatar/{{ entry[\'.gravatar\'] }}?s=20&default=https://mobbr.com/img/default-gravatar.png" class="gravatar small img-rounded" width=20 height=20> <img ng-switch-when=gravatar-xsmall ng-src="https://secure.gravatar.com/avatar/{{ entry[\'gravatar\'] }}?s=20&default=https://mobbr.com/img/default-gravatar.png" class="gravatar xsmall img-rounded" width=20 height=20> <img ng-switch-when=img_uri ng-src="{{ entry.img_uri }}" class="img_uri img-rounded" width=58 height=58> <a ng-switch-when=img_uri_link href="{{ \'/#/url/\' + entry.uri }}"><img ng-src="{{ entry.img_uri }}" class="img_uri img-rounded" width=58 height=58></a> <span ng-switch-when=amount ng-bind="entry.amount | mobbrcurrency" ng-class="{ \'text-error\': entry.amount < 0 }" class=nowrap></span> <span ng-switch-when=currency_iso ng-bind="entry.currency_iso || $mobbrStorage.user.currency_iso" class=nowrap></span> <span ng-switch-when=currency_description ng-bind=currencyDescription(entry.currency_iso) class=nowrap></span> <span ng-switch-when=.percentage ng-bind="(entry[\'.percentage\'] | number:0) + \'%\'"></span><div ng-switch-when=title+description><strong ng-bind=entry.title></strong> <small ng-bind=entry.description></small></div><div ng-switch-when=title+description_link><a href="{{ \'/#/url/\' + encodeuri(entry.uri) }}"><strong ng-bind=entry.title></strong></a><div ng-bind=entry.description></div></div><div ng-switch-when=name><span ng-show=entry.firstname ng-bind=entry.firstname></span> <span ng-show=entry.lastname ng-bind=entry.lasttname></span></div><a ng-switch-when=url href="{{ \'/#/url/\' + encodeuri(entry.url) }}" ng-bind=entry.url></a><div ng-switch-when=mobbrbutton><mobbrbutton url="{{ entry.uri }}"></mobbrbutton></div><span ng-switch-default>{{ entry[column] }}</span></td></tr></tbody></table></div>')}]);