'use strict';

module.export = function(app){
    var jsonku = require('./controller');
    
    app.route('/')
        .get(jsonku.index);
}