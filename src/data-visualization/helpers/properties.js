import * as Calc from './math.js'
import * as Global from './global.js'

export function setGraphPosition(dv){
    const canvas = dv.getCanvas();
    const width = canvas.width, height = canvas.height;

    //define the graph dimensions
    let graphWidth = width;
    let graphHeight = height;

    const style = dv.getStyle();
    const titleLines = dv.getLayout().titleLines;
    const titleFontSize = style.title.fontSize;

    const labelFontSize = style.label.fontSize;

    //layout 
    const layout = dv.getLayout();
    const xLabel = layout.xAxis? layout.xAxis.title: null;
    const yLabel = layout.yAxis? layout.yAxis.title: null;

    const labelSpace = (labelFontSize*4);

    const axisData = layout.axisData;
    const labels = axisData.labels;
    const maxLabelWidth = axisData.maxLabelWidth;
    const maxValueWidth = axisData.maxValueWidth;

    //calculates horizontal position of the graph area
    let graphX = 0;
    //calculates vertical position of the graph area
    let graphY = (titleFontSize*2);

    if(titleLines.length > 1){
        graphY = ((titleFontSize*titleLines.length)+(titleFontSize/2));
    }

    //x and y side title labels
    if(yLabel){
        if(yLabel.length > 0){
            graphX += (labelSpace/2);
        }
    }

    if(xLabel){
        if(xLabel.length > 0){
            graphHeight -= ((graphY)+(labelSpace/2));
        }
    }

    //values (y-axis)
    const widthSide = (width*2.0);
    if(maxValueWidth > 0){
        maxValueWidth > widthSide? graphX += widthSide: graphX += (maxValueWidth+labelFontSize);
    }

    //datasetlabels 
    const datasetNameData = layout.datasetNameData;
    const isDatasetName = datasetNameData.isDatasetName;
    const datasetMaxNameWidth = datasetNameData.maxNameWidth;

    if(isDatasetName){
        datasetMaxNameWidth > widthSide? graphWidth -= (graphX+widthSide): graphWidth -= (graphX+datasetMaxNameWidth+(labelFontSize*2));
    }else {
        graphWidth -= (graphX);
    }

    const labelStep = (graphWidth/labels.length); //set label step after calculating graphWidth
    
    if(maxLabelWidth > labelStep && maxLabelWidth > (labelFontSize*2)){
        graphHeight -= (graphY)+(maxLabelWidth*0.7)+labelFontSize;

        //console.log("width: ", (graphY+graphHeight), maxLabelWidth);
    }else {
        graphHeight -= ((graphY)+(labelFontSize*2));
    }
    
    
    const graphPosition = {
        x: graphX,
        y: graphY,
        width: graphWidth,
        height: graphHeight,
    }


    //set graphposition
    dv.layout = {
        ...layout, 
        graphPosition: graphPosition
    };

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

    //stores the width of the category with the highest text length
    let axisMaxLabelWidth = 0;
    let axisMaxValueWidth = 0;

    let pieMaxLabelWidth = 0;

    const axisData = [];
    const pieData = [];

    let axisDataCount = 0;

    //all axischart labels and values
    const axisLabels = [];
    const axisValues = [];

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

            const newPieDataset = {...dataset};
            const newPieLabels = [];
            const newPieValues = [];
            let pieTotalValues = 0;

            const labelIsAllNumbers = Calc.isAllNumbers(labels);
            const valueIsAllNumbers = Calc.isAllNumbers(values);

            if(axisChartTypes.includes(dataType)){

                for(let j = 0; j < labels.length; j++){
                    const label = labelIsAllNumbers? Math.round(labels[j]): labels[j];
                    const value = valueIsAllNumbers? Math.round(values[j]): values[j];
    
                    //set maxTextlength
                    const labelWidth = ctx.measureText(label).width;
                    const valueWidth = ctx.measureText(value).width;
    
                    if(dataType === "bar"){
                        let labelValues = [value];
    
                        if(barCategories.has(label)){
                            const lastData = barCategories.get(label);
                            labelValues = [...lastData.values, value];
                        }
    
                        //set maxBarPerCategory if labelValues is more then the current value.
                        labelValues.length > maxBarPerCategory? maxBarPerCategory = labelValues.length: null;
    
                        barCategories.set(label, {values: labelValues});
    
                        dataset.direction === "hr"? axisDirection = "hr": null;
                        hasBarDataset = true;
                    }
    
                   
                    labelWidth > axisMaxLabelWidth? axisMaxLabelWidth = labelWidth: null;
                    valueWidth > axisMaxValueWidth? axisMaxValueWidth = valueWidth: null;
                    
    
                    //set axis labels and values 
                    if(axisLabels.indexOf(label) === -1){
                        axisLabels.push(label);
                    }
                    
                    if(axisValues.indexOf(value) === -1){
                        axisValues.push(value);
                    }
    
                }

                hasAxisData = true;

                //if not a bar dataset push the dataset to newData 
                const newDataName = dataName? dataName: "Dataset " + axisDataCount;
                const newDataNameWidth = ctx.measureText(newDataName).width;

                if(dataType === "bar"){
                    barDatasetNames.push(newDataName);
                }else {
                    dataset.name = newDataName;
                    axisData.push(dataset);
                }

                //set dataset name max width and total on axis charts
                newDataNameWidth > datasetNameMaxWidth? datasetNameMaxWidth = newDataNameWidth: null;
                totalDatasetName += 1;

                axisDataCount++;
            }else if(dataType === "pie"){

                for(let j = 0; j < labels.length; j++){
                    const label = labelIsAllNumbers? Math.round(labels[j]): labels[j];
                    const value = valueIsAllNumbers? Math.round(values[j]): values[j];
    
                    //set maxTextlength
                    const labelWidth = ctx.measureText(label).width;
                    const valueWidth = ctx.measureText(value).width;

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

    const newData = [...axisData, ...pieData];

    const axisLabelIsAllNumbers = Calc.isAllNumbers(axisLabels);
    const axisValueIsAllNumbers = Calc.isAllNumbers(axisValues);

    const isHorizontal = axisDirection === "hr";

    //set layout ranges 
    let labelRange = Calc.rangeFromData(axisLabels);
    let valueRange = Calc.rangeFromData(axisValues);

    if(layout.xAxis){
        const range = layout.xAxis.range;
        range? labelRange = range: null;
    }

    if(layout.yAxis){
        const range = layout.yAxis.range;
        range? labelRange = range: null;
    }

    layout.ranges = {
        labelRange: labelRange,
        valueRange: valueRange,
    };


    //
    layout.datasetNameData = {
        isDatasetName: totalDatasetName > 1,
        maxNameWidth: datasetNameMaxWidth,
        total: totalDatasetName
    };

    //set axis data 
    layout.axisData = {
        labels: isHorizontal? axisValues: axisLabels,
        values: isHorizontal? axisLabels: axisValues,
        maxLabelWidth: isHorizontal? axisMaxValueWidth: axisMaxLabelWidth,
        maxValueWidth: isHorizontal? axisMaxLabelWidth: axisMaxValueWidth,
        labelIsAllNumbers: isHorizontal? axisValueIsAllNumbers: axisLabelIsAllNumbers,
        valueIsAllNumbers: isHorizontal? axisLabelIsAllNumbers: axisValueIsAllNumbers,
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