import * as Global from '../helpers/global.js';

const getValue = (element, column, row, defaultValue) => {
    let value = defaultValue;
    //get at column
    if(Array.isArray(element)){
        const colElement = element[column] || element[element.length-1];

        if(Array.isArray(colElement)){
            const rowElement = colElement[row];
            !Array.isArray(rowElement)? value = rowElement: null;
        }else {
            value = colElement;
        }
    }else {
        value = element;
    }
    
    if(value){
        return value;
    }else {
        return defaultValue;
    }
};

const DrawCell = (dv, ctx, positions, properties, rect, column, row, columnWidth) => {
    //
    const align = getValue(properties.align, column, row, "center");

    const fill = properties.fill || {};
    let fillColor = getValue(fill.color, column, row, "transparent");

    const line = properties.line || {};
    const lineWidth = isNaN(line.width)? 1: line.width;
    const halfLineWidth = lineWidth? lineWidth/2: lineWidth;
    const lineColor = line.color || "black";

    ctx.beginPath();
    ctx.fillStyle = fillColor || "transparent";
    ctx.fillRect((rect.x + halfLineWidth), (rect.y + halfLineWidth), (rect.width-lineWidth), (rect.height-lineWidth));


    if(lineWidth){
        ctx.beginPath();
        ctx.fillStyle = "transparent";
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;

        positions.forEach((pos, index) => {
            if(index){
                ctx.lineTo(pos.x, pos.y);
            }else {
                ctx.moveTo(pos.x, pos.y);
            }
        });

        ctx.stroke();
    }

    //draw text
    const center = properties.center;

    const font = properties.font || {};

    
    let fontSize = getValue(font.size, column, row, 12);;
    let family = getValue(font.family, column, row, "Arial");
    let fontWeight = getValue(font.weight, column, row, "normal");
    let fontStyle = getValue(font.style, column, row, "normal");
    let fontColor = getValue(font.color, column, row, "black");

    const value = Global.shortenText(properties.value, ((columnWidth-(lineWidth*2))/fontSize));
    
    ctx.beginPath();
    ctx.fillStyle = fontColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = align;
    ctx.font = fontStyle + " " + fontWeight + " " + fontSize +"px "+ family;

    ctx.fillText(value, center.x, center.y);

};

export default DrawCell;