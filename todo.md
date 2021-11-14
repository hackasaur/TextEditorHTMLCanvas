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
- [x] cursor shifts more than the character width 
- [x] cursor does not align with text vertically when font size is changed
    - fixed by adding the difference of previous height of cursor and new height to y coord of the cursor

# features
- have vim key bindings
- freestyle mouse highlight text 
- draw mode
- minimalistic and easy to customize
- design for touchscreen devices
- timelapse code

# notes
start typing text from text cursor's current position 

fontObject
{fontSize, fontStyle, fontColor}

fontChanged? should check whether font is same to previous in the line.addCharacter()?