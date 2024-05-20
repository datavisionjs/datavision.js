//Contains functions for rendering and formatting axis, ticks, and labels.

import * as Global from '../helpers/global.js';
import * as Calc from '../helpers/math.js'



function drawLabels(dv, position){
    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const labelStyle = dv.getStyle().label;

    const canvas = ctx.canvas;
    const canvasHeight = canvas.height;

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    const yAxisRight = position.yAxisRight;

    let yAxis = layout.yAxis;
    let y2Axis = layout.y2Axis;

    let xAxis = layout.xAxis;

    //set text alignment
    ctx.textAlign = 'center'; 

    //set fontsize for yAxis and xAxis texts 
    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

    if(yAxis){

        let title = yAxis.title;

        if(title){
            ctx.beginPath();

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

            ctx.fillText(title, ((graphX+(graphWidth/2))), (canvasHeight-(fontSize/2)));
        }
    }
}

function drawYAxis(dv, position){
    const ctx = dv.getCtx();
    const canvas = dv.getCanvas();

    const layout = dv.getLayout();

    const labelStyle = dv.getStyle().label;

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;
    
    const yMaxLabelWidth = position.maxLabelWidth;

    //get the data type of the dataset
    //const firstDataType = layout.firstDataType;

    //const ranges = layout.ranges;
    //let range = ranges.yRange;
    
    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

    let axisX = graphX;
    let axisY = graphY+graphHeight;

    //set axisData
    const axisData = layout.axisData;

    const axisValues = axisData.values;

    for(let key in axisValues){
        const axis = axisValues[key];
        const values = axis.values;

        if(axis.isAllNumbers){
            const tickData = axis.tickData;

            //const maxDist = 7;

            //const ranges = layout.ranges;

            values.sort((a, b) => a - b);

            //let range = ranges? isHorizontal? ranges.labelRange: ranges.valueRange: dataRange;
            let range = axis.range;
            
            if(range){

                const format = axis.tickFormat || {};
                const prefix = (format.prefix || ""), suffix = (format.suffix || "");

                const rangeStart = range[0];

                const step = tickData.interval;

                let dist = tickData.count;

                let pixelStep = (graphHeight/dist);
                pixelStep < 1? pixelStep = 1: null;

                let value = 0;

                let iterator = 1;

                //set iterator to 2 if the highest label length is 2 times the size of the step
                fontSize > pixelStep? iterator += Math.round(fontSize/pixelStep): null;

                for(let i = 0; i <= dist; i += iterator){

                    value = prefix + Calc.commaSeparateNumber(Calc.toFixedIfNeeded((rangeStart)+(step*i), format.decimalPlaces)) + suffix;

                    axisY = ((graphY+graphHeight)-(pixelStep*i));

                    //set text width
                    const textWidth = ctx.measureText(value).width;
                    
                    const textPosX = "y2" === key? ((axisX+graphWidth)+fontSize): ((axisX-textWidth)-(fontSize));
                    const textPosY = (axisY+Math.floor(fontSize/2));

                    //draw lines 
                    ctx.beginPath();
                    ctx.strokeStyle = value === "0"? "black":"#b5b5b5";
                    if("y2" === key){
                        ctx.moveTo((graphX+graphWidth), axisY);
                        ctx.lineTo(((graphX+graphWidth)+(fontSize/2)), (axisY));
                    }else {
                        ctx.moveTo((graphX+graphWidth), axisY);
                        ctx.lineTo((graphX-(fontSize/2)), (axisY));
                    }
                    ctx.stroke();
                    
                    //add xAxis range labels
                    ctx.beginPath();
                    ctx.fillText(value, textPosX, textPosY);

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
            
            for(var i = 0; i < values.length; i += iterator){
    
                axisY = ((graphY+graphHeight)-((step/2)+(step*i)));
    
                let value = values[i];
               
                const valueWidth = ctx.measureText(value).width;
                const valueCharSize = (valueWidth/value.length);

                if(maxValueWidth > (yMaxLabelWidth-fontSize)){
                    value = Global.shortenText(value, ((yMaxLabelWidth-fontSize)/valueCharSize));
                }

                const textPosX = "y2" === key? ((axisX+graphWidth)+fontSize): (axisX-(fontSize));
                const textPosY = (axisY);

                //add xAxis range labels
                ctx.beginPath();
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

function drawXAxis(dv, position){

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const canvas = dv.getCanvas();
    const canvasWidth = canvas.width, canvasHeight = canvas.height;

    const labelStyle = dv.getStyle().label;

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    const maxLabelWidth = position.maxLabelWidth;

    //get the data type of the dataset
    //const firstDataType = layout.firstDataType;

    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

    ctx.textBaseline = "hanging";
    

    let axisX = 0;
    let axisY = (graphY+graphHeight);

    //set barData
    const axisData = layout.axisData;
    //const isHorizontal = axisData.direction === "hr";

    const labels = axisData.labels;

    for(let key in labels){

        const axis = labels[key];
        const values = axis.values;

        if(axis.isAllNumbers){
            const tickData = axis.tickData;

            values.sort((a, b) => a - b);

            let range = axis.range;

            if(range){

                const format = axis.tickFormat || {};
                const prefix = (format.prefix || ""), suffix = (format.suffix || "");

                const rangeStart = range[0];
                const rangeEnd = range[1];

                const step = tickData.interval;


                let dist = tickData.count;

                let pixelStep = (graphWidth/dist);
                pixelStep < 1? pixelStep = 1: null;

                let label = 0;

                //get max label width 
                const maxLabelWidth = ctx.measureText(rangeEnd).width;

                let iterator = 1;
                
                //set iterator to 2 if the highest label length is 2 times the size of the step
                maxLabelWidth > pixelStep? iterator += Math.round(maxLabelWidth/pixelStep): null;

                ctx.textAlign = "center";

                for(let i = 0; i <= dist; i += iterator){

                    label = prefix + Calc.commaSeparateNumber(Calc.toFixedIfNeeded((rangeStart)+(step*i), format.decimalPlaces)) + suffix;

                    //label = Calc.commaSeparateNumber(Calc.toFixedIfNeeded((rangeStart)+(step*i)));
                    axisX = (graphX+(pixelStep*i));


                    //set text width
                    const textWidth = ctx.measureText(label).width;

                    const textPosX = (axisX);
                    const textPosY = (axisY+(fontSize));

                    //draw lines 
                    ctx.beginPath();
                    ctx.strokeStyle = label === "0"? "black":"#b5b5b5";
                    
                    ctx.moveTo(axisX, graphY);
                    ctx.lineTo(axisX, ((graphY+graphHeight)+(fontSize/2)));
                    ctx.stroke();
                    

                    //add xAxis range labels
                    ctx.beginPath();
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
            
            for(var i = 0; i < values.length; i += iterator){

                axisX = (graphX+((step/2)+(step*i)));
                
                //set text width
                //const textWidth = ctx.measureText(label).width;

                let textPosX = (axisX);
                const textPosY = (axisY+(fontSize));

                //add xAxis range labels
                ctx.beginPath();
                ctx.textAlign = "center";
                //ctx.textBaseline = "middle";

                let label = values[i];

                let angle = 0;

                const labelWidth = ctx.measureText(label).width;
                const labelCharSize = (labelWidth/label.length);

                if((step/fontSize) < 4){
                    label = Global.shortenText(label, ((maxLabelWidth-fontSize)/labelCharSize));
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

    const layout = dv.getLayout();

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;

    //draw a rectangle representing the graph area
    
    ctx.beginPath();
    ctx.strokeStyle = "#b5b5b5";
    ctx.lineWidth = "0.1";
    ctx.rect((graphPosition.x+1), graphPosition.y, (graphPosition.width-2), graphPosition.height);
    ctx.stroke();
    ctx.lineWidth = "1";
    

    //Draw Y-axis, X-axis around the graph area
    drawXAxis(dv, graphPosition);
    drawYAxis(dv, graphPosition);

    //labels around the graph area
    drawLabels(dv, graphPosition);
}

export default DrawAxis;