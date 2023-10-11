
function rangeStep(range, maxDist){
    const roundedNumbers = [1, 2, 5, 10, 20, 50, 100];

    const rangeStart = range[0];
    const rangeEnd = range[1];

    const rangeDiff = Math.abs(rangeEnd-rangeStart);



    const estStep = (rangeDiff/maxDist); //estimated distribution steps 

    const remainder100 = (estStep % 100);

    const roundedRemainder100 = roundedNumbers.filter(number=> number >= remainder100)[0];

    const step = (estStep-remainder100)+roundedRemainder100;

    return step;
}


function drawLabels(ctx, layout, position){
    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

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
    const fontSize = 20;

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

    console.log("working");

    if(axis){
        if(axis.range){

            const range = axis.range;
            const maxDist = 10;

            const rangeStart = range[0];
            const newRangeStart = Math.floor(rangeStart / 10) * 10;

            const rangeEnd = range[1];

            const rangeDiff = Math.abs(rangeEnd-rangeStart);


            const step = rangeStep(range, maxDist);


            let newDist = Math.round(rangeDiff/step);
            if((newRangeStart+(newDist*step)) < rangeEnd) newDist++;

            let pixelStep = (graphHeight/newDist);

            let label = newRangeStart;

            let fontSize = 13;

            for(let i = 0; i < newDist; i++){
                
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

    console.log("working");

    if(axis){

        if(axis.range){

            const range = axis.range;
            const maxDist = 7;

            const rangeStart = range[0];
            const newRangeStart = Math.floor(rangeStart / 10) * 10;

            const rangeEnd = range[1];

            const rangeDiff = Math.abs(rangeEnd-rangeStart);


            const step = rangeStep(range, maxDist);


            let newDist = Math.round(rangeDiff/step);
            if((newRangeStart+(newDist*step)) < rangeEnd) newDist++;

            let pixelStep = (graphWidth/newDist);

            let label = newRangeStart;

            let fontSize = 13;

            for(let i = 0; i < newDist; i++){

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

const DrawAxis = (ctx, data, layout) => {

    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    //define the graph dimensions
    const graphWidth = (canvas.width*0.85);
    const graphHeight = (canvas.height*0.65);

    //calculates horizontal position of the graph area
    const graphX = (canvasWidth - graphWidth) * 0.75;
    //calculates vertical position of the graph area
    const graphY = (canvasHeight-graphHeight)/2;

    //draw a rectangle representing the graph area
    ctx.beginPath();
    ctx.rect(graphX, graphY, graphWidth, graphHeight);
    ctx.stroke();

    //stores the position and dimensions of the graph area
    const graphPosition = {
        x: graphX,
        y: graphY,
        width: graphWidth,
        height: graphHeight
    };
    
    //Draw Y-axis, X-axis, and labels around the graph area
    drawYAxis(ctx, layout, graphPosition);
    drawXAxis(ctx, layout, graphPosition);
    drawLabels(ctx, layout, graphPosition);
}

export default DrawAxis;