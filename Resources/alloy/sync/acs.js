function S4() {
    return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function guid() {
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function InitAdapter(config) {
    Cloud = require("ti.cloud"), Cloud.debug = !0, config.Cloud = Cloud;
}

function Sync(model, method, opts) {
    var name = model.config.adapter.name, settings = model.config.settings, data = model.config.data, object_name = model.config.settings.object_name, object_method = Cloud[model.config.settings.object_method];
    Ti.API.info("method " + method);
    switch (method) {
      case "create":
        var params = {};
        model.config.settings.object_method === "Objects" ? (params.fields = model.toJSON(), params.classname = object_name) : params = model.toJSON(), object_method.create(params, function(e) {
            if (e.success) {
                var m = new model.config.Model(e[object_name][0]);
                opts.success && opts.success(e[object_name][0]), model.trigger("fetch");
                return;
            }
            opts.error && opts.error();
        });
        break;
      case "read":
        var id_name = object_name.replace(/s+$/, "") + "_id", params = {};
        params[id_name] = model.id = opts.id || model.id;
        var id_name = "", params = {};
        model.config.settings.object_method === "Objects" ? (opts.data ? opts.data : opts.data = {}, opts.data.classname = object_name, opts.data.id = model.id) : (id_name = object_name.replace(/s+$/, "") + "_id", opts.data[id_name] = model.id), model.id ? getObject(model, opts) : opts && opts.data && opts.data.q ? searchObjects(model, opts) : getObjects(model, opts);
        break;
      case "update":
        var params = model.toJSON(), id_name = object_name.replace(/s+$/, "") + "_id";
        params[id_name] = model.id, object_method.update(params, function(e) {
            if (e.success) {
                var m = new model.config.Model(e[object_name][0]);
                opts.success && opts.success(e[object_name][0]), model.trigger("fetch");
                return;
            }
            opts.error && opts.error();
        }), model.trigger("fetch");
        break;
      case "delete":
        var id_name = "", params = {};
        model.config.settings.object_method === "Objects" ? (params.classname = object_name, params.id = model.id) : (id_name = object_name.replace(/s+$/, "") + "_id", params[id_name] = model.id), object_method.remove(params, function(e) {
            if (e.success) {
                opts.success && opts.success({}), model.trigger("fetch");
                return;
            }
            opts.error && opts.error();
        });
    }
}

function getObject(_model, _opts) {
    var object_name = _model.config.settings.object_name, object_method = Cloud[_model.config.settings.object_method];
    Ti.API.info(" searching for object id " + JSON.stringify(_opts.data)), object_method.show(_opts.data, function(e) {
        if (e.success) {
            if (_model.id) {
                var m = new _model.config.Model(e[object_name][0]);
                _opts.success && _opts.success(e[object_name][0]), _model.trigger("fetch");
                return;
            }
        } else _opts.error && _opts.error();
    });
}

function getObjects(_model, _opts) {
    var object_name = _model.config.settings.object_name, object_method = Cloud[_model.config.settings.object_method];
    _model.config.settings.object_method === "Objects" && (_opts.data ? _opts.data : _opts.data = {}, _opts.data.classname = object_name), Ti.API.info(" querying for all objects of type " + _model.config.settings.object_name + " " + (_opts.data && _opts.data.q)), object_method.query(_opts.data || {}, function(e) {
        if (e.success) {
            if (e[object_name].length !== 0) {
                var retArray = [];
                for (var i in e[object_name]) {
                    var m = new _model.config.Model(e[object_name][i]);
                    retArray.push(e[object_name][i]);
                }
                _opts.success && _opts.success(retArray), _model.trigger("fetch");
                return;
            }
        } else opts.error && opts.error();
    });
}

function searchObjects(_model, _opts) {
    var object_name = _model.config.settings.object_name, object_method = Cloud[_model.config.settings.object_method];
    _model.config.settings.object_method === "Objects" && (_opts.data ? _opts.data : _opts.data = {}, _opts.data.classname = object_name), Ti.API.info(" searching for all objects of type " + _model.config.settings.object_name + " " + _opts.data.q), object_method.search(_opts.data, function(e) {
        if (e.success) {
            if (e[object_name].length !== 0) {
                var retArray = [];
                for (var i in e[object_name]) {
                    var m = new _model.config.Model(e[object_name][i]);
                    retArray.push(e[object_name][i]);
                }
                _opts.success && _opts.success(retArray), _model.trigger("fetch");
                return;
            }
        } else opts.error && opts.error();
    });
}

var Cloud, _ = require("alloy/underscore")._;

module.exports.sync = Sync, module.exports.beforeModelCreate = function(config) {
    return config = config || {}, config.data = {}, InitAdapter(config), config;
}, module.exports.afterModelCreate = function(Model) {
    return Model = Model || {}, Model.prototype.config.Model = Model, Model;
};