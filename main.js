import * as canvasTools from './modules/canvas tools.js';


const nonCharacterKeys = ['Backspace', 'Enter', 'Alt', 'AltGraph', 'Shift', 'Escape', 'Delete', 'F1', 'F2', 'F3', 'F6', 'F7', 'F8', 
'F9', 'F10', 'F12', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']

function main() {
	const canvas = document.getElementById('code editor')
	if (canvas.getContext) {
		const ctx = canvas.getContext('2d')
		ctx.canvas.width = window.innerWidth / 2;
		ctx.canvas.height = window.innerHeight;


		const areFontsSame = (font1, font2) => {
			let sameFont = (
				font1.fontColor === font2.fontColor
				&& font1.fontStyle === font2.fontStyle
				&& font1.fontSize === font2.fontSize
			)
			return sameFont
		}

		//function factories for elements of the text editor:
		const createTextCursor = (ctx, initialCoords) => {
			const properties = {
				coords: initialCoords,
				color: ctx.fillStyle,
				width: ctx.measureText(' ').width / 4,
				height: ctx.measureText(' ').fontBoundingBoxAscent,
			}
			let blinkCycle = 0
			let imageDataBehindTheCursor

			return {
				draw: () => {
					if (blinkCycle === 0) {
						ctx.fillStyle = properties.color;
						ctx.fillRect(properties.coords[0], properties.coords[1], properties.width, properties.height);
					}
					else if (blinkCycle === 30) {
						//this way the whole background with text will not be rendered everytime for blinking...it'll just render the area behind the cursor
						ctx.putImageData(imageDataBehindTheCursor, properties.coords[0], properties.coords[1])
					}
					else if (blinkCycle === 60) {
						blinkCycle = -1
					}
					blinkCycle++
				},
				getProperties: () => {
					return properties
				},
				updateCursor: () => {
					properties.height = ctx.measureText(' ').fontBoundingBoxAscent
					properties.coords[1] = properties.coords[1] + properties.height - newHeight
					properties.width = ctx.measureText(' ').width / 4
					properties.color = ctx.fillStyle
				},
				setImageDataBehindTheCursor: () => {
					imageDataBehindTheCursor = ctx.getImageData(properties.coords[0], properties.coords[1], properties.width + 1, properties.height);
				},
				resetBlinkCycle: () => {
					blinkCycle = 0
				}
			}
		}

		const createLine = (ctx, coords) => {
			// fontWithPosition element should be of the form {start:0, font: font}
			const properties = {
				coords: coords,
				height: ctx.measureText('').fontBoundingBoxAscent,
				text: '',
				fontsWithPosition: [],
				characterWidths: []
			}

			return {
				// getCoords: () => {
				// 	return properties.coords
				// },
				// setCoords: (coords) => {
				// 	properties.coords = coords
				// },
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
						sameFontBool = areFontsSame(lastFont, font)
					}
					if (sameFontBool === false) {
						properties.fontsWithPosition.push({ start: properties.text.length - 1, font: { ...font } })
					}

					canvasTools.setCanvasFont(ctx, font)
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
					for (let line of properties.lines) {
						// line.drawBoundary()
						let lineProps = line.getProperties()
						let fontsWithPosition = lineProps.fontsWithPosition
						let txt = lineProps.text
						for (let i = 0; i < fontsWithPosition.length; i++) {
							let characterWidths = lineProps.characterWidths
							let offsetInX = 0
							if (i >= 1) {
								for (let charIndex = 0; charIndex < fontsWithPosition[i].start; charIndex++) {
									offsetInX += characterWidths[charIndex]
								}
							}

							let font = fontsWithPosition[i].font
							canvasTools.setCanvasFont(ctx, font)
							if (i === (fontsWithPosition.length - 1)) { //slice till end of txt for last element of fontsWithPos
								ctx.fillText(txt.slice(fontsWithPosition[i].start), lineProps.coords[0] + offsetInX, lineProps.coords[1] + lineProps.height)
							}
							else {
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
			canvasTools.paintBackground(ctx, '#3a2081')
			docText.draw()
			textCursor.resetBlinkCycle()
			textCursor.setImageDataBehindTheCursor()
		}


		function startEditor() {
			//configs:
			let font = {
				size: document.getElementById('font-dropdown-size').value,
				font: document.getElementById('font-dropdown-style').value,
				color: document.getElementById('font-dropdown-color').value
			}
			canvasTools.setCanvasFont(ctx, font)

			let fontDropdowns = document.getElementById('font-dropdowns')

			//editor's elements:
			let theTextCursor = createTextCursor(ctx, canvasTools.createPoint(0, 0))
			let theDocText = createDocText(ctx, canvasTools.createPoint(0, 0), font)

			canvas.addEventListener('mousedown', event => {
				if (event.button === 0) {
					let mouseCoords = canvasTools.createPoint(event.offsetX, event.offsetY)
					theTextCursor.getProperties().coords = mouseCoords
					theDocText.addNewLine(mouseCoords, font)
					renderEditor(ctx, theDocText, theTextCursor)
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
							theTextCursorProps.coords = (
								canvasTools.createPoint(theTextCursorProps.coords[0] - characterWidth, theTextCursorProps.coords[1])
							)
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
					theTextCursorProps.coords = (
						canvasTools.createPoint(theTextCursorProps.coords[0] + characterWidth,
							theTextCursorProps.coords[1]))
				}

				renderEditor(ctx, theDocText, theTextCursor)
			});

			fontDropdowns.addEventListener("click", () => {
				font.font = document.getElementById('font-dropdown-style').value
				font.color = document.getElementById('font-dropdown-color').value
				font.size = document.getElementById('font-dropdown-size').value
				canvasTools.setCanvasFont(ctx, font)
				theTextCursor.updateCursor()
				renderEditor(ctx, theDocText, theTextCursor)
			})

			//rendering part:

			//render the first time
			renderEditor(ctx, theDocText, theTextCursor)

			//global variables:
			let frameNumber = 1

			//loop for text cursor:
			function loop() {
				// if (frameNumber <= 1000) {
				window.requestAnimationFrame(loop)
				theTextCursor.draw()
				frameNumber++

				console.log('frame #')
			}
			loop()
		}

		startEditor()
	}
}

window.addEventListener('load', main)