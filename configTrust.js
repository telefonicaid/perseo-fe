'use strict';

/**
 * List of pre-configured trusts
 */
var configTrust = {};

configTrust.trusts = [
    {
        host: 'keystone',
        port: '5001',
        id: 'trust1',
        user: 'user1',
        password: 'password',
        service: 'domain1'
    },
    {
        host: 'keystone',
        port: '5001',
        id: 'trust2',
        user: 'user2',
        password: 'password2',
        service: 'domain2'
    }
];
