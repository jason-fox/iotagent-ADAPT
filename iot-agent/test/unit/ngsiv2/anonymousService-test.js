/*
 * Copyright 2020 FIWARE Foundation e.V.
 *
 * This file is part of iotagent-isoxml
 *
 * iotagent-isoxml is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * iotagent-isoxml is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with iotagent-isoxml.
 * If not, see http://www.gnu.org/licenses/.
 *
 */

/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */

const iotagentISOXML = require('../../../lib/iotagent-isoxml');
const config = require('./config-anon.js');
const nock = require('nock');
const iotAgentLib = require('iotagent-node-lib');
const should = require('should');
const async = require('async');
const request = require('request');
const utils = require('../../utils');
let contextBrokerUnprovMock;
let contextBrokerMock;


function addMock(id , type, code = 204){
    contextBrokerMock
    .matchHeader('fiware-service', 'isoxml')
    .matchHeader('fiware-servicepath', '/')
    .post('/v2/entities/urn:ngsi-ld:'+ type +':' +  id +'/attrs')
    .query({ type })
    .reply(code);
}

describe('Anonymous ISOXML measures', function () {
    beforeEach(function (done) {
        contextBrokerMock = nock('http://192.168.1.1:1026')
            .matchHeader('fiware-service', 'isoxml')
            .matchHeader('fiware-servicepath', '/')
            .post('/v2/entities?options=upsert')
            .reply(204);

        iotagentISOXML.start(config, function () {
            done();
        });
    });

    afterEach(function (done) {
        nock.cleanAll();
        async.series([iotAgentLib.clearAll, iotagentISOXML.stop], done);
    });

    describe('When a single isoxml <FRM> element arrives, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/farm1.xml')
        };

        beforeEach(function () {
             addMock('FRM3' , 'Building');
        });

        it('should end up with a 200OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with just that entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });


    describe('When a single isoxml <DVC> element arrives, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/device1.xml')
        };

        beforeEach(function () {
            addMock('DVC1', 'Device');
        });

        it('should end up with a 200OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with just that entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });


    describe('When a single <TSK> with <PGP>. <PDT> and <VPN> elements arrives, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/task_PDT.xml')
        };

        beforeEach(function () {

            contextBrokerMock = nock('http://192.168.1.1:1026')
            .matchHeader('fiware-service', 'isoxml')
            .matchHeader('fiware-servicepath', '/')
            .post('/v2/entities?options=upsert')
            .times(5)
            .reply(204);

            addMock('TSK11', 'Activity');
            addMock('PGP1', 'ProductGroup');
            addMock('PDT1', 'Product'); 
            addMock('PGP2' , 'ProductGroup');
            addMock('PDT2' , 'Product');
            addMock('VPN1' , 'Value');
        });

        it('should end up with a 200 OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                console.error(body);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with just that entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a <FRM> and <CTR> elements arrive, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/farmAndCustomers.xml')
        };

        beforeEach(function () {
            contextBrokerMock
                .matchHeader('fiware-service', 'isoxml')
                .matchHeader('fiware-servicepath', '/')
                .post('/v2/entities?options=upsert')
                .twice()
                .reply(204);

            addMock('FRM3' , 'Building');
            addMock('CTR1' , 'Person');
            addMock('CTR2' , 'Person');
        });

        it('should end up with a 200OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send multiple update context requests to the Context Broker', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });
});