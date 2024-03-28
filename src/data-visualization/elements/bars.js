import * as Calc from '../helpers/math.js'
import customColors from '../helpers/colors.js';


export const Group = (dv, barData, index, key, value, barSize, maxBarPerLabel) => { //process grouped bars
    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const isHorizontal = barData.direction === "hr";

    const axisData = layout.axisData;

    const yAxis = axisData.values[barData.yAxis];
    const xAxis = axisData.labels[barData.xAxis];

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

        //draw bar
        ctx.beginPath();
        ctx.rect(start, (axisY-barHeight), barWidth, barHeight);
        ctx.fill();
    }else {
        
        const labelPositionX = Calc.getAxisLabelPosition(dv, key);

        const barArea = (maxBarPerLabel*barSize);
        const barAreaStartX = (labelPositionX-(barArea/2));
        
        const barWidth = barSize;
        let axisX = barAreaStartX+(barWidth*index);

        //value > rangeEnd? value = rangeEnd: null; //making sure value stays in range

        const end = Calc.getAxisValuePosition(dv, value);

        const barHeight = (start-end);

        //draw bar
        ctx.beginPath();
        ctx.rect(axisX, end, barWidth, barHeight);
        ctx.fill();

    }

};

export const Stack = (dv, barData, barSize, key, lastValue, value) => {
    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const isHorizontal = barData.direction === "hr";

    const axisData = layout.axisData;

    const yAxis = axisData.values[barData.yAxis];
    const xAxis = axisData.labels[barData.xAxis];

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

        //draw bar
        ctx.beginPath();
        ctx.rect(start, (axisY-barHeight), barWidth, barHeight);
        ctx.fill();
    }else {
        
        const labelPositionX = Calc.getAxisLabelPosition(dv, key);

        const barArea = (barSize);
        const barAreaStartX = (labelPositionX-(barArea/2));
        
        const barWidth = barSize;
        let axisX = barAreaStartX;

        //value > rangeEnd? value = rangeEnd: null; //making sure value stays in range

        const end = Calc.getAxisValuePosition(dv, value);

        const barHeight = (start-end);

        //draw bar
        ctx.beginPath();
        ctx.rect(axisX, end, barWidth, barHeight);
        ctx.fill();

    }
}
