import * as Global from './global.js';
import * as Calc from './math.js';


const DrawHover = (dv, ctx, data) => {

    const canvasSize = dv.getCanvasSize();
    const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;
    
    ctx.beginPath();

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    const type = data.type;
    const point = data.point;

    if(type === "bar"){
        ctx.rect(point.x, point.y, point.width, point.height); // Fill
    }else if(type === "pie"){
        //draw arc line
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";

        const lineWidth = canvasWidth * 0.0063;
        ctx.lineWidth = lineWidth;
        
        ctx.arc(point.midPoint.x, point.midPoint.y, (point.radius-2), point.startAngle, point.endAngle);
    }else if(type === "line"){
        const hover = data.hover || {};
        
        ctx.strokeStyle = hover.color || "#000";
        ctx.fillStyle = hover.color || "transparent";
        ctx.arc(point.midPoint.x, point.midPoint.y, (point.radius+1), 0, 2 * Math.PI);
        ctx.fill();
    }else {
        ctx.arc(point.midPoint.x, point.midPoint.y, point.radius, 0, 2 * Math.PI);
    }

    ctx.stroke();
}

/*
const GetText = (dv, data, ctx, type, fontSize) => {
    if(!data[type] && data[type] !== 0) return {text: null, width: 0};

    const canvasSize = dv.getCanvasSize();
    const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;

    let text = data[type+"Text"];
    let textWidth = data[type+"Width"];

    const tickFormat = data.tickFormat? data.tickFormat[type] || {}: {};

    const prefix = (tickFormat.prefix || ""), suffix = (tickFormat.suffix || "");
    const decimalPlaces = tickFormat.decimalPlaces;
    const separateNumbers = tickFormat.separateNumbers;

    if(!textWidth){
        //set value
        let value = prefix + Calc.commaSeparateNumber(Calc.toFixedIfNeeded(data[type], decimalPlaces), separateNumbers) + suffix;

        //shorten value
        const valueWidth = ctx.measureText(value).width;
        const maxValueWidth = valueWidth > canvasWidth? (canvasWidth*0.9): valueWidth;
        
        const valueCharSize = (valueWidth/value.length);
        value = Global.shortenText(value, ((maxValueWidth)/valueCharSize));

        //set title
        let name = data[type+"Name"];
        if(name){
            //shorten title
            const titleWidth = ctx.measureText(name).width;
            const maxTitleWidth = ((canvasWidth-maxValueWidth)-fontSize) || 0;

            const titleCharSize = (titleWidth/name.length);
            name = Global.shortenText(name, ((maxTitleWidth)/titleCharSize))+": ";
        }

        //set percent
        const percent = data.percent && type === "value"? " ("+data.percent+"%)": "";

        text = (name? name+" ": "") + value + percent;
        textWidth = ctx.measureText(text).width;
    }

    data[type+"Text"] = text;
    data[type+"Width"] = textWidth;

    return {text: text, width: textWidth};
}


const DrawToolTip = (dv, ctx, pos, data) => {

    const canvasSize = dv.getCanvasSize();
    const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;

    //draw hover
    DrawHover(dv, ctx, data);

    const design = dv.getDesign();
    const font = design.font;

    const fontSize = font.size;
    const halfFontSize = fontSize/2;

    const label = GetText(dv, data, ctx, "label", fontSize);
    const value = GetText(dv, data, ctx, "value", fontSize);
    const size = GetText(dv, data, ctx, "size", fontSize);


    const textWidth = (Math.max(label.width, value.width, size.width)+(fontSize));
    const textHeight = (fontSize*(size.text? 5: 3.5));
    
    // Calculate tooltip position
    let tooltipX = (pos.x+20);
    let tooltipY = (pos.y+25);
    
    // Draw a rectangle (tooltip with border)
    const tooltipWidth = textWidth;
    const tooltipHeight = textHeight;
    const tooltipBorderWidth = 1;
    const tooltipBorderColor = "#b5b5b5";
    const tooltipFillColor = "#fff";

    const positionRight = (tooltipX+tooltipWidth);
    const positionBottom = (tooltipY+tooltipHeight);

    //keep tool tip on canvas
    if(positionRight > canvasWidth){
        if(((tooltipWidth+fontSize)+20) < (pos.x)){
            tooltipX = (pos.x) - (tooltipWidth+20);
        }else {
            tooltipX = (pos.x+20) - ((positionRight-canvasWidth));
        }
    }

    if(positionBottom > canvasHeight){
        tooltipY = (pos.y) - (tooltipHeight+20);
    }

    ctx.beginPath();

    ctx.fillStyle = tooltipBorderColor;
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight); // Border

    ctx.beginPath();
    ctx.fillStyle = tooltipFillColor;
    ctx.fillRect(tooltipX + tooltipBorderWidth, tooltipY + tooltipBorderWidth, tooltipWidth - 2 * tooltipBorderWidth, tooltipHeight - 2 * tooltipBorderWidth); // Fill

    // Draw text (tooltip)
    ctx.beginPath();
    ctx.fillStyle = font.color;
    ctx.font = font.weight + " " + fontSize+'px ' + font.family;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    //ctx.fillText(text, (tooltipX+(textWidth/2)), tooltipY+(textHeight/2));

    //draw label text
    ctx.fillText(label.text, (tooltipX+halfFontSize), tooltipY+(halfFontSize));

    //draw value text
    ctx.fillText(value.text, (tooltipX+halfFontSize), tooltipY+(fontSize*2));

    //draw size text
    size.text? ctx.fillText(size.text, (tooltipX+halfFontSize), tooltipY+(fontSize*3)+(halfFontSize)): null;
} */

const ShowToolTipNot = (dv, ctx, pos, data) => {

    //draw hover
    DrawHover(dv, ctx, data);

    const design = dv.getDesign();
    const font = design.font;

    const fontSize = font.size;
    const halfFontSize = fontSize/2;

    const target = dv.getTarget();
    const toolTipCard = target.getElementById("dv_tooltip");

    if(!toolTipCard){
        toolTipCard = document.createElement("div");
        toolTipCard.setAttribute("id", "dv_tooltip");
        toolTipCard.setAttribute("style", 
        "position: absolute, padding: 10px, background-color: white; display: block, font-size: " + fontSize);
    }

    data.text.map((textObj) => {
        const container = document.createElement("div");
        const nameEl = document.createElement("span");
        const valueEl = document.createElement("span");

        nameEl.appendChild(textObj.name);
        valueEl.appendChild(textObj.valaue);

        //add to container
        container.appendChild(nameEl);
        container.appendChild(valueEl);

        //add to toolTipCard 
        toolTipCard.appendChild(container);
    });

    
    
}

const ShowToolTip = (dv, ctx, pos, data) => {
    // Draw hover effect
    DrawHover(dv, ctx, data);

    const design = dv.getDesign();
    const fontSize = design.font.size;
    const target = dv.getTarget();
    
    let toolTipCard = target.querySelector("#dv_tooltip");

    // Create tooltip if it doesn't exist
    if (!toolTipCard) {
        toolTipCard = document.createElement("div");
        toolTipCard.setAttribute("id", "dv_tooltip");
        toolTipCard.setAttribute("style", `
            position: absolute;
            padding: 10px;
            background-color: white;
            display: block;
            font-size: ${fontSize}px;
            border: 1px solid #ccc;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
            pointer-events: none;  /* Makes tooltip non-interactable */
            z-index: 1000;
        `);
        target.appendChild(toolTipCard);  // Append to document
    }

    // Clear previous content
    toolTipCard.innerHTML = '';

    // Add content to tooltip
    data.text.forEach((textObj) => {
        const container = document.createElement("div");
        const nameEl = document.createElement("span");
        const valueEl = document.createElement("span");

        nameEl.textContent = textObj.name; // Create text content
        valueEl.textContent = textObj.value;

        // Style name and value elements
        nameEl.style.fontWeight = "bold";
        valueEl.style.marginLeft = "5px";

        // Add to container
        container.appendChild(nameEl);
        container.appendChild(valueEl);

        // Add to tooltip
        toolTipCard.appendChild(container);
    });

    // Adjust tooltip position to ensure it's within the viewport
    const tooltipWidth = toolTipCard.offsetWidth;
    const tooltipHeight = toolTipCard.offsetHeight;

    // Set initial position based on `pos`
    let tooltipX = pos.x + 10;  // Offset by 10 pixels
    let tooltipY = pos.y + 10;  // Offset by 10 pixels

    // Ensure the tooltip doesn't overflow horizontally
    if (tooltipX + tooltipWidth > window.innerWidth) {
        tooltipX = pos.x - tooltipWidth - 10;  // Flip to the left side
    }

    // Ensure the tooltip doesn't overflow vertically
    if (tooltipY + tooltipHeight > window.innerHeight) {
        tooltipY = pos.y - tooltipHeight - 10;  // Move upwards
    }

    // Apply final tooltip position
    toolTipCard.style.left = `${tooltipX}px`;
    toolTipCard.style.top = `${tooltipY}px`;

    // Show the tooltip
    toolTipCard.style.display = 'block';
};



const DisplayToolTip = (event, dv, position) => {
    if(dv && position){
        const ctx = dv.getCtx();
        const target = dv.getTarget();
        
        var rect = ctx.canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        dv.updateTargetCanvas();

        const toolTipData = [...dv.getToolTipData()].reverse();

        const currentRect = {x: x, y: y, width: 1, height: 1};

        let closestData = null;

        //hide tooltip 
        let toolTipCard = target.querySelector("#dv_tooltip");
        toolTipCard? toolTipCard.style.display = "none": null;

        for (let i = 0; i < toolTipData.length; i++) {
            const data = toolTipData[i];

            const type = data.type;

            if(type === "bar"){
                if(Global.crashWithRect(currentRect, data.point)){
                    ShowToolTip(dv, ctx, {x: x, y: y}, data);
                    closestData = null;
                    break;
                }
            }else if(type === "pie"){
                if(Global.crashWithAngle(currentRect, data.point)){
                    ShowToolTip(dv, ctx, {x: x, y: y}, data);
                    closestData = null;
                    break;
                }
            }else {

                if(Global.crashWithCircle(currentRect, data.point)){
                    ShowToolTip(dv, ctx, {x: x, y: y}, data);
                    closestData = null;
                    break;
                }else {

                    const newPoint = Global.crashWithDistance(currentRect, data.point, 22);
                    if(newPoint){
                        if(closestData){
                            if(closestData.point.dist > newPoint.dist){
                                closestData = {...data, point: {...newPoint}};
                            }
                        }else {
                            closestData = {...data, point: {...newPoint}};
                        }
                    }

                }
            }
            
        }

        if(closestData){
            ShowToolTip(dv, ctx, {x: x, y: y}, closestData);
        }

    }
};

export default DisplayToolTip;