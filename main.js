const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpdateActions = require('./actions')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'The TV will need to be configured with a Pre Shared Key (PSK).'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: self.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'psk',
				label: 'Pre Shared Key (PSK)',
				width: 6
			}
		]
	}

	updateActions() {
		UpdateActions(this)
	}
	
	getRest(cmd, host, port) {
		var self = this;
		return self.doRest('GET', cmd, host, port, {});
	};
	
	postRest(cmd, host, port, body) {
		var self = this;
		return self.doRest('POST', cmd, host, port, body);
	};
	
	doRest(method, cmd, host, port, body) {
		var self = this;
		var url = 'http://' + self.config.host + cmd;
		
		let extra_headers = {};
		extra_headers['X-Auth-PSK'] = self.config.psk;
		
		return new Promise(function(resolve, reject) {
			
			function handleResponse(err, result) {
				if (err === null && typeof result === 'object' && result.response.statusCode === 200) {
					// A successful response
					
					var objJson = result.data;
					
					resolve([ host, port, objJson ]);
				} else {
					// Failure. Reject the promise.
					var message = 'Unknown error';
					
					if (result !== undefined) {
						if (result.response !== undefined) {
							message = result.response.statusCode + ': ' + result.response.statusMessage;
						} else if (result.error !== undefined) {
							// Get the error message from the object if present.
							message = result.error;
						}
					}
					
					reject([ host, port, message ]);
				}
			}
			
			switch(method) {
				case 'POST':
					self.system.emit('rest', url, body, function(err, result) {
						handleResponse(err, result);
					}, extra_headers);
					break;
				case 'GET':
					self.system.emit('rest_get', url, function(err, result) {
						handleResponse(err, result);
					}, extra_headers);
					break;
				default:
					throw new Error('Invalid method');
					break;
			}
		});
	};


}

runEntrypoint(ModuleInstance, [])
