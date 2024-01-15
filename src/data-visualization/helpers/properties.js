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
    let yAxisLeft = (canvasWidth*0.15), yAxisRight = (canvasWidth*0.15);


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
   
    if(x1MaxWidth > labelStep && x1MaxWidth > axisTitleSpace){
        xAxisBottom += (x1MaxWidth*0.7);
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
        yAxisRight: yAxisRight
    }


    //set graphposition
    dv.layout = {
        ...layout, 
        graphPosition: graphPosition
    };
    
}


function getTickData(range){ 
    if(!range) return {count: 0, range: range};

    let desiredTickCount = 10;

    const min = range[0], max = range[1];

    let rangeStart = min, rangeEnd = max;
    let tickCount = desiredTickCount;
    let interval = 0;
    
    if(!isNaN(min) && !isNaN(max)){
        if(min <= 0 && max >= 0){
            desiredTickCount = Math.round(desiredTickCount/2);
            const rangeDiff = max - 0;

            // Calculate the interval size based on the desired number of ticks
            const intervalSize = rangeDiff / Math.max(desiredTickCount - 1, 1);

            interval = Calc.getTicksInterval(intervalSize);

            const topTickCount = Math.ceil(rangeDiff / interval);
            const bottomTickCount = Math.ceil(Math.abs(min)/interval);

            tickCount = (topTickCount+bottomTickCount);
            rangeStart = -(bottomTickCount*interval);
            rangeEnd = (interval*(topTickCount));
        }else {

            if(min <= 0){
                const rangeDiff = max - min;

                // Calculate the interval size based on the desired number of ticks
                const intervalSize = rangeDiff / Math.max(desiredTickCount - 1, 1);

                interval = Calc.getTicksInterval(intervalSize);

                rangeEnd = -(Calc.getTicksInterval(Math.abs(rangeEnd), true));

                tickCount = Math.ceil(Math.abs(rangeEnd-min)/interval);

                rangeStart = -((Math.abs(rangeEnd))+(interval*(tickCount)));
            
            }else if(min > 0){
                rangeStart = Calc.getTicksInterval(rangeStart, true);

                const rangeDiff = rangeEnd - rangeStart;

                // Calculate the interval size based on the desired number of ticks
                const intervalSize = rangeDiff / Math.max(desiredTickCount - 1, 1);

                interval = Calc.getTicksInterval(intervalSize);
                
                const belowIntCount = Math.floor((min-rangeStart)/interval);

                rangeStart += (rangeStart+interval) < min? (belowIntCount*interval): 0;

                const newRangeDiff = (rangeEnd-rangeStart);

                // Calculate the number of ticks
                tickCount = Math.ceil(newRangeDiff / interval);

                rangeEnd = rangeStart + (interval*(tickCount));
            }

        }
    }

    return {
        count: tickCount,
        range: [rangeStart, rangeEnd],
        interval: interval,
    }
}


export function setUpChart(dv){
    const ctx = dv.getCtx();
    const layout = dv.getLayout();
    const data = [...dv.getData()];

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
    const NewAxis = () => {
        return {
            values: [], 
            range: null, 
            maxWidth: 0, 
            tickData: null, 
            isAllNumbers: false
        };
    };

    const axisLabels = {x1: NewAxis()};
    const axisValues = { y1: NewAxis(), y2: NewAxis() };

    //all pie labels and values
    const pieLabels = [];
    const pieValues = [];


    const axisChartTypes = ["line", "scatter", "bar"];
    let hasAxisData = false;
    let hasPieData = false;
    let axisDirection = null;

    //dataset names data
    let datasetNameMaxWidth = 0;
    let totalDatasetName = 0;

    //get range from data 
    if(data){
        
        //loop through data and set xRange and yRange
        const tempData = [...data];
        const tempDataLength = tempData.length;

        const barDataset = {type: "bar"};
        const barCategories = new Map();
        const barDatasetNames = [];
        let hasBarDataset = false;

        for(let i = 0; i < tempDataLength; i++){
            const dataset = {...tempData[i]};

            const dataName = dataset.name;
            const labels = dataset.labels;
            const values = dataset.values;
            const dataType = dataset.type;
            const design = dataset.design;
            const dataValueAxis = dataset.yAxis? dataset.yAxis: "y1";
            const dataLabelAxis = dataset.xAxis? dataset.xAxis: "x1";

            const yAxis = dataValueAxis === "y2"? axisValues.y2: axisValues.y1;
            const xAxis = axisLabels[dataLabelAxis];

            let maxLabelWidth = 0;
            let maxValueWidth = 0;

            const newPieDataset = {...dataset};
            const newPieLabels = [];
            const newPieValues = [];
            let pieTotalValues = 0;

            const labelIsAllNumbers = Calc.isAllNumbers(labels);
            const valueIsAllNumbers = Calc.isAllNumbers(values);
            

            if(axisChartTypes.includes(dataType)){

                const currentBarLabels = [];
                for(let j = 0; j < labels.length; j++){
                    
                    const label = labelIsAllNumbers? Math.round(labels[j]): labels[j];
                    const value = valueIsAllNumbers? Math.round(values[j]): values[j];
    
                    //set maxTextlength
                    const labelWidth = ctx.measureText(label).width;

                    //If there's a value between 0 and -10 set the value to -10 and for measurement.
                    const valueToMeasure = valueIsAllNumbers? value < 0 && value > 10? -10: value: value;
                    const valueWidth = ctx.measureText(valueToMeasure).width;
    
                    if(dataType === "bar"){
                        const isHorizontal = dataset.direction === "hr";
                        const customColor = customColors[axisDataCount].code;

                        const newValue = isHorizontal? label: value;
                        const newLabel = isHorizontal? value: label;
                        

                        let labelValues = [[newValue]];
                                              //positive value count , negative value count
                        let labelValuesCount = [[newValue >= 0? newValue: 0, newValue < 0? newValue: 0]];
                        
                        let colorValues = [[design? Array.isArray(design.color)? j < design.color.length? design.color[j]: customColor : design.color: customColor]];
    
                        if(barCategories.has(newLabel)){

                            const lastData = barCategories.get(newLabel);
                            const lastDataValues = lastData.values;
                            const lastLabelValues = lastDataValues[lastDataValues.length-1];

                            const lastDataValuesCount = lastData.valuesCount;
                            const lastValuesCount = lastDataValuesCount[lastDataValuesCount.length-1];

                            const lastDataColors = lastData.colors;
                            const lastColorValues = lastDataColors[lastDataColors.length-1];
                            
                            if(currentBarLabels.includes(newLabel)){
                                lastLabelValues.push(...labelValues[0]);
                                lastColorValues.push(...colorValues[0]);

                                if(valueIsAllNumbers || (isHorizontal && labelIsAllNumbers)){
                                    const lastValue = newValue >= 0? lastValuesCount[0]: lastValuesCount[1];
                                    const sumValue = (lastValue+newValue);

                                    newValue >= 0? lastDataValuesCount[lastDataValuesCount.length-1][0] = sumValue: null;
                                    newValue < 0? lastDataValuesCount[lastDataValuesCount.length-1][1] = sumValue: null;
                                    
                                    //add to axisValue
                                    if(isHorizontal){
                                        xAxis.values.indexOf(sumValue) === -1? xAxis.values.push(sumValue): null;
                                    }else {
                                        yAxis.values.indexOf(sumValue) === -1? yAxis.values.push(sumValue): null;
                                    }
                                }

                                labelValues = [...lastDataValues];
                                colorValues = [...lastDataColors];
                                labelValuesCount = lastDataValuesCount;
                            }else {
                                labelValues = [...lastDataValues, ...labelValues];
                                labelValuesCount = [...lastDataValuesCount, ...labelValuesCount];
                                colorValues = [...lastDataColors, ...colorValues];
                            }
                        }
    
                        //set maxBarPerCategory if labelValues is more then the current value.
                        labelValues.length > maxBarPerCategory? maxBarPerCategory = labelValues.length: null;
    
                        barCategories.set(newLabel, {
                            values: labelValues, 
                            valuesCount: labelValuesCount,  
                            colors: colorValues,
                            xAxis: dataLabelAxis,
                            yAxis: dataValueAxis
                        });
    
                        dataset.direction === "hr"? axisDirection = "hr": null;
                        hasBarDataset = true;

                        //push label to currentBarLabels 
                        currentBarLabels.push(newLabel);
                    }
    
                   
                    labelWidth > maxLabelWidth? maxLabelWidth = labelWidth: null;
                    valueWidth > maxValueWidth? maxValueWidth = valueWidth: null;
                    
    
                    xAxis.values.indexOf(label) === -1? xAxis.values.push(label): null;
                    yAxis.values.indexOf(value) === -1? yAxis.values.push(value): null;

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
                }else {
                    dataset.name = newDataName;
                    dataset.design = setUpAxisChartDesign(dataType, design, axisDataCount);
                    axisData.push(dataset);
                }

                //set dataset name max width and total on axis charts
                newDataNameWidth > datasetNameMaxWidth? datasetNameMaxWidth = newDataNameWidth: null;
                totalDatasetName += 1;

                axisDataCount++;
            }else if(dataType === "pie"){

                for(let j = 0; j < values.length; j++){
                    const label = labelIsAllNumbers? Math.round(labels[j]): labels[j];
                    const value = valueIsAllNumbers? Math.round(values[j]): values[j];
                    
                    if(value >= 0){
                        //set maxTextlength
                        const labelWidth = ctx.measureText(label).width;

                        //set all pie data into universal pie labels and values 
                        if(pieLabels.includes(label)){
                            const index = pieLabels.indexOf(label);
                            const currentValue = pieValues[index];

                            pieValues[index] = (currentValue+value);
                        }else {
                            pieLabels.push(label);
                            pieValues.push(value);
                        }

                        //set new pie dataset labels and values 
                        if(newPieLabels.includes(label)){
                            const index = newPieLabels.indexOf(label);
                            const currentValue = newPieValues[index];

                            newPieValues[index] = (currentValue+value);
                        }else {
                            newPieLabels.push(label);
                            newPieValues.push(value);
                        }

                        pieTotalValues += value;

                        //set max width of axis labels and values for pie charts
                        labelWidth > pieMaxLabelWidth? pieMaxLabelWidth = labelWidth: null;
                    }

                }

                 //push pie dataset
                hasPieData = true;
                
                newPieDataset.labels = newPieLabels;
                newPieDataset.values = newPieValues;
                newPieDataset.totalValues = pieTotalValues;
                newPieDataset.type = "pie";

                pieData.push(newPieDataset);

                //set dataset name max width and total on pie
                pieMaxLabelWidth > datasetNameMaxWidth? datasetNameMaxWidth = pieMaxLabelWidth: null;
                totalDatasetName += labels.length;
            }

        }

        //if bar is in data set the bar 
        if(hasBarDataset){
            barDataset.names = barDatasetNames;
            barDataset.categories = barCategories;
            barDataset.maxBarPerCategory = maxBarPerCategory;

            barDataset.direction = axisDirection;
            axisData.unshift(barDataset);
        }

    }

    const setAxisProperties = (axisObject, type) => {
        for(let key in axisObject){
            const axis = axisObject[key];

            const values = axis.values;
            const axisMaxWidth = axis.maxWidth;

            key === "y2"? console.log(key, axisMaxWidth): null;

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
            
            const tickRangeStart = Calc.toFixedIfNeeded(tickRange[0]), tickRangeEnd = Calc.toFixedIfNeeded(tickRange[1]);

            const tickRangeStartWidth = tickRangeStart && !isNaN(tickRangeStart)? ctx.measureText(tickRangeStart).width: 0;
            const tickRangeEndWidth = tickRangeEnd && !isNaN(tickRangeStart)? ctx.measureText(tickRangeEnd).width: 0;

            const maxWidth = Math.max(axisMaxWidth, Math.max(tickRangeStartWidth, tickRangeEndWidth));

            key === "y2"? console.log(key, maxWidth, range, tickRange): null;
            

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

    //set pie data
    layout.pieData = {
        labels: pieLabels,
        values: pieValues,
        maxLabelWidth: pieMaxLabelWidth,
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
    const color = customColors[count].code;
    !newDesign.color? newDesign.color = color: null;

    dataType === "line"? Array.isArray(newDesign.color)? newDesign.color = color: null: null;

    //set design size 
    !newDesign.size? newDesign.size = 3: null;

    return newDesign;
}