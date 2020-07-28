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

const path = require('path');
const fs = require('fs');
const config = require('./configService');
const async = require('async');
let transportBindings = [];

/**
 * Start all the transport protocol bindings found in the bindings directory.
 *
 * @param {Object} newConfig        Configuration object to start the bindings
 */
function startTransportBindings(newConfig, callback) {
    function invokeBinding(binding, callbackFn) {
        binding.start(callbackFn);
    }

    const bindings = fs.readdirSync(path.join(__dirname, './bindings'));

    transportBindings = bindings.map(function (item) {
        return require('./bindings/' + item);
    });

    async.map(transportBindings, invokeBinding, callback);
}

/**
 * Stop all the transport protocol bindings of the agent.
 */
function stopTransportBindings(callback) {
    function invokeBinding(binding, callbackFn) {
        binding.stop(callbackFn);
    }

    async.map(transportBindings, invokeBinding, callback);
}

/**
 * Execute the function given by the 'functionName' parameter for all the transport bindings, with the arguments
 * given in the 'argument' array. If the optional parameter protocol is not null, the function will only be
 * executed in the plugin of the selected protocol.
 *
 * @param {Array} argument          Array of arguments to call the function with.
 * @param {String} functionName     Name of the function to call in every transport plugin.
 * @param {String} protocol         Transport protocol where the function must be executed.
 */
function applyFunctionFromBinding(argument, functionName, protocol, callback) {
    config.getLogger().debug('Looking for bindings for the function [%s] and protocol [%s]', functionName, protocol);

    function addHandler(current, binding) {
        if (binding[functionName] && (!protocol || binding.protocol === protocol)) {
            const args = [binding[functionName]].concat(argument);
            /* eslint-disable-next-line prefer-spread */
            const boundFunction = binding[functionName].bind.apply(binding[functionName], args);

            config.getLogger().debug('Binding found for function [%s] and protocol [%s]', functionName, protocol);
            current.push(boundFunction);
        }

        return current;
    }

    async.series(transportBindings.reduce(addHandler, []), callback);
}

exports.startTransportBindings = startTransportBindings;
exports.stopTransportBindings = stopTransportBindings;
exports.applyFunctionFromBinding = applyFunctionFromBinding;