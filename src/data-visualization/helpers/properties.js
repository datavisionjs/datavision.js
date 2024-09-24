import * as Calc from './math.js';
import * as Global from './global.js';

import customColors from '../helpers/colors.js';

export function setGraphPosition(dv){
    const canvasSize = dv.getCanvasSize();
    const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;

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

    const getWidth = (hasTitle, textMaxWidth, maxLabelWidth) => {
        const twiceFontSize = fontSize * 2;
        
        let width = maxLabelWidth;
        if(textMaxWidth < width){
            width = textMaxWidth + twiceFontSize;
        }

        hasTitle? width += twiceFontSize: null;
        return width;
    }


    //set title space from top;
    const titleLines = dv.getLayout().title.titleLines;
    let titleTop = titleLines.length > 0? (((titleLines.length+1)*titleFontSize)+fontSize): fontSize;


    const axisData = layout.axisData;
    const labelObject = axisData.labels;
    const valueObject = axisData.values;
    const axisTitleSpace = (fontSize*2);


    //y1
    const y1 = valueObject.y1;
    const y1MaxWidth = y1.maxWidth;
    const y1Title = layout.yAxis? layout.yAxis.title: null;
    let yAxisLeft = getWidth(y1Title, y1MaxWidth, yLabelMaxWidth);
    

    //y2
    const y2 = valueObject.y2;
    const y2MaxWidth = y2.maxWidth;
    const y2Title = layout.y2Axis? layout.y2Axis.title: null;
    let yAxisRight = getWidth((y2Title && (y2MaxWidth>0)), y2MaxWidth, yLabelMaxWidth);




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
    const tempGraphWidth = (canvasWidth-(yAxisLeft+yAxisRight+datasetSpace));

    const x1 = labelObject.x1;
    const x1MaxWidth = x1.maxWidth;
    const labelStep = (tempGraphWidth/x1.values.length);

    //give space to the right of the x axis using x1MaxWidth
    xAxisRight = x1.isAllNumbers? x1MaxWidth: 0;

    const x1Title = layout.xAxis? layout.xAxis.title: null;
    let xAxisBottom = getWidth(x1Title, fontSize, xLabelMaxWidth);
    if(!x1.isAllNumbers && ((labelStep/fontSize) < 4)){
        xAxisBottom = getWidth(x1Title, x1MaxWidth, xLabelMaxWidth);
    }


    const graphX = (yAxisLeft), graphY = (titleTop);
    const graphWidth = (canvasWidth-(yAxisLeft+yAxisRight+datasetSpace+xAxisRight));
    const graphHeight = (canvasHeight-(titleTop+xAxisBottom));

    const graphPosition = {
        x: graphX,
        y: graphY,
        width: graphWidth,
        height: graphHeight,
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
                intervalSize = (rangeEnd-rangeStart) / Math.max(desiredTickCount - 1, 1);
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


function setAxisProperties(dv, axisObject, type){
    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    for(let key in axisObject){
        const axis = axisObject[key];

        const values = Array.from(axis.values);
        const axisMaxWidth = axis.maxWidth;

        const isAllNumbers = Calc.isAllNumbers(values);

        const design = dv.getDesign();
        let font = design.xAxis.font;

        let targetAxis = {};
        if(type === "values"){
            if(key === "y2"){
                layout.y2Axis? targetAxis = layout.y2Axis: null;
            }else {
                layout.yAxis? targetAxis = layout.yAxis: null;
                font = design.yAxis.font;
            }
        }else {
            layout.xAxis? targetAxis = layout.xAxis: null;
        }

        ctx.font = font.weight + " " + font.size + "px " + font.family;

        let range = Calc.rangeFromData(values, targetAxis.range);
        const title = targetAxis.title || "";
       
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

        //set separateNumbers
        const tickFormat = axis.tickFormat;
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
        
        const xLayout = pieObject.xLayout;
        const yLayout = pieObject.yLayout;

        if(xLayout && yLayout){
            const valueRange = Calc.rangeFromData(values);
            const valueTick = getTickData(valueRange);

            const valueTickFormat = {...yLayout.tickFormat};
            if(valueTickFormat){
                if(!valueTickFormat.separateNumbers){
                    valueTickFormat.separateNumbers = !Calc.isYearSeries(valueTick.range);
                }
            }
            //set values tickformat
            pieObject.yLayout.tickFormat = valueTickFormat;

            const labelRange = Calc.rangeFromData(labels);
            const labelTick = getTickData(labelRange);

            const labelTickFormat = {...xLayout.tickFormat};
            if(labelTickFormat){
                if(!labelTickFormat.separateNumbers){
                    labelTickFormat.separateNumbers = !Calc.isYearSeries(labelTick.range);
                }
            }

            //set labels tickformat
            pieObject.xLayout.tickFormat = labelTickFormat;
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
    ctx.font = font.weight + " " + fontSize+"px "+ font.family;

    //get scroll data 
    const scrollData = dv.getScrollData();

    //stores the number of bars for each category
    let maxBarPerCategory = 1;

    let pieMaxLabelWidth = 0;

    const axisData = [];
    const pieData = [];
    const tableData = [];

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

    const axisLabels = {x1: new NewAxis()};
    const axisValues = { y1: new NewAxis(), y2: new NewAxis() };


    const axisChartTypes = Global.getAxisChartTypes();
    let hasAxisData = false;
    let hasPieData = false;
    let hasTableData = false;
    let axisDirection = null;


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
                dataPoints: new Map(),  
                xAxis: dataLabelAxis, 
                yAxis: dataValueAxis
            };

            //axis dataset
            const dataPoints = new Map();
            const axisLabelBuckets = new Map();
            const axisValueBuckets = new Map();
            const newLabels = [];
            const newValues = [];
            const axisBucket = [];


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


            if(axisChartTypes.includes(dataType) && !(hasPieData || hasTableData)){

                const operation = dataset.operation;

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
    
                        if(barData.dataPoints.has(newLabel)){

                            labelValues = barData.dataPoints.get(newLabel);

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

                            barData.dataPoints.set(newLabel, labelValues);
        
                            dataset.direction === "hr"? axisDirection = "hr": null;
                            hasBarDataset = true;
                        }

                        if(j === (loopEnd-1)){ //at the end of the j loop 

                            //Set the barSize base on the min key difference (how far aprart the labels are on the axis)
                            const isAllNumbers = isHorizontal? valueIsAllNumbers: labelIsAllNumbers; //check if the base of the bars is all numbers
                            if(isAllNumbers){

                                let keysArray = Array.from(barData.dataPoints.keys());
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

                                //loop through barData dataPoints bucket and execute the operation
                                barData.dataPoints.forEach((bucket, key) => {

                                    if(bucket.length > 0){
                                        let newValue = newValueIsAllNumbers? Calc.computeOperation(operation, bucket): bucket[0];

                                        const newValueWidth = ctx.measureText(prefix + Calc.toFixedIfNeeded(newValue, decimalPlaces) + suffix).width;

                                        barData.dataPoints.set(key, newValue);

                                        //add stack value to properly show axis range
                                        if(barDataset.mode === "stack"){
                                            const lastStack = barStackTrackValues.has(key)? barStackTrackValues.get(key): [0, 0];
                                            const lastValue = newValue >= 0? (lastStack[0]): (lastStack[1]);

                                            newValue = (lastValue+newValue);

                                            const currentStack = newValue >= 0? [newValue, lastStack[1]]: [lastStack[0], newValue];
                                            barStackTrackValues.set(key, currentStack);
                                        }
                                        

                                        if(isHorizontal){
                                            xAxis.values.add(newValue);
                                            
                                            if(newValueWidth > maxLabelWidth){
                                                maxLabelWidth = newValueWidth;
                                            }
                                        }else {
                                            yAxis.values.add(newValue);

                                            if(newValueWidth > maxValueWidth){
                                                maxValueWidth = newValueWidth;
                                            }
                                        }
                                    }

                                });
                            }
                        }
                        
                        (labelIsAllNumbers && !valueIsAllNumbers && !isHorizontal)? 
                        xAxis.values.add(label) : null;
                        (valueIsAllNumbers && !labelIsAllNumbers && isHorizontal)?
                        yAxis.values.add(value) : null;
                    }else {

                        /*
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
                            if(!labelIsAllNumbers && !valueIsAllNumbers){
                                const xIndex = newLabels.indexOf(label) != -1;
                                const yIndex = newValues.indexOf(value) != -1;
        
                                if(!xIndex || !yIndex){
                                    newLabels.push(label);
                                    newValues.push(value);
                                }
                            }else {
                                newLabels.push(label);
                                newValues.push(value);
                            }

                            //push value into an array bucket
                            if(valueIsAllNumbers){
                                !isNaN(value)? axisBucket.push([value]): axisBucket.push([]);
                            }else {
                                labelIsAllNumbers? axisBucket.push([label]): axisBucket.push([]);
                            }
                        }*/

                        if(axisLabelBuckets.has(label) && valueIsAllNumbers){
                            const bucket = axisLabelBuckets.get(label);
                            if(!isNaN(value)){
                                axisLabelBuckets.set(label, [...bucket, value]);
                            }
                        }else if(axisValueBuckets.has(value) && !valueIsAllNumbers && labelIsAllNumbers){
                            const bucket = axisValueBuckets.get(value);
                            
                            if(!isNaN(label)){
                                axisValueBuckets.set(value, [...bucket, label]);
                            }
                        }else {
                            if(!labelIsAllNumbers && !valueIsAllNumbers){
                                if(!axisLabelBuckets.has(label) || !axisValueBuckets.has(value)){
                                    axisLabelBuckets.set(label, []);
                                    axisValueBuckets.set(value, []);
                                }
                            }else {

                                if(valueIsAllNumbers){

                                    if(!isNaN(value)){
                                        axisLabelBuckets.set(label, [value]);
                                    }
                                }else if(labelIsAllNumbers){
                                    axisValueBuckets.set(value, [label]);
                                }
                            }
                        }

                        if(j === (loopEnd-1)){ //at the end of the j loop 
                            const bucketMap = valueIsAllNumbers? axisLabelBuckets: axisValueBuckets;

                            for (let [key, bucket] of bucketMap){

                                if(bucket.length > 0){
                                    const newValue = Calc.computeOperation(operation, bucket);
                                    if(!isNaN(newValue)){

                                        if(valueIsAllNumbers){
                                            valueWidth = ctx.measureText(yPrefix + Calc.toFixedIfNeeded(newValue, yDecimalPlaces) + ySuffix).width;

                                            dataPoints.set(key, newValue);

                                            yAxis.values.add(newValue);

                                            if(valueWidth > maxValueWidth){
                                                maxValueWidth = valueWidth;
                                            }
                                        }else {
                                            if(labelIsAllNumbers){
                                                labelWidth = ctx.measureText(xPrefix + Calc.toFixedIfNeeded(newValue, xDecimalPlaces) + xSuffix).width;

                                                dataPoints.set(key, newValue);
                                                xAxis.values.add(newValue);

                                                if(labelWidth > maxLabelWidth){
                                                    maxLabelWidth = labelWidth;
                                                }
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
                    
                    (!labelIsAllNumbers || valueIsAllNumbers)? 
                    xAxis.values.add(label) : null;
                    (!valueIsAllNumbers || labelIsAllNumbers)? 
                    yAxis.values.add(value) : null;

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
                const newDataNameWidth = Global.measureLegendText(dv, newDataName).width;

                if(dataType === "bar"){
                    //barDatasetNames.push(newDataName);
                    barData.name = newDataName;
                    barData.type = "bar";
                    barData.design = setUpAxisChartDesign(dataType, design, axisDataCount);
                    barData.design.color? barDatasetColors.push(Array.isArray(barData.design.color)? barData.design.color[0]: barData.design.color): null;
                    dataset.sort? barData.sort = dataset.sort: null;
                    barDataset.dataset.push(barData);

                    //set legend colors
                    //legendData.colors.push(barData.design.color);
                    legendData.data.set(newDataName, barData.design.color);
                }else {
                    dataset.name = newDataName;
                    dataset.dataPoints = dataPoints;
                    dataset.design = setUpAxisChartDesign(dataType, design, axisDataCount);
                    axisData.push(dataset);

                    //set legend colors
                    //legendData.colors.push(dataset.design.color);
                    legendData.data.set(newDataName, dataset.design.color);
                }

                legendData.names.push(newDataName);

                //set dataset name max width and total on axis charts
                newDataNameWidth > legendData.maxWidth? legendData.maxWidth = newDataNameWidth: null;

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
                    if(!yAxis.isAllNumbers){
                        const yAxisSize = yAxis.values.size;
                        //set axis count
                        yAxisSize > (scrollData.valuesCount|| 0)? scrollData.valuesCount = yAxisSize: null;
                    }
                }

            }else if(dataType === "pie" && !(hasAxisData || hasTableData)){

                const operation = dataset.operation;
                const design = dataset.design || {};
                const colors = Array.isArray(design.colors)? design.colors: null;
                
                const pieLabels = [];
                const valueBuckets = [];

                for(let j = 0; j < values.length; j++){
                    const label = labelIsAllNumbers? labels[j]: labels[j];
                    const value = valueIsAllNumbers? values[j]: values[j];
                    
                    if(value >= 0 && label){
                        //set maxTextlength
                        const labelWidth = Global.measureLegendText(dv, label).width;

                        //set new pie dataset labels and values 
                        const index = pieLabels.indexOf(label);
                        if(index > -1){
                            valueBuckets[index].push(value);
                        }else {
                            pieLabels.push(label);
                            valueBuckets.push([value]);
                        }

                        //set max width of axis labels and values for pie charts
                        labelWidth > pieMaxLabelWidth? pieMaxLabelWidth = labelWidth: null;
                    }

                }

                 //pie dataset
                 const newDataset = {
                    ...dataset,
                    data: new Map(),
                    labels: pieLabels,
                    values: [],
                    colors: [],
                    sumOfValues: 0
                };


                //calculate operations and set values;
                const pieValues = [];
                valueBuckets.forEach((bucket, index) => {
                    const label = pieLabels[index];
                    const value = Calc.computeOperation(operation, bucket);
                    //
                    const defaultColor = customColors.get(index).code;
                    const pieColor = colors? colors[index] || defaultColor: defaultColor;

                    newDataset.data.set(label, {value: value, color: pieColor});
                    pieValues.push(value);
                    newDataset.sumOfValues = (newDataset.sumOfValues + value);

                    //set legend data
                    legendData.data.set(label, pieColor);
                });

                newDataset.values = pieValues;
                newDataset.type = "pie";

                newDataset.xLayout = {tickFormat: xAxisTickFormat, isAllNumbers: labelIsAllNumbers};
                newDataset.yLayout = {tickFormat: yAxisTickFormat, isAllNumbers: valueIsAllNumbers};

                //sorting
                Calc.pieCustomSort(dv, newDataset);
                legendData.names = {...newDataset.sortedLabels};

                //add to pieData 
                pieData.push(newDataset);

                //set dataset name max width and total on pie
                pieMaxLabelWidth > legendData.maxWidth? legendData.maxWidth = pieMaxLabelWidth: null;

                hasPieData = true;
            }else if(dataType === "table" && !(hasAxisData || hasPieData)){

                //table dataset
                const newTableDataset = {...dataset};
                const newTableHeaders = []; //tableheaders values
                const newTableData = []; //tabledata values

                const headerValues = dataset.header? dataset.header.values: [];
                const datasetData = dataset.data || {};
                const data = datasetData.values? datasetData.values: [];

                const dataOperation = dataset.data? dataset.data.operation: false;

                let maxValueWidth = 0;
                let columnCount = data.length > headerValues.length? data.length: headerValues.length;
                let rowCount = 0;

                if(dataOperation){
                    let hasCategoricalData = false;

                    const isNumbericColumn = [];

                    const catColumns = [];

                    for(let index = 0; index < columnCount; index++){

                       //process column data
                       const column = data[index];
                       if(column){
                           const columnIsAllNumbers = Calc.isAllNumbers(column);

                           if(!columnIsAllNumbers){
                                catColumns.push(column);
                                hasCategoricalData = true;
                           }

                           isNumbericColumn.push(columnIsAllNumbers);
                       }
                   }

                   //combine the categorical columns into rows array
                   
                   const categoricalRows = hasCategoricalData? catColumns[0].map((_, i) => catColumns.map(col => col[i]) ): [];
                   
                   const uniqueCategoricalRows = hasCategoricalData? Array.from(new Set(categoricalRows.map(JSON.stringify))).map(JSON.parse): [];
                   const newCategoricalColumns = hasCategoricalData? uniqueCategoricalRows[0].map((_, index) => uniqueCategoricalRows.map(row => row[index])): [];
                  
                   //set row count 
                   rowCount = uniqueCategoricalRows.length || 1;

                   //set column values in the bucket
                   for(let index = 0; index < columnCount; index++){

                        const columnIsNumber = isNumbericColumn[index];

                        //process header values 
                        const headerValue = headerValues[index];
                        if(headerValue){
                            newTableHeaders.push(headerValue);
        
                            const valueWidth = ctx.measureText(headerValue).width;
                            if(valueWidth > maxValueWidth){
                                maxValueWidth = valueWidth;
                            }
                        }

                        //process column data
                        const column = data[index];
                        const columnMap = new Map();

                        const operation = Array.isArray(dataOperation)? dataOperation[index] || dataOperation[dataOperation.length-1]: dataOperation;
                        
                        if(column){
                            if(columnIsNumber){
                                
                                for(let i = 0; i < column.length; i++){
                                    const catRow = categoricalRows[i] || "column";
                                    const catRowString = catRow.toString();
                                   
                                    const value = column[i];
                                    
                                    if(hasCategoricalData){
                                        if(columnMap.has(catRowString)){
                                            columnMap.get(catRowString).push(value);
                                        }else {
                                            columnMap.set(catRowString, [value]);
                                        }
                                    }
                                }

                                if(hasCategoricalData){
                                    const columnValues = [];

                                    for(const [key, bucket] of columnMap){
                                    
                                        const newValue = Calc.computeOperation(operation, bucket);

                                        const valueWidth = ctx.measureText(newValue).width;
                                        if(valueWidth > maxValueWidth){
                                            maxValueWidth = valueWidth;
                                        }

                                        columnValues.push(newValue);
                                    }

                                    newTableData.push(columnValues);
                                }else {
                                    
                                    const newValue = Calc.computeOperation(operation, column);

                                    const valueWidth = ctx.measureText(newValue).width;
                                    if(valueWidth > maxValueWidth){
                                        maxValueWidth = valueWidth;
                                    }

                                    newTableData.push([newValue]);
                                }
                            }else {

                                if(hasCategoricalData){
                                    newTableData.push(newCategoricalColumns.shift());
                                }

                            }
                        }

                   }

                   //add newCategoricalList as the first element in newTableData
                   //hasCategoricalData? newTableData.unshift(categoricalList): null;

                }else {

                    for(let index = 0; index < columnCount; index++){
                         //process header values 
                        const headerValue = headerValues[index];
                        if(headerValue){
                             newTableHeaders.push(headerValue);
     
                             const valueWidth = ctx.measureText(headerValue).width;
                             if(valueWidth > maxValueWidth){
                                 maxValueWidth = valueWidth;
                             }
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
                                if(valueWidth > maxValueWidth){
                                    maxValueWidth = valueWidth;
                                }
                            }

                            newTableData.push(newColumn);
                        }
                    }

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

                newTableDataset.header = {...dataset.header, values: newTableHeaders};
                newTableDataset.data = {
                    ...datasetData,
                    values: newTableData, 
                    font: {
                        ...datasetFont,
                        color: newDataColor,
                    },
                    fill: { 
                        color: newFillColor
                    }
                }
                newTableDataset.type = "table";
                newTableDataset.maxValueWidth = maxValueWidth;
                newTableDataset.columnCount = newColumnCount;
                newTableDataset.rowCount = (rowCount? (rowCount+1): 1); //plus 1 is adding the header row

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
        if(hasBarDataset){
            barDataset.names = barDatasetNames;
            barDataset.colors = barDatasetColors;
            barDataset.direction = axisDirection;
            axisData.unshift(barDataset);
        }

    }

    //set pie Properties 
    setPieProperties(pieData);

    const newData = [...axisData, ...pieData, ...tableData];

    //set axis chart properties
    setAxisProperties(dv, axisValues, "values");
    setAxisProperties(dv, axisLabels);

    //sorting axisCharts
    hasAxisData? Calc.axisCustomSort(dv, axisLabels, axisData): null;

    //set legend
    const isDisplayLegend = layout.legend? layout.legend.display: null;
    const isLegendDisplayBool = typeof isDisplayLegend === "boolean";
    layout.legend = {
        ...legendData,
        isDefault: isLegendDisplayBool? isDisplayLegend: true,
        display: isDisplayLegend,
        size: legendData.data.size,
    }

    //set axis data 

    layout.axisData = {
        labels: axisLabels,
        values: axisValues,
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
function setUpAxisChartDesign(dataType, design, count){
    const newDesign = design;

    if(newDesign){
        //set deign colors
        const color = customColors.get(count).code;
        
        !newDesign.color? newDesign.color = color: null;

        dataType === "line"? Array.isArray(newDesign.color)? newDesign.color = color: null: null;
    }

    return newDesign || {};
}