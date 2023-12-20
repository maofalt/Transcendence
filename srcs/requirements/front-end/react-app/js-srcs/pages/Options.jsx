
const Options = () => {
	return (
		<div className="bg-black min-h-screen text-white">
		<div className="max-w-4xl mx-auto p-4">
			<div className="flex justify-between items-center mb-6">
			<h1 className="text-3xl font-bold">SETTINGS</h1>
			<div className="space-x-2">
				<Button className="bg-white text-black" variant="secondary">
				CONTROLLER
				</Button>
				<Button className="bg-white text-black" variant="secondary">
				KEYBOARD/MOUSE
				</Button>
				<Button className="bg-white text-black" variant="secondary">
				VIDEO
				</Button>
				<Button className="bg-[#ffffff] text-black" variant="secondary">
				AUDIO
				</Button>
				<Button className="bg-white text-black" variant="secondary">
				UI
				</Button>
				<Button className="bg-white text-black" variant="secondary">
				ACCESSIBILITY
				</Button>
			</div>
			</div>
			<div className="space-y-4">
			<div className="flex justify-between items-center">
				<label className="font-medium" htmlFor="size">
				SIZE
				</label>
				<select className="bg-gray-700 text-white border border-gray-500" id="size">
				<option>Small</option>
				<option>Medium</option>
				<option>Large</option>
				</select>
			</div>
			<div className="flex justify-between items-center">
				<label className="font-medium" htmlFor="background-opacity">
				BACKGROUND OPACITY
				</label>
				<input
				className="w-1/2"
				defaultValue="0.7"
				id="background-opacity"
				max="1"
				min="0"
				step="0.1"
				type="range"
				/>
			</div>
			<div className="flex justify-between items-center">
				<label className="font-medium" htmlFor="highlight">
				HIGHLIGHT
				</label>
				<select className="bg-gray-700 text-white border border-gray-500" id="highlight">
				<option>Speaker</option>
				<option>Headphones</option>
				</select>
			</div>
			<div className="font-medium mb-2">COMMUNICATION</div>
			<div className="flex justify-between items-center">
				<label className="font-medium" htmlFor="voice-chat-input-device">
				VOICE CHAT INPUT DEVICE
				</label>
				<select className="bg-gray-700 text-white border border-gray-500" id="voice-chat-input-device">
				<option>Headset Microphone (4- Arctis 7 Game)</option>
				<option>Default Microphone</option>
				</select>
			</div>
			<div className="flex justify-between items-center">
				<label className="font-medium" htmlFor="voice-chat-mode">
				VOICE CHAT MODE
				</label>
				<select className="bg-gray-700 text-white border border-gray-500" id="voice-chat-mode">
				<option>Open Mic</option>
				<option>Push to Talk</option>
				</select>
			</div>
			<div className="flex justify-between items-center">
				<span className="font-medium">FIRETEAM & LOBBY CHAT</span>
				<input className="accent-white" type="checkbox" />
			</div>
			<div className="flex justify-between items-center">
				<span className="font-medium">MATCH CHAT</span>
				<input className="accent-white" type="checkbox" />
			</div>
			<div className="flex justify-between items-center">
				<label className="font-medium" htmlFor="incoming-voice-chat-volume">
				INCOMING VOICE CHAT VOLUME
				</label>
				<input className="w-1/2" defaultValue="0" id="incoming-voice-chat-volume" max="10" min="0" type="range" />
			</div>
			<div className="flex justify-between items-center">
				<span className="font-medium">SPARTAN CHATTER</span>
				<input className="accent-white" type="checkbox" />
			</div>
			</div>
			<div className="flex justify-between items-center mt-6">
			<Button className="bg-transparent border border-white" variant="outline">
				Back
			</Button>
			<Button className="bg-transparent border border-white" variant="outline">
				Restore Defaults
			</Button>
			</div>
		</div>
		</div>
	)
}

export default Options;