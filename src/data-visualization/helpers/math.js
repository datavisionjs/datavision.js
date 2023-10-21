//Contains mathematical functions for data transformations, calculations, and scaling.


//finds a point on a straight line between two known points.
export function linearInterpolation(x, x1, y1, x2, y2) {
    if (x1 === x2) {
        return y1; // Avoid division by zero
    }

    // Calculate the intermediate point (x, y)
    const y = y1 + (x - x1) * (y2 - y1) / (x2 - x1);
    return y;
}

export function graphPosition(canvasWidth, canvasHeight){

    //define the graph dimensions
    const graphWidth = (canvasWidth * 0.85);
    const graphHeight = (canvasHeight * 0.65);

    //calculates horizontal position of the graph area
    const graphX = (canvasWidth - graphWidth) * 0.75;
    //calculates vertical position of the graph area
    const graphY = (canvasHeight-graphHeight)/2;


    return {
        x: graphX,
        y: graphY,
        width: graphWidth,
        height: graphHeight
    };
} 

export function axisDist(range, maxDist){
    const start = range[0];
    const rangeEnd = range[1];

    const rangeDiff = Math.abs(rangeEnd-start);
    const step = rangeStep(range, maxDist);

    let dist = Math.round(rangeDiff/step);
    
    if((start+(dist*step)) < rangeEnd){
        dist++;
    }

    return dist;
}

export function findRanges(){
    //find x axis range 
    let xRange = null;
    let yRange = null;

    //get range from layout
    if(layout){

        const xMaxDist = 7;
        const xAxis = layout.xAxis;
        if(xAxis){
            if(xAxis.range){
                xRange = rangeOnAxis(xAxis.range, xMaxDist);
            }
        }

        const yMaxDist = 10;
        const yAxis = layout.yAxis;
        if(yAxis){
            if(yAxis.range){
                yRange = rangeOnAxis(yAxis.range, yMaxDist);
            }
        }
    }

    //get range from data 
    if(data){

        if(!xRange){
            let xRangeStart, xRangeEnd;

            

        }
    }

    return {
        xRange: xRange,
        yRange: yRange
    }
}

//calculates axis steps on canvas
export function rangeStep(range, maxDist){
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

//generate range that'll be shown on axis
export function rangeOnAxis(range, maxDist){
    let start = range[0];
    let end = range[1];


    //calculate start
    if(start >= 10){
        start = Math.floor(start / 10) * 10;
    }else if(start >= 5){
        start = Math.floor(start / 5) * 5;
    }else if(start >= 2){
        start = Math.floor(start / 2) * 2;
    }else if(start >= 0) {
        start = 0;
    }else if(start > 10){
        start = Math.floor(start);
    }else if(start <= -10){
        start = Math.floor(start / 10) * 10;
    }

    //calculate end
    const step = rangeStep(range, maxDist);
    const dist = axisDist(range, maxDist);

    console.log("step: ", step, maxDist);
    
    end = (start+(dist*step));

    return [start, end];
}


//calculates data position on graph
export function posOnGraph(ctx, position){
    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    //stores the position and dimensions of the graph area
    const chartPosition = graphPosition(canvasWidth, canvasHeight);

    const xAxis = layout.xAxis;
    const yAxis = layout.yAxis;

    if(xAxis && yAxis){

        const xRange = rangeOnAxis(xAxis.range, 7);
        const xRangeStart = xRange[0];
        const xRangeEnd = xRange[1];

        const xRangeDiff = (xRangeEnd-xRangeStart);

        const yRange = rangeOnAxis(yAxis.range, 10);
        const yRangeStart = yRange[0];
        const yRangeEnd = yRange[1];

        const yRangeDiff = (yRangeEnd-yRangeStart);

        //check if position is within range
        if((position.x >= xRangeStart && position.x <= xRangeEnd) && (position.y >= yRangeStart && position.y <= yRangeEnd)){
            
            const xPerc = ((position.x - xRangeStart)/xRangeDiff);
            const yPerc = ((position.y - yRangeStart)/yRangeDiff);
            
            const x = (chartPosition.x+(xPerc*chartPosition.width));
            const y = ((chartPosition.y+chartPosition.height)-(yPerc*chartPosition.height));

            return {x: x, y: y};
        }

        console.log("xRange: ", xRangeStart, xRangeEnd);
        console.log("yRange: ", yRangeStart, yRangeEnd);
        
        console.log("Position: ", position.x, position.y);
    }

    return null;
    
}