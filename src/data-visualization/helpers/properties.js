import * as Calc from './math.js'
import * as Global from './global.js'

export function setGraphPosition(dv){
    const canvas = dv.getCanvas();
    const width = canvas.width, height = canvas.height;

    const labelStyle = dv.getStyle().label;

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

    const firstDataType = layout.firstDataType;

    const labelSpace = (labelFontSize*4);

    //calculates horizontal position of the graph area
    let graphX = 0;
    //calculates vertical position of the graph area
    let graphY = (titleFontSize*2);

    if(titleLines.length > 1){
        graphY = ((titleFontSize*titleLines.length)+(titleFontSize/2));
    }

    //set graph height

    if(firstDataType === "pie"){
        graphY += labelFontSize;

        graphWidth = (graphWidth*0.7);
        graphHeight -= (graphY);
    }else {

        graphX = labelFontSize;

        if(yLabel){
            graphX += (labelSpace/2);
        }

        graphHeight -= ((graphY)+(labelSpace/2));

        console.log(graphHeight);

        if(xLabel){
            if(xLabel.length > 0){
                graphHeight -= (labelSpace/2);
            }
        }

        graphWidth -= graphX;
    }

    const position = {
        x: graphX,
        y: graphY,
        width: graphWidth,
        height: graphHeight
    };

    //set graphposition
    dv.layout = {...layout, graphPosition: position};

}

//set ranges to layout
export function setRanges(dv){

    const layout = dv.getLayout();

    //find x axis range 
    let xRange = null;
    let yRange = null;

    //get range from layout
    if(layout){

        const xMaxDist = 7;
        const xAxis = layout.xAxis;

        if(xAxis){
            if(xAxis.range){
                xRange = Calc.rangeOnAxis(xAxis.range, xMaxDist);
            }
        }

        const yMaxDist = 10;
        const yAxis = layout.yAxis;
        if(yAxis){
            if(yAxis.range){
                yRange = Calc.rangeOnAxis(yAxis.range, yMaxDist);
            }
        }
    }

    //get range from data 
    if(data){

        if(!xRange || !yRange){
            
            let tempXRange = xRange;
            let tempYRange = yRange;

            //loop through data and set xRange and yRange
            for(let i = 0; i < data.length; i++){
                const dataset = data[i];
                const x = dataset.x;
                const y = dataset.y;

                if(!xRange){

                    const xMinAndMax = Calc.findMinAndMax(x);
                    if(xMinAndMax){
                        if(tempXRange){
                            tempXRange = [Math.min(tempXRange[0],xMinAndMax.min), Math.max(tempXRange[1], xMinAndMax.max)];
                        }else {
                            tempXRange = [xMinAndMax.min, xMinAndMax.max];
                        }
                    }
                }

                if(!yRange){

                    const yMinAndMax = Calc.findMinAndMax(y);
                    if(yMinAndMax){
                        if(tempYRange){
                            tempYRange = [Math.min(tempYRange[0],yMinAndMax.min), Math.max(tempYRange[1], yMinAndMax.max)];
                        }else {
                            tempYRange = [yMinAndMax.min, yMinAndMax.max];
                        }
                    }
                }

            }

            //round up the ranges
            if(tempXRange){
                xRange = [Math.round(tempXRange[0]), Math.round(tempXRange[1])];
            }
            if(tempYRange){
                yRange = [Math.round(tempYRange[0]), Math.round(tempYRange[1])];
            }
        }

    }
    //set ranges to layout
    layout.ranges = {
        xRange: xRange,
        yRange: yRange,
    };
}


export function setBar(dv){
    const ctx = dv.getCtx();
    const layout = dv.getLayout();
    const data = [...dv.getData()];

    const style = dv.getStyle();
    const labelStyle = style.label;

    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

    //find y and x axis range 
    let range = null;

    //stores the number of bars for each category
    let categoryBarMax = 1;

    //stores the width of the category with the highest text length
    let maxTextWidth = 0;

    let barCategories = new Map();

    let direction = null;

    //get range from data 
    if(data){

        direction = data.length > 0? data[0].direction: null;
        const isHorizontal = direction === "hr";

        //get range from layout
        if(layout){

            let maxDist = 10;
            let axis = layout.yAxis;

            if(isHorizontal){
                maxDist = 7;
                axis = layout.xAxis;
            }
            
            if(axis){
                if(axis.range){
                    range = Calc.rangeOnAxis(axis.range, maxDist);
                }
            }
            
        }

        //get the data type of the dataset
        //const firstDataType = data[0]? data[0].type: null;
        let tempRange = range;

        //loop through data and set xRange and yRange
        const tempData = [...data];
        const tempDataLength = tempData.length;

        for(let i = 0; i < tempDataLength; i++){
            const dataset = {...tempData[i]};

            const x = dataset.x;
            const y = dataset.y;
            const dataType = dataset.type;
            
            if(dataType === "bar"){
                const barColors = dataset.barColors? dataset.barColors: [];

                for(var j = 0; j < x.length; j++){
                    const xValue = isHorizontal? y[j]: x[j];
                    const yValue = isHorizontal? x[j]: y[j];

                    const barColor = barColors[j];

                    let categoryValues = null;
                    let barColorValues = null;

                    //set maxTextlength 
                    const textWidth = ctx.measureText(xValue).width;
                    textWidth > maxTextWidth? maxTextWidth = textWidth: null;

                    if(barCategories.has(xValue)){
                        const category = barCategories.get(xValue);
                        
                        categoryValues = [...category.yValues, yValue];
                        barColorValues = [...category.barColors, barColor];

                    }else {
                        categoryValues = [yValue];
                        barColorValues = [barColor];
                    }

                    if(categoryValues){
                        categoryValues.length > categoryBarMax? categoryBarMax = categoryValues.length: null;
                    }

                    barCategories.set(xValue, {values: categoryValues, barColors: barColorValues});

                }

                //set bar data type to null
                dataset.type = null;
            }
            
            if(!range){
                const dataValues = isHorizontal? x: y;
                console.log(dataValues);
                const minAndMax = Calc.findMinAndMax(dataValues);

                if(minAndMax){
                    if(tempRange){
                        tempRange = [Math.min(tempRange[0],minAndMax.min), Math.max(tempRange[1], minAndMax.max)];
                    }else {
                        tempRange = [minAndMax.min, minAndMax.max];
                    }
                }
            }

        }

        //round up the ranges
        if(tempRange){
            range = [Math.round(tempRange[0]), Math.round(tempRange[1])];
        }



    }

    //set ranges to layout
    console.log("myRange: ", range);
    layout.ranges = {
        yRange: range,
        xRange: range
    };

    //create a new bar data
    const newBarData = {
        type: "bar",
        range: range,
        barCategories: barCategories,
        categoryBarMax: categoryBarMax,
        maxTextWidth: maxTextWidth,
        direction: direction
    };

    //set bardata to layout 
    layout.barData = newBarData;

    //replace the first bar element
    data.splice(0, 1, newBarData);

    //set data to dv
    dv.setData(data);
}

export function setPie(dv){
    const data = [...dv.getData()];
    const layout = dv.getLayout();

    let pieCategories = new Map();

    let valuesLength = 0;

    //get range from data 
    if(data){

        //loop through data and set xRange and yRange
        const tempData = [...data];
        const tempDataLength = tempData.length;

        for(let i = 0; i < tempDataLength; i++){
            const dataset = {...tempData[i]};

            const labels = dataset.labels;
            const values = dataset.values;

            if(labels && values){
                const dataType = dataset.type;
                
                if(dataType === "pie"){
                    const pieColors = dataset.pieColors? dataset.pieColors: [];

                    for(var j = 0; j < labels.length; j++){
                        const label = labels[j];
                        const value = values[j];
                        const pieColor = pieColors[j];

                        //subtract from valuesLength if exist
                        if(pieCategories.has(label)){
                            const lastValue = pieCategories.get(label).value;
                            !isNaN(lastValue)? valuesLength -= lastValue: null;
                        }
                        
                        !isNaN(value)? valuesLength += value: null;

                        pieCategories.set(label, {value: value, pieColor: pieColor});
                    }

                    //set pie data type to null
                    dataset.type = null;
                }
            }else {
                //set error if labels and values not found 
                console.error("Pie chart not defined properly!");
            }

        }

    }

    //create a new pie data
    const newPieData = {
        type: "pie", 
        pieCategories: pieCategories,
        valuesLength: valuesLength
    };

    //set pie data to layout 
    layout.pieData = newPieData;

    //set arcRadius 
    const graphPosition = layout.graphPosition;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;
    
    let radius = Math.round(0.5 * Math.min(graphWidth, graphHeight));
    radius < 0? radius = 0: null;

    layout.arcRadius = radius;

    //replace the first pie  element
    data.splice(0, 1, newPieData);

     //set data to dv
     dv.setData(data);
}