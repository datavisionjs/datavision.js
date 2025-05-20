import * as Calc from './math.js';
import * as Global from './global.js';

import customColors from '../helpers/colors.js';

export function setGraphPosition(dv){
    const chartArea = Calc.projChartPosition(dv);
    const canvasWidth = chartArea.width, canvasHeight = chartArea.height;

    //layout 
    const layout = dv.getLayout();
    
    //styling 
    const design = dv.getDesign();
    const font = design.font;
    const titleDesign = design.title;

    const titleFont = titleDesign.font;
    const titleFontSize = titleFont.size;

    const fontSize = font.size;

    //maxLabel Width 
    const yLabelMaxWidth = canvasWidth * 0.30;
    const xLabelMaxWidth = canvasHeight * 0.30;

    const getAxisWidth = (hasTitle, textMaxWidth, maxLabelWidth) => {
        if(!layout.hasAxisData){
            return 0;
        }
        
        const twiceFontSize = fontSize * 2;

        let width = 0;
        if(textMaxWidth){
            if(textMaxWidth < maxLabelWidth){
                width = textMaxWidth + twiceFontSize;
            }else {
                width = maxLabelWidth;
            }
        }

        hasTitle? width += twiceFontSize: null;

        return width;
    }


    const axisData = layout.axisData;
    const labelObject = axisData.xData;
    const valueObject = axisData.yData;
    const axisTitleSpace = (fontSize*2);


    //y1
    const y1 = valueObject.y1;
    const y1MaxWidth = y1.maxWidth;
    const y1Title = layout.yAxis? layout.yAxis.title: null;
    let yAxisLeft = getAxisWidth(y1Title, y1MaxWidth, yLabelMaxWidth);
    

    //y2
    const y2 = valueObject.y2;
    const y2MaxWidth = y2.maxWidth;
    const y2Title = layout.y2Axis? layout.y2Axis.title: null;
    let yAxisRight = getAxisWidth((y2Title && (y2MaxWidth>0)), y2MaxWidth, yLabelMaxWidth);

    //dataset labels 
    let datasetSpace = yLabelMaxWidth;

    const legend = layout.legend;
    const legendIsDefault = legend.isDefault;
    const legendSize = legend.size;

    const legendMaxWidth = legend.maxWidth;

    if((legendIsDefault && legendSize > 1) || legend.display){
        legendMaxWidth < datasetSpace? datasetSpace = (legendMaxWidth+axisTitleSpace): datasetSpace = (canvasWidth*0.2);
    }else {
        datasetSpace = 0;
    }

    //x1
    //set x axis space from bottom
    let xAxisRight = 0;
    const tempGraphWidth = (canvasWidth-(yAxisLeft+yAxisRight));

    const x1 = labelObject.x1;
    const x1MaxWidth = x1.maxWidth;
    const labelStep = (tempGraphWidth/x1.values.length);

    //give space to the right of the x axis using x1MaxWidth
    xAxisRight = x1.isAllNumbers? x1MaxWidth: 0;

    const x1Title = layout.xAxis? layout.xAxis.title: null;
    let xAxisBottom = getAxisWidth(x1Title, (x1MaxWidth? fontSize: 0), xLabelMaxWidth);
    if(!x1.isAllNumbers && ((labelStep/fontSize) < 4)){
        xAxisBottom = getAxisWidth(x1Title, x1MaxWidth, xLabelMaxWidth);
    }


    const graphX = (yAxisLeft), graphY = layout.hasTableData? 0: (fontSize);
    const graphWidth = (canvasWidth-(yAxisLeft+yAxisRight+xAxisRight));
    const graphHeight = (canvasHeight-(xAxisBottom+graphY));

    const graphPosition = {
        x: graphX,
        y: graphY,
        width: Math.max(0, graphWidth),
        height: Math.max(0, graphHeight),
        yAxisRight: yAxisRight,
        maxLabelWidth: {
            x1: xLabelMaxWidth,
            y1: yLabelMaxWidth,
            y2: yLabelMaxWidth,
        }
    }

    //set graphposition
    dv.layout = {
        ...layout, 
        graphPosition: graphPosition
    };
    
}


function getTickData(range, isPercent){ 
    if(!range) return {count: 0, range: range};

    const min = range[0], max = range[1];

    let desiredTickCount = 4;

    let rangeStart = min, rangeEnd = max;
    let tickCount = desiredTickCount;
    let interval = 0;

    if(!isNaN(rangeStart) && !isNaN(rangeEnd)){
        let intervalSize = 0;

        if(rangeStart === rangeEnd){
            rangeStart = rangeStart-1;
            rangeEnd = rangeEnd+1;
        }
        
        if(rangeStart <= 0 && rangeEnd >= 0){
            intervalSize = Math.max((Math.abs(rangeStart) + Math.abs(rangeEnd)) / Math.max(desiredTickCount, 1));
        }else {

            if(rangeStart <= 0){
                //intervalSize = Math.abs(rangeStart / Math.max(desiredTickCount - 1, 1));
                intervalSize = (rangeEnd-rangeStart) / Math.max(desiredTickCount, 1);
            }else if(rangeStart > 0){
                // Calculate the interval size based on the desired number of ticks
                intervalSize = (rangeEnd-rangeStart) / Math.max(desiredTickCount, 1);
            }

        }

        interval = Calc.getClosest(intervalSize, Calc.tickStep(intervalSize, true), Calc.tickStep(intervalSize));

        if(rangeStart > 0 && rangeStart < interval){
            rangeStart = 0;
        }

        const newRangeDiff = (rangeEnd-rangeStart);
        // Calculate the number of ticks
        tickCount = Math.round(newRangeDiff / interval);

        if(tickCount <= 1){
            rangeStart = 0;
            tickCount = Math.round(rangeEnd / interval);
        }
    }

    //adjust tickCount
    let valueStart = Math.ceil(rangeStart / interval) * interval;
    if(valueStart > rangeStart){
        tickCount = (tickCount - 1);
    }

    return {
        count: tickCount,
        range: [rangeStart, rangeEnd],
        interval: interval,
    }
}


function fillData(filledData, toFillData, axisValues){

    if(axisValues.length > 0){
        for(let i = 0; i < axisValues.length; i++){
            const value = axisValues[i];
            toFillData.push(value);
        }
    }else {
        toFillData = Array.from({ length: filledData.length }, (_, index) => index);
    }
}


function getAxisFromLayout(layout, key){
    let axisName = (key === "y1" || key === "yAxis")? "yAxis": "";
    axisName = (key === "y2" || key === "y2Axis")? "y2Axis": axisName;
    axisName = (key === "x1" || key === "xAxis")? "xAxis": axisName;

    return layout[axisName];
}


function setAxisProperties(dv, isZeroBased, axisObject, type){
    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    for(let key in axisObject){
        const axis = axisObject[key];
        const tickFormat = axis.tickFormat || {};

        const values = Array.from(axis.values);
        const axisMaxWidth = axis.maxWidth;

        const isAllNumbers = Calc.isAllNumbers(values);

        const design = dv.getDesign();
        let font = design.xAxis.font;

        const isPercent = tickFormat.isPercent; //is range format percent?

        let targetAxis = {};
        if(type === "y"){
            if(key === "y2"){
                if(layout.y2Axis){
                    targetAxis = layout.y2Axis
                }

            }else {
                if(layout.yAxis){
                    targetAxis = layout.yAxis
                }
                font = design.yAxis.font;
            }
        }else {
            layout.xAxis? targetAxis = layout.xAxis: null;
        }

        ctx.font = font.weight + " " + font.size + "px " + font.family;
        let range = Calc.rangeFromData(values, targetAxis.range, (isZeroBased? 0:null));
        const title = targetAxis.title || "";
       
        const tick = getTickData(range, isPercent);

        const tickRange = tick.range;
        
        const tickRangeStart = tickRange[0], tickRangeEnd = tickRange[1];

        let maxWidth = axisMaxWidth;

        if(isAllNumbers){
            const decimalPlaces = tickFormat? tickFormat.decimalPlaces: null;
            const prefix = tickFormat? tickFormat.prefix || "": "";
            const suffix = tickFormat? tickFormat.suffix || "": "";

            if( !isNaN(tickRangeStart) && !isNaN(tickRangeEnd) ){
                const startWidth = ctx.measureText(prefix + Calc.toFixedIfNeeded(tickRangeStart, decimalPlaces) + suffix).width;
                const endWidth = ctx.measureText(prefix + Calc.toFixedIfNeeded(tickRangeEnd, decimalPlaces) + suffix).width;

                maxWidth = Math.max(startWidth, endWidth);
            }
        }

        if(tickFormat){
            if(!tickFormat.separateNumbers){
                tickFormat.separateNumbers = !Calc.isYearSeries(tick.range);
            }
        }

        axis.values = values;
        axis.title = title;
        axis.maxWidth = maxWidth;
        axis.range = tick.range;
        axis.tickData = tick;
        axis.isAllNumbers = isAllNumbers;
        axis.tickFormat = {...tickFormat};
    }
};

function setPieProperties(pieData){
    pieData.forEach(pieObject => {

        const labels = pieObject.labels;
        const values = pieObject.values;
        
        const labelLayout = pieObject.labelLayout;
        const valueLayout = pieObject.valueLayout;

        if(labelLayout && valueLayout){
            const valueRange = Calc.rangeFromData(values);
            const valueTick = getTickData(valueRange);

            const valueTickFormat = {...valueLayout.tickFormat};
            if(valueTickFormat){
                if(!valueTickFormat.separateNumbers){
                    valueTickFormat.separateNumbers = !Calc.isYearSeries(valueTick.range);
                }
            }
            //set values tickformat
            pieObject.valueLayout.tickFormat = valueTickFormat;

            const labelRange = Calc.rangeFromData(labels);
            const labelTick = getTickData(labelRange);

            const labelTickFormat = {...labelLayout.tickFormat};
            if(labelTickFormat){
                if(!labelTickFormat.separateNumbers){
                    labelTickFormat.separateNumbers = !Calc.isYearSeries(labelTick.range);
                }
            }

            //set labels tickformat
            pieObject.labelLayout.tickFormat = labelTickFormat;
        }
    });
}



export function setUpChart(dv){

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const data = dv.getData();

    
    const design = dv.getDesign();
    const font = design.font;

    const fontSize = font.size;
    const twiceFontSize = fontSize * 2;
    ctx.font = font.weight + " " + fontSize+"px "+ font.family;

    //get scroll data 
    const scrollData = dv.getScrollData();

    //stores the number of bars for each category
    let maxBarPerCategory = 1;

    let pieMaxLabelWidth = 0;

    const axisData = {
        type: "axis",
        colors: [], 
        dataset: [], 
        stackSums: new Map(),
        barDatasetCount: 0,
        maxValue: 0,
        minValue: 0,
        attributeIsSet: false
    };

    const pieData = [];
    const tableData = [];

    //sort objects
    const layoutSort = layout.sort || {};
    const sortDatasetIndex = layoutSort.datasetIndex;
    const sortTarget = layoutSort.target || "";
    const customIndex = layoutSort.customIndex;

    //storing univ scatter plot size range
    const sizeRange = {};

    const dataToSort = new Map();

    const legendData = {
        data: new Map(),
        names: [],
        maxWidth: 0
    };

    let axisDataCount = 0;

    //all axischart labels and values
    class NewAxis {
        constructor() {
            this.values = new Set();
            this.range = null;
            this.maxWidth = 0;
            this.tickData = null;
            this.isAllNumbers = false;
        }
    };

    let axisXIsKey = true;
    const axisXData = {x1: new NewAxis()};
    const axisYData = { y1: new NewAxis(), y2: new NewAxis()};


    const axisChartTypes = Global.getAxisChartTypes();

    let hasAxisData = false;
    let hasBarDataset = false;

    let hasPieData = false;
    let hasTableData = false;
    let axisDirection = null;



    //get range from data 
    if(data){
    
        //loop through data and set xRange and yRange
        const tempData = data;
        const tempDataLength = tempData.length;
        const prevDataset = {labels: [], values: [], xData: [], yData: []};

        const stackTrackValues = new Map(); //track and add values of stacked bars for range

        for(let i = 0; i < tempDataLength; i++){
            const dataset = {...tempData[i]};

            const dataValueAxis =  dataset.yAxis || "y1";
            const dataLabelAxis = dataset.xAxis || "x1";

            const dataName = dataset.name;
            const chartType = dataset.type;
            const design = dataset.design || {};

            let maxLabelWidth = 0;
            let maxValueWidth = 0;

            //axis dataset
            const dataPoints = new Map();
            const axisLabelBuckets = new Map();
            //const axisValueBuckets = new Map();
            const axisSizeBuckets = new Map();
            const customDataBuckets = new Map();

            const sizeObj = design.size || {};
            const sizeData = sizeObj.data || [];

            const customData = dataset.custom && Array.isArray(dataset.custom)? [...(dataset.custom || [])]: [];

            const isBubble = chartType === "scatter" && sizeData.length;

            if(isBubble){
                sizeObj.isAllNumber = Calc.isAllNumbers(sizeData);
            }

            //custom data is all numbers 
            if(customData.length){
                customData.map((innerObj) => {
                    innerObj? innerObj.isAllNumber = Calc.isAllNumbers(innerObj.data): null;
                });
            }

            if(axisChartTypes.includes(chartType) && !(hasPieData || hasTableData)){

                const yAxis = dataValueAxis === "y2"? axisYData.y2: axisYData.y1;
                const xAxis = axisXData[dataLabelAxis];

                const xData =  dataset.x? dataset.x.slice(): [];
                const yData = dataset.y? dataset.y.slice(): [];
            
                //fill empty data
                if(xData.length === 0){
                    fillData(yData, xData, prevDataset.xData);
                }
                if(yData.length === 0){
                    fillData(xData, yData, prevDataset.yData);
                }
            
                prevDataset.xData = xData.slice();
                prevDataset.yData = yData.slice();

                const barData = {
                    dataPoints: new Map(),
                    customDataPoints: new Map(), 
                    xAxis: dataLabelAxis,
                    yAxis: dataValueAxis
                };
                
                const xDataStats = Calc.getArrayStats(xData);
                const yDataStats = Calc.getArrayStats(yData);

                const xDataIsAllNumber = xDataStats.isNumbers;
                let yDataIsAllNumber = yDataStats.isNumbers;
            
                //get and set tick format
                const layoutXAxis = getAxisFromLayout(layout, dataLabelAxis);
                const xAxisTickFormat = xAxis.tickFormat = layoutXAxis? {...layoutXAxis.tickFormat}: {};
                const xPrefix = xAxisTickFormat.prefix || "", xSuffix = xAxisTickFormat.suffix || "";
                const xDecimalPlaces = xAxisTickFormat.decimalPlaces;
            
                const layoutYAxis = getAxisFromLayout(layout, dataValueAxis);
                const yAxisTickFormat = yAxis.tickFormat = layoutYAxis? {...layoutYAxis.tickFormat}: {};
                const yPrefix = yAxisTickFormat.prefix || "", ySuffix = yAxisTickFormat.suffix || "";
                const yDecimalPlaces = yAxisTickFormat.decimalPlaces;
            
                const operation = dataset.operation;
            
                //const loopEnd = xData.length > 0? xData.length: yData.length;
                //if min is 0 get the max
                const loopEnd = Math.min(xData.length, yData.length) || Math.max(xData.length, yData.length);
            
                let lastMaxValue = "", lastMaxLabel = "";

                if(chartType === "histogram"){ //set binWidth to barData
                    const min = xDataStats.min, max = xDataStats.max;
                    const n = xData.length;

                    let binCount, binWidth;

                    if(dataset.binWidth){
                        binWidth = dataset.binWidth;
                        binCount = Math.ceil((max - min) / binWidth);
                    } else {
                        binCount = dataset.binCount || Math.ceil(Math.log2(n) + 1); //Sturges Formula
                        binWidth = dataset.binWidth || ((max - min) / binCount);
                    }
                    
                    barData.binCount = binCount;
                    barData.binWidth = binWidth;
                    axisData.barSize = binWidth;

                    yDataIsAllNumber = true; //histogram's y axis is numeric
                }
            
                for(let j = 0; j < loopEnd; j++){
                    
                    const xValue = xData[j];
                    const yValue = yData[j];
                    
                    //set maxTextlength
                    const labelToMeasure = xDataIsAllNumber? xPrefix + Calc.toFixedIfNeeded(xValue, xDecimalPlaces) + xSuffix: xValue + "";
                    let labelWidth = (xValue+"").length > (lastMaxLabel+"").length? ctx.measureText(labelToMeasure).width: null;
            
                    //If there's a value between 0 and -10 set the value to -10 and for measurement.
                    const valueToMeasure = yDataIsAllNumber? yPrefix + Calc.toFixedIfNeeded((yValue < 0 && yValue > 10? -10: yValue), yDecimalPlaces) + ySuffix: yValue+"";
                    let valueWidth = valueToMeasure.length > (lastMaxValue+"").length? ctx.measureText(valueToMeasure).width: 0;
                    
                    //loop to assign direction and mode to axisData if a bar dataset includes it.
                    if(!axisData.attributeIsSet){

                        for(let k = 0; k < tempData.length; k++) {
                            const data = tempData[k];
        
                            if(chartType === "bar"){
                                if(data.direction === "hr"){
                                    axisData.direction = data.direction;
                                }
                            }

                            if(data.mode === "stack"){
                                axisData.mode = data.mode;
                            }
                            if(data.format === "percent"){
                                axisData.format = data.format;
                            }
                        }

                        axisData.attributeIsSet = true;
                    }
            
                    if(chartType === "bar"){
                        
                        const isHorizontal = axisData.direction === "hr";
            
                        const newYValue = isHorizontal? xValue: yValue;
                        const newXValue = isHorizontal? yValue: xValue;
            
                        const newYDataIsAllNumber = isHorizontal? xDataIsAllNumber: yDataIsAllNumber;
                        const newXDataIsAllNumber = isHorizontal? yDataIsAllNumber: xDataIsAllNumber;
            
                        const prefix = isHorizontal? xPrefix: yPrefix;
                        const suffix = isHorizontal? xSuffix: ySuffix;
                        const decimalPlaces = isHorizontal? xDecimalPlaces: yDecimalPlaces;
            
                        //set axisData xDataIsAllNumber to newXDataIsAllNumber
                        axisData.xDataIsAllNumber = newXDataIsAllNumber;

                        //set axisYData as label
                        isHorizontal? axisXIsKey = false: null;
            
                        if(barData.dataPoints.has(newXValue)){
            
                            const labelValues = barData.dataPoints.get(newXValue);

                            //set maxBarPerCategory if labelValues is more then the current value.
                            labelValues.length > maxBarPerCategory? maxBarPerCategory = labelValues.length: null;
                            labelValues.push(newYValue);

                            //push custom 
                            const customLabelValues = barData.customDataPoints.get(newXValue);

                            if(customLabelValues){
                                customLabelValues.map((innerArray, index) => {
                                    const customObj = customData[index] || {};
                                    const cData = customObj.data || [];

                                    innerArray.push(cData[j]);
                                });
                            }

                            
                        //}else if(!newXDataIsAllNumber? (newXValue+"").length > 0:true){
                        }else {
            
                            barData.dataPoints.set(newXValue, [newYValue]);


                            //set custom data
                            if(customData.length){
                                barData.customDataPoints.set(newXValue,
                                    customData.map((innerArray) => {
                                        return [(innerArray||{}).data? innerArray.data[j]: null];
                                    })
                                )
                            }
            
                            dataset.direction === "hr"? axisDirection = "hr": null;
                            hasBarDataset = true;
                        }
            
                        if(j === (loopEnd-1)){//at the end of the j loop
            
                            //Set the barSize base on the min key difference (how far aprart the labels are on the axis)
                            const isAllNumbers = isHorizontal? yDataIsAllNumber: xDataIsAllNumber; //check if the base of the bars is all numbers
                            if(isAllNumbers){
            
                                let keysArray = Array.from(barData.dataPoints.keys());
                                keysArray.sort((a, b) => {return a-b; });
            
                                for(let k = 0; k < keysArray.length; k++){
                                    const key = keysArray[k];
                                    const nextIndex = k !== keysArray.length - 1? (k+1): null;
            
                                    const nextKey = keysArray[nextIndex];
                                    let newSize = nextKey? Math.abs(nextKey-key): null;

                                    
                                    const currentSize = axisData.barSize;
                                    if(newSize){
                                        currentSize? currentSize > newSize? axisData.barSize = newSize: null: axisData.barSize = newSize;
                                    }
                                }
                            }
                            
                            //if(yDataIsAllNumber || xDataIsAllNumber){
                            if(barData.dataPoints.size > 0){
            
                                //loop through barData dataPoints bucket and execute the operation
                                barData.dataPoints.forEach((bucket, key) => {
            
                                    if(bucket.length > 0){
                                        let newValue = Calc.computeOperation(bucket, operation, newYDataIsAllNumber);
            
                                        const newValueWidth = ctx.measureText(prefix + Calc.toFixedIfNeeded(newValue, decimalPlaces) + suffix).width;
            
                                        barData.dataPoints.set(key, newValue);
                                        //sort 
                                        if(sortDatasetIndex || sortTarget){
                                            if(sortTarget === "y"){
                                                if(sortDatasetIndex === i || isNaN(sortDatasetIndex)){
                                                    const lastSortValue = dataToSort.get(key);
                                                    const newSortValue = (newValue || 0);
                                                    dataToSort.set(key, lastSortValue? (lastSortValue+newSortValue): newSortValue);
                                                }
                                            }
                                        }
            
                                        //add stack value to properly show axis range
                                        if(axisData.mode === "stack"){
                                            const lastStack = stackTrackValues.has(key)? stackTrackValues.get(key): [0, 0];
                                            const lastValue = newValue >= 0? (lastStack[0]): (lastStack[1]);
            
                                            newValue = (lastValue+newValue);
            
                                            const currentStack = newValue >= 0? [newValue, lastStack[1]]: [lastStack[0], newValue];
                                            stackTrackValues.set(key, currentStack);

                                            if(axisData.format === "percent"){
                                                const keyRange = axisData.stackSums.get(key) || {min: 0, max: 0};
                
                                                const max = keyRange.max || newValue;
                                                const min = keyRange.min || newValue;
                                                        
                                                keyRange.max = Math.max(max, newValue);
                                                keyRange.min = Math.min(min, newValue);

                                                axisData.stackSums.set(key, keyRange);
                                            }
                                        }
                                        
            
                                        if(isHorizontal){
                                            xAxis.values.add(newValue);
                                            xAxis.tickFormat["isPercent"] = axisData.format === "percent";
                                            
                                            if(newValueWidth > maxLabelWidth){
                                                maxLabelWidth = newValueWidth;
                                            }

                                        }else {
                                            yAxis.values.add(newValue);
                                            yAxis.tickFormat["isPercent"] = axisData.format === "percent";
            
                                            if(newValueWidth > maxValueWidth){
                                                maxValueWidth = newValueWidth;
                                            }
                                        }

                                        const maxValue = axisData.maxValue || newValue;
                                        const minValue = axisData.minValue || newValue;
                                        
                                        axisData.maxValue = Math.max(maxValue, newValue);
                                        axisData.minValue = Math.min(minValue, newValue);
                                    }

                                    //custom data 
                                    const customBuckets = barData.customDataPoints.get(key);

                                    if(customBuckets){
                                        customBuckets.map((bucket, index) => {
                                            if(bucket.length > 0){
                                                const customObj = customData[index] || {};
                                                const isAllNumber = customObj.isAllNumber;
                                                let newValue = Calc.computeOperation(bucket, customObj.operation, isAllNumber);
                                                
                                                //sort
                                                if(sortDatasetIndex || sortTarget){
                                                    if(sortTarget === "custom"){
                                                        if(sortDatasetIndex === i || isNaN(sortDatasetIndex)){
                                                            if(customIndex === index || (index === 0 && !customIndex)){
                                                                const lastSortValue = dataToSort.get(key);
                                                                const newSortValue = (newValue || 0);
                                                                dataToSort.set(key, lastSortValue? (lastSortValue+newSortValue): newSortValue);
                                                            }
                                                        }
                                                    }
                                                }
                                                
                                                customBuckets[index] = newValue;
                                            }
                                        });
                                    }
            
                                });

                            }
                        }
                        
                        /*
                        (xDataIsAllNumber && !yDataIsAllNumber && !isHorizontal)? 
                        xAxis.values.add(xValue) : null;
                        (yDataIsAllNumber && !xDataIsAllNumber && isHorizontal)?
                        yAxis.values.add(yValue) : null;*/

                        if(isHorizontal){
                            (!yDataIsAllNumber || xDataIsAllNumber)? 
                            yAxis.values.add(yValue) : null;
                        }else {
                            (!xDataIsAllNumber || yDataIsAllNumber)? 
                            xAxis.values.add(xValue) : null;
                        }

                        

                    }else if(chartType === "histogram"){
                        const min = xDataStats.min, max = xDataStats.max;
                        const binCount = barData.binCount;
                        const binWidth = barData.binWidth;

                        const index = Math.min(binCount - 1, Math.floor((xValue - min) / binWidth));
                        const binStart = min + (index * binWidth);

                        if(barData.dataPoints.has(binStart)){
        
                            const labelValues = barData.dataPoints.get(binStart);
                            labelValues.push(xValue);
                        }else {

                            barData.dataPoints.set(binStart, [xValue]);
                            hasBarDataset = true;
                        }

                        if(j === (loopEnd-1)){//at the end of the j loop
                            barData.dataPoints.forEach((bucket, key) => {
            
                                if(bucket.length > 0){
                                    let newValue = Calc.computeOperation(bucket, "count", xDataStats.isNumbers);
                                    barData.dataPoints.set(key, newValue);

                                    yAxis.values.add(newValue);
                                }
                            });
                        }

                        xDataIsAllNumber? xAxis.values.add(xValue): null;
                        
                    } else {
                        
                        if(axisLabelBuckets.has(xValue)){
                            const bucket = axisLabelBuckets.get(xValue);
                            const customBuckets = customDataBuckets.get(xValue);

                            bucket.push(yValue);

                            if(isBubble){
                                const sizeBuckets = axisSizeBuckets.get(xValue);
                                sizeBuckets && sizeBuckets.push(sizeData[j]);
                            }

                            //push custom data
                            if(customBuckets){
                                customBuckets.map((innerBucket, index) => {
                                    const customObj = customData[index] || {};
                                    const cData = customObj.data || [];

                                    innerBucket.push(cData[j]);
                                });
                            }
                        } else {
                            axisLabelBuckets.set(xValue, [yValue]);

                            isBubble && axisSizeBuckets.set(xValue, [sizeData[j]]);

                            //set custom data
                            if(customData.length){
                                customDataBuckets.set(xValue,
                                    customData.map((innerArray) => {
                                        return [innerArray.data? innerArray.data[j]: null];
                                    })
                                )
                            }
                        }
            
                        if(j === (loopEnd-1)){ //at the end of the j loop 
                            //const bucketMap = yDataIsAllNumber? axisLabelBuckets: axisValueBuckets;
                            const bucketMap = axisLabelBuckets;
                            
                            for (let [key, bucket] of bucketMap){
            
                                if(bucket.length > 0){
                                    let newValue = Calc.computeOperation(bucket, operation, yDataIsAllNumber);

                                    //sort 
                                    if(sortDatasetIndex || sortTarget){
                                        if(sortTarget === "y"){
                                            if(sortDatasetIndex === i || isNaN(sortDatasetIndex)){
                                                const lastSortValue = dataToSort.get(key);
                                                const newSortValue = (newValue || 0);
                                                dataToSort.set(key, lastSortValue? (lastSortValue+newSortValue): newSortValue);
                                            }
                                        }
                                    }

                                    valueWidth = ctx.measureText(yPrefix + Calc.toFixedIfNeeded(newValue, yDecimalPlaces) + ySuffix).width;
            
                                    dataPoints.set(key, newValue);

                                    //add stack value to properly show axis range
                                    if(axisData.mode === "stack"){
                                        const lastValue = stackTrackValues.get(key) || 0;

                                        //if(axisData.format === "percent"){
                                            //const keyRange = axisData.stackSums.get(key) || {min: 0, max: 0};
            
                                            //const max = keyRange.max || 0;
                                            //const min = keyRange.min || 0;
                                                    
                                            //keyRange.max = newValue > 0? (max+newValue): max;
                                            //keyRange.min = newValue < 0? (min+newValue): min;

                                            //keyRange.max = Math.max(max, newValue);
                                            //keyRange.min = Math.min(min, newValue);

                                            let [min, max, range] = axisData.stackSums.get(key) || [0,0,0];

                                            range = range + Math.abs(newValue);
                                            newValue = (lastValue+newValue);

                                            min = Math.min(newValue, min);
                                            max = Math.max(newValue, max);

                                            axisData.stackSums.set(key, [min, max, range]);

                                            if(axisData.format === "percent" && i === (tempDataLength-1)){
                                                const minPercent = ((min / range) * 100) || 0;
                                                const maxPercent = ((max / range) * 100) || 0;

                                                const maxValue = axisData.maxValue || minPercent;
                                                const minValue = axisData.minValue || maxPercent;
                                                
                                                axisData.minValue = Math.min(minValue, minPercent);
                                                axisData.maxValue = Math.max(maxValue, maxPercent);

                                                axisData.stackSums.set(key, range);
                                            }
                                        //}
        
                                        //const currentStack = newValue >= 0? [newValue, lastStack[1]]: [lastStack[0], newValue];
                                        //stackTrackValues.set(key, newValue);
                                    }

                                    yAxis.values.add(newValue);
                                    yAxis.tickFormat["isPercent"] = axisData.format === "percent";
            
                                    if(valueWidth > maxValueWidth){
                                        maxValueWidth = valueWidth;
                                    }

                                    /*
                                    if(!(axisData.mode === "stack" && axisData.format === "percent")){
                                        const maxValue = axisData.maxValue || newValue;
                                        const minValue = axisData.minValue || newValue;
                                            
                                        axisData.maxValue = Math.max(maxValue, newValue);
                                        axisData.minValue = Math.min(minValue, newValue);
                                    }*/
                                }

                                if(isBubble){
                                    const sizeBucket = axisSizeBuckets.get(key);
                                    const newValue = Calc.computeOperation(sizeBucket, sizeObj.operation, sizeObj.isAllNumber);
                                    
                                    if(newValue){
                                        const minSize = sizeRange.min || newValue;
                                        const maxSize = sizeRange.max || newValue;

                                        sizeRange.max = Math.max(maxSize, newValue);
                                        sizeRange.min = Math.min(minSize, newValue);
                                    }

                                    axisSizeBuckets.set(key, newValue);
                                }

                                //custom data 
                                const customBuckets = customDataBuckets.get(key);

                                if(customBuckets){
                                    customBuckets.map((bucket, index) => {
                                        if(bucket.length > 0){

                                            const customObj = customData[index] || {};
                                            const isAllNumber = customObj.isAllNumber;
                                            let newValue = Calc.computeOperation(bucket, customObj.operation, isAllNumber);

                                            //sort
                                            if(sortDatasetIndex || sortTarget){
                                                if(sortTarget === "custom"){
                                                    if(sortDatasetIndex === i || isNaN(sortDatasetIndex)){
                                                        if(customIndex === index || (index === 0 && !customIndex)){
                                                            const lastSortValue = dataToSort.get(key);
                                                            const newSortValue = (newValue || 0);
                                                            dataToSort.set(key, lastSortValue? (lastSortValue+newSortValue): newSortValue);
                                                        }
                                                    }
                                                }
                                            }

                                            customBuckets[index] = newValue;
                                        }
                                    });
                                }
                            }
            
                        }

                        (!xDataIsAllNumber || yDataIsAllNumber)? 
                        xAxis.values.add(xValue) : null;
            
                    }
            
                    if(labelWidth > maxLabelWidth){
                        maxLabelWidth = labelWidth;
                        lastMaxLabel = xValue;
                    }
            
                    if(valueWidth > maxValueWidth){
                        maxValueWidth = valueWidth
                        lastMaxValue = yValue;
                    }
            
                }
                
            
                //set axisData max width 
                xAxis.maxWidth = maxLabelWidth > xAxis.maxWidth? maxLabelWidth: xAxis.maxWidth;
                yAxis.maxWidth = maxValueWidth > yAxis.maxWidth? maxValueWidth: yAxis.maxWidth;
            
                //set axis is numbers 
                yAxis.isAllNumbers = yDataIsAllNumber;
                xAxis.isAllNumbers = xDataIsAllNumber;
            
                hasAxisData = true;
            
                //if not a bar dataset push the dataset to newData 
                const newDataName = dataName? dataName: "Dataset " + axisDataCount;
                const newDataNameWidth = Global.measureLegendText(dv, newDataName).width;
            
                if(chartType === "bar" || chartType === "histogram"){
                    //barDatasetNames.push(newDataName);
                    barData.name = newDataName;
                    barData.type = chartType;
                    barData.design = setUpAxisChartDesign(chartType, design, axisDataCount);
                    barData.design.color? axisData.colors.push(Array.isArray(barData.design.color)? barData.design.color[0]: barData.design.color): null;
                    dataset.sort? barData.sort = dataset.sort: null;
                    //add custom data 
                    barData.custom = customData;

                    axisData.dataset.push(barData);
                    axisData.barDatasetCount++;
            
                    //set legend colors
                    //legendData.colors.push(barData.design.color);
                    legendData.data.set(newDataName, barData.design.color);
                }else {
                    dataset.name = newDataName;
                    dataset.dataPoints = dataPoints;
                    dataset.design = {
                        ...setUpAxisChartDesign(chartType, design, axisDataCount),
                        size: isBubble? {
                            ...sizeObj,
                            data: axisSizeBuckets
                        }: design.size,
                    }
                    dataset.customDataPoints = customDataBuckets;
                    axisData.dataset.push(dataset);
            
                    //set legend colors
                    //legendData.colors.push(dataset.design.color);
                    legendData.data.set(newDataName, dataset.design.color);
                }
            
                legendData.names.push(newDataName);
            
                //set dataset name max width and total on axis charts
                legendData.maxWidth = Math.max(legendData.maxWidth, newDataNameWidth);
            
                axisDataCount++;
            
                if(xAxis){
                    //remove all duplicates
                    if(!xAxis.isAllNumbers){
                        const xAxisSize = xAxis.values.size;
                        //set axis count
                        xAxisSize > (scrollData.labelsCount|| 0)? scrollData.labelsCount = xAxisSize: null;
                    } 
                }
            
                if(yAxis){
                    if(!yDataIsAllNumber){
                        const yAxisSize = yAxis.values.size;
                        //set axis count
                        yAxisSize > (scrollData.valuesCount|| 0)? scrollData.valuesCount = yAxisSize: null;
                    }
                }
            
            }else if(chartType === "pie" && !(hasAxisData || hasTableData)){

                const labels = dataset.labels ? dataset.labels.slice() : [];
                const values = dataset.values ? dataset.values.slice() : [];
                
                //fill empty data
                if(labels.length === 0){
                    fillData(values, labels, prevDataset.labels);
                }
                if(values.length === 0){
                    fillData(labels, values, prevDataset.values);
                }

                prevDataset.labels = labels;
                prevDataset.values = values;

                const labelIsAllNumbers = Calc.isAllNumbers(labels);
                const valueIsAllNumbers = Calc.isAllNumbers(values);

                const operation = dataset.operation;
                const design = dataset.design || {};
                const colors = Array.isArray(design.colors)? design.colors: null;
            
                const valueBuckets = new Map();
                const colorBuckets = new Map();

                const customDataLength = customData.length;

                labels.forEach((label, j) => {
                    const value = values[j];
                    const color = colors[j];
                    
                    if(Calc.isNumber(value)){
                        //set maxTextlength
                        const labelWidth = Global.measureLegendText(dv, label).width;

                        //set new pie dataset labels and values 
                        const bucket = valueBuckets.get(label);
                        const colorBucket = colorBuckets.get(label);

                        if(bucket){
                            bucket.push(value);
                            colorBucket.push(color);
                            
                            //push custom data
                            const customBuckets = customDataBuckets.get(label);
                            if(customBuckets){
                                customBuckets.map((innerBucket, index) => {
                                    const customObj = customData[index] || {};
                                    const cData = customObj.data || [];

                                    innerBucket.push(cData[j]);
                                });
                            }
                        }else {
                            valueBuckets.set(label, [value]);
                            colorBuckets.set(label, [color]);

                            //push custom data
                            if(customDataLength){
                                customDataBuckets.set(label,
                                    customData.map((innerArray) => {
                                        return [innerArray.data? innerArray.data[j]: null];
                                    })
                                )
                            }
                        }

                        //set max width of axis labels and values for pie charts
                        labelWidth > pieMaxLabelWidth? pieMaxLabelWidth = labelWidth: null;
                    }
                });

                 //pie dataset
                 const newDataset = {
                    ...dataset,
                    data: new Map(),
                    labels: [],
                    values: [],
                    colors: [],
                    sumOfValues: 0
                };


                //calculate operations and set values;
                const pieLabels = [];
                const pieValues = [];

                let index = 0;
                let validValueCount = 0;
                for (const [label, bucket] of valueBuckets.entries()) {
                    const value = Calc.computeOperation(bucket, operation, true);
                    
                    if(value > -1){
                        // Set sort values
                        if (sortTarget === "values") {
                            const lastSortValue = dataToSort.get(label);
                            const newSortValue = value || 0;
                            dataToSort.set(label, lastSortValue ? lastSortValue + newSortValue : newSortValue);
                        }
                    
                        const defaultColor = customColors.get(index).code;
                        const pieColor = colorBuckets.get(label)[0] || defaultColor;
                    
                        newDataset.data.set(label, { value: value, color: pieColor });
                        pieLabels.push(label);
                        pieValues.push(value);
                        
                        newDataset.sumOfValues += value;
                        
                        // Set legend data
                        legendData.data.set(label, pieColor);
                    
                        // Custom data processing
                        const customBuckets = customDataBuckets.get(label);
                    
                        if (customBuckets) {
                            customBuckets.forEach((bucket, i) => {
                                if (bucket.length > 0) {
                                    const customObj = customData[i];
                                    const isAllNumber = customObj.isAllNumber;
                                    let newValue = Calc.computeOperation(bucket, customObj.operation, isAllNumber);
                                    
                                    // Set sort values for custom data
                                    if (sortTarget === "custom") {
                                        if (customIndex === i || (i === 0 && !customIndex)) {
                                            const lastSortValue = dataToSort.get(label);
                                            const newSortValue = newValue || 0;
                                            dataToSort.set(label, lastSortValue ? lastSortValue + newSortValue : newSortValue);
                                        }
                                    }
                                    
                                    customBuckets[i] = newValue;
                                }
                            });
                        }

                        if (validValueCount > 49) {
                            break;
                        }

                        validValueCount++;

                    }
                
                    index++;
                }                

                newDataset.labels = pieLabels;
                newDataset.values = pieValues;
                newDataset.type = "pie";

                newDataset.customDataPoints = customDataBuckets;

                newDataset.labelLayout = {tickFormat: getAxisFromLayout(layout, dataLabelAxis), isAllNumbers: labelIsAllNumbers};
                newDataset.valueLayout = {tickFormat: getAxisFromLayout(layout, dataValueAxis), isAllNumbers: valueIsAllNumbers};

                //sorting
                Calc.pieCustomSort(dv, newDataset, dataToSort);
                legendData.names = {...newDataset.sortedLabels};

                //add to pieData 
                pieData.push(newDataset);

                //set dataset name max width and total on pie
                legendData.maxWidth = Math.max(legendData.maxWidth, pieMaxLabelWidth);

                hasPieData = true;
            }else if(chartType === "table" && !(hasAxisData || hasPieData)){

                //table dataset
                const newTableDataset = {...dataset};
                const newTableHeaders = []; //tableheaders values
                const newTableData = []; //tabledata values

                const maxWidths = [];
                const cumulativeWidths = [];

                const isSummaryColumns = [];
                let hasSummaryColumn = false;

                const columnsTotal = [];
                const rowsTotal = new Map();

                const headerValues = dataset.header? dataset.header.values: [];
                const datasetData = dataset.data || {};
                const data = datasetData.values? datasetData.values: [];

                const dataOperation = dataset.data? dataset.data.operation: false;

                let rowsValueSum = 0;
                let columnCount = data.length > headerValues.length? data.length: headerValues.length;
                let rowCount = 0;

                let hasNoOperations = true;
                let operationStatus = null;

                if(dataOperation){
                    let includesNone = false;

                    const isNumericColumns = [];

                    const catColumns = [];
                    let maxCatColumnIndex = -1; // Initialize with an invalid index
                    let maxUniqueCount = 0; // Track the maximum unique value count

                    const catOperations = [];

                    for(let index = 0; index < columnCount; index++){

                       //process column data
                       const column = data[index];
                        if(column){
                            const columnIsAllNumbers = Calc.isAllNumbers(column);
                            isSummaryColumns.push(columnIsAllNumbers);
                            !hasSummaryColumn? hasSummaryColumn = columnIsAllNumbers: null;

                            const operation = Array.isArray(dataOperation)? dataOperation[index]: dataOperation;
                            const isOperation = operation && operation !== "none";
                            isOperation? hasNoOperations = false: null;

                            //if(!columnIsAllNumbers){
                            if(operation === "none"){
                                catColumns.push(column);
                                includesNone = true;

                                catOperations.push(operation);
                                
                                const uniqueValues = new Set(column).size;

                                // Update maxColumnIndex if this column has more unique values
                                if (operation === "none" && uniqueValues > maxUniqueCount) {
                                    maxUniqueCount = uniqueValues;
                                    maxCatColumnIndex = catColumns.length-1; // Store the index within catColumns
                                }
                            }

                            if(operation === "none"){
                                operationStatus = "some"; // Some operations are none
                            }else if(operationStatus !== "some") {
                                operationStatus = "all";
                            }

                            isNumericColumns.push(columnIsAllNumbers);
                        }
                    }

                   hasNoOperations? operationStatus = null: null;


                   //combine the categorical columns into rows array
                   const categoricalRows = includesNone? catColumns[0].map((_, i) => catColumns.map(col => col[i]) ): [];
                   const allRows = (data[0] || []).map((_, i) => data.map(col => col[i]) ) || [];
                   
                   //const uniqueCategoricalRows = hasCategoricalData? Array.from(new Set(categoricalRows.map(JSON.stringify))).map(JSON.parse): [];
                   //const newCategoricalColumns = hasCategoricalData? uniqueCategoricalRows[0].map((_, index) => uniqueCategoricalRows.map(row => row[index])): [];
                  
                   //set row count 
                   rowCount = 1;

                    if(includesNone && operationStatus !== "all"){

                        //set column values in the bucket
                        const firstColumn = data[0] || [];
                        const columnsMap = Array.from({ length: columnCount }, () => new Map());

                        for(let i = 0; i < firstColumn.length; i++){
                        
                            for(let index = 0; index < columnCount; index++){
                                const columnIsNumeric = isNumericColumns[index];
                                const maxWidth = maxWidths[index] || 0;

                                if(i === 0){
                                    const headerValue = headerValues[index];
                                    if(headerValue){
                                        newTableHeaders.push(headerValue);
                    
                                        const valueWidth = (ctx.measureText(headerValue).width + twiceFontSize);
                                        maxWidths[index] = Math.max(maxWidth, valueWidth);
                                    }
                                }
                                
                                const column = data[index];
                                const operation = Array.isArray(dataOperation)? dataOperation[index]: dataOperation;

                                
                                if(column){

                                    let columnMap = columnsMap[index] || {};

                                    let row = hasNoOperations ? allRows[i] : categoricalRows[i];

                                    row = Array.isArray(row) ? row.slice() : ["column"];
                                        
                                    //const rowString = (!operationStatus? row: row.splice(maxCatColumnIndex, 1)).toString();
                                    let rowString;
                                    if (Array.isArray(row)) {
                                        const safeCatColumnIndex = Math.max(maxCatColumnIndex, 1); // Ensure the index is valid
                                        rowString = (!operationStatus ? row : row.slice(0, safeCatColumnIndex).concat(row.slice(safeCatColumnIndex + 1))).toString();
                                    } else {
                                        rowString = row.toString();
                                    }

                                    
                                        
                                    const value = column[i];

                                    if(columnMap.has(rowString)){
                                        columnMap.get(rowString).push(value);
                                    }else {
                                        columnMap.set(rowString, [value]);
                                    }

                                    if(i === (firstColumn.length-1)){
                                        columnsTotal.push(Calc.computeOperation(column, operation, columnIsNumeric));
                                    }
                                    
                                }

                            }
                        }


                        //process bucket
                        for(let index = 0; index < columnsMap.length; index++){
                            const columnMap = columnsMap[index];

                            if(columnMap){
                                const columnIsNumeric = isNumericColumns[index];
                                
                                const operation = Array.isArray(dataOperation)? dataOperation[index]: dataOperation;
                                const isOperation = operation && operation !== "none";

                                const columnValues = [];
                                let maxWidth = maxWidths[index] || 0;

                                for(const [key, bucket] of columnMap){

                                    const newValue = isOperation? Calc.computeOperation(bucket, operation, columnIsNumeric): bucket[0] || "";

                                    const valueWidth = (ctx.measureText(newValue).width + twiceFontSize);
                                    maxWidths[index] = Math.max(maxWidth, valueWidth);

                                    columnValues.push(newValue);

                                    if(columnIsNumeric){
                                        if(Calc.isNumber(newValue)){
                                            const rowTotal = rowsTotal.get(key) || 0;
                                            rowsTotal.set(key, (rowTotal+newValue));
                                        }
                                    }
                                }

                                rowsValueSum += maxWidths[index];
                                cumulativeWidths.push(rowsValueSum);

                                if(rowCount < columnValues.length){
                                    rowCount = columnValues.length;
                                }

                                newTableData.push(columnValues);
                            }
                        }

                    }else {

                        for(let index = 0; index < columnCount; index++){
                            const columnIsNumeric = isNumericColumns[index];
                            const maxWidth = maxWidths[index] || 0;

                            const column = data[index];
                            const operation = Array.isArray(dataOperation)? dataOperation[index]: dataOperation;

                            if(column){
                                const newValue = Calc.computeOperation(column, operation, columnIsNumeric);

                                const valueWidth = (ctx.measureText(newValue).width + twiceFontSize);
                                maxWidths[index] = Math.max(maxWidth, valueWidth);

                                if(columnIsNumeric){
                                    if(Calc.isNumber(newValue)){
                                        const rowTotal = rowsTotal.get("0") || 0;
                                        rowsTotal.set("0", (rowTotal+newValue));
                                    }
                                }

                                rowsValueSum += maxWidths[index];
                                cumulativeWidths.push(rowsValueSum);

                                newTableData.push([newValue]);
                            }
                        }
                    }


                    /*
                    for(let index = 0; index < columnCount; index++){
                        const columnIsNumeric = isNumericColumns[index];

                        //process header values 
                        const headerValue = headerValues[index];
                        if(headerValue){
                            newTableHeaders.push(headerValue);
        
                            const valueWidth = ctx.measureText(headerValue).width;
                            maxValueWidth = Math.max(maxValueWidth, valueWidth);
                        }

                        //process column data
                        const column = data[index];
                        const columnMap = new Map();

                        const operation = Array.isArray(dataOperation)? dataOperation[index]: dataOperation;
                        const isOperation = operation && operation !== "none";

                        if(column){
                            //let columnTotal = 0;

                            if(includesNone && operationStatus !== "all"){
                               
                                for(let i = 0; i < column.length; i++){
                                    //const row = ((hasNoOperations? allRows[i]: categoricalRows[i]) || "column").slice();
                                    let row = hasNoOperations ? allRows[i] : categoricalRows[i];

                                    row = Array.isArray(row) ? row.slice() : ["column"];
                                    
                                    //const rowString = (!operationStatus? row: row.splice(maxCatColumnIndex, 1)).toString();
                                    let rowString;
                                    if (Array.isArray(row)) {
                                        const safeCatColumnIndex = Math.max(maxCatColumnIndex, 1); // Ensure the index is valid
                                        rowString = (!operationStatus ? row : row.slice(0, safeCatColumnIndex).concat(row.slice(safeCatColumnIndex + 1))).toString();
                                    } else {
                                        rowString = row.toString();
                                    }
                                    
                                    const value = column[i];

                                    if(columnMap.has(rowString)){
                                        columnMap.get(rowString).push(value);
                                    }else {
                                        columnMap.set(rowString, [value]);
                                    }
                                }

                                const columnValues = [];

                                for(const [key, bucket] of columnMap){

                                    const newValue = isOperation? Calc.computeOperation(bucket, operation, columnIsNumeric): bucket[0] || "";

                                    const valueWidth = ctx.measureText(newValue).width;
                                    maxValueWidth = Math.max(maxValueWidth, valueWidth);

                                    columnValues.push(newValue);

                                    if(columnIsNumeric){
                                        if(Calc.isNumber(newValue)){
                                            const rowTotal = rowsTotal.get(key) || 0;
                                            rowsTotal.set(key, (rowTotal+newValue));
                                        }
                                    }
                                }

                                if(rowCount < columnValues.length){
                                    rowCount = columnValues.length;
                                }

                                newTableData.push(columnValues);

                            }else {

                                const newValue = Calc.computeOperation(column, operation, columnIsNumeric);

                                const valueWidth = ctx.measureText(newValue).width;
                                maxValueWidth = Math.max(maxValueWidth, valueWidth);

                                if(columnIsNumeric){
                                    if(Calc.isNumber(newValue)){
                                        const rowTotal = rowsTotal.get("0") || 0;
                                        rowsTotal.set("0", (rowTotal+newValue));
                                    }
                                }

                                newTableData.push([newValue]);

                            }

                            columnsTotal.push(Calc.computeOperation(column, operation, columnIsNumeric));
                        }
                    }

                    */

                }else {

                    const firstColumn = data[0] || [];
                    const newColumns = Array.from({ length: columnCount }, () => []);

                    for(let i = 0; i < firstColumn.length; i++){

                        for(let index = 0; index < columnCount; index++){
                            const maxWidth = maxWidths[index] || 0;
                            //prcess header data
                            if(i === 0){
                                const headerValue = headerValues[index];
                                if(headerValue){
                                    newTableHeaders.push(headerValue);
                
                                    const valueWidth = (ctx.measureText(headerValue).width + twiceFontSize);
                                    maxWidths[index] = Math.max(maxWidth, valueWidth);
                                }
                            }

                            //process column data
                            const column = data[index];
                            if(column){
                                const newColumn = newColumns[index];
                                const len = column.length;

                                len > rowCount? rowCount = len: null;

                                const value = column[i];
                                newColumn.push(value);

                                const valueWidth = (ctx.measureText(value).width + twiceFontSize);
                                maxWidths[index] = Math.max(maxWidth, valueWidth);

                                if(i === (firstColumn.length-1)){
                                    rowsValueSum += maxWidths[index];
                                    cumulativeWidths.push(rowsValueSum);

                                    newTableData.push(newColumn);
                                }
                            }

                        }
                    }

                    /*
                    for(let index = 0; index < columnCount; index++){
                         //process header values 
                         const maxWidth = maxWidths[index] || 0;

                        const headerValue = headerValues[index];
                        if(headerValue){
                            newTableHeaders.push(headerValue);
                
                            const valueWidth = ctx.measureText(headerValue).width;
                            maxWidths[index] = Math.max(maxWidth, valueWidth);
                        }

                        //process column data
                        const column = data[index];
                        if(column){
                            const newColumn = [];
                            const len = column.length;

                            len > rowCount? rowCount = len: null;
                            for(let i = 0; i < len; i++){
                                const value = column[i];
                                newColumn.push(value);

                                const valueWidth = ctx.measureText(value).width;
                                maxValueWidth = Math.max(maxValueWidth, valueWidth);
                            }

                            newTableData.push(newColumn);
                        }
                    }*/

                }

                const newColumnCount = Math.max(newTableData.length, newTableHeaders.length);

                //alternating row styling
                const datasetFont = datasetData.font || {};
                const fill = datasetData.fill || {};

                const dataColor = datasetFont.color || [];
                const fillColor = fill.color || [];

                let newDataColor = dataColor;
                let newFillColor = fillColor;

                if(datasetData.alternatingRowStyle){
                    const firstColors = dataColor[0];
                    if(Array.isArray(firstColors)){
                        newDataColor.splice(0, 1, Global.repeatArrays(firstColors, rowCount));
                    }
                    
                    const firstFillColors = fillColor[0];
                    if(Array.isArray(firstFillColors)){
                        newFillColor.splice(0, 1, Global.repeatArrays(firstFillColors, rowCount));
                    }
                }

                const sortedTableData = Calc.tableCustomSort(dv, newTableData);

                newTableDataset.header = {...dataset.header, values: newTableHeaders};
                newTableDataset.data = {
                    ...datasetData,
                    values: sortedTableData, 
                    isSummaryColumns,
                    font: {
                        ...datasetFont,
                        color: newDataColor,
                    },
                    fill: { 
                        color: newFillColor
                    }
                }

                //set totals
                const totals = dataset.totals || {};
                let isColumnTotal = totals.enableColumnTotal;
                isColumnTotal !== false? isColumnTotal = true: null;

                let isRowTotal = totals.enableRowTotal;

                if(!hasSummaryColumn || hasNoOperations){
                    isColumnTotal = false;
                    isRowTotal = false;
                }

                if(rowCount === 1){
                    isColumnTotal = false;
                }

                if(columnCount === 1){
                    isRowTotal = false;
                }

                const rowsTotalValues = Array.from(rowsTotal.values());

                const rowsGrandTotal = Calc.computeOperation(rowsTotalValues, "sum", true);
                const columnsGrandTotal = Calc.computeOperation(columnsTotal, "sum", true);
                const grandTotal = (columnsGrandTotal + rowsGrandTotal);

                newTableDataset.totals = {
                    ...(dataset.totals || []),
                    columns: columnsTotal,
                    rows: rowsTotalValues,
                    grand: grandTotal,
                    enableColumnTotal: isColumnTotal,
                    enableRowTotal: isRowTotal
                }

                newTableDataset.type = "table";
                newTableDataset.rowsValueSum = rowsValueSum;
                newTableDataset.maxWidths = maxWidths;
                newTableDataset.cumulativeWidths = cumulativeWidths;

                newTableDataset.columnCount = (newColumnCount + (isRowTotal? 1: 0));
                newTableDataset.rowCount = ((rowCount? (rowCount+1): 1) + (isColumnTotal? 1: 0)); //plus 1 is adding the header row

                //remove previous table dataset as we only require 1
                tableData.shift();
                tableData.push(newTableDataset);

                hasTableData = true;
            }

            //remove duplicates from dataset 
            //dataset.values = [...new Set(dataset.values)];
            //dataset.labels = [...new Set(dataset.labels)];
            
        }

        //if bar is in data set the bar 
        if(hasAxisData){
            //axisData.names = barDatasetNames;
            axisData.direction = axisDirection;

            //set default range for 100% stacked bar
            if(axisData.mode === "stack" && axisData.format === "percent"){
                let min = axisData.minValue, max = axisData.maxValue;

                if(hasBarDataset){
                    min = min < 0? -100: 0;
                }else {
                    min = min < 0? Math.floor(min): 0;
                    min = min > 100? 100: min;
                }
                max = max > 0? 100: 0; 

                if(axisData.direction === "hr"){
                    if(layout.xAxis) {
                        layout.xAxis.range = [min, max];
                    }
                }else {
                    if(layout.yAxis) {
                        layout.yAxis.range = [min, max];
                    }
                }
            }
        }

    }


    //set pie Properties 
    setPieProperties(pieData);

    const newData = [axisData, ...pieData, ...tableData];

    //set axis chart properties
    const isHrBarChart = hasBarDataset && (axisDirection === "hr");
    setAxisProperties(dv, !isHrBarChart, axisYData, "y");
    setAxisProperties(dv, isHrBarChart, axisXData);

    //sorting axisCharts
    const axisLabels = axisXIsKey? axisXData["x1"]: axisYData["y1"];

    hasAxisData? Calc.axisCustomSort(dv, axisLabels, dataToSort): null;

    //set legend
    const isDisplayLegend = layout.legend? layout.legend.display: null;
    const isLegendDisplayBool = typeof isDisplayLegend === "boolean";

    //checking and setting if legend title width is max legend width
    const legend = layout.legend || {};
    const legendTitle = legend.title || {};
    const legendTitleText = legendTitle.text || "";
    const legendTitleWidth = ctx.measureText(legendTitleText).width;
    legendData.maxWidth = Math.max(legendData.maxWidth, legendTitleWidth);

    layout.legend = {
        ...layout?.legend,
        ...legendData,
        isDefault: isLegendDisplayBool? isDisplayLegend: true,
        size: legendData.data.size,
    }

    //setting scatter plot range to layoutsize
    layout.size = {
        ...layout.size,
        range: sizeRange
    }

    //set axis data 

    layout.axisData = {
        xData: axisXData,
        yData: axisYData,
        direction: axisDirection
    };

    //set table data 
    layout.tableData = hasTableData? tableData[0]: null;
    
    //set whether for not a particular chart type exists.
    layout.hasAxisData = hasAxisData;
    layout.hasPieData = hasPieData;
    layout.hasTableData = hasTableData;

    //set data to dv
    dv.setData(newData);
}


//get non bar axis chart design
function setUpAxisChartDesign(chartType, design, count){
    const newDesign = design;

    if(newDesign){
        //set deign colors
        const color = customColors.get(count).code;
        
        !newDesign.color? newDesign.color = color: null;

        chartType === "line"? Array.isArray(newDesign.color)? newDesign.color = color: null: null;
    }

    return newDesign || {};
}