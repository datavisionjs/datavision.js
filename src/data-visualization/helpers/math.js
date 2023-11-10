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

//find minimum numbers 
export function findMinAndMax(arr) {
    if(arr){
        // Use filter to remove non-numeric elements
        const numericArray = arr.filter(element => typeof element === 'number' && !isNaN(element));
    
        if (numericArray.length === 0) {
            // Handle the case where there are no valid numbers in the array
            return undefined; // or any other value that makes sense in your context
        }
    
        return {
            min: Math.min(...numericArray),
            max: Math.max(...numericArray)
        }
    }else {
        return null;
    }
}

export function calculatePointOnCircle(degrees, radius, centerPosition = {x: 0, y: 0}){
    // Convert degrees to radians
    const radians = (Math.PI / 180) * degrees;
   
    return {
        x: (centerPosition.x+(radius*Math.cos(radians))),
        y: (centerPosition.y+(radius*Math.sin(radians)))
    }
}

export function hasValidElements(arr) {
    if(arr){    
        return arr.every(element => element !== undefined && element !== null);
    }else {
        return null;
    }
}

export function graphPosition(type, canvasWidth, canvasHeight){
    //define the graph dimensions
    let graphWidth = canvasWidth;
    let graphHeight = canvasHeight;

    //calculates horizontal position of the graph area
    let graphX = 0;
    //calculates vertical position of the graph area
    let graphY = 0;

    if(type === "pie"){

        graphWidth = (canvasWidth * 0.65);
        graphHeight = (canvasHeight * 0.80);

        //calculates vertical position of the graph area
        graphY = (canvasHeight-graphHeight);

    }else {

        graphWidth = (canvasWidth * 0.85);
        graphHeight = (canvasHeight * 0.65);

        //calculates horizontal position of the graph area
        graphX = (canvasWidth - graphWidth) * 0.75;
        //calculates vertical position of the graph area
        graphY = (canvasHeight-graphHeight)/2;

    }


    return {
        x: graphX,
        y: graphY,
        width: graphWidth,
        height: graphHeight
    };
} 

export function axisDist(range, maxDist){
    if(!range) return null;
   
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


//calculates axis steps on canvas
export function rangeStep(range, maxDist){

    if(!range) return null;
    
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

    if(!range) return null;

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
    const step = rangeStep([start, end], maxDist);
    const dist = axisDist([start, end], maxDist);
    
    end = (start+(dist*step));

    return [start, end];
}


//calculates data position on graph
export function posOnGraph(dv, position){
    const layout = dv.getLayout();
    const dataType = dv.getFirstDataType();

    const canvas = dv.ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    //stores the position and dimensions of the graph area
    const chartPosition = graphPosition(dataType, canvasWidth, canvasHeight);

    const ranges = layout.ranges;

    const xRange = rangeOnAxis(ranges.xRange, 7);
    const xRangeStart = xRange? xRange[0]: null;
    const xRangeEnd = xRange? xRange[1]: null;

    const xRangeDiff = (xRangeEnd-xRangeStart);

    const yRange = rangeOnAxis(ranges.yRange, 10);
    const yRangeStart = yRange? yRange[0]: null;
    const yRangeEnd = yRange? yRange[1]: null;

    const yRangeDiff = (yRangeEnd-yRangeStart);

    //check if position is within range
    if((position.x >= xRangeStart && position.x <= xRangeEnd) && (position.y >= yRangeStart && position.y <= yRangeEnd)){
        
        const xPerc = ((position.x - xRangeStart)/xRangeDiff);
        const yPerc = ((position.y - yRangeStart)/yRangeDiff);
        
        const x = (chartPosition.x+(xPerc*chartPosition.width));
        const y = ((chartPosition.y+chartPosition.height)-(yPerc*chartPosition.height));
        
        return {x: x, y: y};
    }

    return null;
    
}

export function posOnGraphYAxis(dv, y){
    const ctx = dv.getCtx();
    const layout = dv.getLayout();
    const dataType = layout.firstDataType;

    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    //stores the position and dimensions of the graph area
    const chartPosition = graphPosition(dataType, canvasWidth, canvasHeight);

    const ranges = layout.ranges;

    const yRange = rangeOnAxis(ranges.yRange, 10);
    const yRangeStart = yRange[0];
    const yRangeEnd = yRange[1];

    const yRangeDiff = (yRangeEnd-yRangeStart);

    //check if position is within range
    if((y >= yRangeStart && y <= yRangeEnd)){

        const yPerc = ((y - yRangeStart)/yRangeDiff);
        const newY = ((chartPosition.y+chartPosition.height)-(yPerc*chartPosition.height));
        
        return newY;
    }

    return null;
}