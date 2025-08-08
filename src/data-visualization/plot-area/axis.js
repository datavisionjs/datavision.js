//Contains functions for rendering and formatting axis, ticks, and labels.

import * as Global from '../helpers/global.js';
import * as Calc from '../helpers/math.js';
import * as Scroll from './scrollbar.js';



function drawLabels(dv, ctx, position){
    const layout = dv.getLayout();

    const design = dv.getDesign();
    const font = design.font;

    const canvasSize = dv.getCanvasSize();
    const canvasHeight = canvasSize.height;

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    const yAxisRight = position.yAxisRight;

    let yAxis = layout.yAxis;
    let y2Axis = layout.y2Axis;

    let xAxis = layout.xAxis;

    const scrollBarSize = Scroll.getBarSize(dv);

    //set text alignment
    ctx.textAlign = 'center'; 

    //set fontsize for yAxis and xAxis texts 
    const fontSize = font.size;
    ctx.font = font.weight + " " + font.style + " " + fontSize+ "px "+ font.family;

    if(yAxis){

        let title = yAxis.title;

        if(title){
            ctx.beginPath();
            ctx.fillStyle = font.color;

            let angleInRadians = (-90 * (Math.PI/180));

            //save the current canvas state
            ctx.save();

            // Translate the canvas context to the desired position
            ctx.translate(fontSize, (graphY+(graphHeight/2)));

            // Rotate the canvas context by the specified angle
            ctx.rotate(angleInRadians);

            // Draw the rotated text
            ctx.fillText(title, 0, 0); // (0, 0) is the position relative to the translated and rotated context

            ctx.restore();
        }
    }

    if(y2Axis){


        let title = y2Axis.title;

        if(title){
            ctx.beginPath();
            ctx.fillStyle = font.color;

            let angleInRadians = (-90 * (Math.PI/180));

            //save the current canvas state
            ctx.save();

            // Translate the canvas context to the desired position
            ctx.translate(((graphX+graphWidth+yAxisRight)-fontSize), (graphY+(graphHeight/2)));

            // Rotate the canvas context by the specified angle
            ctx.rotate(angleInRadians);

            // Draw the rotated text
            ctx.fillText(title, 0, 0); // (0, 0) is the position relative to the translated and rotated context

            ctx.restore();
        }
    }

    if(xAxis){

        let title = xAxis.title;

        if(title){
            ctx.beginPath();
            ctx.fillStyle = font.color;
            
            ctx.fillText(title, ((graphX+(graphWidth/2))), (canvasHeight-(fontSize*0.5)));
        }
    }
}

function drawYAxis(dv, ctx, position, isPercent){

    const scrollData = dv.getScrollData();

    const layout = dv.getLayout();

    const design = dv.getDesign();
    const yAxisDesign = design.yAxis;
    const font = yAxisDesign.font;
    const gridDesign = yAxisDesign.grid;
    const gridTick0Design = gridDesign.tick0;

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    //get the data type of the dataset
    //const firstDataType = layout.firstDataType;

    //const ranges = layout.ranges;
    //let range = ranges.yRange;
    
    const fontSize = font.size;
    ctx.font = font.weight + " " + font.style + " " + fontSize+ "px "+ font.family;

    let axisX = graphX;
    let axisY = graphY+graphHeight;

    //set axisData
    const axisData = layout.axisData;
    const isHorizontal = axisData.direction === "hr";

    const axisValues = axisData.yData;

    for(let key in axisValues){
        const axis = axisValues[key];
        if(!axis.display) continue;

        const values = axis.values;
        const maxLabelWidth = position.maxLabelWidth[key];

        if(axis.isNumeric){
            const tickData = axis.tickData;

            //const maxDist = 7;

            //const ranges = layout.ranges;

            values.sort((a, b) => a - b);

            //let range = ranges? isHorizontal? ranges.labelRange: ranges.valueRange: dataRange;
            let range = axis.range;
            
            if(range){

                const format = axis.tickFormat || {};
                isPercent && !isHorizontal? format.suffix = "%": null;
                
                const step = tickData.interval;

                const rangeStart = range[0];
                //let valueStart = Calc.getClosest(rangeStart, Calc.tickStep(rangeStart, true), Calc.tickStep(rangeStart));
                let valueStart = Math.ceil(rangeStart / step) * step;
                //const valueStart = step * Math.round(rangeStart / step);
                //valueStart = Calc.getClosest(rangeStart, 0, Calc.tickStep(rangeStart));

                let dist = tickData.count;

                let pixelStep = (graphHeight/dist);
                pixelStep < 1? pixelStep = 1: null;

                let value = 0;

                let iterator = 1;

                //set iterator to 2 if the highest label length is 2 times the size of the step
                fontSize > pixelStep? iterator += Math.round(fontSize/pixelStep): null;

                for(let i = 0; i <= dist; i += iterator){

                    //value = prefix + Calc.commaSeparateNumber(Calc.toFixedIfNeeded((rangeStart)+(step*i), format.decimalPlaces), separateNumbers) + suffix;
                    
                    const rawValue = (valueStart)+(step*i);
                    value = Global.numberFormat(rawValue, format);
                    //axisY = ((graphY+graphHeight)-(pixelStep*i));
                    axisY = Calc.posOnGraphYAxis(dv, rawValue, key);

                    //set text width
                    const textWidth = ctx.measureText(value).width;
                    
                    const textPosX = "y2" === key? ((axisX+graphWidth)+fontSize): ((axisX-textWidth)-(fontSize));
                    //const textPosY = (axisY+Math.floor(fontSize/2));

                    //draw grid
                    ctx.beginPath();
                    ctx.strokeStyle = rawValue === 0? gridTick0Design.color: gridDesign.color;
                    ctx.lineWidth = rawValue === 0? gridTick0Design.width: gridDesign.width;

                    if("y2" === key){
                        ctx.moveTo((graphX+graphWidth), axisY);
                        ctx.lineTo(((graphX+graphWidth)+(fontSize/2)), (axisY));
                    }else {
                        ctx.moveTo((graphX+graphWidth), axisY);
                        ctx.lineTo((graphX-(fontSize/2)), (axisY));
                    }

                    ctx.stroke();
                    ctx.closePath();
                    
                    //add xAxis range labels
                    ctx.beginPath();
                    ctx.fillStyle = font.color;
                    ctx.textBaseline = "middle";
                    ctx.fillText(value, textPosX, axisY);
                }
            }

        }else {
            //const maxTextWidth = barData.maxTextWidth;
            
            const maxValueWidth = axis.maxWidth;

            let step = (graphHeight/values.length);
            step < fontSize? step = fontSize: null;
    
            let iterator = 1;

            //set iterator to 2 if the highest label length is 2 times the size of the step
            fontSize > step? iterator += Math.round(fontSize/step): null;

            const topIndex = Math.floor(scrollData.topIndex||0);
            
            const maxStep = Math.ceil(scrollData.topIndex+(graphHeight/fontSize));
            const loopEnd = maxStep < values.length? maxStep: values.length;
            
            for(var i = topIndex; i < loopEnd; i += iterator){
    
                //axisY = ((graphY+graphHeight)-((step/2)+(step*(i-scrollData.topIndex))));
                axisY = ((graphY)+((step/2)+(step*(i-scrollData.topIndex))));

                
    
                let value = values[i]+"";
               
                const valueWidth = ctx.measureText(value).width;
                const valueCharSize = (valueWidth/value.length);

                if(maxValueWidth > (maxLabelWidth-fontSize)){
                    value = Global.shortenText(value, ((maxLabelWidth-fontSize)/valueCharSize));
                }

                const textPosX = "y2" === key? ((axisX+graphWidth)+fontSize): (axisX-(fontSize));
                const textPosY = (axisY);

                //add xAxis range labels
                ctx.beginPath();
                ctx.fillStyle = font.color;
                ctx.textAlign = "y2" === key? "start":"end";
                ctx.textBaseline = "middle";
    
                // Draw the rotated text
                ctx.fillText(value, textPosX, textPosY);
    
                ctx.textAlign = "start";
                ctx.textBaseline = "alphabetic";
        
            }
            
        }
    }


}

function drawXAxis(dv, ctx, position, isPercent){

    const layout = dv.getLayout();
    const scrollData = dv.getScrollData();


    const design = dv.getDesign();
    const xAxisDesign = design.xAxis;
    const font = xAxisDesign.font;
    const gridDesign = xAxisDesign.grid;
    const gridTick0Design = gridDesign.tick0;

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    //get the data type of the dataset
    //const firstDataType = layout.firstDataType;

    const fontSize = font.size;
    ctx.font = font.weight + " " + font.style + " " + fontSize+ "px "+ font.family;

    ctx.textBaseline = "hanging";
    

    let axisX = 0;
    let axisY = (graphY+graphHeight);

    //set barData
    const axisData = layout.axisData;
    const isHorizontal = axisData.direction === "hr";

    const labels = axisData.xData;
    
    for(let key in labels){
        const axis = labels[key];
        if(!axis.display) continue;

        const values = axis.values;
        const maxLabelWidth = position.maxLabelWidth[key];

        if(axis.isNumeric){
            const tickData = axis.tickData;

            values.sort((a, b) => a - b);

            let range = axis.range;

            if(range){

                const format = axis.tickFormat || {};
                isPercent && isHorizontal? format.suffix = "%": null;
                //const prefix = (format.prefix || ""), suffix = (format.suffix || "");
                //const separateNumbers = format.separateNumbers;

                const rangeStart = range[0];
                const rangeEnd = range[1];

                const step = tickData.interval;


                let dist = tickData.count;

                let pixelStep = (graphWidth/dist);
                pixelStep < 1? pixelStep = 1: null;

                let valueStart = Math.ceil(rangeStart / step) * step;

                let label = 0;

                //get max label width 
                const maxLabelWidth = ctx.measureText(rangeEnd).width;

                let iterator = 1;
                
                //set iterator to 2 if the highest label length is 2 times the size of the step
                maxLabelWidth > pixelStep? iterator += Math.round(maxLabelWidth/pixelStep): null;

                ctx.textAlign = "center";

                for(let i = 0; i <= dist; i += iterator){

                    //label = prefix + Calc.commaSeparateNumber(Calc.toFixedIfNeeded((rangeStart)+(step*i), format.decimalPlaces), separateNumbers) + suffix;
                    const rawLabel = (valueStart)+(step*i);
                    label = Global.numberFormat(rawLabel, format);

                    //label = Calc.commaSeparateNumber(Calc.toFixedIfNeeded((rangeStart)+(step*i)));
                    //axisX = (graphX+(pixelStep*i));
                    axisX = Calc.posOnGraphXAxis(dv, rawLabel, key);


                    //set text width
                    const textWidth = ctx.measureText(label).width;

                    const textPosX = (axisX);
                    const textPosY = (axisY+(fontSize));

                    //draw grid 
                    ctx.beginPath();
                    ctx.strokeStyle = rawLabel === 0? gridTick0Design.color: gridDesign.color;
                    ctx.lineWidth = rawLabel === 0? gridTick0Design.width: gridDesign.width;

                    ctx.moveTo(axisX, graphY);
                    ctx.lineTo(axisX, ((graphY+graphHeight)+(fontSize/2)));
                    ctx.stroke();
                    ctx.closePath();
                    

                    //add xAxis range labels
                    ctx.beginPath();
                    ctx.fillStyle = font.color;
                    ctx.fillText(label, textPosX, textPosY);

                }
            }

        }else {
            const axisMaxWidth = axis.maxWidth;
            
            let step = (graphWidth/values.length);
            step < fontSize? step = fontSize: null;

            let iterator = 1;



            //set iterator to 2 if the highest label length is 2 times the size of the step
            //(maxLabelWidth/2) > step? iterator += Math.round((maxLabelWidth/2)/step): null;

            const leftIndex = Math.floor(scrollData.leftIndex||0);

            //axisX -= (fontSize*(scrollData.leftIndex-leftIndex));
            const maxStep = Math.ceil(leftIndex+(graphWidth/fontSize));
            const loopEnd = maxStep < values.length? maxStep: values.length;

            for(var i = leftIndex; i < loopEnd; i += iterator){

                axisX = (graphX+((step/2)+(step*(i-scrollData.leftIndex))));

                //set text width
                //const textWidth = ctx.measureText(label).width;

                let textPosX = (axisX);
                const textPosY = (axisY+(fontSize));

                //add xAxis range labels
                ctx.beginPath();
                ctx.fillStyle = font.color;
                ctx.textAlign = "center";
                //ctx.textBaseline = "middle";

                let label = values[i]+"";

                let angle = 0;

                const labelWidth = ctx.measureText(label).width;
                const labelCharSize = (labelWidth/label.length);

                if((step/fontSize) < 4){
                    const textMax = ((maxLabelWidth-(fontSize*1.5))/labelCharSize);
                    label = Global.shortenText(label, textMax);

                    angle = -90
                    textPosX = axisX;

                    ctx.textAlign = "end";
                    ctx.textBaseline = "middle";
                }else if(axisMaxWidth > step) {
                    label = Global.shortenText(label, (step/labelCharSize));
                }

                let angleInRadians = (angle * (Math.PI/180));

                //save the current canvas state
                ctx.save();

                // Translate the canvas context to the desired position
                ctx.translate(textPosX, textPosY);

                // Rotate the canvas context by the specified angle
                ctx.rotate(angleInRadians);

                // Draw the rotated text
                ctx.fillText(label, 0, 0);
            
                ctx.restore();
            }

        }
    }

    //reset text baselien
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";

}

const DrawAxis = (dv) => {
    const ctx = dv.getCtx();

    const canvasSize = dv.getCanvasSize();
    const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;

    const layout = dv.getLayout();

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;
    const graphWidth = graphPosition.width;
    const graphHeight = graphPosition.height;
    const graphX = graphPosition.x;
    const graphY = graphPosition.y;
    const xAxisMaxLabelWidth = graphPosition.maxLabelWidth["x1"];

    const design = dv.getDesign();
    const font = design.font;
    
    const fontSize = font.size;

    const position = {x: 0, y: graphY, width: (graphX+graphWidth), height: (graphHeight)};
    
    //clear axis area
    //ctx.clearRect(position.x, (graphY-fontSize), (position.width+fontSize), ((canvasHeight-graphY)+halfFontSize));
    //ctx.clearRect(position.x, (graphY-fontSize), (position.width+fontSize), canvasHeight);
    dv.clearCanvas(position.x, (graphY-fontSize), (position.width+fontSize), canvasHeight);
    dv.clearCanvas((position.width), (graphY+graphHeight), (canvasWidth-position.width), (canvasHeight-(graphY+graphHeight)));
    
    //set scroll content width and height
    Scroll.setContentSize(dv);

    //add axis scroll bar
    const scrollData = dv.getScrollData();

    const tempCanvas = dv.createCanvas(null, canvasWidth, canvasHeight);
    const tempCtx = tempCanvas.getContext("2d");

    const data = dv.getData()[0] || {};
    const isPercent = data.format === "percent";
    
    //Draw Y-axis, X-axis around the graph area
    drawXAxis(dv, tempCtx, graphPosition, isPercent);
    drawYAxis(dv, tempCtx, graphPosition, isPercent);

    //labels around the graph area
    drawLabels(dv, tempCtx, graphPosition);

    //ctx.beginPath();
    //left edge clear
    
    if(scrollData.isScrollX){
        tempCtx.clearRect(position.x, (graphY+graphHeight+fontSize), (graphX), (xAxisMaxLabelWidth+fontSize));
        tempCtx.clearRect((graphX+graphWidth), (graphY+graphHeight), fontSize, (xAxisMaxLabelWidth+fontSize));
    }

    if(scrollData.isScrollY){
        tempCtx.clearRect(0, (graphY-fontSize), graphX, fontSize);
        tempCtx.clearRect(0, (graphY+graphHeight), graphX, fontSize);

    }

    ctx.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);
}

export default DrawAxis;