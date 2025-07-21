import * as Calc from '../helpers/math.js'
import * as Global from '../helpers/global.js';


export const Group = (dv, ctx, barData, index, key, xIsLabel, value, barSize, maxBarPerLabel, customData, tickFormat) => { //process grouped bars
    const layout = dv.getLayout();

    const isHorizontal = barData.direction === "hr";

    const axisData = layout.axisData;

    const yAxis = axisData.yData[barData.yAxis];
    const xAxis = axisData.xData[barData.xAxis];

    const layoutYAxisName = barData.yAxis === "y2"? "y2Axis": "yAxis";
    
    const labelTitle = layout["xAxis"]? layout["xAxis"].title: null;
    const valueTitle = layout[layoutYAxisName]? layout[layoutYAxisName].title: null;
    const datasetName = barData.name || "";

    const customDataPoints = barData.customDataPoints;
    const customDataValues = customDataPoints.get(key) || [];

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;
    const graphX = (graphPosition.x), graphY = graphPosition.y;
    const graphHeight = graphPosition.height, graphWidth = graphPosition.width;

    let range = isHorizontal? xAxis.range: yAxis.range;

    const rangeStart = Calc.getNumberInRange(0, range);

    //find the starting position of the bar on the y-axis
        
    const startPos = range? isHorizontal? Calc.getAxisLabelPosition(dv, rangeStart): Calc.getAxisValuePosition(dv, rangeStart, barData.yAxis): null;
    //const start = find0? find0: startPos? startPos: isHorizontal? graphX: (graphY+graphHeight);
    const start = startPos? startPos: isHorizontal? graphX: (graphY+graphHeight);
    
    if(isHorizontal){

        const labelPositionY = Calc.getAxisValuePosition(dv, key);

        const barArea = (maxBarPerLabel*barSize);
        const barAreaStartY = (labelPositionY+(barArea/2));
        
        const barHeight = barSize;
        let axisY = barAreaStartY-(barHeight*index);

        //value > rangeEnd? value = rangeEnd: null; //making sure value stays in range

        const end = Calc.getAxisLabelPosition(dv, value);

        const barWidth = (end-start);

        let x = start;
        let y = (axisY-barHeight);
        let width = barWidth;
        let height = barHeight;

        let isRectIn = Global.crashWithRect({x: x, y: y, width: width, height: height}, graphPosition);

        if(isRectIn){
            //draw bar
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.fill();

            //set tooltip
            dv.setToolTipData(
                { 
                    type: "bar",
                    point: {
                        x, y,
                        width, height
                    },
                    text: [
                        {name: labelTitle, value: key, isLabel: xIsLabel},
                        {name: datasetName, value: value},
                        ...customDataValues.map((value, index) => {
                            const data = customData[index] || {};
                            return {name: data.name || "", value: value};
                        })
                    ],
                    tickFormat
                }
            );
        }
    }else {
        
        const labelPositionX = Calc.getAxisLabelPosition(dv, key);

        const barArea = (maxBarPerLabel*barSize);
        const barAreaStartX = (labelPositionX-(barArea/2));
        
        const barWidth = barSize;
        let axisX = barAreaStartX+(barWidth*index);

        //value > rangeEnd? value = rangeEnd: null; //making sure value stays in range

        const end = Calc.getAxisValuePosition(dv, value, barData.yAxis);

        const barHeight = (start-end);

        const x = axisX;
        let y = end;
        const width = barWidth;
        let height = barHeight;

        let isRectIn = Global.crashWithRect({x: x, y: y, width: width, height: height}, graphPosition);

        if(isRectIn){

            if(y < (graphY)){
                const yDiff = (graphY-y);
                y = (graphY);
                height = (height-yDiff);
            }

            //draw bar
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.fill();

            //set tooltip
            //dv.setToolTipData({type: "bar", x: x, y: y, width: width, height: height, label: key, value: value, labelName: labelTitle, valueName: datasetName, tickFormat: tickFormat});
            dv.setToolTipData(
                { 
                    type: "bar",
                    point: {
                        x, y,
                        width, height
                    },
                    text: [
                        {name: labelTitle, value: key, isLabel: xIsLabel},
                        {name: datasetName, value: value},
                        ...customDataValues.map((value, index) => {
                            const data = customData[index] || {};
                            return {name: data.name || "", value: value};
                        })
                    ],
                    tickFormat
                }
            );
        
        }

    }

};

export const Stack = (
    dv, 
    ctx, 
    isPercent,
    barData, 
    barSize, 
    key, 
    xIsLabel, 
    baseStack, 
    cumulativeValue, 
    stackValue, 
    originalValue,
    customData, 
    tickFormat
) => {
    const layout = dv.getLayout();

    const isHorizontal = barData.direction === "hr";

    const axisData = layout.axisData;

    const yAxis = axisData.yData[barData.yAxis];
    const xAxis = axisData.xData[barData.xAxis];

    const layoutYAxisName = barData.yAxis === "y2"? "y2Axis": "yAxis";
    const labelTitle = layout["xAxis"]? layout["xAxis"].title: null;
    const valueTitle = layout[layoutYAxisName]? layout[layoutYAxisName].title: null;
    const datasetName = barData.name || "";

    const customDataPoints = barData.customDataPoints;
    const customDataValues = customDataPoints.get(key) || [];

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    let range = isHorizontal? xAxis.range: yAxis.range;

    baseStack = Calc.getNumberInRange(baseStack, range); //keep lastStackValue in range;

    //find the starting position of the bar on the y-axis
        
    const startPos = range? isHorizontal? Calc.getAxisLabelPosition(dv, baseStack): Calc.getAxisValuePosition(dv, baseStack, barData.yAxis): null;
    //const start = find0? find0: startPos? startPos: isHorizontal? graphX: (graphY+graphHeight);
    const start = startPos? startPos: isHorizontal? graphX: (graphY+graphHeight);

    if(isHorizontal){

        const labelPositionY = Calc.getAxisValuePosition(dv, key);

        const barArea = (barSize);
        const barAreaStartY = (labelPositionY+(barArea/2));
        
        const barHeight = barSize;
        let axisY = barAreaStartY;

        //value > rangeEnd? value = rangeEnd: null; //making sure value stays in range

        const end = Calc.getAxisLabelPosition(dv, cumulativeValue);

        const barWidth = (end-start);

        const x = start;
        const y = (axisY-barHeight);
        const width = barWidth;
        const height = barHeight;

        //draw bar
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fill();

        //set tooltip
        //dv.setToolTipData({type: "bar", x: x, y: y, width: width, height: height, label: key, value: currentValue, labelName: datasetName, valueName: valueTitle, tickFormat: tickFormat});
        //set tooltip
        dv.setToolTipData(
            { 
                type: "bar",
                point: {
                    x: x, y: y, width: width, height: height
                },
                text: [
                    {name: labelTitle, value: key, isLabel: xIsLabel},
                    {name: datasetName, value: originalValue, percent: isPercent && stackValue},
                    ...customDataValues.map((value, index) => {
                        const data = customData[index] || {};
                        return {name: data.name || "", value: value};
                    })
                ],
                format: tickFormat,
            }
        );
    }else {
        
        const labelPositionX = Calc.getAxisLabelPosition(dv, key);

        const barArea = (barSize);
        const barAreaStartX = (labelPositionX-(barArea/2));
        
        const barWidth = barSize;
        let axisX = barAreaStartX;

        //value > rangeEnd? value = rangeEnd: null; //making sure value stays in range

        const end = Calc.getAxisValuePosition(dv, cumulativeValue, barData.yAxis);

        const barHeight = (start-end);

        const x = axisX;
        const y = end;
        const width = barWidth;
        const height = barHeight;

        //draw bar
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fill();

        //set tooltip
        dv.setToolTipData(
            { 
                type: "bar",
                point: {
                    x: x, y: y, width: width, height: height
                },
                text: [
                    {name: labelTitle, value: key, isLabel: xIsLabel},
                    {name: datasetName, value: originalValue, percent: isPercent && stackValue},
                    ...customDataValues.map((value, index) => {
                        const data = customData[index] || {};
                        return {name: data.name || "", value: value};
                    })
                ],
                tickFormat
            }
        );
    }
}


export const Histogram = (dv, ctx, barData, index, key, value, barSize, tickFormat) => { //process grouped bars
    const layout = dv.getLayout();

    const axisData = layout.axisData;

    const binWidth = barData.binWidth || 0;

    const yAxis = axisData.yData[barData.yAxis];

    const labelTitle = layout["xAxis"]? layout["xAxis"].title: null;

    const datasetName = barData.name || "";

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;
    const graphY = graphPosition.y;
    const graphHeight = graphPosition.height;

    let range = yAxis.range;

    const rangeStart = Calc.getNumberInRange(0, range);

    //find the starting position of the bar on the y-axis
        
    const startPos = range? Calc.getAxisValuePosition(dv, rangeStart): null;
    const start = startPos? startPos: (graphY+graphHeight);
    
    const newKey = (key + (binWidth/2))
    const labelPositionX = Calc.getAxisLabelPosition(dv, newKey);

    const barArea = (barSize);
    const barAreaStartX = (labelPositionX-(barArea/2));
    
    const barWidth = barSize;
    let axisX = barAreaStartX+(barWidth*index);

    const end = Calc.getAxisValuePosition(dv, value);

    const barHeight = (start-end);

    const x = axisX;
    let y = end;
    const width = barWidth;
    let height = barHeight;

    let isRectIn = Global.crashWithRect({x: x, y: y, width: width, height: height}, graphPosition);

    if(isRectIn){

        if(y < (graphY)){
            const yDiff = (graphY-y);
            y = (graphY);
            height = (height-yDiff);

        }

        //draw bar
        ctx.beginPath();

        ctx.rect(x, y, width, height);

        ctx.fill();

        //set tooltip
        dv.setToolTipData(
            { 
                type: "bar",
                point: {
                    x, y,
                    width, height
                },
                text: [
                    {name: labelTitle, value: key, isLabel: true},
                    {name: datasetName, value: value},
                ],
                tickFormat
            }
        );
    
    }

};
