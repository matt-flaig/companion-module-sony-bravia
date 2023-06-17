const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpdateActions = require('./actions')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config
		console.log(config)

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
				type: 'static-text',
				id: 'info',
				label: 'Information',
				width: 12,
				value: 'The TV will need to be configured with a Pre Shared Key (PSK).'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: Regex.IP
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
	
	updateFeedbacks() {
		UpdateFeedbacks(this)
	}
	
	updatePresets() {
		UpdatePresets(this)
	}
	
	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
	
	async sendAction(event) {
		let self = this;
		let options = event.options;
		
		let host = self.config.host;
		let port = 80;
		let psk = self.config.psk;
		
		let service = null;
		let method = null;
		let params = null;
		
		switch (event.actionId) {
			case 'power':
				switch (options.power) {
					case 'power_on':
						service = 'system';
						method = 'setPowerStatus';
						params = {status: true};
						break;
					case 'power_off':
						service = 'system';
						method = 'setPowerStatus';
						params = {status: false};
						break;
				}
				break;
			case 'volume':
				switch (options.volume) {
					case 'volume_up':
						service = 'audio';
						method = 'setAudioVolume';
						params = {target: 'speaker', volume: '+1'};
						break;
					case 'volume_down':
						service = 'audio';
						method = 'setAudioVolume';
						params = {target: 'speaker', volume: '-1'};
						break;
					case 'volume_mute':
						service = 'audio';
						method = 'setAudioMute';
						params = {status: true};
						break;
					case 'volume_unmute':
						service = 'audio';
						method = 'setAudioMute';
						params = {status: false};
						break;
				}
				break;
			case 'changeInput':
				service = 'avContent';
				method = 'setPlayContent';
				let uri = 'extInput:' + options.kind + '?port=' + options.port;
				params = {uri: uri};
				break;
			default:
				break;
		}
		
		let cmdObj = {};
		cmdObj.method = method;
		cmdObj.version = '1.0';
		cmdObj.id = 1;
		cmdObj.params = [params];
		
		self.doRest('POST', '/sony/' + service, host, port, cmdObj)
		.then(function(res) {
			if(res.ok){
				self.updateStatus(InstanceStatus.Ok)
			}else{
				console.debug('Connection Error: ' + res);
				self.updateStatus(InstanceStatus.Error)
			}
		})
		.catch(function(error) {
			console.debug(error)
			self.updateStatus(InstanceStatus.Error)
		});
	
	}
	
	async doRest(method, cmd, host, port, body) {
		var self = this;
		var url = 'http://' + (host ? host : self.config.host) + cmd;
		console.log(url)
		console.log(body)
		
		let headers = {};
		headers['X-Auth-PSK'] = self.config.psk;

		return fetch(url, {
				method: method == "GET" ? "GET" : "POST",
				headers: headers,
				body: body
			});
	};

}

runEntrypoint(ModuleInstance, [])
