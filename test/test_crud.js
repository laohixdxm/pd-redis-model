'use strict';
var q = require('q');
var announcer = require('pd-api-announcer');
var anno = require('pd-api-test-anno')();
var eReport = require('./report-error');
var expect = require('chai').expect;
var assert = require('chai').assert;

var modelMaker = require('../');
var Merchant = modelMaker('merchant');
var Owner = modelMaker('owner');
var Patron = modelMaker('patron');
Merchant.setUniques({
    'name': ['name']
});

Owner.setUniques({
    'reg-name': ['reg-name']
});

Patron.setUniques({
    'pno': ['pno']
});

Owner.mother(Merchant);
Patron.mother(Merchant);

describe('Redis-model', function () {
    var ownersToDelete = [];
    var mercsToDelete = [];
    var patsToDelete = [];

    it('should allow creating records', function (done) {
        anno.tcase(function () {
            return Owner.create({
                name: 'johndoe',
                'reg-name': 'johndoe'
            }).then(function (sid) {
                ownersToDelete.push(sid);
                console.log('created owner with sid:' + sid);
                return Owner.merchantOwner(sid).bear({
                    name: 'Small-Cafe'
                });
            }).then(function (sid) {
                mercsToDelete.push(sid);
                console.log('created merchant with sid:' + sid);
                return Patron.create({
                    name: 'janedoe',
                    pno: 'sc-1234'
                });
            }).then(function (sid) {
                patsToDelete.push(sid);
                console.log('created patron with sid:' + sid);
                return Patron.merchantOwner(sid).adopt(mercsToDelete[0]);
            }).fail(function (err) {
                eReport(err);
            });
        }, done, 'creating');
    });

    it('should not allow creating record with invalid constraints', function (done) {
        anno.tcase(function () {
            return Owner.create({
                name: 'charlie',
                'reg-name': 'johndoe'
            }).fail(function (err) {
                assert(announcer.isClientErrorFor(err, 'reg-name', 'taken'), 'not-taken-error');
                console.log('caught uniqueness conflict');
            }).fail(function (err) {
                eReport(err);
            });
        }, done, 'invalid-constraints');
    });

    it('should list records with right relationship', function (done) {
        anno.tcase(function () {
            var MomOwner = Owner.merchantOwner(ownersToDelete[0]);
            var MomPatron = Patron.merchantOwner(patsToDelete[0]);
            var showPromises = [];
            [MomOwner, MomPatron].forEach(function (mom) {
                showPromises.push(
                    mom.hasKid(mercsToDelete[0]).then(function () {
                        return mom.findKids({
                            latest: (new Date()).getTime(),
                            earliest: 0
                        });
                    }).then(function (kids) {
                        expect(kids.length).to.equal(mercsToDelete.length);
                        console.log(kids);

                    })
                );
            });
            return q.allSettled(showPromises);
        }, done, 'show-relationship');
    });

    after(function (done) {
        anno.fin(function () {
            var kidPromises = [];
            mercsToDelete.forEach(function (sid) {
                kidPromises.push(
                    Merchant.remove(sid).fail(function (err) {
                        eReport(err);
                    })
                );
            });
            return q.allSettled(kidPromises).then(function () {
                var momPromises = [];
                [
                    [Owner, ownersToDelete],
                    [Patron, patsToDelete]
                ].forEach(function (item) {
                        item[1].forEach(function (sid) {
                            momPromises.push(
                                item[0].remove(sid).fail(function (err) {
                                    eReport(err);
                                })
                            );
                        });
                    });
                return q.allSettled(momPromises);
            }).then(function () {
                var clearPromises = [];
                [Merchant, Owner, Patron].forEach(function (model) {
                    clearPromises.push(model.clearSidCounter());
                });
                return q.allSettled(clearPromises);
            });
        }, done, 'Redis-model');
    });
});
