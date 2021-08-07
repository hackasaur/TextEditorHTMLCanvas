function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function draw() {
	const canvas = document.getElementById('code editor')
	if (canvas.getContext) {
		const ctx = canvas.getContext('2d')
		ctx.canvas.width = window.innerWidth / 2;
		ctx.canvas.height = window.innerHeight;

		const createPoint = (x, y) => {
			let point = new Int8Array(2)
			point = [x, y]
			return point
		}

		//function factories for elements of the text editor:
		const createLine = (ctx, initialCoords, lineHeight) => {
			const properties = { coords: initialCoords, width: 100, height: lineHeight }

			return {
				getCoords: () => {
					return properties.coords
				},
				setCoords: (point) => {
					properties.coords = point
				},
				getProperties: () => {
					return properties
				},
				setProperties: (props) => {
					properties = props
				},
				drawBoundary: () => {
					let coords = properties.coords
					// ctx.lineJoin = 'round';
					ctx.lineWidth = 1;
					ctx.strokeStyle = 'white'
					ctx.strokeRect(coords[0], coords[1], properties.width, properties.height)
				}

			}
		}

		const createTextCursor = (ctx, initialCoords, width, height, color) => {

			const properties = { coords: initialCoords, color, width, height }

			return {
				draw: () => {
					ctx.fillStyle = properties.color;
					ctx.fillRect(properties.coords[0], properties.coords[1], properties.width, properties.height);
				},
				setCoords: (coords) => {
					properties.coords = coords
				},
				getCoords: () => {
					return properties.coords
				}
			}
		}

		const createDocText = (ctx, fontStyle, fontSize, fontColor) => {
			const properties = { textWithCoords: [], style: fontStyle, size: fontSize, color: fontColor }

			return {
				draw: () => {
					ctx.font = `${properties.size}px ${properties.style}`
					ctx.fillStyle = `${properties.color}`;
					let textWithCoords = properties.textWithCoords
					for (let i = 0; i < textWithCoords.length; i += 3) {
						ctx.fillText(textWithCoords[i], textWithCoords[i + 1], textWithCoords[i + 2])
					}
					// ctx.fillText('Hello World', 100, 100)
					// console.log(textWithcoords)
				},
				addCharacterWithCoords: (character, x, y) => {
					properties.textWithCoords.push(character, x, y)
				},
				backSpacePressed: () => {
					let textWithCoords = properties.textWithCoords
					let l = textWithCoords.length
					if (l < 4) {
						if (l > 0) {
							textWithCoords.splice(0, 3)
						}
					}
					else {
						textWithCoords.splice(textWithCoords.length - 3, 3)
					}
				}
			}
		}

		function renderEditor(text, textCursor) {
			ctx.fillStyle = '#2c0b88' //lighter purple background color
			ctx.fillRect(0, 0, canvas.width, canvas.height)
			text.draw()
			let textCursorcoords = textCursor.getCoords()
			behindTheCursor = ctx.getImageData(textCursorcoords[0], textCursorcoords[1], textCursorWidth + 1, textCursorHeight);
		}

		const nonCharacterKeys = ['Backspace', 'Enter', 'Alt', 'AltGraph', 'Shift', 'Escape', 'Delete', 'F1', 'F2', 'F3', 'F6', 'F7', 'F8', 'F9', 'F10', 'F12', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']

		//configs:

		//font
		let fontSize = 25
		let fontStyle = 'Fira Code'
		let fontColor = 'lightgreen'
		ctx.font = `${fontSize}px ${fontStyle}`
		//text cursor
		let textCursorWidth = fontSize / 2
		let textCursorHeight = fontSize
		//line
		let lineHeight = ctx.measureText('|').fontBoundingBoxAscent

		//global variables
		let frameNumber = 1
		let blinkCycleFrame = 1
		let behindTheCursor

		//editor's elements
		let theTextCursor = createTextCursor(ctx, createPoint(0, 0), textCursorWidth, textCursorHeight, fontColor)
		let theDocText = createDocText(ctx, fontStyle, fontSize, fontColor)
		let theLine = createLine(ctx, createPoint(0, 0), lineHeight)

		canvas.addEventListener('mousedown', event => {
			if (event.button === 0) {
				let mouseCoords = createPoint(event.offsetX, event.offsetY)
				theTextCursor.setCoords(mouseCoords)
				// thetextCursor.textCursorcoords = createPoint(event.offsetX, event.offsetY)
				blinkCycleFrame = 1
				renderEditor(theDocText, theTextCursor)
			}
		})

		window.addEventListener("keydown", event => {
			// event.preventDefault()
			let keyPressed = event.key
			// console.log(keyPressed)
			let theTextCursorcoords = theTextCursor.getCoords()
			if (nonCharacterKeys.includes(keyPressed)) {
				if (keyPressed === 'Backspace') {
					theDocText.backSpacePressed()
					theTextCursor.setCoords(createPoint(theTextCursorcoords[0] - fontSize, theTextCursorcoords[1]))
				}
				else if (keyPressed === 'Enter') {
					theDocText.addCharacterWithCoords('', theTextCursorcoords[0], theTextCursorcoords[1] + textCursorHeight)
				}
			}
			else {
				theDocText.addCharacterWithCoords(keyPressed, theTextCursorcoords[0], theTextCursorcoords[1] + textCursorHeight)
				theTextCursor.setCoords(createPoint(theTextCursorcoords[0] + fontSize, theTextCursorcoords[1]))
			}

			blinkCycleFrame = 1
			renderEditor(theDocText, theTextCursor)
		});

		//rendering part:

		//render first time
		renderEditor(theDocText, theTextCursor)

		function main() {
			if (frameNumber <= 5000) {
				window.requestAnimationFrame(main)
			}

			if (blinkCycleFrame === 1) {
				theTextCursor.draw()
			}
			else if (blinkCycleFrame === 30) {
				let theTextCursorcoords = theTextCursor.getCoords()
				//this way the whole background, text will not be rendered everytime it'll just render the area behind the cursor for blinking
				ctx.putImageData(behindTheCursor, theTextCursorcoords[0], theTextCursorcoords[1])
			}
			else if (blinkCycleFrame === 60) {
				blinkCycleFrame = 0
			}

			// theLine.drawBoundary()

			blinkCycleFrame++
			frameNumber++

			console.log('frame #')
			// console.log('blinkCycleFrame#:', blinkCycleFrame)
			// await sleep(500)
		}
		main()
	}
}