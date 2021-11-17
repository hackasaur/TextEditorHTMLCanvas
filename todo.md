# todo
- [ ] add all the properties in return part of the function factories
    - so that instead of making a props object using .getProperties() you can write cursor.properties.coords which is more consistent
- [ ] enter should work
- text highlighting and copy-pasting
- textCursorWidth should be calculated from font
- text should be in a grid
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
*open*
- Control is typed out sometimes?
    - cannot reproduce
- combinations like ctrl + a-zA-Z types out the letter. should not type anything

*fixed*
- [x] cursor shifts more than the character width 
- [x] cursor does not align with text vertically when font size is changed
    - fixed by adding the difference of previous height of cursor and new height to y coord of the cursor
- [x] character drops below when backspaced
    -  changed textWithCoords.length - 3 instead of -4
- [x] text appears above text cursor
    - fillText draws above the y coordinate, so had to add lineHeight to the y

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