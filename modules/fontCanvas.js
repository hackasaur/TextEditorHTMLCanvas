export const areFontsSame = (font1, font2) => {
    let sameFont = (
        font1.color === font2.color
        && font1.style === font2.style
        && font1.size === font2.size
    )
    return sameFont
}

export const getFontHeight = (ctx) => {
    return ctx.measureText(' ').fontBoundingBoxAscent
}

export const getCharacterWidth = (ctx, character) => {
    return ctx.measureText(character).width
}

export const setCanvasFont = (ctx, font) => {
    ctx.fillStyle = `${font.color}`
    ctx.font = `${font.size}px ${font.font}`
}