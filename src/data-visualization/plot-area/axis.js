//Contains functions for rendering and formatting axis, ticks, and labels.

import * as Calc from '../helpers/math.js'

import DrawTitleLabel from './titleLabel.js';

function drawLabels(ctx, position){

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
    const fontSize = 15;

    if(yAxis){

        let title = yAxis.title;

        if(title){
            ctx.beginPath();

            let angleInRadians = (-90 * (Math.PI/180))

            ctx.font = fontSize+'px Arial';

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

            ctx.font = fontSize+"px Arial";

            ctx.fillText(title, ((graphX+(graphWidth/2))), (canvasHeight-fontSize));
        }
    }
}

function drawYAxis(ctx, position){

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    const ranges = layout.ranges;
    let range = ranges.yRange;

    const fontSize = layout.fontSize;
    ctx.font = fontSize+"px Arial";

    let axisX = graphX;
    let axisY = graphY+graphHeight;

    if(range){
        const maxDist = 10;

        range = Calc.rangeOnAxis(range, maxDist);

        if(range){

            const rangeStart = range[0];

            const step = Calc.rangeStep(range, maxDist);

            let dist = Calc.axisDist(range, maxDist);

            let pixelStep = (graphHeight/dist);

            let label = rangeStart;

            for(let i = 0; i < dist; i++){

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

function drawXAxis(ctx, position){

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    //get the data type of the dataset
    const firstDataType = data[0]? data[0].type: null;

    const ranges = layout.ranges;

    const fontSize = layout.fontSize;
    ctx.font = fontSize+"px Arial";

    let axisX = graphX;
    let axisY = (graphY+graphHeight);

    if(firstDataType === "bar"){
        const barData = layout.barData;

        const categories = barData.barCategories;
        const catKeys = Array.from(categories.keys());

        const step = (graphWidth/catKeys.length);

        for(var i = 0; i < catKeys.length; i++){
            if(i === 0){
                axisX += (step/2);
            }else {
                axisX += step;
            }

            const label = catKeys[i];

            //set text width
            const textWidth = ctx.measureText(label).width;

            const textPosX = (axisX-(textWidth/2));
            const textPosY = (axisY+(fontSize*2));

            //add xAxis range labels
            ctx.beginPath();
            ctx.fillText(label, textPosX, textPosY);
        }

    }else {
        let range = ranges.xRange;

        if(range){

            const maxDist = 7;

            range = Calc.rangeOnAxis(range, maxDist);

            if(range){

                const rangeStart = range[0];

                const step = Calc.rangeStep(range, maxDist);


                let dist = Calc.axisDist(range, maxDist);

                let pixelStep = (graphWidth/dist);

                let label = rangeStart;

                for(let i = 0; i < dist; i++){

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

}

const DrawAxis = (ctx) => {

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;

    //draw a rectangle representing the graph area
    ctx.beginPath();
    ctx.rect(graphPosition.x, graphPosition.y, graphPosition.width, graphPosition.height);
    ctx.stroke();

    //Draw Y-axis, X-axis around the graph area
    drawXAxis(ctx, graphPosition);
    drawYAxis(ctx, graphPosition);

    //labels around the graph area
    DrawTitleLabel(ctx);
    drawLabels(ctx, graphPosition);
}

export default DrawAxis;