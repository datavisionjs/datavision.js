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

export function isAllNumbers(arr) {
    return arr.every(element => typeof element === 'number');
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

//get the minimun and max from a data of all numbers and return as range
export function rangeFromData(arr){
    if(isAllNumbers(arr)){
        const minAndMax = findMinAndMax(arr);

        if(minAndMax){
            return [minAndMax.min, minAndMax.max];
        }
    }
    return null;
}


//calculates data position on graph
export function posOnGraph(dv, position){
    const x = posOnGraphXAxis(dv, position.x);
    const y = posOnGraphYAxis(dv, position.y);

    return {x: x, y: y};
}

export function posOnGraphYAxis(dv, y){
    const layout = dv.getLayout();

    const axisData = layout.axisData;
    const isHorizontal = axisData.direction === "hr";

    //stores the position and dimensions of the graph area
    //const chartPosition = graphPosition(dv, dataType, canvasWidth, canvasHeight);
    const chartPosition = layout.graphPosition;
    const chartY = chartPosition.y;
    const chartHeight = chartPosition.height;

    const ranges = layout.ranges;

    const yRange = isHorizontal? ranges.labelRange: ranges.valueRange;

    if(yRange){
        const range = rangeOnAxis(yRange, 10);
        const rangeStart = range[0];
        const rangeEnd = range[1];

        const rangeDiff = (rangeEnd-rangeStart);

        //check if position is within range
        if((y >= rangeStart && y <= rangeEnd)){

            const perc = ((y - rangeStart)/rangeDiff);
            const pos = ((chartY+chartHeight)-(perc*chartHeight));
            
            return pos;
        }
    }

    return y;
}

export function posOnGraphXAxis(dv, x){
    const layout = dv.getLayout();

    const axisData = layout.axisData;
    const isHorizontal = axisData.direction === "hr";

    //stores the position and dimensions of the graph area
    //const chartPosition = graphPosition(dv, dataType, canvasWidth, canvasHeight);
    const chartPosition = layout.graphPosition;
    const chartX = chartPosition.x;
    const chartWidth = chartPosition.width;

    const ranges = layout.ranges;

    const xRange = isHorizontal? ranges.valueRange: ranges.labelRange;

    if(xRange){
        const range = rangeOnAxis(xRange, 7);
    
        const rangeStart = range[0];
        const rangeEnd = range[1];

        const rangeDiff = (rangeEnd-rangeStart);

        //check if position is within range
        if((x >= rangeStart && x <= rangeEnd)){

            const perc = ((x - rangeStart)/rangeDiff);
            const pos = (chartX+(perc*chartWidth));
            
            return pos;
        }
    }
    
    return x;
    
}


export function getAxisPosition(dv, label, value){
    return {
        x: getAxisLabelPosition(dv, label),
        y: getAxisValuePosition(dv, value)
    };
}

export function getAxisLabelPosition(dv, label){
    const layout = dv.getLayout();

    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x;
    const graphWidth = graphPosition.width;

    const axisData = layout.axisData;
    const labelIsAllNumbers = axisData.labelIsAllNumbers;

    const axisLabels = axisData.labels;

    if(!labelIsAllNumbers){
        const step = (graphWidth/axisLabels.length);
        const halfStep = (step/2);
        const index = axisLabels.indexOf(label);
        
        if(index >= 0){

            label = (graphX+((step*index)+halfStep));
        }
    }else {
        label = posOnGraphXAxis(dv, label);
    }

    return label;
}

export function getAxisValuePosition(dv, value){
    const layout = dv.getLayout();

    const graphPosition = layout.graphPosition;
    const graphY = graphPosition.y;
    const graphHeight = graphPosition.height;

    const axisData = layout.axisData;
    const valueIsAllNumbers = axisData.valueIsAllNumbers;

    const axisValues = axisData.values;

    if(!valueIsAllNumbers){
        const step = (graphHeight/axisValues.length);
        const halfStep = (step/2);
        const index = axisValues.indexOf(value);
        
        if(index >= 0){
            value = ((graphY+graphHeight)-((step*index)+halfStep));
        }
    }else {
        value = posOnGraphYAxis(dv, value);
    }

    return value;
}


//get arcRadius 
export function getArcRadius(width, height){
    
    let radius = Math.round(0.5 * Math.min(width, height));
    radius < 0? radius = 0: null;

    return radius;
};