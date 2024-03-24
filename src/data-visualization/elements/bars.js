import * as Calc from '../helpers/math.js'
import customColors from '../helpers/colors.js';


const DrawBars = (dv, barData, index, key, value, barSize, maxBarPerLabel) => {
    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const isHorizontal = barData.direction === "hr";

    const axisData = layout.axisData;

    const yAxis = axisData.values[barData.yAxis];
    const xAxis = axisData.labels[barData.xAxis];

    const valueIsAllNumbers = yAxis.isAllNumbers;
    const labelIsAllNumbers = xAxis.isAllNumbers;

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    let range = isHorizontal? xAxis.range: yAxis.range;

    const rangeStart = range[0] < 0? 0: range[0];
    const rangeEnd = range[1];

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

        value > rangeEnd? value = rangeEnd: null; //making sure value stays in range

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

        value > rangeEnd? value = rangeEnd: null; //making sure value stays in range

        const end = Calc.getAxisValuePosition(dv, value);

        const barHeight = (start-end);

        //draw bar
        ctx.beginPath();
        ctx.rect(axisX, end, barWidth, barHeight);
        ctx.fill();

    }

};


//draw the bars


const DrawP = (dv, category, catKey, dataset, barSize) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();
    const operation = category.operation;
    
    
    if(category && dataset){
        const isHorizontal = dataset.direction === "hr";

        const values = category.values;
        const barColors = category.colors;


        const axisData = layout.axisData;

        const yAxis = axisData.values[category.yAxis];
        const xAxis = axisData.labels[category.xAxis];

        const valueIsAllNumbers = yAxis.isAllNumbers;
        const labelIsAllNumbers = xAxis.isAllNumbers;

        //stores the position and dimensions of the graph area
        const graphPosition = layout.graphPosition;
        const graphX = graphPosition.x, graphY = graphPosition.y;
        const graphHeight = graphPosition.height;

        let range = isHorizontal? xAxis.range: yAxis.range;

        const rangeStart = range[0] < 0? 0: range[0];
        const rangeEnd = range[1];

        
        //find the starting position of the bar on the y-axis
        //const find0 = Calc.posOnGraphYAxis(dv, 0);
        const startPos = range? isHorizontal? Calc.getAxisLabelPosition(dv, rangeStart): Calc.getAxisValuePosition(dv, rangeStart): null;
        //const start = find0? find0: startPos? startPos: isHorizontal? graphX: (graphY+graphHeight);
        const start = startPos? startPos: isHorizontal? graphX: (graphY+graphHeight);

        
        if(isHorizontal){

            const barHeight = barSize;
            let axisY = (Calc.getAxisValuePosition(dv, catKey)+(barHeight/2));

            for(var i = 0; i < values.length; i++){

                const itemSort = barItemSort(values[i], barColors[i], labelIsAllNumbers, operation);
                const valuesItem = itemSort.values;
                const colorsItem = itemSort.colors;

                let newStart = start;
                let lastValue = 0;

                for(let o = 0; o < valuesItem.length; o++){
                    const item = valuesItem[o];
                    const value = labelIsAllNumbers? (item+lastValue): item;
                   
                    const x = value > rangeEnd? rangeEnd: value;
                

                    const colorIndex = layout.customColorsIndex;
                    const defaultColor = customColors[colorIndex+i].code;

                    const barColor = colorsItem? colorsItem[o]? colorsItem[o]: defaultColor: defaultColor;


                    const end = Calc.getAxisLabelPosition(dv, x);

                    if(end >= graphX){
                        const barWidth = (end-newStart);

                        if(newStart && end){

                            barColor? ctx.fillStyle = barColor: null;//set bar color if exists
                            
                            //draw bar
                            ctx.beginPath();
                            ctx.rect(newStart, (axisY-barHeight), barWidth, barHeight);
                            ctx.fill();
                        }
                    }

                    newStart = newStart < end? start: end;

                    if(labelIsAllNumbers){
                        //const nextValue = valuesItem[o+1];
                        //nextValue? Calc.haveOppositeSigns(x, nextValue) ? newStart = start: null: null;
                        
                        //lastValue += value;

                        const nextValue = valuesItem[o+1]
                        const isOpposite = nextValue? Calc.haveOppositeSigns(x, nextValue): false;
                        
                        isOpposite? newStart = start: newStart = end;
                        isOpposite? lastValue = 0: lastValue += item;
                    }
                }

                axisY -= barHeight;
            }

        }else {

            const barWidth = barSize;

            let axisX = (Calc.getAxisLabelPosition(dv, catKey)-(barWidth/2));
            //let axisX = (graphX+((step*catPos)+(barWidth/2)));

            for(var i = 0; i < values.length; i++){

                const itemSort = barItemSort(values[i], barColors[i], valueIsAllNumbers, operation);
                
                const valuesItem = itemSort.values;
                const colorsItem = itemSort.colors;

                let newStart = start;
                let lastValue = 0;
                for(let o = 0; o < valuesItem.length; o++){
                    const item = valuesItem[o];
                    const value = valueIsAllNumbers? (item+lastValue): item;

                    let y = value > rangeEnd? rangeEnd: value;
                    
                    const colorIndex = layout.customColorsIndex;
                    const defaultColor = customColors[colorIndex+i].code;

                    const barColor = colorsItem? colorsItem[o]? colorsItem[o]: defaultColor: defaultColor;

                    const end = Calc.getAxisValuePosition(dv, y);


                    const barHeight = (newStart-end);

                    if((graphY+graphHeight) >= end){
                        if(newStart && end){

                            barColor? ctx.fillStyle = barColor: null;//set bar color if exists
                            
                            //draw bar
                            ctx.beginPath();
                            ctx.rect(axisX, end, barWidth, barHeight);
                            ctx.fill();
                        }
                    }

                    //newStart = newStart < end? start: end;

                    if(valueIsAllNumbers){
                        const nextValue = valuesItem[o+1];
                        const isOpposite = nextValue? Calc.haveOppositeSigns(y, nextValue): false;
                        
                        isOpposite? newStart = start: newStart = end;
                        isOpposite? lastValue = 0: lastValue += item;

                    }

                }

                axisX += (barWidth);

            }
            
        }

        
    }
}

export default DrawBars;
