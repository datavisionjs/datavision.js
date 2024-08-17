import * as Global from './global.js';
import * as Calc from './math.js';


const DrawHover = (dv, ctx, data) => {
    
    ctx.beginPath();

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    if(data.type === "bar"){
        ctx.rect(data.x, data.y, data.width, data.height); // Fill
    }else if(data.type === "pie"){
        //draw arc line
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";

        const lineWidth = ctx.canvas.width * 0.0063;
        ctx.lineWidth = lineWidth;
        
        ctx.arc(data.midPoint.x, data.midPoint.y, (data.radius-2), data.startAngle, data.endAngle);
    }else if(data.type === "line"){
        ctx.strokeStyle = data.color || "#000";
        ctx.fillStyle = data.color || "transparent";
        ctx.arc(data.midPoint.x, data.midPoint.y, (data.radius+1), 0, 2 * Math.PI);
        ctx.fill();
    }else {
        ctx.arc(data.midPoint.x, data.midPoint.y, data.radius, 0, 2 * Math.PI);
    }

    ctx.stroke();
}

const GetText = (data, ctx, type, fontSize) => {
    if(!data[type] && data[type] !== 0) return {text: null, width: 0};

    const canvasWidth = ctx.canvas.width;

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

    //draw hover
    DrawHover(dv, ctx, data);

    const labelStyle = dv.getStyle().label;
    const fontSize = labelStyle.fontSize;
    const halfFontSize = fontSize/2;

    const label = GetText(data, ctx, "label", fontSize);
    const value = GetText(data, ctx, "value", fontSize);
    const size = GetText(data, ctx, "size", fontSize);


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
    if(positionRight > ctx.canvas.width){
        if(((tooltipWidth+fontSize)+20) < (pos.x)){
            tooltipX = (pos.x) - (tooltipWidth+20);
        }else {
            tooltipX = (pos.x+20) - ((positionRight-ctx.canvas.width));
        }
    }

    if(positionBottom > ctx.canvas.height){
        tooltipY = (pos.y) - (tooltipHeight+20);
    }

    ctx.beginPath();

    ctx.fillStyle = tooltipBorderColor;
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight); // Border

    ctx.fillStyle = tooltipFillColor;
    ctx.fillRect(tooltipX + tooltipBorderWidth, tooltipY + tooltipBorderWidth, tooltipWidth - 2 * tooltipBorderWidth, tooltipHeight - 2 * tooltipBorderWidth); // Fill

    // Draw text (tooltip)
    ctx.fillStyle = '#000';
    ctx.font = fontSize+'px Arial';
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    //ctx.fillText(text, (tooltipX+(textWidth/2)), tooltipY+(textHeight/2));

    //draw label text
    ctx.fillText(label.text, (tooltipX+halfFontSize), tooltipY+(halfFontSize));

    //draw value text
    ctx.fillText(value.text, (tooltipX+halfFontSize), tooltipY+(fontSize*2));

    //draw size text
    size.text? ctx.fillText(size.text, (tooltipX+halfFontSize), tooltipY+(fontSize*3)+(halfFontSize)): null;
}


const DisplayToolTip = (event, dv, position) => {
    if(dv && position){
        const ctx = dv.getCtx();

        
        var rect = ctx.canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        dv.updateTargetCanvas();

        const toolTipData = [...dv.getToolTipData()].reverse();

        const currentRect = {x: x, y: y, width: 1, height: 1};

        let closestData = null;

        for (let i = 0; i < toolTipData.length; i++) {
            const data = toolTipData[i];

            const type = data.type;

            if(type === "bar"){

                if(Global.crashWithRect(currentRect, data)){
                    DrawToolTip(dv, ctx, {x: x, y: y}, data);
                    closestData = null;
                    break;
                }
            }else if(type === "pie"){
                if(Global.crashWithAngle(currentRect, data)){
                    DrawToolTip(dv, ctx, {x: x, y: y}, data);
                    closestData = null;
                    break;
                }
            }else {

                if(Global.crashWithCircle(currentRect, data)){
                    DrawToolTip(dv, ctx, {x: x, y: y}, data);
                    closestData = null;
                    break;
                }else {

                    const newClosestData = Global.crashWithDistance(currentRect, data, 22);
                    if(newClosestData){
                        if(closestData){
                            if(closestData.dist > newClosestData.dist){
                                closestData = newClosestData;
                            }
                        }else {
                            closestData = newClosestData;
                        }
                    }

                }
            }
            
        }

        if(closestData){
            DrawToolTip(dv, ctx, {x: x, y: y}, closestData.data);
        }

    }
};

export default DisplayToolTip;