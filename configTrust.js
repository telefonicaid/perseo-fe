'use strict';

/**
 * List of pre-configured trusts
 */
var configTrust = {};

configTrust.trusts = [
    {
        host: 'iot-keystone',
        port: '5001',
        id: 'trust1',
        user: 'adm1',
        password: 'password',
        service: 'smartcity'
    },
    {
        host: 'iot-keystone',
        port: '5001',
        id: 'trust2',
        user: 'foo',
        password: 'password',
        service: 'smartcity'
    }
];
exports.configTrust = configTrust;
