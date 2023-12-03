//Contains functions for rendering and formatting axis, ticks, and labels.

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

    let yAxis = layout.yAxis;
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
    const layout = dv.getLayout();

    const labelStyle = dv.getStyle().label;

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

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

    const values = axisData.values;

    if(axisData.valueIsAllNumbers){
        values.sort((a, b) => a - b);

        const maxDist = 10;

        let range = [values[0], values[values.length-1]];

        range = Calc.rangeOnAxis(range, maxDist);

        if(range){

            console.log("myRange: ", range);

            const rangeStart = range[0];

            const step = Calc.rangeStep(range, maxDist);

            let dist = Calc.axisDist(range, maxDist);

            let pixelStep = (graphHeight/dist);
            pixelStep < 1? pixelStep = 1: null;

            let value = 0;

            let iterator = 1;

            //set iterator to 2 if the highest label length is 2 times the size of the step
            fontSize > pixelStep? iterator += Math.round(fontSize/pixelStep): null;


            for(let i = 0; i < dist; i += iterator){

                value = ((rangeStart)+(step*i));
                axisY = ((graphY+graphHeight)-(pixelStep*i));

                //set text width
                const textWidth = ctx.measureText(value).width;
                
                const textPosX = ((axisX-textWidth)-(fontSize));
                const textPosY = (axisY+Math.floor(fontSize/2));

                //draw lines 
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.moveTo((graphX+graphWidth), axisY);
                ctx.lineTo((graphX-(fontSize/2)), (axisY));
                ctx.stroke();
                
                //add xAxis range labels
                ctx.beginPath();
                ctx.fillText(value, textPosX, textPosY);

            }
        }

    }else {
         //const maxTextWidth = barData.maxTextWidth;
        
 
         let step = (graphHeight/values.length);
         step < 1? step = 1: null;
 
         let iterator = 1;
 
         //set iterator to 2 if the highest label length is 2 times the size of the step
         fontSize > step? iterator += Math.round(fontSize/step): null;
         
         for(var i = 0; i < values.length; i += iterator){
 
            axisY = ((graphY+graphHeight)-((step/2)+(step*i)));
 
            const value = values[i];

            const textPosX = (axisX-(fontSize));
            const textPosY = (axisY);

            //add xAxis range labels
            ctx.beginPath();
            ctx.textAlign = "end";
            ctx.textBaseline = "middle";
 
             // Draw the rotated text
             ctx.fillText(value, textPosX, textPosY);
 
             ctx.textAlign = "start";
             ctx.textBaseline = "alphabetic";
     
         }
    }


}

function drawXAxis(dv, position){

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const labelStyle = dv.getStyle().label;

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    //get the data type of the dataset
    //const firstDataType = layout.firstDataType;

    //const ranges = layout.ranges;

    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

    ctx.textBaseline = "hanging";
    

    let axisX = 0;
    let axisY = (graphY+graphHeight);

    //set barData
    const axisData = layout.axisData;

    const labels = axisData.labels;

    if(axisData.labelIsAllNumbers){
        labels.sort((a, b) => a - b);

        const maxDist = 7;

        let range = [labels[0], labels[labels.length-1]];

        range = Calc.rangeOnAxis(range, maxDist);

        if(range){

            const rangeStart = range[0];
            const rangeEnd = range[1];

            const step = Calc.rangeStep(range, maxDist);


            let dist = Calc.axisDist(range, maxDist);

            let pixelStep = (graphWidth/dist);
            pixelStep < 1? pixelStep = 1: null;

            let label = 0;

            //get max label width 
            const maxLabelWidth = ctx.measureText(rangeEnd).width;

            let iterator = 1;
            
            //set iterator to 2 if the highest label length is 2 times the size of the step
            maxLabelWidth > pixelStep? iterator += Math.round(maxLabelWidth/pixelStep): null;

            for(let i = 0; i < dist; i += iterator){

                label = ((rangeStart)+(step*i));
                axisX = (graphX+(pixelStep*i));

                //set text width
                const textWidth = ctx.measureText(label).width;

                const textPosX = (axisX-(textWidth/2));
                const textPosY = (axisY+(fontSize));

                //draw lines 
                ctx.beginPath();
                ctx.moveTo(axisX, graphY);
                ctx.lineTo(axisX, ((graphY+graphHeight)+(fontSize/2)));
                ctx.stroke();

                console.log("lime: ", textPosX, textPosY);
                

                //add xAxis range labels
                ctx.beginPath();
                ctx.fillText(label, textPosX, textPosY);

            }
        }

    }else {
        const maxLabelWidth = axisData.maxLabelWidth;
        
        let step = (graphWidth/labels.length);
        step < 1? step = 1: null;

        let iterator = 1;

        //set iterator to 2 if the highest label length is 2 times the size of the step
        (maxLabelWidth/2) > step? iterator += Math.round((maxLabelWidth/2)/step): null;
        
        for(var i = 0; i < labels.length; i += iterator){

            axisX = (graphX+((step/2)+(step*i)));

            const label = labels[i];

            //set text width
            const textWidth = ctx.measureText(label).width;

            let textPosX = (axisX-(textWidth/2));
            const textPosY = (axisY+(fontSize));

            //add xAxis range labels
            ctx.beginPath();

            let angle = 0;

            console.log("max: ", axisY, fontSize);
            if(maxLabelWidth > step){
                angle = -40
                textPosX = axisX;

                ctx.textAlign = "end";
                ctx.textBaseline = "middle";
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

            ctx.textAlign = "start";
        }
    }

    //reset text baselien
    ctx.textBaseline = "alphabetic";

}

const DrawAxis = (dv) => {
    const ctx = dv.getCtx();

    const layout = dv.getLayout();

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;

    //draw a rectangle representing the graph area
    ctx.beginPath();
    ctx.rect(graphPosition.x, graphPosition.y, (graphPosition.width-1), graphPosition.height);
    ctx.stroke();

    //Draw Y-axis, X-axis around the graph area
    drawXAxis(dv, graphPosition);
    drawYAxis(dv, graphPosition);

    //labels around the graph area
    drawLabels(dv, graphPosition);
}

export default DrawAxis;