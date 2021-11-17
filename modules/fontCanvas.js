export const areFontsSame = (font1, font2) => {
    let sameFont = (
        font1.fontColor === font2.fontColor
        && font1.fontStyle === font2.fontStyle
        && font1.fontSize === font2.fontSize
    )
    return sameFont
}

export const getFontHeight = (ctx) => {
    return ctx.measureText('l').fontBoundingBoxAscent
}

export const getCharacterWidth = (ctx, character) => {
    return ctx.measureText(character).width
}

export const setCanvasFont = (ctx, font) => {
    ctx.fillStyle = `${font.color}`
    ctx.font = `${font.size}px ${font.font}`
}