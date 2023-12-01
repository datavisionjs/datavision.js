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

    //calculates horizontal position of the graph area
    let graphX = 0;
    //calculates vertical position of the graph area
    let graphY = (titleFontSize*2);

    if(titleLines.length > 1){
        graphY = ((titleFontSize*titleLines.length)+(titleFontSize/2));
    }

    //axis 
    const axisY = graphY;
    let axisX = labelFontSize;

    if(yLabel){
        axisX += (labelSpace/2);
    }

    let axisHeight = ((graphHeight)-((graphY)+(labelSpace/2)));

    if(xLabel){
        if(xLabel.length > 0){
            axisHeight -= (labelSpace/2);
        }
    }

    const axisWidth = (graphWidth-graphX);

    const axisPosition = {
        x: axisX,
        y: axisY,
        width: axisWidth,
        height: axisHeight
    };


    //pie
    const pieX = graphX, pieY = graphY += labelFontSize;
    const pieWidth = (graphWidth*0.8), pieHeight = (graphHeight-graphY);

    const piePosition = {
        x: pieX,
        y: pieY,
        width: pieWidth,
        height: pieHeight,
    }


    //set graphposition
    dv.layout = {
        ...layout, 
        axisGraphPosition: axisPosition, 
        pieGraphPosition: piePosition
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

    const newData = [];

    const axisLabels = [];
    const axisValues = [];

    //all pie labels and values
    const pieLabels = [];
    const pieValues = [];


    const axisChartTypes = ["line", "scatter", "bar"];
    let hasAxisData = false;
    let hasPieData = false;
    let axisDirection = null;

    //get range from data 
    if(data){
        
        //loop through data and set xRange and yRange
        const tempData = [...data];
        const tempDataLength = tempData.length;

        const barDataset = {type: "bar"};
        const barCategories = new Map();
        let hasBarDataset = false;

        for(let i = 0; i < tempDataLength; i++){
            const dataset = {...tempData[i]};

            const labels = dataset.labels;
            const values = dataset.values;
            const dataType = dataset.type;

            const newPieDataset = {...dataset};
            const newPieLabels = [];
            const newPieValues = [];
            let pieTotalValues = 0;

            const labelIsAllNumbers = Calc.isAllNumbers(labels);
            const valueIsAllNumbers = Calc.isAllNumbers(values);
            
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
                }else if(dataType === "pie"){
                    
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

                //set max width of axis labels and values
                if(axisChartTypes.includes(dataType)){
                    labelWidth > axisMaxLabelWidth? axisMaxLabelWidth = labelWidth: null;
                    valueWidth > axisMaxValueWidth? axisMaxValueWidth = valueWidth: null;
                }

                //set axis labels and values 
                if(axisLabels.indexOf(label) === -1){
                    axisLabels.push(label);
                }
                
                if(axisValues.indexOf(value) === -1){
                    axisValues.push(value);
                }

            }

            //push axis dataset whose data type is not bar
            if(axisChartTypes.includes(dataType)){
                hasAxisData = true;
                 //if not a bar dataset push the dataset to newData 
                dataType !== "bar"? newData.push(dataset): null;
            }
            
            //push pie dataset
            if(dataType === "pie"){
                hasPieData = true;
                
                newPieDataset.labels = newPieLabels;
                newPieDataset.values = newPieValues;
                newPieDataset.totalValues = pieTotalValues;
                newPieDataset.type = "pie";

                newData.push(newPieDataset);
            }  

        }

        //if bar is in data set the bar 
        if(hasBarDataset){

            barDataset.categories = barCategories;
            barDataset.maxBarPerCategory = maxBarPerCategory;

            barDataset.direction = axisDirection;
            newData.unshift(barDataset);
        }

    }

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

    //set datasetlabels 
    let datasetLabels = [];
    for(let i = 0; i < newData.length; i++){
        const dataset = newData[i];
        const labels = dataset.labels;
        const dataType = dataset.type;
        const label = dataset.label;

        if(axisChartTypes.includes(dataType)){
            const newLabel = datasetLabels.length;
            label? datasetLabels.push(label): datasetLabels.push("Dataset " + newLabel);
        }else if(dataType === "pie"){
            datasetLabels = [...datasetLabels, ...labels];
        }
    }
    layout.datasetLabels = datasetLabels;

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