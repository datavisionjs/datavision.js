import * as Calc from '../helpers/math.js'
import customColors from '../helpers/colors.js';

//draw the bars

const DrawBars = (dv, category, catKey, dataset) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const axisData = layout.axisData;
    const valueIsAllNumbers = axisData.valueIsAllNumbers;

    console.log("cat: ", category);
    

    if(category && dataset){
        const isHorizontal = dataset.direction === "hr";

        const values = category.values;
        const barColors = category.colors;



        //stores the position and dimensions of the graph area
        const graphPosition = layout.graphPosition;
        const graphX = graphPosition.x, graphY = graphPosition.y;
        const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

        const ranges = layout.ranges;
        let range = ranges.valueRange;

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

                const valuesItem = values[i];
                const colorsItem = barColors[i];

                let newStart = start;
                for(let o = 0; o < valuesItem.length; o++){
                    const value = valuesItem[o];
                    const x = value > rangeEnd? rangeEnd: value;
                

                    const colorIndex = layout.customColorsIndex;
                    const defaultColor = customColors[colorIndex+i].code;

                    const barColor = colorsItem? colorsItem[o]? colorsItem[o]: defaultColor: defaultColor;


                    const end = Calc.getAxisLabelPosition(dv, x);

                    if(end >= graphY){
                        const barWidth = (end-newStart);

                        if(newStart && end){

                            barColor? ctx.fillStyle = barColor: null;//set bar color if exists
                            
                            //draw bar
                            ctx.beginPath();
                            ctx.rect(startPos, (axisY-barHeight), barWidth, barHeight);
                            ctx.fill();
                        }
                    }

                    newStart = newStart < end? start: end;

                    if(valueIsAllNumbers){
                        const nextValue = valuesItem[o+1]
                        nextValue? Calc.haveOppositeSigns(x, nextValue) ? newStart = start: null: null;
                    }
                }

                axisY -= barHeight;
            }

        }else {

            const barWidth = barSize;

            let axisX = (graphX+((step*catPos)+(barWidth/2)));

            for(var i = 0; i < values.length; i++){
                
                const valuesItem = values[i];
                const colorsItem = barColors[i];

                let newStart = start;
                for(let o = 0; o < valuesItem.length; o++){
                    const value = valuesItem[o];

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

                    newStart = newStart < end? start: end;

                    if(valueIsAllNumbers){
                        const nextValue = valuesItem[o+1]
                        nextValue? Calc.haveOppositeSigns(y, nextValue) ? newStart = start: null: null;
                    }

                }

                axisX += (barWidth);

            }
        }

        
    }
}

export default DrawBars;