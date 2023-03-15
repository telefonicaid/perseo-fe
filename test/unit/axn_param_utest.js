/*
 * Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of perseo-fe
 *
 * perseo-fe is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * perseo-fe is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with perseo-fe.
 * If not, see http://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with iot_support at tid dot es
 */

'use strict';

var should = require('should'),
    emailAction = require('../../lib/models/emailAction'),
    postAction = require('../../lib/models/postAction'),
    smsAction = require('../../lib/models/smsAction'),
    twitterAction = require('../../lib/models/twitterAction'),
    updateAction = require('../../lib/models/updateAction');

describe('AxnParams', function() {
    describe('#buildMailOptions()', function() {
        it('should substitute params', function() {
            var event = { x: 1, y: 'abc', z: '***', t: 'some text' },
                action = {
                    parameters: {
                        from: ' x = ${x}',
                        to: 'y is ${y} ',
                        subject: '${z} ${z} ${z}'
                    },
                    template: 'this is "${t}"'
                },
                options = emailAction.buildMailOptions(action, event);

            should.equal(options.from, ' x = 1');
            should.equal(options.to, 'y is abc ');
            should.equal(options.subject, '*** *** ***');
            should.equal(options.text, 'this is "some text"');
        });
        it('should keep params without placeholders', function() {
            var event = { x: 1, y: 'abc', z: '***', t: 'some text' },
                action = {
                    parameters: {
                        from: ' x = 1',
                        to: 'y is y ',
                        subject: '{z} $z $ { z }'
                    },
                    template: 'this is "$"'
                },
                options = emailAction.buildMailOptions(action, event);

            should.equal(options.from, ' x = 1');
            should.equal(options.to, 'y is y ');
            should.equal(options.subject, '{z} $z $ { z }');
            should.equal(options.text, 'this is "$"');
        });
    });
    describe('#buildPostOptions()', function() {
        it('should substitute params', function() {
            var event = { x: 1, y: 'abc', z: '***', t: 'some text' },
                action = {
                    parameters: {
                        url: 'http://${x}/${y}/${z}',
                        qs: { '${x}': 'Y${y}Y' },
                        headers: { 'X-${x}': '-${z}-', 'X-${y}': '+${z}+' }
                    },
                    template: 'this is "${t}"'
                },
                options = postAction.buildPostOptions(action, event);

            should.equal(options.url, 'http://1/abc/***');
            should.equal(options.text, 'this is "some text"');
            should.equal(Object.keys(options.qs).length, 1);
            should.equal(options.qs['1'], 'YabcY');
            should.equal(Object.keys(options.headers).length, 2);
            should.equal(options.headers['X-1'], '-***-');
            should.equal(options.headers['X-abc'], '+***+');
        });
        it('should substitute params w/o template also', function() {
            var event = { x: 1, y: 'abc', z: '***', t: 'some text' },
                action = {
                    parameters: {
                        url: 'http://${x}/${y}/${z}',
                        qs: { '${x}': 'Y${y}Y' },
                        headers: { 'X-${x}': '-${z}-', 'X-${y}': '+${z}+' }
                    }
                },
                options = postAction.buildPostOptions(action, event);

            should.exist(options);
            should.equal(Object.keys(options.qs).length, 1);
            should.equal(Object.keys(options.headers).length, 2);
            should.not.exist(options.text);
        });
        it('should keep params without placeholders', function() {
            var event = { x: 1, y: 'abc', z: '***', t: 'some text' },
                action = {
                    parameters: {
                        url: 'http://localhost:8080/path/entity',
                        headers: { 'Content-type': 'application/json', 'X-Something': 'in the way she moves' },
                        qs: { George: 'Harrison', Paul: 'McCartney', John: 'Lennon', Ringo: '*' }
                    },
                    template: 'this is "$"'
                },
                options = postAction.buildPostOptions(action, event);

            should.equal(options.url, 'http://localhost:8080/path/entity');
            should.equal(options.text, 'this is "$"');
            should.equal(Object.keys(options.qs).length, 4);
            should.equal(options.qs.John, 'Lennon');
            should.equal(options.qs.Ringo, '*');
            should.equal(Object.keys(options.headers).length, 2);
            should.equal(options.headers['Content-type'], 'application/json');
            should.equal(options.headers['X-Something'], 'in the way she moves');
        });
    });
    describe('#buildSMSOptions()', function() {
        it('should substitute params', function() {
            var event = { x: 1, y: 'abc', z: '***', t: 'some text' },
                action = {
                    parameters: {
                        to: 'http://${x}/${y}/${z}'
                    },
                    template: 'this is "${t}"'
                },
                options = smsAction.buildSMSOptions(action, event);

            should.equal(options.to, 'http://1/abc/***');
            should.equal(options.text, 'this is "some text"');
        });
        it('should keep params without placeholders', function() {
            var event = { x: 1, y: 'abc', z: '***', t: 'some text' },
                action = {
                    parameters: {
                        to: 'http://localhost:8080/path/entity'
                    },
                    /*jshint quotmark: double */
                    template: "this is '$'"
                    /*jshint quotmark: single */
                },
                options = smsAction.buildSMSOptions(action, event);

            should.equal(options.to, 'http://localhost:8080/path/entity');
            /*jshint quotmark: double */
            should.equal(options.text, "this is '$'");
            /*jshint quotmark: single */
        });
    });
    describe('#buildTwitterOptions()', function() {
        it('should substitute params', function() {
            var event = { t: 'some text' },
                action = {
                    /*jshint quotmark: double */
                    template: "this is '${t}'"
                    /*jshint quotmark: single */
                },
                options = twitterAction.buildTwitterOptions(action, event);
            /*jshint quotmark: double */
            should.equal(options.text, "this is 'some text'");
            /*jshint quotmark: single */
        });
        it('should keep params without placeholders', function() {
            var event = { x: 1, y: 'abc', z: '***', t: 'some text' },
                action = {
                    /*jshint quotmark: double */
                    template: "this is '$'"
                    /*jshint quotmark: single */
                },
                options = twitterAction.buildTwitterOptions(action, event);
            /*jshint quotmark: double */
            should.equal(options.text, "this is '$'");
            /*jshint quotmark: single */
        });
    });
    // describe('#buildUpdateOptions()', function() {
    //     it('should substitute params (old format)', function() {
    //         var event = { a: 'ID', b: 'TYPE', c: 'NAME', d: 'VALUE', e: 'ISPATTERN', f: 'ATTRTYPE' },
    //             action = {
    //                 parameters: {
    //                     id: '${a}',
    //                     type: '${b}',
    //                     name: '${c}',
    //                     value: '${d}',
    //                     isPattern: '${e}',
    //                     attrType: '${f}'
    //                 }
    //             },
    //             options = updateAction.buildUpdateOptions(action, event);

    //         should.equal(options.id, 'ID');
    //         should.equal(options.type, 'TYPE');
    //         should.equal(options.attributes[0].name, 'NAME');
    //         should.equal(options.attributes[0].value, 'VALUE');
    //         should.equal(options.isPattern, 'ISPATTERN');
    //         should.equal(options.attributes[0].type, 'ATTRTYPE');
    //     });
    //     it('should keep params without placeholders (old format)', function() {
    //         var event = { id: 'ID', type: 'TYPE' },
    //             action = {
    //                 parameters: {
    //                     name: 'NAME',
    //                     value: 'VALUE',
    //                     attrType: 'ATTRTYPE'
    //                 }
    //             },
    //             options = updateAction.buildUpdateOptions(action, event);

    //         should.equal(options.id, 'ID'); // default value
    //         should.equal(options.type, 'TYPE'); // default value
    //         should.equal(options.attributes[0].name, 'NAME');
    //         should.equal(options.attributes[0].value, 'VALUE');
    //         should.equal(options.isPattern, 'false'); // default value
    //         should.equal(options.attributes[0].type, 'ATTRTYPE');
    //     });
    //     it('should not use type if not specified and not in event (old format)', function() {
    //         /*
    //             Some entities do not have type. To update the same origin
    //             entity, 'type' field should not be propagated to Context Broker.
    //             If the action does not include an explicit parameter for 'type'
    //             and the incoming event has not 'type' neither, options should
    //             not include a 'type'
    //          */
    //         var event = { id: 'ID', x: 'X' },
    //             action = {
    //                 parameters: {
    //                     name: 'NAME',
    //                     value: 'VALUE',
    //                     attrType: '${x}'
    //                 }
    //             },
    //             options = updateAction.buildUpdateOptions(action, event);

    //         should.equal(options.id, 'ID'); // default value
    //         should.not.exists(options.type); // not in event
    //         should.equal(options.isPattern, 'false'); // default value
    //         should.equal(options.attributes[0].name, 'NAME');
    //         should.equal(options.attributes[0].value, 'VALUE');
    //         should.equal(options.attributes[0].type, 'X');
    //     });
    //     it('should substitute params (array format)', function() {
    //         var event = {
    //                 a: 'ID',
    //                 b: 'TYPE',
    //                 c: 'NAME',
    //                 d: 'VALUE',
    //                 e: 'ISPATTERN',
    //                 f: 'ATTRTYPE',
    //                 c1: 'NAME1',
    //                 d1: 'VALUE1',
    //                 f1: 'ATTRTYPE1',
    //                 c2: 'NAME2',
    //                 d2: 'VALUE2',
    //                 f2: 'ATTRTYPE2'
    //             },
    //             action = {
    //                 parameters: {
    //                     id: '${a}',
    //                     type: '${b}',
    //                     isPattern: '${e}',
    //                     attributes: [
    //                         {
    //                             name: '${c}',
    //                             value: '${d}',
    //                             type: '${f}'
    //                         },
    //                         {
    //                             name: '${c1}',
    //                             value: '${d1}',
    //                             type: '${f1}'
    //                         },
    //                         {
    //                             name: '${c2}',
    //                             value: '${d2}',
    //                             type: '${f2}'
    //                         }
    //                     ]
    //                 }
    //             },
    //             options = updateAction.buildUpdateOptions(action, event);

    //         should.equal(options.id, 'ID');
    //         should.equal(options.type, 'TYPE');
    //         should.equal(options.isPattern, 'ISPATTERN');

    //         should.equal(options.attributes[0].name, 'NAME');
    //         should.equal(options.attributes[0].value, 'VALUE');
    //         should.equal(options.attributes[0].type, 'ATTRTYPE');

    //         should.equal(options.attributes[1].name, 'NAME1');
    //         should.equal(options.attributes[1].value, 'VALUE1');
    //         should.equal(options.attributes[1].type, 'ATTRTYPE1');

    //         should.equal(options.attributes[2].name, 'NAME2');
    //         should.equal(options.attributes[2].value, 'VALUE2');
    //         should.equal(options.attributes[2].type, 'ATTRTYPE2');
    //     });
    //     it('should keep params without placeholders (array format)', function() {
    //         var event = { id: 'ID', type: 'TYPE' },
    //             action = {
    //                 parameters: {
    //                     attributes: [
    //                         {
    //                             name: 'NAME',
    //                             value: 'VALUE',
    //                             type: 'ATTRTYPE'
    //                         },
    //                         {
    //                             name: 'NAME1',
    //                             value: 'VALUE1',
    //                             type: 'ATTRTYPE1'
    //                         },
    //                         {
    //                             name: 'NAME2',
    //                             value: 'VALUE2',
    //                             type: 'ATTRTYPE2'
    //                         }
    //                     ]
    //                 }
    //             },
    //             options = updateAction.buildUpdateOptions(action, event);

    //         should.equal(options.id, 'ID'); // default value
    //         should.equal(options.type, 'TYPE'); // default value
    //         should.equal(options.isPattern, 'false'); // default value

    //         should.equal(options.attributes[0].name, 'NAME');
    //         should.equal(options.attributes[0].value, 'VALUE');
    //         should.equal(options.attributes[0].type, 'ATTRTYPE');

    //         should.equal(options.attributes[1].name, 'NAME1');
    //         should.equal(options.attributes[1].value, 'VALUE1');
    //         should.equal(options.attributes[1].type, 'ATTRTYPE1');

    //         should.equal(options.attributes[2].name, 'NAME2');
    //         should.equal(options.attributes[2].value, 'VALUE2');
    //         should.equal(options.attributes[2].type, 'ATTRTYPE2');
    //     });
    //     it('should not use type if not specified and not in event (array format)', function() {
    //         /*
    //          Some entities do not have type. To update the same origin
    //          entity, 'type' field should not be propagated to Context Broker.
    //          If the action does not include an explicit parameter for 'type'
    //          and the incoming event has not 'type' neither, options should
    //          not include a 'type'
    //          */
    //         var event = { id: 'ID', x: 'X' },
    //             action = {
    //                 parameters: {
    //                     attributes: [
    //                         {
    //                             name: 'NAME',
    //                             value: 'VALUE',
    //                             type: '${x}'
    //                         }
    //                     ]
    //                 }
    //             },
    //             options = updateAction.buildUpdateOptions(action, event);

    //         should.equal(options.id, 'ID'); // default value
    //         should.not.exists(options.type); // not in event
    //         should.equal(options.isPattern, 'false'); // default value
    //         should.equal(options.attributes[0].name, 'NAME');
    //         should.equal(options.attributes[0].value, 'VALUE');
    //         should.equal(options.attributes[0].type, 'X');
    //     });
    // });
});
