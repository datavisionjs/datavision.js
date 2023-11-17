//Contains functions for rendering and formatting axis, ticks, and labels.

import * as Calc from '../helpers/math.js'

import DrawTitleLabel from './titleLabel.js';


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

    const ranges = layout.ranges;
    let range = ranges.yRange;

    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

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

function drawXAxis(dv, position){

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const labelStyle = dv.getStyle().label;

    const graphWidth = position.width;
    const graphHeight = position.height;

    const graphX = position.x;
    const graphY = position.y;

    //get the data type of the dataset
    const firstDataType = layout.firstDataType;

    const ranges = layout.ranges;

    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

    ctx.textBaseline = "hanging";
    

    let axisX = graphX;
    let axisY = (graphY+graphHeight);

    if(firstDataType === "bar"){
        const barData = layout.barData;

        const maxTextWidth = barData.maxTextWidth;
        
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

            let textPosX = (axisX-(textWidth/2));
            const textPosY = (axisY+(fontSize));

            //add xAxis range labels
            ctx.beginPath();

            let angle = 0;

            if(maxTextWidth > step){
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
                    const textPosY = (axisY+(fontSize));

                    //draw lines 
                    ctx.beginPath();
                    ctx.moveTo(axisX, graphY);
                    ctx.lineTo(axisX, (graphY+graphHeight));
                    ctx.stroke();

                    console.log("lime: ", textPosX, textPosY);
                    

                    //add xAxis range labels
                    ctx.beginPath();
                    ctx.fillText(label, textPosX, textPosY);

                    label += step;
                    axisX += pixelStep;

                }
            }

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

    let graphWidth = graphPosition.width;
    let graphHeight = graphPosition.height;

    let graphX = graphPosition.x;
    let graphY = graphPosition.y;

    //get the data type of the dataset
    const firstDataType = layout.firstDataType;

    if(firstDataType === "bar"){
        
        const barData = layout.barData;
        const maxTextWidth = barData.maxTextWidth;

        const categories = barData.barCategories;
        const catKeys = Array.from(categories.keys());

        const step = (graphWidth/catKeys.length);

        if(maxTextWidth > step){
            graphHeight -= (maxTextWidth/2);
        }
    }

    const newGraphPosition = {x: graphX, y: graphY, width: graphWidth, height: graphHeight};
    
    //reset layout's graphPosition
    layout.graphPosition = {...newGraphPosition};

    //draw a rectangle representing the graph area
    ctx.beginPath();
    ctx.rect(newGraphPosition.x, newGraphPosition.y, (newGraphPosition.width-1), newGraphPosition.height);
    ctx.stroke();

    //Draw Y-axis, X-axis around the graph area
    drawXAxis(dv, newGraphPosition);
    drawYAxis(dv, newGraphPosition);

    //labels around the graph area
    DrawTitleLabel(dv);
    drawLabels(dv, newGraphPosition);
}

export default DrawAxis;