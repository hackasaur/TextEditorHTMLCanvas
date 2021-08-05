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

        carrot = (ctx) => {
            let carrotCoords = new Int8Array(2)

            return {
                updateState: () => {

                },
                draw: () => {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(carrotCoords[0], carrotCoords[1], carrotWidth, carrotHeight);
                },
                setCarrotCoords: (x, y) => {
                    carrotCoords = createPoint(x, y)
                },
                getCarrotCoords: () => {
                    return carrotCoords
                }
            }
        }

        text = (ctx) => {
            let textWithCoords = []

            return {
                updateState: () => { },
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
                    l = textWithCoords.length
                    if (l < 4) {
                        if (l !== 0) {
                            textWithCoords.splice(0, 3)
                        }
                    }
                    else {
                        textWithCoords.splice(textWithCoords.length - 4, 3)
                    }
                }
            }
        }

        const nonCharacterKeys = ['Backspace', 'Enter', 'Alt', 'AltGraph', 'Shift']

        let fontSize = 25
        let fontStyle = 'Fira Code'
        let fontColor = 'lightgreen'
        ctx.font = `${fontSize}px ${fontStyle}`
        let carrotWidth = fontSize/2
        let carrotHeight = fontSize
        let theCarrot = carrot(ctx)
        let theDocText = text(ctx)
        let frameNumber = 1
        let blink = 1

        canvas.addEventListener('mousedown', event => {
            if (event.button === 0) {
                theCarrot.setCarrotCoords(event.offsetX, event.offsetY)
                blink = 1
            }
        })

        window.addEventListener("keydown", event => {
            // event.preventDefault()
            let keyPressed = event.key
            console.log(keyPressed)
            let theCarrotCoords = theCarrot.getCarrotCoords()
            if (nonCharacterKeys.includes(keyPressed)) {
                if (keyPressed === 'Backspace') {
                    theDocText.backSpacePressed()
                    theCarrot.setCarrotCoords(theCarrotCoords[0] - fontSize, theCarrotCoords[1])
                }
            }
            else {
                theDocText.addCharacterInTextWithCoords(keyPressed, theCarrotCoords[0], theCarrotCoords[1] + carrotHeight)
                theCarrot.setCarrotCoords(theCarrotCoords[0] + fontSize, theCarrotCoords[1])
            }
        });

        function main() {
            if (frameNumber <= 5000) {
                window.requestAnimationFrame(main)
            }

            ctx.fillStyle = '#2c0b88';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            theDocText.draw()
            if (blink <= 30) {
                theCarrot.draw()
            }

            if (blink === 60) {
                blink = 1
            }

            blink++
            frameNumber++

            console.log('frame #')
            // console.log('blink #:', blink)
            // await sleep(500)
        }
        main()
    }
}
