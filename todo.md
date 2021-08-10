# todo
- textCursorWidth should be calculated from font
- text should be in a grid
- enter should work
- text highlighting and copy-paste should be possible
- change text cursor shape
- auto-indent
- indent based folding
- split window
- find regex
- character-level text formatting
- undo/redo
- cursor width and height

# bugs
- Control is typed out sometimes?
    - cannot reproduce
- [x] character drops below when backspaced [fixed]
    -  changed textWithCoords.length - 3 instead of -4
- [x] text appears above text cursor
    - fillText draw above the y coordinate, so had to add lineHeight to the y
- [ ] cursor shit more thn the character width 

# features
- have vim key bindings
- freestyle mouse highlight text 
- draw mode
- minimalistic and easy to customize
- design for touchscreen devices

# notes
start typing text from text cursor's current position 

fontObject
{fontSize, fontStyle, fontColor}

fontChanged? should check whether font is same to previous in the line.addCharacter()?