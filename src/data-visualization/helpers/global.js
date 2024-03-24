
//adds event listeners
export function on(element, event, handler, eventAlt) {
    if (element && typeof element === 'object') {
        if (element.addEventListener) {

            if(!hasEvent(element, event, handler)){
                element.addEventListener(event, handler, false);
            }

            if (eventAlt && !hasEvent(element, eventAlt, handler)) {
                element.addEventListener(eventAlt, handler, false);
            }
        } else if (element.attachEvent) {
            if(!hasEvent(element, event, handler)){
                element.attachEvent('on' + event, handler);
            }

            if (eventAlt && !hasEvent(element, eventAlt, handler)) {
                element.attachEvent('on' + eventAlt, handler);
            }
        }
    }
}

//check if the event is already attached
function hasEvent(element, eventName, handler){
    return element._eventHandlers && element._eventHandlers[eventName] &&
    element._eventHandlers[eventName].includes(handler);
}


//get mouse position
export function getMousePosition(event){

    if(event){
        const target = event.target;

        const rect = target.getBoundingClientRect(); // Get the canvas bounding box

        // Calculate the mouse position relative to the canvas
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        return {x: mouseX, y: mouseY};
    }

    return null;
};


//plit graph title text
export function splitTitleText(dv, text) {
    const canvas = dv.getCanvas();
    const ctx = dv.getCtx();

    const style = dv.getStyle().title;

    const maxWidth = canvas.width;

    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    const fontSize = style.fontSize;
    ctx.font = style.fontWeight+" "+fontSize+"px "+style.fontFamily;

    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const testWidth = (ctx.measureText(testLine).width+fontSize);

        if (testWidth < maxWidth) {
            currentLine = testLine;
        } else {
            const currWidth = ctx.measureText(currentLine).width;

            lines.push(currentLine);
            currentLine = words[i];
        }
    }

    lines.push(currentLine);
    return lines;
}

//shorten text 
export function shortenText(text, maxLength){
    if (text.length > maxLength) {
        return text.substr(0, maxLength) + '..';
    }
    return text;
}

//get space for charts like line scatter and bar
export function getXSpace(dv, graphWidth){
    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const labelStyle = dv.getStyle().label;

    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

    //set initial space 
    let space = (fontSize*4);


    const barData = layout.barData;

    const categories = barData.barCategories;
    const catKeys = Array.from(categories.keys());

    const step = (graphWidth/catKeys.length);


    let widerTextSize = 0;

    for(var i = 0; i < catKeys.length; i++){

        const label = catKeys[i];

        //set text width
        const textWidth = ctx.measureText(label).width;

        if(textWidth >= step && textWidth > widerTextSize){
            widerTextSize = textWidth;
        }

    }

    return (space+widerTextSize);
    
}