import * as Calc from './math.js'

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
    const layout = dv.getLayout();
    const data = [...dv.getData()];

    //find y axis range 
    let yRange = null;

    //stores the number of bars for each category
    let categoryBarMax = 1;

    let barCategories = new Map();

    //get range from layout
    if(layout){

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

        //get the data type of the dataset
        //const firstDataType = data[0]? data[0].type: null;
        let tempYRange = yRange;

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
                    const xValue = x[j];
                    const yValue = y[j];
                    const barColor = barColors[j];

                    let categoryValues = null;
                    let barColorValues = null;

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

                    barCategories.set(xValue, {yValues: categoryValues, barColors: barColorValues});

                }

                //set bar data type to null
                dataset.type = null;
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
        if(tempYRange){
            yRange = [Math.round(tempYRange[0]), Math.round(tempYRange[1])];
        }



    }

    //set ranges to layout
    layout.ranges = {
        yRange: yRange,
    };

    //create a new bar data
    const newBarData = {
        type: "bar", 
        yRange: yRange, 
        barCategories: barCategories,
        categoryBarMax: categoryBarMax
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
    layout.arcRadius = Math.round(0.5 * Math.min(graphWidth, graphHeight));

    //replace the first pie  element
    data.splice(0, 1, newPieData);

     //set data to dv
     dv.setData(data);
}