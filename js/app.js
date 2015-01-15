var user = 'emalherbi',
  gravatar = 'http://www.gravatar.com/avatar/b4b2e05c730f60dd7ad3acb964bed758.png?size=100px';

var params = [],
  page = 1,
  app = angular.module ("mygithub", ['ngResource', 'filters']);

app.factory('github', function($resource) {
	return {
		projects : function(func, callback) {
			var api = $resource('https://api.github.com/users/:user/:func?page=:page&callback=JSON_CALLBACK', {
				user : user,
				func : func,
				page : page
			}, {
				fetch : { method : 'JSONP' }
			});

      document.getElementById('progress').style.display = 'block';
      api.fetch(function (response) {
        document.getElementById('progress').style.display = 'none';

        if ( response.meta.status == '403' ) {
          alert( response.data.message );
          return false;
        }

				callback( response.data );
			});
		},
    gravatar : function(callback) {
      var api = $resource('https://api.github.com/users/:user?callback=JSON_CALLBACK', {
        user : user
      }, {
        fetch : { method : 'JSONP' }
      });

      api.fetch(function (response) {
        if ( response.meta.status == '403' ) {
          alert( response.data.message );
          return false;
        }

        callback( response.data );
      });
    }
	}
});
angular.module('filters', []).filter('truncate', function () {
    return function (text, length, end) {
        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if ((text.length <= length) || ((text.length - end.length) <= length)) {
            return text;
        }
        else {
            return String(text).substring(0, length - end.length) + end;
        }

    };
});
app.filter ('searchFor', function () {
	return function (arr, searchGitHub) {
		if (!searchGitHub) {
			return arr;
		}

		var result = [];
		searchGitHub = searchGitHub.toLowerCase();

		angular.forEach (arr, function (item) {
			if (item.name.toLowerCase().indexOf(searchGitHub) !== -1) {
				result.push(item);
			}
		});

		return result;
	};
});

function GitHubController($scope, github) {
	$scope.layout = 'repos';
	$scope.github = [];

  $scope.gravatar = function () {
    github.gravatar(function(response) {
      document.getElementsByClassName("avatar-link")[0].style.backgroundImage = 'url("' + gravatar + '")';
      document.getElementsByClassName("avatar-link")[0].href = response.html_url;
    });
  }

	$scope.all = function () {
    github.projects($scope.layout, function(response) {
			params = params.concat( response );

			if ( response.length < 30 ) {
				$scope.github = params;

				params = [];
				page = 1;
			}
			else {
				page++;
				$scope.all();
			}
		});
	}

	$scope.all();
  $scope.gravatar();
}
