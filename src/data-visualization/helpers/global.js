import * as Calc from './math.js';

//get axis chart types 
export function getAxisChartTypes(){
    return ["line", "bar", "scatter", "bubble"];
}

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
        return text.substr(0, maxLength > 3? (maxLength-2): maxLength) + '..';
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

//checks if a degree is between two degrees
function isDegreeBetween(degree, minDegree, maxDegree) {
    // Normalize degree, minDegree, and maxDegree to be between 0 and 360
    degree = (degree + 360) % 360;
    minDegree = (minDegree + 360) % 360;
    maxDegree = (maxDegree + 360) % 360;

    // Check if minDegree <= degree <= maxDegree
    if (minDegree <= maxDegree) {
        return degree >= minDegree && degree <= maxDegree;
    } else {
        // Wrap around case where minDegree > maxDegree
        return degree >= minDegree || degree <= maxDegree;
    }
}


//crashing 
export function crashWithRect(rect, target){
    const targetX = target.width >= 0? target.x: (target.x+target.width);
    const targetY = target.height >= 0? target.y: (target.y+target.height);

    const targetWidth = Math.abs(target.width);
    const targetHeight = Math.abs(target.height);

    // Check if the rectangles collide
    if (rect.x < targetX + targetWidth &&
        rect.x + rect.width > targetX &&
        rect.y < targetY + targetHeight &&
        rect.y + rect.height > targetY) {
        // Collision detected
        return true;
    } else {
        // No collision detected
        return false;
    }
}

export function crashWithCircle(rect, target){
    const radius = target.radius;
    const midPoint = target.midPoint;

    if(Calc.distance(rect, midPoint) <= radius){
        return true;
    }else {
        return false;
    }
}

export function crashWithDistance(rect, target, tolerace){
    const radius = Math.max(target.radius, tolerace);
    const newTarget = {midPoint: target.midPoint, radius: radius};

    const distance = Calc.distance(rect, target.midPoint);

    if(crashWithCircle(rect, newTarget)){
        return {dist: distance, data: target};
    }else {
        return false;
    }
}


export function crashWithAngle(rect, target){
    const holeTarget = {radius: target.holeRadius, midPoint: target.midPoint};

    if(crashWithCircle(rect, target) && !crashWithCircle(rect, holeTarget)){
        
        const startDeg = target.startDegrees > 0? target.startDegrees: (target.startDegrees+360);
        const midPoint = target.midPoint;
        const endDeg = target.endDegrees > 0? target.endDegrees: (target.endDegrees+360);;

        const rectDeg = Calc.angleBetweenPoints(midPoint, rect);

        if(isDegreeBetween(rectDeg, startDeg, endDeg)){
            return true;
        }else {
            return false;
        }
        
    }else {
        return false;
    }
}
