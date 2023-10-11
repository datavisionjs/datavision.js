

function drawLabels(ctx, layout){
    const canvas = ctx.canvas;
}

function drawYAxis(ctx, layout){
    const canvas = ctx.canvas;
}

function drawXAxis(ctx, layout){
    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const areaWidth = (canvas.width*0.85);
    const areaHeight = (canvas.height*0.65);

    const areaX = (canvasWidth-areaWidth)/2;
    const areaY = ((canvasHeight-areaHeight)/2);

    let axisX = areaX;
    let axisY = (areaY+areaHeight);

    let axis = layout.xAxis;

    console.log("working");

    if(axis.range){

        const range = axis.range;
        const maxDist = 7;
        const roundedNumbers = [1, 2, 5, 10, 20, 50, 100];

        const rangeStart = range[0];
        const newRangeStart = Math.floor(rangeStart / 10) * 10;

        const rangeEnd = range[1];

        const rangeDiff = Math.abs(rangeEnd-rangeStart);



        const estStep = (rangeDiff/maxDist); //estimated distribution steps 

        const remainder100 = (estStep % 100);

        const roundedRemainder100 = roundedNumbers.filter(number=> number >= remainder100)[0];

        const step = (estStep-remainder100)+roundedRemainder100;


        let newDist = Math.round(rangeDiff/step);
        if((newRangeStart+(newDist*step)) < rangeEnd) newDist++;

        let pixelStep = (areaWidth/newDist);

        let label = newRangeStart;

        let fontSize = 13;

        for(let i = 0; i < newDist; i++){

            const textWidth = ctx.measureText(label).width;
            const textPosX = (axisX-(textWidth/2));
            const textPosY = (axisY+(fontSize*2));

            //draw lines 
            ctx.beginPath();
            ctx.moveTo(axisX, areaY);
            ctx.lineTo(axisX, (areaY+areaHeight));
            ctx.stroke();
            

            //add xAxis range labels
            ctx.beginPath();
            ctx.font = fontSize+"px Arial";
            ctx.fillText(label, textPosX, textPosY);

            label += step;
            axisX += pixelStep;

        }

    }

}

const DrawAxis = (ctx, data, layout) => {

    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    //draw graph area
    const areaWidth = (canvas.width*0.85);
    const areaHeight = (canvas.height*0.65);

    const areaX = (canvasWidth-areaWidth)/2;
    const areaY = (canvasHeight-areaHeight)/2;

    ctx.beginPath();
    ctx.rect(areaX, areaY, areaWidth, areaHeight);
    ctx.stroke();
    
    drawYAxis(ctx, layout);
    drawXAxis(ctx, layout);
    drawLabels(ctx, layout);

}

export default DrawAxis;