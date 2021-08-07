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

        textCursor = (ctx) => {
            let textCursorCoords = new Int8Array(2)

            return {
                draw: () => {
                    ctx.fillStyle = fontColor;
                    ctx.fillRect(textCursorCoords[0], textCursorCoords[1], textCursorWidth, textCursorHeight);
                },
                setXYCoordinates: (x, y) => {
                    textCursorCoords = createPoint(x, y)
                },
                getXYCoordinates: () => {
                    return textCursorCoords
                }
            }
        }

        text = (ctx) => {
            let textWithCoords = []

            return {
                draw: () => {
                    ctx.fillStyle = `${fontColor}`;
                    for (let i = 0; i < textWithCoords.length; i += 3) {
                        ctx.fillText(textWithCoords[i], textWithCoords[i + 1], textWithCoords[i + 2])
                    }
                    // console.log(textWithCoords)
                },
                addCharacterInTextWithCoords: (character, x, y) => {
                    textWithCoords.push(character, x, y)
                },
                backSpacePressed: () => {
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
            let textCursorCoords = textCursor.getXYCoordinates()
            behindTheCursor = ctx.getImageData(textCursorCoords[0], textCursorCoords[1], textCursorWidth + 1, textCursorHeight);
        }

        const nonCharacterKeys = ['Backspace', 'Enter', 'Alt', 'AltGraph', 'Shift', 'Escape', 'Delete', 'F1', 'F2', 'F3', 'F6', 'F7', 'F8', 'F9', 'F10', 'F12', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']

        let fontSize = 25
        let fontStyle = 'Fira Code'
        let fontColor = 'lightgreen'
        ctx.font = `${fontSize}px ${fontStyle}`
        let textCursorWidth = fontSize / 2
        let textCursorHeight = fontSize
        let theTextCursor = textCursor(ctx)
        let theDocText = text(ctx)
        let frameNumber = 1
        let blinkCycleFrame = 1
        let behindTheCursor

        canvas.addEventListener('mousedown', event => {
            if (event.button === 0) {
                theTextCursor.setXYCoordinates(event.offsetX, event.offsetY)
                // thetextCursor.textCursorCoords = createPoint(event.offsetX, event.offsetY)
                blinkCycleFrame = 1
                renderEditor(theDocText, theTextCursor)
            }
        })

        window.addEventListener("keydown", event => {
            // event.preventDefault()
            let keyPressed = event.key
            // console.log(keyPressed)
            let theTextCursorCoords = theTextCursor.getXYCoordinates()
            if (nonCharacterKeys.includes(keyPressed)) {
                if (keyPressed === 'Backspace') {
                    theDocText.backSpacePressed()
                    theTextCursor.setXYCoordinates(theTextCursorCoords[0] - fontSize, theTextCursorCoords[1])
                }
            }
            else {
                theDocText.addCharacterInTextWithCoords(keyPressed, theTextCursorCoords[0], theTextCursorCoords[1] + textCursorHeight)
                theTextCursor.setXYCoordinates(theTextCursorCoords[0] + fontSize, theTextCursorCoords[1])
            }
            blinkCycleFrame = 1
            renderEditor(theDocText, theTextCursor)
        });

        //rendering part:
        //render editor first time
        renderEditor(theDocText, theTextCursor)

        function main() {
            if (frameNumber <= 5000) {
                window.requestAnimationFrame(main)
            }

            if (blinkCycleFrame === 1) {
                theTextCursor.draw()
            }
            else if(blinkCycleFrame === 30){
                let theTextCursorCoords = theTextCursor.getXYCoordinates()
                //this way we don't render the whole background, text just render the area behind the cursor for blinking the texxt cursor
                ctx.putImageData(behindTheCursor, theTextCursorCoords[0], theTextCursorCoords[1]) 
            }
            else if (blinkCycleFrame === 60) {
                blinkCycleFrame = 0
            }

            blinkCycleFrame++
            frameNumber++

            console.log('frame #')
            // console.log('blinkCycleFrame#:', blinkCycleFrame)
            // await sleep(500)
        }
        main()
    }
}

