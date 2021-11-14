export const createPoint = (x, y) => {
    let point = new Int8Array(2)
    point = [x, y]
    return point
}

export const setCanvasFont = (ctx, font) => {
    ctx.fillStyle = `${font.color}`
    ctx.font = `${font.size}px ${font.font}`
}

export const getFontHeight = (ctx) => {
    return ctx.measureText('l').fontBoundingBoxAscent
}

export const getCharacterWidth = (ctx, character) => {
    return ctx.measureText(character).width
}

export const isPointInsideBox = (point, topLeftCoords, bottomRightCoords) => {
            return (
                point[0] >= topLeftCoords[0] && 
                point[0] <= bottomRightCoords[0] && 
                point[1] >= topLeftCoords[1] && 
                point[1] <= bottomRightCoords[1])
        }


export const isPointInsideBox2 = (point, topLeftCoords, width, height) => {
            return (
                point[0] >= topLeftCoords[0] && 
                point[0] <= topLeftCoords[0] + width && 
                point[1] >= topLeftCoords[1] && 
                point[1] <= topLeftCoords[1] + height)
        }

export const paintBackground = (ctx, color, width, height) => {
    ctx.fillStyle = color
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height)
}