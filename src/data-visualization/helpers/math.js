//Contains mathematical functions for data transformations, calculations, and scaling.


//finds a point on a straight line between two known points.
export function linearInterpolationX(x, x1, y1, x2, y2) {
    if (x1 === x2) {
        return y1; // Avoid division by zero
    }

    // Calculate the intermediate point (x, y)
    const y = y1 + (x - x1) * (y2 - y1) / (x2 - x1);
    return y;
}

export function linearInterpolationY(y, x1, y1, x2, y2) {
    if (y1 === y2) {
        return x1; // Avoid division by zero
    }

    // Calculate the intermediate point (x, y)
    const x = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
    return x;
}

//find the distance between two points 
export function distance(point1, point2) {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;

    // Using Math.hypot() to compute the square root of the sum of squares of its arguments
    return Math.hypot(deltaX, deltaY);
}

export function angleBetweenPoints(center, point) {
    // Compute the angle (in radians) between the positive x-axis and the line segment
    var angleRad = Math.atan2(point.y - center.y, point.x - center.x);

    // Convert radians to degrees
    var angleDeg = angleRad * (180 / Math.PI);

    // Ensure the angle is between 0 and 360 degrees
    angleDeg = (angleDeg + 360) % 360;

    return angleDeg;
}

export function getNumbericArray (arr){
    return arr.filter(element => typeof element === 'number' && !isNaN(element));
}

//find minimum numbers 
export function findMinAndMax(arr) {
    if(Array.isArray(arr)){
        // Use filter to remove non-numeric elements
        const numericArray = getNumbericArray(arr);
    
        if (numericArray.length === 0) {
            // Handle the case where there are no valid numbers in the array
            return undefined; // or any other value that makes sense in your context
        }

        let min = numericArray[0];
        let max = numericArray[0];

        for (let i = 1; i < numericArray.length; i++) {
            if (numericArray[i] < min) {
                min = numericArray[i];
            }
            if (numericArray[i] > max) {
                max = numericArray[i];
            }
        }
    
        return {
            min: min,
            max: max
        }
    }else {
        return null;
    }
}

export function getClosestToZero(arr){

    if(arr.length === 0){
        return undefined;
    }

    let closestValue = arr[0];
    let closestDifference = Math.abs(closestValue);

    for(let i = 0; i < arr.length; i++){
        const currentDifference = Math.abs(arr[i]);

        if(currentDifference < closestDifference){
            closestValue = arr[i];
            closestDifference = currentDifference;
        }
    }

    return closestValue;
}

export function removeDuplicates(array){ //remove duplicates from array but keep in the same order
    
    const seen = new Set();
    
    return array.filter(item => {
        if (seen.has(item)) {
          return false;
        } else {
          seen.add(item);
          return true;
        }
    });
}

export function axisCustomSort(dv, labels, axisData){
    const layout = dv.getLayout();

    const firstData = axisData[0] || {};
    const barDataset = firstData.type? firstData.type === "bar"? firstData.dataset: []: [];

    const sortDataset = [...barDataset, ...axisData.slice(1)].filter(dataset => 
        dataset.isSortBy
    );
    console.log("myLab: ", labels, axisData, sortDataset);

    
    const sort = layout.sort || {};
    const order = sort.order;
    
    if(order){
        const xAxis = labels["x1"];
        

        if(sortDataset.length){
            const dataset = sortDataset[0];
            let combined = xAxis.values.map((label, index) => [label, dataset.dataPoints.get(label)]);

            // Step 2: Sort the combined array based on the number
            combined = customSort(combined, order, 1);

            // Step 3: Extract the sorted numbers and strings if needed
            const sortedXAxisValues = combined.map(item => item[0]);

            xAxis.values = sortedXAxisValues;
        }else {
            xAxis.values = customSort(xAxis.values, order);
        }
    }
}

export function pieCustomSort(dv, dataset){
    const layout = dv.getLayout();

    const sort = layout.sort || {};
    const order = sort.order;

    if(order){
        const key = sort.key || "labels";
        const labels = dataset.labels;
        const values = dataset.values;

        if(key === "values"){
            let combined = labels.map((label, index) => [label, values[index]]);

            // Step 2: Sort the combined array based on the number
            combined = customSort(combined, order, 1);

            // Step 3: Extract the sorted numbers and strings if needed
            const sortedLabels = combined.map(item => item[0]);

            dataset.sortedLabels = sortedLabels;
        }else {
            dataset.sortedLabels = customSort(labels, order);
        }
    }
}

export function customSort(values, order = "asc", index = 0){
    let newValues = values.slice(); //a copy to avoid mutation

    const isAscending = order === "asc";

    function sortNumerically(a, b) {
        return Number(a) - Number(b);
    }

    function sortLexicographically(a, b) {
        return a.localeCompare(b);
    }

    newValues.sort((a, b) => {
        a = typeof(a) === "object"? a[index]: a;
        b = typeof(b) === "object"? b[index]: b;

        const isANumeric = !isNaN(a);
        const isBNumeric = !isNaN(b);

        if (isANumeric && isBNumeric) {
            // Both are numbers
            return isAscending? sortNumerically(a, b) : sortNumerically(b, a);
        } else if (!isANumeric && !isBNumeric) {
            // Both are non-numeric strings
            return isAscending? sortLexicographically(a, b) : sortLexicographically(b, a);
        } else if (isANumeric) {
            // a is numeric, b is non-numeric
            return isAscending? -1 : 1; // Numbers before strings for ascending, reverse for descending
        } else {
            // a is non-numeric, b is numeric
            return isAscending? 1 : -1; // Strings after numbers for ascending, reverse for descending
        }
    });

    return newValues;
}

export function getNumberInRange(number, range){
    const rangeMin = Math.min(...range);
    const rangeMax = Math.max(...range);

    if(isNaN(rangeMin) || isNaN(rangeMax)){
        return null;
    }

    if(number < rangeMin){
        return rangeMin;
    }else if(number > rangeMax){
        return rangeMax;
    }else {
        return number;
    }
}

//add comma to every third digit from the right of numbers
export function commaSeparateNumber(number, separateNumbers) {
    if (typeof number !== 'number' || isNaN(number) || separateNumbers === false) {
        return number;
    }

    //split number into parts before and after the decimal point
    const parts = number.toString().split('.');

    // Add commas to the part before the decimal point
    parts[0] = parts[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return parts.join(".");
}


//find sum of an array of numbers
export function sum(arr) {
    // Filter out non-numeric elements
    const numericArr = getNumbericArray(arr);

    // Calculate the sum of numeric elements
    return numericArr.reduce((sum, current) => sum + current, 0);
}

//find the avarage of an array of numbers
export function avg(arr) {
    // Filter out non-numeric elements
    const numericArr = getNumbericArray(arr);

    // Calculate the sum of numeric elements
    const sum = numericArr.reduce((sum, current) => sum + current, 0);

    // Calculate the average
    return numericArr.length === 0 ? 0 : sum / numericArr.length;
}

export function computeOperation(operation, arr){
    if(arr.length === 0){
        return 0; //making sure that we do not get -infinity when array length is 0
    }

    if(operation === "avg"){
        return avg(arr);
    }else if(operation === "min"){
        return Math.min(...getNumbericArray(arr));
    }else if(operation === "max"){
        return Math.max(...getNumbericArray(arr));
    }else if(operation === "count"){
        return arr.length;
    }else {
        return sum(arr); //sum is the default
    }
}

//Function that returns true if an array contains all numbers.
export function isAllNumbers(arr) {
    if(!arr){
        return null;
    }
    //return arr.every(element => typeof element === 'number');
    let numberCount = 0;
    let stringCount = 0;

    for(let i = 0; i < arr.length; i++){
        const value = arr[i];
        const type = typeof value;

        if(type === "string"){
            stringCount++;
        }else if(type === "number") {
            numberCount++;
        }
    }

    return numberCount > (stringCount/2);
}

export function isYearSeries(range){
    // Define the typical range for year values
    const minYear = 1000;
    const maxYear = 9999;

    const minRange = range[0];
    const maxRange = range[1];

    // Check if the data series is an array
    if (isNaN(minRange) || isNaN(maxRange)) {
        return false;
    }

    if(minRange < minYear || maxRange > maxYear){
        return false;
    }


    return true;

}

//Function to get the next key given a key in a Map
export function getMapNextKey(map, currentKey){
    let keysArray = Array.from(map.keys());
    let currentIndex = keysArray.indexOf(currentKey);

    if(currentIndex === -1 || currentIndex === keysArray.length -1){
        return null;
    }

    return keysArray[currentIndex + 1];
}

export function hasDecimal(number){
    return number !== Math.floor(number);
}

export function haveOppositeSigns(num1, num2) {
    return (num1 >= 0 && num2 < 0) || (num1 < 0 && num2 >= 0);
}

/*
export function toFixedIfNeeded(number, decimalPlaces){
    if (typeof number !== 'number' || isNaN(number)) {
        return number; // Return original value if not a valid number
    }
   
    if(Number.isInteger(number)){
        return number.toFixed(decimalPlaces || 0);
    }else {
        if(!isNaN(decimalPlaces)){
            return number.toFixed(decimalPlaces);
        }else {
            const numberStr = number.toString();
            const splitNumberStr = numberStr.split(".");
            let nonZeroIndex = splitNumberStr[1].search(/[^0]/);

            nonZeroIndex? nonZeroIndex += 1: null;


            return parseFloat(number.toFixed(nonZeroIndex || 1));
        }
    }
   
}*/

export function toFixedIfNeeded(number, decimalPlaces) {
    if (typeof number !== 'number' || isNaN(number)) {
        return number; // Return original value if not a valid number
    }

    const parsedNumber = parseFloat(number);
    let result = parsedNumber;

    if (Number.isInteger(parsedNumber)) {
        result = parsedNumber.toFixed(decimalPlaces || 0); // Round integer numbers
    } else {
        const numberStr = parsedNumber.toString();
        const decimalIndex = numberStr.indexOf('.');
        
        if (decimalIndex !== -1) {
            const fractionalPart = numberStr.substring(decimalIndex + 1);
            const nonZeroIndex = fractionalPart.search(/[^0]/);

            if (nonZeroIndex === -1) {
                result = parsedNumber.toFixed(0); // Return integer part if all decimals are zeros
            } else {
                const newDecimalPlaces = !isNaN(decimalPlaces)? decimalPlaces: nonZeroIndex + 1;
                result = parsedNumber.toFixed(newDecimalPlaces);
            }
        } else {
            result = parsedNumber; // Return original value if no decimal part
        }
    }

    return parseFloat(result);
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
    const niceNumbers = [1, 2, 4, 5, 10];

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


export function zeroBasedRangeAdjust(range, interval){
    let rangeStart = range[0], rangeEnd = range[1];

    rangeStart = interval * Math.floor(rangeStart / interval);
    rangeEnd = interval * Math.ceil(rangeEnd / interval);

    return [rangeStart, rangeEnd];
}

//find next position
export function findAxisBoundPositions(dv, index, labels, values, valueAxisName, labelAxisName, lastPosition, isDrawStarted, loopStart, loopEnd){
    
    let prevPosition = lastPosition;
    let nextPosition = getAxisPosition(dv, labels[index], values[index], valueAxisName, labelAxisName);

    let newIndex = index;

    if(!isDrawStarted){
      
        let isInLoop = (newIndex >= loopStart && newIndex <= loopEnd);
        
        while(posIsOutOfBound(dv, nextPosition) && isInLoop){
            newIndex++;
            isInLoop = (newIndex >= loopStart && newIndex <= loopEnd);

            prevPosition = {...nextPosition};
            nextPosition = getAxisPosition(dv, labels[newIndex], values[newIndex], valueAxisName, labelAxisName);

            if(!nextPosition){
                break;
            }
        }
    }

    return {next: nextPosition, prev: prevPosition};
}

//check if positon is out of range or not
export function posIsOutOfRange(dv, label, value, labelAxisName, valueAxisName){
    const layout = dv.getLayout();

    !labelAxisName? labelAxisName = "x1": null;
    !valueAxisName? valueAxisName = "y1": null;

    const axisData = layout.axisData;

    const labelAxis = axisData.labels[labelAxisName];
    const valueAxis = axisData.values[valueAxisName];

    let labelIsOut = false;
    let valueIsOut = false;

    if(labelAxis){
        const range = labelAxis.range;
        if(range){
            const start = range[0];
            const end = range[1];
            label < start || label > end? labelIsOut = true: null;
        }
    }

    if(valueAxis){
        const range = valueAxis.range;
        if(range){
            const start = range[0];
            const end = range[1];

            value < start || value > end? valueIsOut = false: null;
        }
    }

    return labelIsOut || valueIsOut;
}

export function posIsOutOfBound(dv, position){
    const layout = dv.getLayout();
    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    if(position.x > (graphX+graphWidth) || position.x < (graphX)){
        return true;
    }

    if(position.y > (graphY+graphHeight) || position.y < (graphY)){
        return true;
    }

    return false;
}


//calculates data position on graph
export function posOnGraph(dv, position){
    const x = posOnGraphXAxis(dv, position.x);
    const y = posOnGraphYAxis(dv, position.y);

    return {x: x, y: y};
}

export function posOnGraphYAxis(dv, y, yAxisName, xAxisName){
    const layout = dv.getLayout();

    //stores the position and dimensions of the graph area
    //const chartPosition = graphPosition(dv, dataType, canvasWidth, canvasHeight);
    const chartPosition = layout.graphPosition;
    const chartY = chartPosition.y;
    const chartHeight = chartPosition.height;


    const axisData = layout.axisData;

    !yAxisName? yAxisName = "y1": null;
    const yAxis = axisData.values[yAxisName];

    //!xAxisName? xAxisName = "x1": null;
    //const xAxis = axisData.labels[xAxisName];

    //const isHorizontal = axisData.direction === "hr";

    if(yAxis){
        const range = yAxis.range;

        if(range){
            const rangeStart = range[0];
            const rangeEnd = range[1];

            const rangeDiff = (rangeEnd-rangeStart);


            //const value = getNumberInRange(y, range);

            const perc = ((y - rangeStart)/rangeDiff);
            const pos = ((chartY+chartHeight)-(perc*chartHeight));
                
            return pos;
        }
    }

    return y;
}

export function posOnGraphXAxis(dv, x, axisName){
    const layout = dv.getLayout();

    //stores the position and dimensions of the graph area
    //const chartPosition = graphPosition(dv, dataType, canvasWidth, canvasHeight);
    const chartPosition = layout.graphPosition;
    const chartX = chartPosition.x;
    const chartWidth = chartPosition.width;

    const axisData = layout.axisData;

    !axisName? axisName = "x1": null;
    const axis = axisData.labels[axisName];

    if(axis){
        const range = axis.range;

        if(range){
        
            const rangeStart = range[0];
            const rangeEnd = range[1];

            const rangeDiff = (rangeEnd-rangeStart);

            //const value = getNumberInRange(x, range);

            const perc = ((x - rangeStart)/rangeDiff);
            const pos = (chartX+(perc*chartWidth));
                
            return pos;
        }
    }
    
    return x;
    
}


export function getAxisPosition(dv, label, value, valueAxisName, labelAxisName){
    return {
        x: getAxisLabelPosition(dv, label, labelAxisName),
        y: getAxisValuePosition(dv, value, valueAxisName)
    };
}

export function getAxisLabelPosition(dv, label, axisName){

    const layout = dv.getLayout();

    const design = dv.getDesign();
    const font = design.font;

    const fontSize = font.size;

    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x;
    const graphWidth = graphPosition.width;

    const axisData = layout.axisData;

    !axisName? axisName = "x1": null;
    const axis = axisData.labels[axisName];

    if(axis){
        const labelIsAllNumbers = axis.isAllNumbers;
        const axisLabels = axis.values;

        if(!labelIsAllNumbers){

            let step = (graphWidth/axisLabels.length);
            step < fontSize? step = fontSize: null;

            const halfStep = (step/2);
            const index = axisLabels.indexOf(label);

            if(index >= 0){
                const leftIndex = (dv.getScrollData().leftIndex);
                label = (graphX+((step*(index-leftIndex))+halfStep));
            }
        }else {
            label = posOnGraphXAxis(dv, label);
        }
    }

    return label;
}

export function getAxisValuePosition(dv, value, axisName){
    const layout = dv.getLayout();

    const design = dv.getDesign();
    const font = design.font;

    const fontSize = font.size;

    const graphPosition = layout.graphPosition;
    const graphY = graphPosition.y;
    const graphHeight = graphPosition.height;

    const axisData = layout.axisData;

    !axisName? axisName = "y1": null;
    const axis = axisData.values[axisName];

    if(axis){
        const valueIsAllNumbers = axis.isAllNumbers;
        const axisValues = axis.values;

        if(!valueIsAllNumbers){

            let step = (graphHeight/axisValues.length);
            step < fontSize? step = fontSize: null;

            const halfStep = (step/2);
            const index = axisValues.indexOf(value);
            
            if(index >= 0){
                const topIndex = (dv.getScrollData().topIndex);
                value = ((graphY+graphHeight)-((step*(index-topIndex))+halfStep));
            }
        }else {
            value = posOnGraphYAxis(dv, value, axisName);
        }
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
/*
export function getChartArea(dv, layout){
    const target = dv.getTarget();

    const layoutWidth = layout.width;
    const layoutHeight = layout.height;

    let width = 700, height = 350;

    
    if(layoutWidth || layoutHeight){
        width = !layoutWidth? (layoutHeight*2): layoutWidth;
        height = !layoutHeight? (layoutWidth*0.5): layoutHeight;
    }else {
        if(target){
            const targetWidth = target.offsetWidth, targetHeight = target.offsetHeight;
            
            if(targetWidth > targetHeight){
                width = targetWidth;
                height = (targetWidth/2);
            }else {
                if(targetWidth || targetHeight){
                    width = (targetWidth || width);
                    height = (width/2);
                }
            }
        }
    }

    return {
        width: width,
        height: height
    };
}*/

export function getChartArea(dv, layout){
    const target = dv.getTarget() || {};

    const layoutWidth = layout.width || target.offsetWidth;
    const layoutHeight = layout.height || target.offsetHeight;

    let width = layoutWidth || (layoutHeight? (layoutHeight*2): 700), height = layoutHeight || (layoutWidth? (layoutWidth/2): 350);

    const heightTwice = height * 2;

    if(heightTwice > layoutWidth){
        height = width / 2;
    }else if(heightTwice < layoutWidth){
        width = height * 2;
    }
    

    return {
        width: width,
        height: height
    };
}

/*export function getChartArea(dv, layout){
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
*/