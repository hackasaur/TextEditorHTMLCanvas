import * as canvasTools from './modules/canvas tools.js';
import * as fontTools from './modules/fontCanvas.js'

const nonCharacterKeys = ['Backspace', 'Enter', 'Alt', 'AltGraph', 'Shift', 'Escape', 'Delete', 'F1', 'F2', 'F3', 'F6', 'F7', 'F8',
	'F9', 'F10', 'F12', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']

function main() {
	const canvas = document.getElementById('code editor')
	if (canvas.getContext) {

		const ctx = canvas.getContext('2d')
		ctx.canvas.width = window.innerWidth - 30 ;
		ctx.canvas.height = window.innerHeight - 60;

		//function factories for elements of the text editor:
		const createTextCursor = (ctx, coords) => {
			const properties = {
				coords: coords,
				color: ctx.fillStyle,
				width: ctx.measureText(' ').width / 4,
				height: ctx.measureText(' ').fontBoundingBoxAscent, //height of font
			}
			let blinkFrameNumber = 0
			let imageDataBehindTheCursor

			return {
				properties: properties,
				draw: () => {
					if (blinkFrameNumber === 0) {
						ctx.fillStyle = properties.color;
						ctx.fillRect(properties.coords[0], properties.coords[1], properties.width, properties.height);
					}
					else if (blinkFrameNumber === 30) {
						//this way the whole background with text will not be rendered everytime for blinking...it'll just render the area behind the cursor
						ctx.putImageData(imageDataBehindTheCursor, properties.coords[0], properties.coords[1])
					}
					else if (blinkFrameNumber === 60) {
						blinkFrameNumber = -1
					}
					blinkFrameNumber++
				},
				updateCursor: () => {
					let currentHeight = properties.height
					properties.height = ctx.measureText(' ').fontBoundingBoxAscent
					let heightShift = currentHeight - properties.height
					properties.coords[1] = properties.coords[1] + heightShift
					properties.width = ctx.measureText(' ').width / 4
					properties.color = ctx.fillStyle
				},
				setImageDataBehindTheCursor: () => {
					imageDataBehindTheCursor = ctx.getImageData(properties.coords[0], properties.coords[1], properties.width + 1, properties.height);
				},
				resetBlinkCycle: () => {
					blinkFrameNumber = 0
				}
			}
		}

		const createLine = (ctx, coords) => {
			// fontWithPosition element should be of the form {start:0, font: font}
			const properties = {
				coords: coords,
				height: ctx.measureText(' ').fontBoundingBoxAscent,
				text: '',
				fontsWithPosition: [],
				characterWidths: []
			}

			return {
				properties,
				addCharacter: (character, font) => {
					properties.text = properties.text.concat(character)
					let sameFontBool = false
					if (properties.fontsWithPosition.length !== 0) {
						let lastFont = properties.fontsWithPosition[properties.fontsWithPosition.length - 1].font
						sameFontBool = fontTools.areFontsSame(lastFont, font)
					}
					if (sameFontBool === false) {
						properties.fontsWithPosition.push({ start: properties.text.length - 1, font: { ...font } })
					}

					canvasTools.setCanvasFont(ctx, font)
					properties.characterWidths.push(ctx.measureText(character).width)
				},

				drawBoundary: () => {
					let coords = properties.coords
					ctx.lineJoin = 'bevel';
					ctx.lineWidth = 1;
					ctx.strokeStyle = 'white'
					let width = 0
					for (let characterWidth of properties.characterWidths) {
						width += characterWidth
					}
					ctx.strokeRect(coords[0], coords[1] - properties.height, width, properties.height)
					ctx.fillStyle = 'red'
					ctx.fillRect(coords[0], coords[1], 3, 3)
				},
				getCharacterWidths: () => {
					return properties.characterWidths
				}
			}
		}

		const createDocText = (ctx, coords) => {
			const properties = {
				lines: [createLine(ctx, canvasTools.createPoint(coords[0], coords[1] + fontTools.getFontHeight(ctx)))],
				currentLineIndex: 0
			}
			// ctx.textBaseline = 'bottom';

			return {
				properties,
				draw: () => {
					for (let line of properties.lines) {
						// line.drawBoundary()
						let fontsWithPosition = line.properties.fontsWithPosition
						let txt = line.properties.text
						for (let i = 0; i < fontsWithPosition.length; i++) {
							let characterWidths = line.properties.characterWidths
							let offsetInX = 0
							if (i >= 1) {
								for (let charIndex = 0; charIndex < fontsWithPosition[i].start; charIndex++) {
									offsetInX += characterWidths[charIndex]
								}
							}

							let font = fontsWithPosition[i].font
							canvasTools.setCanvasFont(ctx, font)
							if (i === (fontsWithPosition.length - 1)) { //slice till end of txt for last element of fontsWithPos
								ctx.fillText(txt.slice(fontsWithPosition[i].start), line.properties.coords[0] + offsetInX, line.properties.coords[1]) // + line.properties.height)
							}
							else {
								ctx.fillText(txt.slice(fontsWithPosition[i].start, fontsWithPosition[i + 1].start), line.properties.coords[0] + offsetInX, line.properties.coords[1]) // + line.properties.height)
							}
						}
					}
				},
				addCharacterInLine: (character, font) => {
					properties.lines[properties.lines.length - 1].addCharacter(character, font)
				},
				backSpacePressed: () => {
					let currentLineIndex = properties.lines.length - 1
					let line = properties.lines[currentLineIndex].properties.text
					properties.lines[currentLineIndex].properties.text = line.slice(0, line.length - 1)
					properties.lines[currentLineIndex].properties.characterWidths.pop()
				},
				addNewLine: (coords) => {
					// if(coords[1] - fontTools.getFontHeight(ctx) )
					// coords[1] += fontTools.getFontHeight(ctx)
					properties.lines.push(createLine(ctx, coords))
				}
			}
		}

		function renderEditor(ctx, docText, textCursor) {
			canvasTools.paintBackground(ctx, '#3a2081')
			docText.draw()
			textCursor.resetBlinkCycle()
			textCursor.setImageDataBehindTheCursor()
		}


		function startEditor(ctx) {
			//define font using the html font-dropdowns 
			let font = {
				size: document.getElementById('font-dropdown-size').value,
				style: document.getElementById('font-dropdown-style').value,
				color: document.getElementById('font-dropdown-color').value
			}
			document.getElementById('font-size-display').innerText = font.size
			canvasTools.setCanvasFont(ctx, font)

			let fontDropdowns = document.getElementById('font-dropdowns')

			let theTextCursor = createTextCursor(ctx, canvasTools.createPoint(0, 0))
			let theDocText = createDocText(ctx, canvasTools.createPoint(0, 0), font)

			canvas.addEventListener('mousedown', event => {
				if (event.button === 0) {
					theTextCursor.properties.coords = canvasTools.createPoint(event.offsetX, event.offsetY)
					theDocText.addNewLine(canvasTools.createPoint(event.offsetX, event.offsetY + fontTools.getFontHeight(ctx)))
					renderEditor(ctx, theDocText, theTextCursor)
				}
			})

			window.addEventListener("keydown", event => {
				let keyPressed = event.key
				document.getElementById('keypressed-debug').innerText = keyPressed
				document.getElementById('docText').innerText = ''
				for (let line of theDocText.properties.lines) {
					// console.log(line.properties)
					document.getElementById('docText').innerText += `\n${line.properties.text}`
				}
				// console.log(event.code)
				if (nonCharacterKeys.includes(keyPressed)) {
					if (keyPressed === 'Backspace') {
						//move cursor back2 char
						let line = theDocText.properties.lines[theDocText.properties.lines.length - 1]
						if (line.properties.text.length > 0) {
							let characterWidth = line.properties.characterWidths[line.properties.text.length - 1]
							theTextCursor.properties.coords = (
								// canvasTools.createPoint(theTextCursorProps.coords[0] - characterWidth, theTextCursorProps.coords[1])
								canvasTools.createPoint(theTextCursor.properties.coords[0] - characterWidth, theTextCursor.properties.coords[1])
							)
							theDocText.backSpacePressed()
						}
					}
					else if (keyPressed === 'Enter') {
						let line = theDocText.properties.lines[theDocText.properties.lines.length - 1]
						// let newLineCoords = canvasTools.createPoint(0, line.properties.coords[1] + fontTools.getFontHeight(ctx))
						theTextCursor.properties.coords = canvasTools.createPoint(0, line.properties.coords[1])
						theDocText.addNewLine(canvasTools.createPoint(0, line.properties.coords[1] + fontTools.getFontHeight(ctx)))
					}
				}
				//when a character key is pressed
				else {
					if (keyPressed === ' ') {//spacebar
						event.preventDefault()
					}
					theDocText.addCharacterInLine(keyPressed, font)
					let line = theDocText.properties.lines[theDocText.properties.lines.length - 1]
					let characterWidth = line.properties.characterWidths[line.properties.text.length - 1]

					theTextCursor.properties.coords = (
						canvasTools.createPoint(theTextCursor.properties.coords[0] + characterWidth, theTextCursor.properties.coords[1])
					)
				}

				renderEditor(ctx, theDocText, theTextCursor)
			});

			fontDropdowns.addEventListener("click", () => {
				font.style = document.getElementById('font-dropdown-style').value
				font.color = document.getElementById('font-dropdown-color').value
				font.size = document.getElementById('font-dropdown-size').value
				document.getElementById('font-size-display').innerText = font.size
				canvasTools.setCanvasFont(ctx, font)
				theTextCursor.updateCursor()
				renderEditor(ctx, theDocText, theTextCursor)
			})

			//rendering part:

			//render the first time
			renderEditor(ctx, theDocText, theTextCursor)
			// let frameNumber = 1

			//loop for text cursor:
			function loop() {
				// if (frameNumber <= 1000) {
				window.requestAnimationFrame(loop)
				theTextCursor.draw()
				// frameNumber++

				// console.log('frame #')
			}
			loop()
		}

		startEditor(ctx)
	}
}

window.addEventListener('load', main)