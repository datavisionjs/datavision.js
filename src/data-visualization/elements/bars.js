import * as Calc from '../helpers/math.js'
import customColors from '../helpers/colors.js';

function barItemSort(valuesItem, colorsItem, isSort) {
    if (!isSort) {
        return {
            values: valuesItem,
            colors: colorsItem
        };
    }

    const positive = [];
    const positiveColors = [];
    const negative = [];
    const negativeColors = [];

    for (let i = 0; i < valuesItem.length; i++) {
        const item = valuesItem[i];
        const color = colorsItem[i];

        if (item >= 0) {
            positive.push(item);
            positiveColors.push(color);
        } else {
            negative.push(item);
            negativeColors.push(color);
        }
    }

    const sortedValues = [...positive, ...negative];
    const sortedColors = [...positiveColors, ...negativeColors];

    return {
        values: sortedValues,
        colors: sortedColors
    };
}


//draw the bars

const DrawBars = (dv, category, catKey, dataset) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();
    

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
        const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

        let range = isHorizontal? xAxis.range: yAxis.range;

        const rangeStart = range[0] < 0? 0: range[0];
        const rangeEnd = range[1];
        

        const maxBarPerCategory = dataset.maxBarPerCategory;

        const categories = dataset.categories;
        const catKeys = Array.from(categories.keys());

        const catPos = catKeys.indexOf(catKey);
        const step = isHorizontal? (graphHeight/catKeys.length): (graphWidth/catKeys.length);
        const barSize = (step/(maxBarPerCategory+1));

        //find the starting position of the bar on the y-axis
        //const find0 = Calc.posOnGraphYAxis(dv, 0);
        const startPos = range? isHorizontal? Calc.getAxisLabelPosition(dv, rangeStart): Calc.getAxisValuePosition(dv, rangeStart): null;
        //const start = find0? find0: startPos? startPos: isHorizontal? graphX: (graphY+graphHeight);
        const start = startPos? startPos: isHorizontal? graphX: (graphY+graphHeight);

        if(isHorizontal){

            const barHeight = barSize;
            let axisY = ((graphY+graphHeight)-((step*catPos)+(barHeight/2)));

            for(var i = 0; i < values.length; i++){

                const itemSort = barItemSort(values[i], barColors[i], labelIsAllNumbers);
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
                        isOpposite? lastValue = 0: lastValue += value;
                    }
                }

                axisY -= barHeight;
            }

        }else {

            const barWidth = barSize;

            let axisX = (graphX+((step*catPos)+(barWidth/2)));

            for(var i = 0; i < values.length; i++){

                const itemSort = barItemSort(values[i], barColors[i], valueIsAllNumbers);
                
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
                        isOpposite? lastValue = 0: lastValue += value;

                    }

                }

                axisX += (barWidth);

            }
        }

        
    }
}

export default DrawBars;