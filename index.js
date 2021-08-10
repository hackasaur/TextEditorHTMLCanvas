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

		const setCanvasFont = (ctx, font) => {
			ctx.fillStyle = `${font.fontColor}`
			ctx.font = `${font.fontSize}px ${font.fontStyle}`
		}
		//function factories for elements of the text editor:
		const createTextCursor = (ctx, initialCoords) => {
			const properties = {
				coords: initialCoords,
				color: ctx.fillStyle,
				width: ctx.measureText(' ').width / 4,
				height: ctx.measureText(' ').fontBoundingBoxAscent
			}

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
				},
				getProperties: () => {
					return properties
				},
				updateCursor(){
					properties.width = ctx.measureText(' ').width / 4
					properties.height =  ctx.measureText(' ').fontBoundingBoxAscent
					properties.color = ctx.fillStyle
				},
				getImageDataBehindTheCursor:() => {
					return ctx.getImageData(properties.coords[0], properties.coords[1], properties.width + 1, properties.height);
				}
			}
		}

		const createLine = (ctx, coords) => {
			// fontWithPosition element should be of form {start:0, font: font}
			const properties = {
				coords: coords,
				height: ctx.measureText('').fontBoundingBoxAscent,
				text: '',
				fontsWithPosition: [],
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
				addCharacter: (character, font) => {
					properties.text = properties.text.concat(character)
					let sameFontBool = false
					if (properties.fontsWithPosition.length !== 0) {
						let lastFont = properties.fontsWithPosition[properties.fontsWithPosition.length - 1].font
						sameFontBool = (lastFont.fontColor === font.fontColor && lastFont.fontStyle === font.fontStyle && lastFont.fontSize === font.fontSize)
					}
					if (sameFontBool === false) {
						// console.log('in addCharcter', properties.fontsWithPosition)
						properties.fontsWithPosition.push({ start: properties.text.length - 1, font: { ...font } })
					}

					setCanvasFont(ctx, font)
					properties.characterWidths.push(ctx.measureText(character).width)
				},
				drawBoundary: () => {
					let coords = properties.coords
					// ctx.lineJoin = 'round';
					ctx.lineWidth = 1;
					ctx.strokeStyle = 'white'
					let width = 0
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

		const createDocText = (ctx, initialCoords) => {
			const properties = {
				lines: [createLine(ctx, initialCoords)],
				currentLineIndex: 0
			}
			// ctx.textBaseline = 'bottom';

			return {
				draw: () => {
					// console.log('==========')
					for (let line of properties.lines) {
						// line.drawBoundary()
						let lineProps = line.getProperties()
						let fontsWithPosition = lineProps.fontsWithPosition
						let txt = lineProps.text
						for (let i = 0; i < fontsWithPosition.length; i++) {
							let characterWidths = lineProps.characterWidths
							let offsetInX = 0
							if (i >= 1) {
								// if (characterWidths.length > 0) {
									for (let charIndex = 0; charIndex < fontsWithPosition[i].start; charIndex++) {
										offsetInX += characterWidths[charIndex]
								
									}
							}
							// console.log('offsetInX:', offsetInX)

							let font = fontsWithPosition[i].font
							setCanvasFont(ctx, font)
							if (i === (fontsWithPosition.length - 1)) { //slice till end of txt for last element of fontsWithPos
								// console.log(txt.slice(fontsWithPosition[i].start))
								ctx.fillText(txt.slice(fontsWithPosition[i].start), lineProps.coords[0] + offsetInX, lineProps.coords[1] + lineProps.height)
							}
							else {
								// console.log('interval text:', txt.slice(fontsWithPosition[i].start, fontsWithPosition[i + 1].start))
								ctx.fillText(txt.slice(fontsWithPosition[i].start, fontsWithPosition[i + 1].start), lineProps.coords[0] + offsetInX, lineProps.coords[1] + lineProps.height)
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
				addNewLine: (coords) => {
					properties.lines.push(createLine(ctx, coords))
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
			let textCursorProps = textCursor.getProperties()
			imageDataBehindTheCursor = textCursor.getImageDataBehindTheCursor() 
		}

		const nonCharacterKeys = ['Backspace', 'Enter', 'Alt', 'AltGraph', 'Shift', 'Escape', 'Delete', 'F1', 'F2', 'F3', 'F6', 'F7', 'F8', 'F9', 'F10', 'F12', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']

		//configs:
		//font
		let fontDropdown = document.getElementById('font-dropdowns')
		let font = { 
					fontSize: document.getElementById('font-dropdown-size').value, 
					fontStyle: document.getElementById('font-dropdown-style').value, 
					fontColor: document.getElementById('font-dropdown-color').value
				}
		//global variables:
		let frameNumber = 1
		let blinkCycleFrame = 1
		//editor's elements:
		setCanvasFont(ctx, font)
		let theTextCursor = createTextCursor(ctx, createPoint(0, 0))
		let imageDataBehindTheCursor = theTextCursor.getImageDataBehindTheCursor() 
		let theDocText = createDocText(ctx, createPoint(0, 0), font)

		canvas.addEventListener('mousedown', event => {
			if (event.button === 0) {
				let mouseCoords = createPoint(event.offsetX, event.offsetY)
				theTextCursor.getProperties().coords = mouseCoords
				theDocText.addNewLine(mouseCoords, font)
				renderEditor(ctx, theDocText, theTextCursor)
				blinkCycleFrame = 1
			}
		})

		window.addEventListener("keydown", event => {
			// event.preventDefault()
			let keyPressed = event.key
			// console.log(keyPressed)
			let theTextCursorProps = theTextCursor.getProperties()
			let theDocTextProps = theDocText.getProperties()
			if (nonCharacterKeys.includes(keyPressed)) {
				if (keyPressed === 'Backspace') {
					let lineProps = theDocTextProps.lines[theDocTextProps.currentLineIndex].getProperties()
					if (lineProps.text.length > 0) {
						let characterWidth = lineProps.characterWidths[lineProps.text.length - 1]
						theTextCursorProps.coords = (createPoint(theTextCursorProps.coords[0] - characterWidth, theTextCursorProps.coords[1]))
						theDocText.backSpacePressed()
					}
				}
				// else if (keyPressed === 'Enter') {
			}
			else {
				if (keyPressed === ' ') {
					event.preventDefault()
				}
				theDocText.addCharacterInLine(keyPressed, font)
				let lineProps = theDocTextProps.lines[theDocTextProps.currentLineIndex].getProperties()
				let characterWidth = lineProps.characterWidths[lineProps.text.length - 1]
				theTextCursorProps.coords = (createPoint(theTextCursorProps.coords[0] + characterWidth, theTextCursorProps.coords[1]))
			}

			blinkCycleFrame = 1
			renderEditor(ctx, theDocText, theTextCursor)
		});

		fontDropdown.addEventListener("click", () => {
			font.fontStyle = document.getElementById('font-dropdown-style').value
			font.fontColor = document.getElementById('font-dropdown-color').value
			font.fontSize = document.getElementById('font-dropdown-size').value
			setCanvasFont(ctx, font)
			theTextCursor.updateCursor()			
			renderEditor(ctx,theDocText, theTextCursor)
			// console.log(font)
		})

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
				let theTextCursorCoords = theTextCursor.getProperties().coords
				//this way the whole background,text will not be rendered everytime for blinking...it'll just render the area behind the cursor
				ctx.putImageData(imageDataBehindTheCursor, theTextCursorCoords[0], theTextCursorCoords[1])
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