module.exports = function (self) {
	self.setActionDefinitions({
		power: {
			name: 'Set Power State',
			options: [
				{
					id: 'power',
					type: 'dropdown',
					label: 'On/Off',
					default: 'power_on',
						choices: [
							{label: 'Power On', id: 'power_on'},
							{label: 'Power Off', id: 'power_off'}
						]
				},
			],
			callback: async (event) => {
				self.sendAction(event)
			}
		},
		volume: {
			name: 'Adjust Volume',
			options: [
				{
					id: 'volume',
					type: 'dropdown',
					label: 'Adjust Volume',
					default: 'volume_up',
					default: '',
						choices: [
							{label: 'Volume Up', id: 'volume_up'},
							{label: 'Volume Down', id: 'volume_down'},
							{label: 'Volume Mute', id: 'volume_mute'},
							{label: 'Volume Unmute', id: 'volume_unmute'}
						]
				},
			],
			callback: async (event) => {
				self.sendAction(event)
			},
		},
		changeInput: {
			name: 'Change External Input',
			options: [
				{
					id: 'kind',
					type: 'dropdown',
					label: 'Kind',
					default: 'hdmi',
					choices: [
						{id: 'hdmi', label: 'HDMI'},
						{id: 'composite', label: 'Composite'},
						{id: 'scart', label: 'SCART'}
					]
				},
				{
					id: 'port',
					type: 'dropdown',
					label: 'Port',
					default: '1',
					choices: [
						{id: '1', label: '1'},
						{id: '2', label: '2'},
						{id: '3', label: '3'},
						{id: '4', label: '4'}
					]
				}
			],
			callback: async (event) => {
				self.sendAction(event)
			},
		}
	})
}