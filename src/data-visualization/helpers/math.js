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

export function toNumber(value) {
    if (value == null) return NaN; // Explicitly handle null or undefined

    // Remove any commas from the string
    let cleanValue = value.toString().replace(/,/g, '');

    // Regular expression to check valid numeric formats (integer, decimal, scientific notation)
    const validNumberPattern = /^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/;

    // Test if the cleaned string matches the valid number pattern
    if (validNumberPattern.test(cleanValue)) {
        return Number(cleanValue); // Convert to a number if valid
    }

    return NaN; // Return NaN for invalid numeric formats
}


export function getNumericArray(arr) {
    return arr
        .filter(element => {
            const num = toNumber(element)
            return !isNaN(num);
        }) // Keep elements that can be converted to numbers
        .map((element) => {
            return toNumber(element);
        }); // Convert numeric strings to numbers
}


export function findMinAndMax(arr) {
    if (Array.isArray(arr)) {
        // Use filter to remove non-numeric elements
        const numericArray = getNumericArray(arr);
    
        if (numericArray.length === 0) {
            // Handle the case where there are no valid numbers in the array
            return undefined; // or any other value that makes sense in your context
        }

        return {
            min: Math.min(...numericArray),
            max: Math.max(...numericArray),
        };
    } else {
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

export function getClosest(target, value1, value2) {
    return Math.abs(target - value1) < Math.abs(target - value2) ? value1 : value2;
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

export function axisCustomSort(dv, axisLabels, dataToSort){
    const layout = dv.getLayout();

    const sort = layout.sort || {};
    const order = sort.order;
    const target = sort.target;
    const customOrder = sort.customOrder;

    if(axisLabels.values.length){

        if(target === "y" || target === "custom"){

            const combined = axisLabels.values.map((label) => [label, dataToSort.has(label)? dataToSort.get(label): null]);

            // Step 2: Sort the combined array based on the number
            const combinedSorted = customSort(combined, order, 1, customOrder);

            // Step 3: Extract the sorted numbers and strings if needed
            const sortedAxisValues = combinedSorted.map(item => item[0]);

            axisLabels.values = sortedAxisValues;
        }else {
            axisLabels.values = customSort(axisLabels.values, order, 0, customOrder);
        }
    }

}

export function pieCustomSort(dv, dataset, dataToSort){
    const layout = dv.getLayout();

    const sort = layout.sort || {};
    const order = sort.order;
    const target = sort.target;
    const customOrder = sort.customOrder;

    const labels = dataset.labels;

    if(target === "values"){
        let combined = labels.map((label) => [label, dataToSort.has(label)? dataToSort.get(label): null]);

        // Step 2: Sort the combined array based on the number
        combined = customSort(combined, order, 1, customOrder);

        // Step 3: Extract the sorted numbers and strings if needed
        const sortedLabels = combined.map(item => item[0]);

        dataset.sortedLabels = sortedLabels;
    }else {
        dataset.sortedLabels = customSort(labels, order, 0, customOrder);
    }
}


export function tableCustomSort(dv, data){
    const layout = dv.getLayout();

    const sort = layout.sort || {};
    const order = sort.order;
    const sortIndex = sort.datasetIndex;

    if (!order || sortIndex === undefined || !data.length) {
        return data; // Return original dataset if sorting conditions are not met
    }

    const combined = data[0]?.map((_, colIndex) => data.map(row => row[colIndex]));

    const sortedData = customSort(combined, order, sortIndex);

    // Convert back to column-major format
    const newData = data.map((_, rowIndex) => sortedData.map(row => row[rowIndex]));

    return newData;
}

export function customSort(values, order, index = 0, customOrder){
        
    let newValues = values.slice(); //a copy to avoid mutation

    if(order === "asc" || order === "desc"){

        const isAscending = order === "asc";

        function sortNumerically(a, b) {
            return toNumber(a) - toNumber(b);
        }

        function sortLexicographically(a, b) {
            const strA = (a != null) ? a.toString() : "";
            const strB = (b != null) ? b.toString() : "";
        
            return strA.localeCompare(strB);
        }

        newValues.sort((a, b) => {
            a = a && typeof a === "object" ? a[index] : a;
            b = b && typeof b === "object" ? b[index] : b;
        
            if (a == null && b == null) return 0; // Both are null or undefined
            if (a == null) return isAscending ? 1 : -1; // Nulls go last for ascending, first for descending
            if (b == null) return isAscending ? -1 : 1; // Nulls go last for ascending, first for descending
        
            const isANumeric = !isNaN(a) && a !== "";
            const isBNumeric = !isNaN(b) && b !== "";
        
            if (isANumeric && isBNumeric) {
                return isAscending ? sortNumerically(a, b) : sortNumerically(b, a);
            } else if (!isANumeric && !isBNumeric) {
                return isAscending ? sortLexicographically(a, b) : sortLexicographically(b, a);
            } else if (isANumeric) {
                return isAscending ? -1 : 1;
            } else {
                return isAscending ? 1 : -1;
            }
        });
        
    }else if((order === "custom" || order === "custom-desc") && customOrder){
        const isAscending = order === "custom";
        const orderMap = new Map(customOrder.map((item, index) => [item, index]));

        // Sort based on the custom order
        newValues.sort((a, b) => {
            const valA = a && typeof a === "object" ? a[index] : a;
            const valB = b && typeof b === "object" ? b[index] : b;

            const indexA = orderMap.get(valA) ?? Infinity; // Use Infinity for values not in customOrder
            const indexB = orderMap.get(valB) ?? Infinity;

            return isAscending ? indexA - indexB: indexB - indexA;
        });
    }

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

//using binary search to get column index for tables
export function scrolledColumnIndex(scrollX, cumulativeWidths, maxWidths) {

    let left = 0, right = cumulativeWidths.length - 1, mid;

    // Binary search to find the first column where cumulativeWidths[mid] > scrollX
    while (left <= right) {
        mid = Math.floor((left + right) / 2);
        if (cumulativeWidths[mid] <= scrollX) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    // At this point, right is the last column fully passed
    //if (right < 0) return scrollX / cumulativeWidths[0]; // before first column
    //if (left >= cumulativeWidths.length) return cumulativeWidths.length; // beyond last column

    const prevEdge = cumulativeWidths[right] || 0;
    const nextEdge = cumulativeWidths[left];

    const progress = (scrollX - prevEdge) / (nextEdge - prevEdge);

    return left + progress;
}



//add comma to every third digit from the right of numbers
export function commaSeparateNumber(number, separateNumbers) {
    if (!isNumber(number) || separateNumbers === false) {
        return number;
    }

    //split number into parts before and after the decimal point
    const parts = number.toString().split('.');

    // Add commas to the part before the decimal point
    parts[0] = parts[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return parts.join(".");
}

export function abbreviateNumber(number, decimalPlaces = 2){
    if (!isNumber(number) || Math.abs(number) < 1000) {
        return number;
    }

    const suffixes = ["", "K", "M", "B", "T"];
    const tier = Math.floor(Math.log10(Math.abs(number)) / 3);
    
    if (tier < 0 || tier >= suffixes.length) {
        return number.toString(); // Return original number if out of range
    }

    const scaled = number / Math.pow(1000, tier);
    const formatted = scaled.toFixed(scaled % decimalPlaces === 0 ? 0 : decimalPlaces); // Format to one decimal place if needed

    return `${formatted}${suffixes[tier]}`;
}



//find sum of an array of numbers
export function sum(arr) {
    // Calculate the sum of numeric elements
    const numericArr = getNumericArray(arr);

    const sum = numericArr.reduce((sum, current) => (toNumber(sum)||0) + (toNumber(current)), (arr[0]? 0: arr[0]) );

    return sum;
}

//find the avarage of an array of numbers
export function avg(arr) {
    // Filter out non-numeric elements
    const numericArr = getNumericArray(arr);

    // Calculate the sum of numeric elements
    const sum = numericArr.reduce((sum, current) => (toNumber(sum)||0) + (toNumber(current)), (arr[0]? 0: arr[0]));

    // Calculate the average
    return numericArr.length === 0 ? null : sum / numericArr.length;
}

export async function computeOperation(arr, operation, isNumeric){
    if(arr.length === 0){
        return null; //making sure that we do not get -infinity when array length is 0
    }

    //filter out null and undefined values
    const newArray = arr.filter(item => item !== null && item !== undefined);

    if(isNumeric){
        if(operation === "count"){
            return newArray.length;
        }else if(operation === "distinct_count"){
            const set = new Set(newArray);
            return set.size;
        }else {
            const stats = await getArrayStats(newArray);
            return stats[operation || "sum"];
        }
    }else {
        if(operation === "last"){
            return newArray[newArray.length-1];
        }else if(operation === "count"){
            return newArray.length;
        }else if(operation === "distinct_count"){
            const set = new Set(newArray);
            return set.size;
        }else {
            return newArray[0];
        }
    }
}

export function isNumber(value) {
    return typeof value === "number" && !isNaN(value);
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
        }else if(isNumber(value)) {
            numberCount++;
        }
    }

    return numberCount > (stringCount/2);
}


export async function getArrayStats(arr) {
    return new Promise((resolve) => {
        if (!Array.isArray(arr) || arr.length === 0) {
            resolve({
                isNumbers: false,
                count: 0,
                min: null,
                max: null,
                sum: null,
                avg: null,
                variance: null,
                std_dev: null,
                median: null,
                distinct_count: 0
            });
            return;
        }

        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        let sumSq = 0;
        let numericValues = [];
        const distinctSet = new Set();

        let numberCount = 0;
        let stringCount = 0;

        //for (let i = 0; i < arr.length; i++) {
        for(const [i, value] of arr.entries()){
            //const value = arr[i];

            if (isNumber(value)) {
                sum += value;
                sumSq += value * value;
                if (value < min) min = value;
                if (value > max) max = value;
                numericValues.push(value);
                distinctSet.add(value);
                numberCount++;
            }else if(typeof value === "string") {
                stringCount++;
            }
        }

        const count = numericValues.length;

        if (count === 0) {
            resolve({
                isNumbers: false,
                count: 0,
                min: null,
                max: null,
                sum: null,
                avg: null,
                variance: null,
                std_dev: null,
                median: null,
                distinct_count: 0
            });
            return;
        }

        // Sort once for median
        numericValues = customSort(numericValues, "asc");

        const average = sum / count;
        const variance = (sumSq / count) - (average * average);
        const standardDeviation = Math.sqrt(variance);

        const median =
            count % 2 === 0
                ? (numericValues[count / 2 - 1] + numericValues[count / 2]) / 2
                : numericValues[Math.floor(count / 2)];

        const isNumbers = numberCount > (stringCount / 2);

        resolve({
            isNumbers,
            count,
            min,
            max,
            sum,
            avg: average,
            variance,
            std_dev: standardDeviation,
            median,
            distinct_count: distinctSet.size
        });
    });
}



export function isObjectButNotArray(variable) {
    return typeof variable === "object" && variable !== null && !Array.isArray(variable);
}

export function isYearSeries(range){
    // Define the typical range for year values
    const minYear = 1000;
    const maxYear = 2100;

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
    if (!isNumber(number) || (!decimalPlaces && decimalPlaces !== 0)) {
        return number; // Return original value if not a valid number
    }

    const parsedNumber = number;
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

/*
export function tickStep(intervalSize, isReverse = false) {
    if (isNaN(intervalSize) || intervalSize === 0) return 0; // Handle invalid cases

    const sign = Math.sign(intervalSize); // Preserve the original sign
    const absIntervalSize = Math.abs(intervalSize);

    const niceNumbers = [1, 2, 4, 5, 10];
    const magnitude = Math.pow(10, Math.floor(Math.log10(absIntervalSize)));

    const candidates = isReverse ? [...niceNumbers].reverse() : niceNumbers;
    const roundedValue = candidates.find(n => n * magnitude >= absIntervalSize) * magnitude;

    return sign * roundedValue; // Restore the original sign
}*/

export function tickStep(intervalSize, isReverse){
    const niceNumbers = [1, 2, 4, 5, 10];

    const sign = Math.sign(intervalSize);
    const absIntervalSize = Math.abs(intervalSize);

    // Round the interval size to a nice number (1, 2, 5, or 10)
    const magnitude = Math.pow(10, Math.floor(Math.log10(absIntervalSize)));

    if(isReverse){
        niceNumbers.reverse();
        return sign * niceNumbers.find(n => n * magnitude <= absIntervalSize) * magnitude;
    }else {
        return sign * niceNumbers.find(n => n * magnitude >= absIntervalSize) * magnitude;
    }
}


/*
export function tickStep(intervalSize, isReverse){
    const niceNumbers = [1, 2, 4, 5, 10];

    // Round the interval size to a nice number (1, 2, 5, or 10)
    const magnitude = Math.pow(10, Math.floor(Math.log10(intervalSize)));

    if(isReverse){
        niceNumbers.reverse();
        return niceNumbers.find(n => n * magnitude <= intervalSize) * magnitude;
    }else {
        return niceNumbers.find(n => n * magnitude >= intervalSize) * magnitude;
    }
}*/

//get the minimun and max from a data of all numbers and return as range
export function rangeFromData(dataArray, preferredRange = [null, null], altValue) {
    if (!dataArray.length || !isAllNumbers(dataArray)) {
        return [null, null]; // Return early if array is empty or invalid
    }

    let { min: actualMin, max: actualMax } = findMinAndMax(dataArray);

    if(altValue !== null && altValue !== '' && !isNaN(altValue)){
        actualMin = altValue < actualMin? altValue: actualMin;
        actualMax = altValue > actualMax? altValue: actualMax;
    }

    const [preferredMin, preferredMax] = preferredRange;

    const finalMin = (preferredMin !== null && preferredMin !== '' && !isNaN(preferredMin)) 
        ? preferredMin : actualMin;
    const finalMax = (preferredMax !== null && preferredMax !== '' && !isNaN(preferredMax)) 
        ? preferredMax : actualMax;

    return [finalMin, finalMax];
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

    const labelAxis = axisData.xData[labelAxisName];
    const valueAxis = axisData.yData[valueAxisName];

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
    const yAxis = axisData.yData[yAxisName];

    //!xAxisName? xAxisName = "x1": null;
    //const xAxis = axisData.labels[xAxisName];

    //const isHorizontal = axisData.direction === "hr";

    if(yAxis){
        const range = yAxis.range;

        if(range){
            const rangeStart = range[0];
            const rangeEnd = range[1];

            const rangeDiff = (rangeEnd-rangeStart);

            const tickData = yAxis.tickData;

            const valueStart = Math.ceil(rangeStart / tickData.interval) * tickData.interval;
            const rangeWidth = Math.max(((valueStart+(tickData.interval*tickData.count))-rangeStart), rangeDiff);


            const perc = ((y - rangeStart) / rangeWidth);
            //const pos = ((chartY+(chartHeight-(chartY*0.5)))-(perc*(chartHeight-chartY)));
            const pos = (chartY+(chartHeight-(perc*chartHeight)));

                
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
    const axis = axisData.xData[axisName];

    if(axis){
        const range = axis.range;

        if(range){
        
            const rangeStart = range[0];
            const rangeEnd = range[1];

            const rangeDiff = (rangeEnd-rangeStart);

            const tickData = axis.tickData;
    
            const valueStart = Math.ceil(rangeStart / tickData.interval) * tickData.interval;
            const rangeWidth = Math.max(((valueStart+(tickData.interval*tickData.count))-rangeStart), rangeDiff);

            const perc = ((x - rangeStart) / rangeWidth);
            const pos = (chartX+((perc*chartWidth)));
                
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
    const axis = axisData.xData[axisName];

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
    const axis = axisData.yData[axisName];

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
                //value = ((graphY+graphHeight)-((step*(index-topIndex))+halfStep));
                value = ((graphY)+((step*(index-topIndex))+halfStep));
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

export function roundToEven(number) {
    let rounded = Math.round(number);

    // Ensure the number itself is even
    if (rounded % 2 !== 0) {
        number > 50? rounded -= 1: rounded += 1;  // If it's odd, add 1 to make it even
    }

    // Ensure half of the number is also even
    if ((rounded / 2) % 2 !== 0) {
        number > 50? rounded -= 2: rounded += 2;  // If half is odd, add 2 to make it divisible by 4
    }

    return rounded;
}

export function targetSize(dv){
    const target = dv.getTarget();
    if(!target) return;

    const computedStyle = window.getComputedStyle(target);

    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingRight = parseFloat(computedStyle.paddingRight);

    const boundingRect = target.getBoundingClientRect();

    const contentWidth = boundingRect.width - paddingLeft - paddingRight;
    const contentHeight = boundingRect.height - paddingTop - paddingBottom;

    return {
        width: contentWidth,
        height: contentHeight,
    };
}

export function projChartPosition(dv) {

    const layout = dv.getLayout();
    const maintainAspectRatio = layout?.maintainAspectRatio || false;


    const targetSize = dv.getTargetSize();
    const canvas = dv.getCanvas();

    //styling 
    const design = dv.getDesign();
    const font = design.font;

    const legendFont = design.legendFont;

    const fontSize = font.size;

    //set title space from top;
    const titleDesign = design.title || {};
    const titleFont = titleDesign.font;
    const titleFontSize = titleFont.size;

    const titleLines = layout.title.lines;
    let titleTop = titleLines.length? (((titleLines.length)*titleFontSize)+fontSize): 0;

    //subtitle 
    const subTitleDesign = design.subTitle || {};
    const subTitleFont = subTitleDesign.font;
    const subTitleFontSize = subTitleFont.size;

    const subTitleLines = layout.title.lines;
    let subTitleTop = subTitleLines.length? (((subTitleLines.length)*subTitleFontSize)+fontSize): 0;

    const legend = layout.legend;
    const legendIsDefault = legend.isDefault;
    const legendSize = legend.size;
    const singleLegendSize = (legend.maxWidth+(fontSize*2));
    const legendMaxWidth = (singleLegendSize > (targetSize.width*0.2)? (targetSize.width*0.2): singleLegendSize);

    const legendPosition = legend.position || "right";
    const legendIsTopBottom = legendPosition === "top" || legendPosition === "bottom";


    canvas? canvas.style.display = "none": null;
    canvas? canvas.style.display = "": null;


    // Determine layout dimensions, falling back to target's dimensions if not specified
    let layoutWidth = layout.width;
    let layoutHeight = layout.height;

    let layoutX = 0, layoutY = (titleTop+subTitleTop);

    if(!layoutWidth || !layoutHeight){

        if(maintainAspectRatio){
            layoutWidth = targetSize.width;
            layoutHeight = targetSize.height;
        }else {
            layoutWidth = targetSize.width;
            layoutHeight = (layoutWidth/2);

            if((targetSize.height < layoutHeight) && (targetSize.height > 0)){
                layoutHeight = targetSize.height;
            }
        }
    }

    //subtract titleTop from layoutHeight
    layoutHeight = (layoutHeight-(titleTop+subTitleTop));

    
    if((legendIsDefault && legendSize > 1) || legend.display){
         //substract legendWidth
        if(legendIsTopBottom){
            layoutHeight = (layoutHeight-(legendFont.size*1.5));
        }else {
            layoutWidth = (layoutWidth-legendMaxWidth);
            
            //set layoutx if legendPosition is left
            legendPosition === "left"? layoutX = (layoutX+legendMaxWidth): null;
        }
    }


    // Set initial width and height with default fallbacks
    const width = roundToEven(layoutWidth) || (maintainAspectRatio? 1: 800);
    const height = roundToEven(layoutHeight) || (maintainAspectRatio? 1: 400);

    const x = layoutX, y = layoutY;

    return { x, y, width, height };
}
