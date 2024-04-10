import * as Global from './global.js';


const DrawHover = (dv, ctx, data) => {
    const hoverFillColor = "#000";
    ctx.beginPath();
    ctx.strokeStyle = hoverFillColor;

    if(data.type === "bar"){
        ctx.rect(data.x, data.y, data.width, data.height); // Fill
    }else if(data.type === "pie"){

    }else {
        ctx.arc(data.midPoint.x, data.midPoint.y, data.radius, 0, 2 * Math.PI);
    }

    ctx.stroke();
}

const DrawToolTip = (dv, ctx, pos, data) => {

    //draw hover
    DrawHover(dv, ctx, data);

    const labelStyle = dv.getStyle().label;
    const fontSize = labelStyle.fontSize;

    let labelTitle = data.labelTitle? data.labelTitle: null;
    let valueTitle = data.valueTitle? data.valueTitle: null;

    !data.labelTitleWidth && labelTitle? data.labelTitleWidth = ctx.measureText(labelTitle).width: null;
    !data.valueTitleWidth && valueTitle? data.valueTitleWidth = ctx.measureText(valueTitle).width: null;

    let label = data.label, value = data.value;

    !data.labelWidth? data.labelWidth = ctx.measureText(label).width: null;
    !data.valueWidth? data.valueWidth = ctx.measureText(value).width: null;

    const maxTextWidth = ctx.canvas.width * 0.15;
    const labelTitleWidth = Math.min(data.labelTitleWidth? data.labelTitleWidth: 0, maxTextWidth);
    const valueTitleWidth = Math.min(data.valueTitleWidth? data.valueTitleWidth: 0, maxTextWidth);

    //shorten labelTitle 
    if(labelTitle){
        const labelTitleCharSize = (data.labelTitleWidth/labelTitle.length);
        labelTitle = Global.shortenText(labelTitle, ((maxTextWidth)/labelTitleCharSize))+": ";
    }

    //shorten labelTitle 
    if(valueTitle){
        const valueTitleCharSize = (data.valueTitleWidth/valueTitle.length);
        valueTitle = Global.shortenText(valueTitle, ((maxTextWidth)/valueTitleCharSize))+": ";
    }

    //get label and value width
    const labelWidth = Math.min(data.labelWidth, maxTextWidth), valueWidth = Math.min(data.valueWidth, maxTextWidth);
   
    //shorten label
    const labelCharSize = (data.labelWidth/label.length);
    label = Global.shortenText(label, ((maxTextWidth)/labelCharSize));

    //sharten value
    const valueCharSize = (data.valueWidth/value.length);
    value = Global.shortenText(value, ((maxTextWidth)/valueCharSize));
    

    const labelText = (labelTitle? labelTitle: "")+label;
    const valueText =  (valueTitle? valueTitle: "")+value;

    const textWidth = (Math.max((labelTitleWidth+labelWidth), (valueTitleWidth+valueWidth))+(fontSize*2));
    const textHeight = (fontSize*3.5);
    
    // Calculate tooltip position
    let tooltipX = (pos.x+20);
    let tooltipY = (pos.y+20);
    
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
        tooltipX = (pos.x) - (tooltipWidth+20);
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
    ctx.fillText(labelText, (tooltipX+(fontSize/2)), tooltipY+(fontSize/2));

    //draw value text
    ctx.fillText(valueText, (tooltipX+(fontSize/2)), tooltipY+(fontSize*2));
}


const DisplayToolTip = (event, dv, position) => {
    if(dv && position){
        const ctx = dv.getCtx();

        
        var rect = ctx.canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        dv.updateTargetCanvas();

        const toolTipData = dv.getToolTipData();

        const currentRect = {x: x, y: y, width: 1, height: 1};

        for (let i = 0; i < toolTipData.length; i++) {
            const data = toolTipData[i];

            const type = data.type;

            if(type === "bar"){

                if(Global.crashWithRect(currentRect, data)){
                    DrawToolTip(dv, ctx, {x: x, y: y}, data);
                    break;
                }
            }else if(type === "pie"){
                if(Global.crashWithAngle(currentRect, data)){
                    DrawToolTip(dv, ctx, {x: x, y: y}, data);
                    break;
                }
            }else {
                if(Global.crashWithCircle(currentRect, data)){
                    DrawToolTip(dv, ctx, {x: x, y: y}, data);
                    break;
                }
            }
            
        }

    }
};

export default DisplayToolTip;