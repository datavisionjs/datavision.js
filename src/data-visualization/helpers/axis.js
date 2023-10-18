//Contains functions for rendering and formatting axis, ticks, and labels.

import * as Calc from './math.js'

function drawLabels(ctx, layout, position){

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    let title = layout.title;
    let yAxis = layout.yAxis;
    let xAxis = layout.xAxis;

    //set text alignment
    ctx.textAlign = 'center'; 

    if(title){
        //draw Title
        ctx.beginPath();

        const fontSize = 30;
        ctx.font = fontSize+"px Arial";

        ctx.fillText(title, ((graphX+(graphWidth/2))), ((graphY/2)+(fontSize/2)));
    }

    //set fontsize for yAxis and xAxis texts 
    const fontSize = 18;

    if(yAxis){
        let title = yAxis.title;
        ctx.beginPath();

        let angleInRadians = (-90 * (Math.PI/180))

        ctx.font = fontSize+'px Arial';

        //save the current canvas state
        ctx.save();

        // Translate the canvas context to the desired position
        ctx.translate((graphX-(fontSize*2)), (graphY+(graphHeight/2)));

        // Rotate the canvas context by the specified angle
        ctx.rotate(angleInRadians);

        // Draw the rotated text
        ctx.fillText(title, 0, 0); // (0, 0) is the position relative to the translated and rotated context

        ctx.restore();
    }

    if(xAxis){
        let title = xAxis.title;

        ctx.beginPath();

        ctx.font = fontSize+"px Arial";

        ctx.fillText(title, ((graphX+(graphWidth/2))), ((graphY+graphHeight)+(fontSize*3)));
    }
}

function drawYAxis(ctx, layout, position){

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    let axisX = graphX;
    let axisY = graphY+graphHeight;

    let axis = layout.yAxis;

    if(axis){
        if(axis.range){
            const maxDist = 10;

            const range = Calc.axisRange(axis.range, maxDist);
            const rangeStart = range[0];

            const step = Calc.rangeStep(range, maxDist);

            let dist = Calc.axisDist(range, maxDist);

            let pixelStep = (graphHeight/dist);

            let label = rangeStart;

            let fontSize = 13;

            for(let i = 0; i < dist; i++){
                
                //set font size
                ctx.font = fontSize+"px Arial";

                //set text width
                const textWidth = ctx.measureText(label).width;
                
                const textPosX = ((axisX-textWidth)-(fontSize));
                const textPosY = (axisY+Math.floor(fontSize/2));

                //draw lines 
                ctx.beginPath();
                ctx.strokeStyle = "gray";
                ctx.moveTo((graphX+graphWidth), axisY);
                ctx.lineTo((graphX), (axisY));
                ctx.stroke();
                

                //add xAxis range labels
                ctx.beginPath();
                ctx.fillText(label, textPosX, textPosY);

                label += step;
                axisY -= pixelStep;

            }

        }
    }

}

function drawXAxis(ctx, layout, position){

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    let axisX = graphX;
    let axisY = (graphY+graphHeight);

    let axis = layout.xAxis;

    if(axis){

        if(axis.range){
            const maxDist = 7;

            const range = Calc.axisRange(axis.range, maxDist);
            const rangeStart = range[0];

            const step = Calc.rangeStep(range, maxDist);


            let dist = Calc.axisDist(range, maxDist);

            let pixelStep = (graphWidth/dist);

            let label = rangeStart;

            let fontSize = 13;

            for(let i = 0; i < dist; i++){

                //set font size
                ctx.font = fontSize+"px Arial";

                //set text width
                const textWidth = ctx.measureText(label).width;

                const textPosX = (axisX-(textWidth/2));
                const textPosY = (axisY+(fontSize*2));

                //draw lines 
                ctx.beginPath();
                ctx.moveTo(axisX, graphY);
                ctx.lineTo(axisX, (graphY+graphHeight));
                ctx.stroke();
                

                //add xAxis range labels
                ctx.beginPath();
                ctx.fillText(label, textPosX, textPosY);

                label += step;
                axisX += pixelStep;

            }

        }
    }

}

const DrawAxis = (ctx, layout) => {

    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    //stores the position and dimensions of the graph area
    const graphPosition = Calc.graphPosition(canvasWidth, canvasHeight);

    //draw a rectangle representing the graph area
    ctx.beginPath();
    ctx.rect(graphPosition.x, graphPosition.y, graphPosition.width, graphPosition.height);
    ctx.stroke();

    
    //Draw Y-axis, X-axis, and labels around the graph area
    drawYAxis(ctx, layout, graphPosition);
    drawXAxis(ctx, layout, graphPosition);
    drawLabels(ctx, layout, graphPosition);
}

export default DrawAxis;