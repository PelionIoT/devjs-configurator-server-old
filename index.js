'use strict'

/*
 * Copyright (c) 2018, Arm Limited and affiliates.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')

var devjs_configurator = require('devjs-configurator')

const configurations = new Map()

module.exports = {
	setModuleConfig: function(moduleName,configuration){
        configurations.set(moduleName, configuration);
        return Promise.resolve();
	},
    createServer: function(port) {
    	if(!port) {
    		port  = devjs_configurator.DEFAULTS.port
    	}
        const app = express()
		const server = http.createServer(app)

        app.use(bodyParser.json())
        
        app.get('/config/:moduleName', function(req, res) {
            let moduleName = req.params.moduleName
            
            if(!configurations.has(moduleName)) {
                res.status(404).send()
            }
            else {
                res.status(200).send(configurations.get(moduleName))
            }
        })
        
        app.put('/config/:moduleName', function(req, res) {
            let moduleName = req.params.moduleName
            let configuration = req.body
            
            if(configuration == null || typeof configuration != 'object') {
                res.status(400).send()
            }
            else {
                configurations.set(moduleName, configuration)
                
                res.status(200).send()
            }
        })
        
        return new Promise(function(resolve, reject) {
            server.listen(port, '127.0.0.1', function(error) {
                if(error) {
                    reject(error)
                }
                else {
                    resolve(server)
                }
            })
        })
    },
    shutdownServer: function(server) {
    	return new Promise(function(resolve,reject){
	    	if(server) {
	    		server.close(function(){
	    			resolve();
	    		});
	    	} else {
	    		throw new TypeError("Bad param: Not a server");
	    	}
    	})
    }

}
