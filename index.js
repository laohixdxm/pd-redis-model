'use strict';

var base = require('pd-redis-base-record');
var setUniques = require('pd-redis-set-uniques');
var parentize = require('pd-redis-parentize');

module.exports = function (modelName, cli) {
    var core = base(modelName, cli);
    core.setUniques = function (uSetting) {
        setUniques(core, uSetting);
        return core;
    };

    core.mother = function (Child) {
        parentize(core, Child);
        return core;
    };

    return core;
};
