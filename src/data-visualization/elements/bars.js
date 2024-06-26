import * as Calc from '../helpers/math.js'
import customColors from '../helpers/colors.js';


export const Group = (dv, barData, index, key, value, barSize, maxBarPerLabel) => { //process grouped bars
    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const isHorizontal = barData.direction === "hr";

    const axisData = layout.axisData;

    const yAxis = axisData.values[barData.yAxis];
    const xAxis = axisData.labels[barData.xAxis];

    const yAxisName = barData.yAxis === "y2"? "y2Axis": "yAxis";
    const labelTitle = layout["xAxis"]? layout["xAxis"].title: null;
    const valueTitle = layout[yAxisName]? layout[yAxisName].title: null;

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphHeight = graphPosition.height;

    let range = isHorizontal? xAxis.range: yAxis.range;

    const rangeStart = Calc.getNumberInRange(0, range);

    //find the starting position of the bar on the y-axis
        
    const startPos = range? isHorizontal? Calc.getAxisLabelPosition(dv, rangeStart): Calc.getAxisValuePosition(dv, rangeStart): null;
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

        const x = start;
        const y = (axisY-barHeight);
        const width = barWidth;
        const height = barHeight;

        //draw bar
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fill();

        //set tooltip
        dv.setToolTipData({type: "bar", x: x, y: y, width: width, height: height, label: key, value: value, labelTitle: labelTitle, valueTitle: valueTitle});
    }else {
        
        const labelPositionX = Calc.getAxisLabelPosition(dv, key);

        const barArea = (maxBarPerLabel*barSize);
        const barAreaStartX = (labelPositionX-(barArea/2));
        
        const barWidth = barSize;
        let axisX = barAreaStartX+(barWidth*index);

        //value > rangeEnd? value = rangeEnd: null; //making sure value stays in range

        const end = Calc.getAxisValuePosition(dv, value);

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
        dv.setToolTipData({type: "bar", x: x, y: y, width: width, height: height, label: key, value: value, labelTitle: labelTitle, valueTitle: valueTitle});

    }

};

export const Stack = (dv, barData, barSize, key, lastValue, value, currentValue) => {
    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const isHorizontal = barData.direction === "hr";

    const axisData = layout.axisData;

    const yAxis = axisData.values[barData.yAxis];
    const xAxis = axisData.labels[barData.xAxis];

    const yAxisName = barData.yAxis === "y2"? "y2Axis": "yAxis";
    const labelTitle = layout["xAxis"]? layout["xAxis"].title: null;
    const valueTitle = layout[yAxisName]? layout[yAxisName].title: null;

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    let range = isHorizontal? xAxis.range: yAxis.range;

    //find the starting position of the bar on the y-axis
        
    const startPos = range? isHorizontal? Calc.getAxisLabelPosition(dv, lastValue): Calc.getAxisValuePosition(dv, lastValue): null;
    //const start = find0? find0: startPos? startPos: isHorizontal? graphX: (graphY+graphHeight);
    const start = startPos? startPos: isHorizontal? graphX: (graphY+graphHeight);

    if(isHorizontal){

        const labelPositionY = Calc.getAxisValuePosition(dv, key);

        const barArea = (barSize);
        const barAreaStartY = (labelPositionY+(barArea/2));
        
        const barHeight = barSize;
        let axisY = barAreaStartY;

        //value > rangeEnd? value = rangeEnd: null; //making sure value stays in range

        const end = Calc.getAxisLabelPosition(dv, value);

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
        dv.setToolTipData({type: "bar", x: x, y: y, width: width, height: height, label: key, value: currentValue, labelTitle: labelTitle, valueTitle: valueTitle});
    }else {
        
        const labelPositionX = Calc.getAxisLabelPosition(dv, key);

        const barArea = (barSize);
        const barAreaStartX = (labelPositionX-(barArea/2));
        
        const barWidth = barSize;
        let axisX = barAreaStartX;

        //value > rangeEnd? value = rangeEnd: null; //making sure value stays in range

        const end = Calc.getAxisValuePosition(dv, value);

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
        dv.setToolTipData({type: "bar", x: x, y: y, width: width, height: height, label: key, value: currentValue, labelTitle: labelTitle, valueTitle: valueTitle});
    }
}
