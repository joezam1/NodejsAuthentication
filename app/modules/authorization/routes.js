var getAllPublicRoutes = function(){
    var allPublicRoutesArray =[
        {
            'route': '/',
            'authorize': null
        },
        {
            'route': '/api/login',
            'authorize': null
        },
        {
            'route': '/api/logout',
            'authorize':null
        },
        {
            'route': '/api/register',
            'authorize': null
        },
        {
            'route': '/api/books',
            'authorize': null
        }
    ]
    return allPublicRoutesArray;

}


var getAllPrivateRoutes = function() {

    var allPrivateRoutesArray = [        
        {
            'route': '/api/users',
            'authorize': ['user','admin']
        },
        {
            'route': '/api/user',
            'authorize': ['user','admin']
        }
    ]
    return allPrivateRoutesArray;
}

var getRouteAuthorizationLevel = function(selectedRoute) {
    var privateRoutes = getAllPrivateRoutes();
    for(var a = 0; a<privateRoutes.length; a++){
        if(privateRoutes[a].route ===selectedRoute )
        {
            return privateRoutes[a].authorize;
        }
    }
    return null;
   
}

var isRoutePublic = function(selectedRoute){
    var publicRoutes = getAllPublicRoutes();
    for(var i = 0; i<publicRoutes.length;i++){
        if(publicRoutes[i].route === selectedRoute){
            return true;
        }
    }
    return false;
}

var authorizationModule = {
    getAllPrivateRoutes: getAllPrivateRoutes,
    getRouteAuthorizationLevel: getRouteAuthorizationLevel,
    isRoutePublic:isRoutePublic,
}
module.exports = authorizationModule;