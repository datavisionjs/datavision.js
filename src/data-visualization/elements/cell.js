import * as Global from '../helpers/global.js';
import * as Calc from '../helpers/math.js';

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

const DrawCell = (ctx, positions, properties, rect, column, row, columnWidth) => {
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
    
    ctx.beginPath();
    ctx.fillStyle = fontColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = align;
    ctx.font = fontStyle + " " + fontWeight + " " + fontSize +"px "+ family;

    const isNumeric = properties.isNumeric || false;
    const range = properties.range || [0, 0];
    const format = properties.format || {};
    
    const isYearSeries = Calc.isYearSeries(range);
    if(!format.separateNumbers){
        format.separateNumbers = !isYearSeries;
    }
    if(format.abbreviate) {
        format.abbreviate = !isYearSeries;
    }

    const value = ((isNumeric && Global.numberFormat(properties.value, format)) || properties.value) || "";

    const valueWidth = ctx.measureText(value).width;
    const valueCharSize = (valueWidth/value.length);

    const newValue = Global.shortenText(value, ((columnWidth-(lineWidth*2))/valueCharSize));

    ctx.fillText(newValue, center.x, center.y);

};

export default DrawCell;