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

		const createLine = (ctx, initialCoords, initialFont) => {
			const font = {
				fontSize: initialFont.fontSize,
				fontStyle: initialFont.fontStyle,
				fontColor: initialFont.fontColor
			}
			const fontWithPosition = [0, font]
			const properties = {
				coords: initialCoords,
				height: ctx.measureText('').fontBoundingBoxAscent,
				text: '',
				fontWithPosition: fontWithPosition,
				characterWidths: []
			}

			return {
				getCoords: () => {
					return properties.coords
				},
				setCoords: (coords) => {
					properties.coords = coords
				},
				getProperties: () => {
					return properties
				},
				setProperties: (props) => {
					properties = props
				},
				addCharacter: (character, font = 'same') => {
					properties.text = properties.text.concat(character)
					if (font !== 'same') {
						fontWithPosition.push(font, properties.length - 1)
					}
					properties.characterWidths.push(ctx.measureText(character).width)
				},
				drawBoundary: () => {
					let coords = properties.coords
					// ctx.lineJoin = 'round';
					ctx.lineWidth = 1;
					ctx.strokeStyle = 'white'
					let width
					for (let characterWidth of properties.characterWidths) {
						width += characterWidth
					}
					ctx.strokeRect(coords[0], coords[1], width, properties.height)
				},
				getCharacterWidths: () => {
					return properties.characterWidths
				}
			}
		}

		const createDocText = (ctx, initialCoords, initialFont) => {
			const properties = {
				lines: [createLine(ctx, initialCoords, initialFont)],
				currentLineIndex: 0
			}
			// ctx.textBaseline = 'bottom';

			return {
				draw: () => {
					ctx.fillStyle = `${properties.color}`;
					for (let line of properties.lines) {
						line.drawBoundary()
						let lineProps = line.getProperties()
						// console.log('lineProps', lineProps)
						for (let i = 0; i < lineProps.fontWithPosition.length; i += 2) {
							let font = lineProps.fontWithPosition[i + 1]
							ctx.fillStyle = `${font.fontColor}`;
							ctx.font = `${font.fontSize}px ${font.fontStyle}`
							if (!lineProps.fontWithPosition[i + 2]) {
								ctx.fillText(lineProps.text.slice(i), lineProps.coords[0], lineProps.coords[1] + lineProps.height)
							}
							else {
								ctx.fillText(lineProps.text.slice(i, i + 2), lineProps.coords[0], lineProps.coords[1] + lineProps.height)
							}
						}
					}
				},
				addCharacterInLine: (character, font) => {
					properties.lines[properties.currentLineIndex].addCharacter(character, font)
				},
				backSpacePressed: () => {
					let line = properties.lines[properties.currentLineIndex].getProperties().text
					properties.lines[properties.currentLineIndex].getProperties().text = line.slice(0, line.length - 1)
					properties.lines[properties.currentLineIndex].getProperties().characterWidths.pop()
				},
				addNewLine: (coords, initialFont) => {
					properties.lines.push(createLine(ctx, coords, initialFont))
					properties.currentLineIndex = properties.lines.length - 1
				},
				getProperties: () => {
					return properties
				}
			}
		}

		function renderEditor(ctx, docText, textCursor) {
			ctx.fillStyle = '#3a2081' //lighter purple background color
			ctx.fillRect(0, 0, canvas.width, canvas.height)
			docText.draw()
			let textCursorCoords = textCursor.getCoords()
			behindTheCursor = ctx.getImageData(textCursorCoords[0], textCursorCoords[1], textCursorWidth + 1, textCursorHeight);
		}

		const nonCharacterKeys = ['Backspace', 'Enter', 'Alt', 'AltGraph', 'Shift', 'Escape', 'Delete', 'F1', 'F2', 'F3', 'F6', 'F7', 'F8', 'F9', 'F10', 'F12', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']

		//configs:
		//font
		let font = { fontSize: 25, fontStyle: 'Fira Code', fontColor: 'lightgreen' }

		//text cursor
		let textCursorWidth = font.fontSize/8
		let textCursorHeight = font.fontSize

		//global variables:
		let frameNumber = 1
		let blinkCycleFrame = 1
		let behindTheCursor
		//editor's elements:
		let theTextCursor = createTextCursor(ctx, createPoint(0, 0), textCursorWidth, textCursorHeight, font.fontColor)
		let theDocText = createDocText(ctx, createPoint(0, 0), font)

		canvas.addEventListener('mousedown', event => {
			if (event.button === 0) {
				let mouseCoords = createPoint(event.offsetX, event.offsetY)
				theTextCursor.setCoords(mouseCoords)
				theDocText.addNewLine(mouseCoords, font)
				renderEditor(ctx, theDocText, theTextCursor)
				blinkCycleFrame = 1
			}
		})

		window.addEventListener("keydown", event => {
			// event.preventDefault()
			let keyPressed = event.key
			// console.log(keyPressed)
			let theTextCursorCoords = theTextCursor.getCoords()
			if (nonCharacterKeys.includes(keyPressed)) {
				if (keyPressed === 'Backspace') {
					theDocTextProps = theDocText.getProperties()
					let lineProps = theDocTextProps.lines[theDocTextProps.currentLineIndex].getProperties()
					if (lineProps.text.length > 0) {
						let characterWidth = lineProps.characterWidths[lineProps.text.length - 1]
						theTextCursor.setCoords(createPoint(theTextCursorCoords[0] - characterWidth, theTextCursorCoords[1]))
						theDocText.backSpacePressed()
					}
				}
				// else if (keyPressed === 'Enter') {
			}
			else {
				theDocText.addCharacterInLine(keyPressed, 'same')
				theDocTextProps = theDocText.getProperties()
				let lineProps = theDocTextProps.lines[theDocTextProps.currentLineIndex].getProperties()
				let characterWidth = lineProps.characterWidths[lineProps.text.length - 1]
				theTextCursor.setCoords(createPoint(theTextCursorCoords[0] + characterWidth, theTextCursorCoords[1]))
			}

			blinkCycleFrame = 1
			renderEditor(ctx, theDocText, theTextCursor)
		});

		//rendering part:

		//render the first time
		renderEditor(ctx, theDocText, theTextCursor)

		function main() {
			if (frameNumber <= 5000) {
				window.requestAnimationFrame(main)
			}

			if (blinkCycleFrame === 1) {
				theTextCursor.draw()
			}
			else if (blinkCycleFrame === 30) {
				let theTextCursorCoords = theTextCursor.getCoords()
				//this way the whole background,text will not be rendered everytime for blinking...it'll just render the area behind the cursor
				ctx.putImageData(behindTheCursor, theTextCursorCoords[0], theTextCursorCoords[1])
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