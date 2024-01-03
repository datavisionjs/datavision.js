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

export function hasDecimal(number){
    return number !== Math.floor(number);
}

export function haveOppositeSigns(num1, num2) {
    return (num1 >= 0 && num2 < 0) || (num1 < 0 && num2 >= 0);
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


export function getTicksInterval(intervalSize, isReverse){
    const niceNumbers = [1, 2, 5, 10];

    // Round the interval size to a nice number (1, 2, 5, or 10)
    const magnitude = Math.pow(10, Math.floor(Math.log10(intervalSize)));

    if(isReverse){
        niceNumbers.reverse();
        return niceNumbers.find(n => n * magnitude <= intervalSize) * magnitude;
    }else {
        return niceNumbers.find(n => n * magnitude >= intervalSize) * magnitude;
    }
}

//get the minimun and max from a data of all numbers and return as range
export function rangeFromData(arr){
    if(isAllNumbers(arr)){
        const minAndMax = findMinAndMax(arr);

        if(minAndMax){
            return [minAndMax.min, minAndMax.max];
        }
    }
    return [null, null];
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

    const range = isHorizontal? ranges.labelRange: ranges.valueRange;

    if(range){
        const rangeStart = range[0];
        const rangeEnd = range[1];

        const rangeDiff = (rangeEnd-rangeStart);


        const value = y;

        const perc = ((value - rangeStart)/rangeDiff);
        const pos = ((chartY+chartHeight)-(perc*chartHeight));
            
        return pos;
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

    const range = isHorizontal? ranges.valueRange: ranges.labelRange;

    if(range){
    
        const rangeStart = range[0];
        const rangeEnd = range[1];

        const rangeDiff = (rangeEnd-rangeStart);

        const value = x;

        const perc = ((value - rangeStart)/rangeDiff);
        const pos = (chartX+(perc*chartWidth));
            
        return pos;
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


//calculate chart Area

export function getChartArea(dv, layout){
    const target = dv.getTarget();

    const layoutWidth = layout.width;
    const layoutHeight = layout.height;

    let width = 0, height = 0;
    if(target){
        width = Math.max(target.offsetWidth, target.offsetHeight);
        height = (width*0.6);
    }

    
    if(layoutWidth || layoutHeight){
        width = layoutWidth;
        height = layoutHeight;
    }

    return {
        width: width,
        height: height
    };
}