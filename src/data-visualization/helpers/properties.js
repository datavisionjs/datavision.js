import * as Calc from './math.js';
import * as Global from './global.js';

import customColors from '../helpers/colors.js';

export function setGraphPosition(dv){
    const ctx = dv.getCtx();
    const canvas = dv.getCanvas();
    const canvasWidth = canvas.width, canvasHeight = canvas.height;

    //layout 
    const layout = dv.getLayout();

    //styling 
    const style = dv.getStyle();
    const titleFontSize = style.title.fontSize;
    const labelFontSize = style.label.fontSize;


    //set title space from top;
    const titleLines = dv.getLayout().titleLines;
    let titleTop = 0;
    titleLines.length > 0? titleTop = ((titleLines.length+1)*titleFontSize): null;
    



    const axisData = layout.axisData;
    const labelObject = axisData.labels;
    const valueObject = axisData.values;
    const axisTitleSpace = (labelFontSize*2);

    //set y axis space from left and right
    const yMaxLabelWidth = (canvasWidth*0.15);
    let yAxisLeft = yMaxLabelWidth, yAxisRight = yMaxLabelWidth;


    //y1
    const y1 = valueObject.y1;
    const y1MaxWidth = y1.maxWidth;

    y1MaxWidth < yAxisLeft? yAxisLeft = (y1MaxWidth+axisTitleSpace): null;

    const y1Title = layout.yAxis? layout.yAxis.title: null;
    y1Title? yAxisLeft += axisTitleSpace: null;
    

    //y2
    const y2 = valueObject.y2;
    const y2MaxWidth = y2.maxWidth;

    y2MaxWidth < yAxisRight? y2MaxWidth === 0? yAxisRight = 0: yAxisRight = (y2MaxWidth+axisTitleSpace): null;

    const y2Title = layout.y2Axis? layout.y2Axis.title: null;
    y2Title && (y2MaxWidth > 0)? yAxisRight += (labelFontSize*2): null;



    //dataset labels 
    let datasetSpace = (canvasWidth*0.15);

    const datasetNameData = layout.datasetNameData;
    const isDatasetName = datasetNameData.isDatasetName;
    const datasetMaxWidth = datasetNameData.maxNameWidth;

    if(isDatasetName){
        datasetMaxWidth < datasetSpace? datasetSpace = (datasetMaxWidth+axisTitleSpace): datasetSpace = (canvasWidth*0.2);
    }else {
        datasetSpace = 0;
    }

    //set x axis space from bottom
    let xAxisBottom = ((axisTitleSpace)+labelFontSize);
    let xAxisRight = 0;

    const tempGraphWidth = (canvasWidth-(yAxisLeft+yAxisRight+datasetSpace));

    //x1 
    const x1 = labelObject.x1;
    const x1MaxWidth = x1.maxWidth;
    const labelStep = (tempGraphWidth/x1.values.length);

    //give space to the right of the x axis using x1MaxWidth
    xAxisRight = x1.isAllNumbers? x1MaxWidth: 0;

    if(!x1.isAllNumbers && ((labelStep/labelFontSize) < 4)){
        const thirdHeight = (canvasHeight*0.3);
        xAxisBottom += x1MaxWidth > thirdHeight? thirdHeight: (labelFontSize*2);
    }

    const x1Title = layout.xAxis? layout.xAxis.title: null;
    x1Title? xAxisBottom += axisTitleSpace: null;


    const graphX = (yAxisLeft), graphY = (titleTop);
    const graphWidth = (canvasWidth-(yAxisLeft+yAxisRight+datasetSpace+xAxisRight));
    const graphHeight = (canvasHeight-(titleTop+xAxisBottom));

    const graphPosition = {
        x: graphX,
        y: graphY,
        width: graphWidth,
        height: graphHeight,
        yAxisRight: yAxisRight,
        maxLabelWidth: yMaxLabelWidth
    }


    //set graphposition
    dv.layout = {
        ...layout, 
        graphPosition: graphPosition
    };
    
}


function getTickData(range){ 
    if(!range) return {count: 0, range: range};

    const min = range[0], max = range[1];

    let desiredTickCount = 5;

    let rangeStart = min, rangeEnd = max;
    let tickCount = desiredTickCount;
    let interval = 0;
    
    if(!isNaN(rangeStart) && !isNaN(rangeEnd)){
        let intervalSize = 0;
        
        if(rangeStart <= 0 && rangeEnd >= 0){
            intervalSize = (Math.max(Math.abs(min) + Math.abs(max)) / Math.max(desiredTickCount - 1, 1));
        }else {

            if(rangeStart <= 0){
                intervalSize = Math.abs(rangeStart / Math.max(desiredTickCount - 1, 1));
            
            }else if(rangeStart > 0){

                // Calculate the interval size based on the desired number of ticks
                intervalSize = rangeEnd / Math.max(desiredTickCount - 1, 1);
            }

        }

        interval = Calc.getTicksInterval(intervalSize);

        const newRange = Calc.zeroBasedRangeAdjust([rangeStart, rangeEnd], interval);
        rangeStart = newRange[0];
        rangeEnd = newRange[1];

        const newRangeDiff = (rangeEnd-rangeStart);
        // Calculate the number of ticks
        tickCount = Math.round(newRangeDiff / interval);

        if(tickCount <= 1){
            rangeStart = 0;
            tickCount = Math.round(rangeEnd / interval);
        }
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
        for(var i = 0; i < filledData.length; i++){
            toFillData.push(i);
        }
    }
}


function getAxisFromLayout(layout, key){
    let axisName = (key === "y1" || key === "yAxis")? "yAxis": "";
    axisName = (key === "y2" || key === "y2Axis")? "y2Axis": axisName;
    axisName = (key === "x1" || key === "xAxis")? "xAxis": axisName;

    return layout[axisName];
}


export function setUpChart(dv){

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const data = dv.getData();

    

    const style = dv.getStyle();
    const labelStyle = style.label;

    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

    //stores the number of bars for each category
    let maxBarPerCategory = 1;

    let pieMaxLabelWidth = 0;

    const axisData = [];
    const pieData = [];

    let axisDataCount = 0;

    //all axischart labels and values
    class NewAxis {
        constructor() {
            this.values = [];
            this.range = null;
            this.maxWidth = 0;
            this.tickData = null;
            this.isAllNumbers = false;
        }
    };

    const axisLabels = {x1: new NewAxis()};
    const axisValues = { y1: new NewAxis(), y2: new NewAxis() };


    const axisChartTypes = Global.getAxisChartTypes();
    let hasAxisData = false;
    let hasPieData = false;
    let axisDirection = null;

    //dataset names data
    let datasetNameMaxWidth = 0;
    let totalDatasetName = 0;

    //get range from data 
    if(data){
        
        //loop through data and set xRange and yRange
        const tempData = data;
        const tempDataLength = tempData.length;
        const prevDataset = {labels: [], values: []};

        const barDataset = {type: "bar", dataset: [], attributeIsSet: false};
        const barStackTrackValues = new Map(); //track and add values of stacked bars for range
        const barDatasetNames = [];
        const barDatasetColors = [];
        let hasBarDataset = false;


        for(let i = 0; i < tempDataLength; i++){
            const dataset = {...tempData[i]};

            const dataValueAxis =  dataset.yAxis || "y1";
            const dataLabelAxis = dataset.xAxis || "x1";

            const yAxis = dataValueAxis === "y2"? axisValues.y2: axisValues.y1;
            const xAxis = axisLabels[dataLabelAxis];

            const dataName = dataset.name;
            const labels = dataset.labels? [...dataset.labels]: [];
            const values = dataset.values? [...dataset.values]: [];
            const dataType = dataset.type;
            const design = dataset.design || {};
            const operation = dataset.operation;

            //fill empty data
            if(labels.length === 0){
                fillData(values, labels, prevDataset.labels);
            }
            if(values.length === 0){
                fillData(labels, values, prevDataset.values);
            }

            prevDataset.labels = [...labels];
            prevDataset.values = [...values];

            let maxLabelWidth = 0;
            let maxValueWidth = 0;

            const barData = {
                values: new Map(),  
                xAxis: dataLabelAxis, 
                yAxis: dataValueAxis
            };

            const newLabels = [];
            const newValues = [];
            const axisBucket = [];

            const newPieDataset = {...dataset};
            const newPieLabels = [];
            const newPieValues = [];

            const labelIsAllNumbers = Calc.isAllNumbers(labels);
            const valueIsAllNumbers = Calc.isAllNumbers(values);

             //get and set tick format
                
             const layoutXAxis = getAxisFromLayout(layout, dataLabelAxis);
             const xAxisTickFormat = xAxis.tickFormat = layoutXAxis? {...layoutXAxis.tickFormat}: {};
             const xPrefix = xAxisTickFormat.prefix || "", xSuffix = xAxisTickFormat.suffix || "";
             const xDecimalPlaces = xAxisTickFormat.decimalPlaces;

             const layoutYAxis = getAxisFromLayout(layout, dataValueAxis);
             const yAxisTickFormat = yAxis.tickFormat = layoutYAxis? {...layoutYAxis.tickFormat}: {};
             const yPrefix = yAxisTickFormat.prefix || "", ySuffix = yAxisTickFormat.suffix || "";
             const yDecimalPlaces = yAxisTickFormat.decimalPlaces;

            if(axisChartTypes.includes(dataType)){

                const loopEnd = labels.length > 0? labels.length: values.length;

                let lastMaxValue = "", lastMaxLabel = "";

                for(let j = 0; j < loopEnd; j++){
                    
                    const label = labels[j];
                    const value = valueIsAllNumbers? Number(values[j]): values[j]? values[j]: "";
                    
                    //set maxTextlength
                    const labelToMeasure = labelIsAllNumbers? xPrefix + Calc.toFixedIfNeeded(label, xDecimalPlaces) + xSuffix: label + "";
                    let labelWidth = (label+"").length > (lastMaxLabel+"").length? ctx.measureText(labelToMeasure).width: null;

                    //If there's a value between 0 and -10 set the value to -10 and for measurement.
                    const valueToMeasure = valueIsAllNumbers? yPrefix + Calc.toFixedIfNeeded((value < 0 && value > 10? -10: value), yDecimalPlaces) + ySuffix: value+"";
                    let valueWidth = valueToMeasure.length > (lastMaxValue+"").length? ctx.measureText(valueToMeasure).width: 0;


                    if(dataType === "bar"){
                        
                        //loop to assign direction and mode to barDataset if a bar dataset includes it.
                        if(!barDataset.attributeIsSet){
                            for(let k = 0; k < tempData.length; k++) {
                                const data = tempData[k];

                                if(data.type === "bar"){
                                    if(data.direction === "hr"){
                                        barDataset.direction = "hr";
                                    }
                                    if(data.mode === "stack"){
                                        barDataset.mode = "stack";
                                    }
                                }
                            }
                            barDataset.attributeIsSet = true;
                        }
                        
                        
                        
                        const isHorizontal = barDataset.direction === "hr";

                        const newValue = isHorizontal? label: value;
                        const newLabel = isHorizontal? value: label;

                        const newValueIsAllNumbers = isHorizontal? labelIsAllNumbers: valueIsAllNumbers;
                        const newLabelIsAllNumbers = isHorizontal? valueIsAllNumbers: labelIsAllNumbers;

                        const prefix = isHorizontal? xPrefix: yPrefix;
                        const suffix = isHorizontal? xSuffix: ySuffix;
                        const decimalPlaces = isHorizontal? xDecimalPlaces: yDecimalPlaces;

                        //set barDataset labelIsAllNumbers to newLabelIsAllNumbers
                        barDataset.labelIsAllNumbers = newLabelIsAllNumbers;

                        let labelValues = [newValue];
    
                        if(barData.values.has(newLabel)){

                            labelValues = barData.values.get(newLabel);

                            if(newValueIsAllNumbers){

                                !isNaN(newValue)? labelValues.push(newValue): null;
                            }else {
                                labelValues.push(newValue);
                            }
                        }
                        
                        if(!newLabelIsAllNumbers? newLabel.toString().length > 0:true){

                            if(labelValues.length === 1 && newValueIsAllNumbers){
                                isNaN(newValue)? labelValues = []: null;
                            }

                            //set maxBarPerCategory if labelValues is more then the current value.
                            labelValues.length > maxBarPerCategory? maxBarPerCategory = labelValues.length: null;

                            barData.values.set(newLabel, labelValues);
        
                            dataset.direction === "hr"? axisDirection = "hr": null;
                            hasBarDataset = true;
                        }

                        if(j === (loopEnd-1)){ //at the end of the j loop 

                            //Set the barSize base on the min key difference (how far aprart the labels are on the axis)
                            const isAllNumbers = isHorizontal? valueIsAllNumbers: labelIsAllNumbers; //check if the base of the bars is all numbers
                            if(isAllNumbers){ 

                                let keysArray = Array.from(barData.values.keys());
                                keysArray.sort((a, b) => {return a-b; });

                                for(let k = 0; k < keysArray.length; k++){
                                    const key = keysArray[k];
                                    const nextIndex = k !== keysArray.length - 1? (k+1): null;

                                    const nextKey = keysArray[nextIndex];
                                    let newSize = nextKey? Math.abs(nextKey-key): null;
                                    
                                    const currentSize = barDataset.barSize;
                                    if(newSize){
                                        currentSize? currentSize > newSize? barDataset.barSize = newSize: null: barDataset.barSize = newSize;
                                    }
                                }
                            }
                            
                            if(valueIsAllNumbers || labelIsAllNumbers){

                                //loop through barData values bucket and execute the operation
                                barData.values.forEach((bucket, key) => {

                                    let newValue = Calc.computeOperation(operation, bucket);

                                    isNaN(newValue)? newValue = bucket[0]: null;
                                    const newValueWidth = ctx.measureText(prefix + Calc.toFixedIfNeeded(newValue, decimalPlaces) + suffix).width;

                                    barData.values.set(key, newValue);

                                    //add stack value to properly show axis range
                                    if(barDataset.mode === "stack"){
                                        const lastStack = barStackTrackValues.has(key)? barStackTrackValues.get(key): [0, 0];
                                        const lastValue = newValue >= 0? (lastStack[0]): (lastStack[1]);

                                        newValue = (lastValue+newValue);

                                        const currentStack = newValue >= 0? [newValue, lastStack[1]]: [lastStack[0], newValue];
                                        barStackTrackValues.set(key, currentStack);
                                    }
                                    

                                    if(isHorizontal){
                                        xAxis.values.push(newValue);
                                        
                                        if(newValueWidth > maxLabelWidth){
                                            maxLabelWidth = newValueWidth;
                                        }
                                    }else {
                                        yAxis.values.push(newValue);

                                        if(newValueWidth > maxValueWidth){
                                            maxValueWidth = newValueWidth;
                                        }
                                    }

                                });
                            }
                        }

                        (labelIsAllNumbers && !valueIsAllNumbers && !isHorizontal)? xAxis.values.push(label): null;
                        (valueIsAllNumbers && !labelIsAllNumbers && isHorizontal)? yAxis.values.push(value): null;
                    }else {

                        if(newLabels.includes(label) && valueIsAllNumbers){
                            
                            const index = newLabels.indexOf(label);
                            const bucket = axisBucket[index];

                            if(bucket && !isNaN(value)){ 
                                bucket.push(value);
                            }
                        }else if(newValues.includes(value) && !valueIsAllNumbers && labelIsAllNumbers){
                            const index = newValues.indexOf(value);
                            const bucket = axisBucket[index];

                            if(bucket && !isNaN(label)){
                                bucket.push(label);
                            }
                        }else {
                            newLabels.push(label);
                            newValues.push(value);

                            //push value into an array bucket
                            if(valueIsAllNumbers){
                                !isNaN(value)? axisBucket.push([value]): axisBucket.push([]);
                            }else {
                                labelIsAllNumbers? axisBucket.push([label]): axisBucket.push([]);
                            }
                        }

                        if(j === (loopEnd-1)){ //at the end of the j loop 

                            for(let k = 0; k < axisBucket.length; k++){
                                const bucket = axisBucket[k];

                                const newValue = Calc.computeOperation(operation, bucket);
                                if(!isNaN(newValue)){

                                    if(valueIsAllNumbers){
                                        valueWidth = ctx.measureText(yPrefix + Calc.toFixedIfNeeded(newValue, yDecimalPlaces) + ySuffix).width;

                                        newValues[k] = newValue;
                                        yAxis.values.push(newValue);

                                        if(valueWidth > maxValueWidth){
                                            maxValueWidth = valueWidth;
                                        }
                                    }else {
                                        if(labelIsAllNumbers){
                                            labelWidth = ctx.measureText(xPrefix + Calc.toFixedIfNeeded(newValue, xDecimalPlaces) + xSuffix).width;

                                            newLabels[k] = newValue;
                                            xAxis.values.push(newValue);

                                            if(labelWidth > maxLabelWidth){
                                                maxLabelWidth = labelWidth;
                                            }
                                        }
                                    }
                                }
                                
                            }
                        }

                    }
    
                    if(labelWidth > maxLabelWidth){
                        maxLabelWidth = labelWidth;
                        lastMaxLabel = label;
                    }

                    if(valueWidth > maxValueWidth){
                        maxValueWidth = valueWidth
                        lastMaxValue = value;
                    }
                    

                    //(!labelIsAllNumbers? label.length > 0:true)? xAxis.values.push(label): null;
                    //(!valueIsAllNumbers? value.length > 0:true)? yAxis.values.push(value): null;

                    (!labelIsAllNumbers || valueIsAllNumbers)? xAxis.values.push(label): null;
                    (!valueIsAllNumbers || labelIsAllNumbers)? yAxis.values.push(value): null;

                }
                

                //set axisData max width 
                xAxis.maxWidth = maxLabelWidth > xAxis.maxWidth? maxLabelWidth: xAxis.maxWidth;
                yAxis.maxWidth = maxValueWidth > yAxis.maxWidth? maxValueWidth: yAxis.maxWidth;

                //set axis is numbers 
                yAxis.isAllNumbers = valueIsAllNumbers;
                xAxis.isAllNumbers = labelIsAllNumbers;

                hasAxisData = true;

                //if not a bar dataset push the dataset to newData 
                const newDataName = dataName? dataName: "Dataset " + axisDataCount;
                const newDataNameWidth = ctx.measureText(newDataName).width;

                if(dataType === "bar"){
                    barDatasetNames.push(newDataName);
                    barData.name = newDataName;
                    barData.design = setUpAxisChartDesign(dataType, design, axisDataCount);
                    barData.design.color? barDatasetColors.push(Array.isArray(barData.design.color)? barData.design.color[0]: barData.design.color): null;
                    barDataset.dataset.push(barData);
                }else {
                    dataset.name = newDataName;
                    dataset.values = newValues;
                    dataset.labels = newLabels;
                    dataset.design = setUpAxisChartDesign(dataType, design, axisDataCount);
                    axisData.push(dataset);
                }

                //set dataset name max width and total on axis charts
                newDataNameWidth > datasetNameMaxWidth? datasetNameMaxWidth = newDataNameWidth: null;
                totalDatasetName += 1;

                axisDataCount++;

            }else if(dataType === "pie"){

                for(let j = 0; j < values.length; j++){
                    const label = labelIsAllNumbers? labels[j]: labels[j];
                    const value = valueIsAllNumbers? values[j]: values[j];
                    
                    if(value >= 0 && label){
                        //set maxTextlength
                        const labelWidth = ctx.measureText(label).width;

                        //set new pie dataset labels and values 
                        if(newPieLabels.includes(label)){
                            const index = newPieLabels.indexOf(label);

                            newPieValues[index].push(value);
                        }else {
                            newPieLabels.push(label);
                            newPieValues.push([value]);
                        }

                        //set max width of axis labels and values for pie charts
                        labelWidth > pieMaxLabelWidth? pieMaxLabelWidth = labelWidth: null;
                    }

                }

                 //push pie dataset
                hasPieData = true;
                
                newPieDataset.labels = newPieLabels;
                newPieDataset.values = newPieValues;
                newPieDataset.names = newPieLabels;
                newPieDataset.type = "pie";

                pieData.push(newPieDataset);

                //set dataset name max width and total on pie
                pieMaxLabelWidth > datasetNameMaxWidth? datasetNameMaxWidth = pieMaxLabelWidth: null;
                totalDatasetName += newPieLabels.length;
            }

            //remove duplicates from dataset 
            //dataset.values = [...new Set(dataset.values)];
            //dataset.labels = [...new Set(dataset.labels)];

            xAxis? xAxis.values = [...new Set(xAxis.values)]: null;
            yAxis? yAxis.values = [...new Set(yAxis.values)]: null;
            
        }

        //if bar is in data set the bar 
        if(hasBarDataset){
            barDataset.names = barDatasetNames;
            barDataset.colors = barDatasetColors;
            barDataset.direction = axisDirection;
            axisData.unshift(barDataset);
        }

    }


    const setAxisProperties = (axisObject, type) => {
        for(let key in axisObject){
            const axis = axisObject[key];

            const values = axis.values;
            const axisMaxWidth = axis.maxWidth;

            const isAllNumbers = Calc.isAllNumbers(values);

            let range = Calc.rangeFromData(values);

            if(type === "values"){
                if(key === "y2"){
                    if(layout.y2Axis){
                        const layoutRange = layout.y2Axis.range;
                        layoutRange? range = layoutRange: [null, null];
                    }
                }else {
                    if(layout.yAxis){
                        const layoutRange = layout.yAxis.range;
                        layoutRange? range = layoutRange: [null, null];
                    }
                }
            }else {
                if(layout.xAxis){
                    const layoutRange = layout.xAxis.range;
                    layoutRange? range = layoutRange: [null, null];
                }
            }

            const tick = getTickData(range);
            const tickRange = tick.range;
            
            const tickRangeStart = tickRange[0], tickRangeEnd = tickRange[1];

            let maxWidth = axisMaxWidth;

            if(isAllNumbers){
                const tickFormat = axis.tickFormat;
                const decimalPlaces = tickFormat? tickFormat.decimalPlaces: null;
                const prefix = tickFormat? tickFormat.prefix || "": "";
                const suffix = tickFormat? tickFormat.suffix || "": "";

                if( !isNaN(tickRangeStart) && !isNaN(tickRangeEnd) ){
                    const startWidth = ctx.measureText(prefix + Calc.toFixedIfNeeded(tickRangeStart, decimalPlaces) + suffix).width;
                    const endWidth = ctx.measureText(prefix + Calc.toFixedIfNeeded(tickRangeEnd, decimalPlaces) + suffix).width;

                    maxWidth = Math.max(startWidth, endWidth);
                }
            }
            
            axis.maxWidth = maxWidth;
            axis.range = tick.range;
            axis.tickData = tick;
            axis.isAllNumbers = isAllNumbers;
        }
    };

    const newData = [...axisData, ...pieData];

    setAxisProperties(axisValues, "values");
    setAxisProperties(axisLabels);

    //
    layout.datasetNameData = {
        isDatasetName: totalDatasetName > 1,
        maxNameWidth: datasetNameMaxWidth,
        total: totalDatasetName
    };

    //set axis data 
    layout.axisData = {
        labels: axisLabels,
        values: axisValues,
        direction: axisDirection
    };
    
    //set whether for not a particular chart type exists.
    layout.hasAxisData = hasAxisData;
    layout.hasPieData = hasPieData;

    //set data to dv
    dv.setData(newData);
}


//get non bar axis chart design
function setUpAxisChartDesign(dataType, design, count){
    const newDesign = design? design: {};

    //set deign colors
    const color = customColors.get(count).code;
    !newDesign.color? newDesign.color = color: null;

    dataType === "line"? Array.isArray(newDesign.color)? newDesign.color = color: null: null;

    //set design size 
    !newDesign.size? newDesign.size = 3: null;

    return newDesign;
}