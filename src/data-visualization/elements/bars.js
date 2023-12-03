import * as Calc from '../helpers/math.js'
import customColors from '../helpers/colors.js';

//draw the bars

const DrawBars = (dv, category, catKey, dataset) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();
    

    if(category && dataset){
        const isHorizontal = dataset.direction === "hr";

        const values = category.values;

        const barColors = category.barColors;

        //stores the position and dimensions of the graph area
        const graphPosition = layout.graphPosition;
        const graphX = graphPosition.x, graphY = graphPosition.y;
        const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

        const maxDist = isHorizontal? 7: 10;

        const ranges = layout.ranges;
        let range = ranges.valueRange;
        range = Calc.rangeOnAxis(range, maxDist);

        const maxBarPerCategory = dataset.maxBarPerCategory;

        const categories = dataset.categories;
        const catKeys = Array.from(categories.keys());

        const catPos = catKeys.indexOf(catKey);
        const step = isHorizontal? (graphHeight/catKeys.length): (graphWidth/catKeys.length);
        const halfStep = (step * 0.5);
        const barSize = (step/(maxBarPerCategory+1));

        //find the starting position of the bar on the y-axis
        const find0 = Calc.posOnGraphYAxis(dv, 0);
        const startPos = range? isHorizontal? Calc.posOnGraphXAxis(dv, range[0]): Calc.posOnGraphYAxis(dv, range[0]): null;
        const start = find0? find0: startPos? startPos: isHorizontal? graphX: (graphY+graphHeight);


        if(isHorizontal){

            const barHeight = barSize;
            let axisY = ((graphY+graphHeight)-((step*catPos)+(barHeight/2)));

            for(var i = 0; i < values.length; i++){
                const x = values[i];

                const colorIndex = layout.customColorsIndex;
                const defaultColor = customColors[colorIndex+i].code;

                const barColor = barColors? barColors[i]: defaultColor;

                const end = Calc.getAxisLabelPosition(dv, x);

                const barWidth = Math.abs(start-end);

                if(start && end){

                    barColor? ctx.fillStyle = barColor: null;//set bar color if exists
                    
                    //draw bar
                    ctx.beginPath();
                    ctx.rect(graphX, (axisY-barHeight), barWidth, barHeight);
                    ctx.fill();
                }

                axisY -= barHeight;
            }

        }else {
            const barWidth = barSize;

            let axisX = (graphX+((step*catPos)+(barWidth/2)));

            for(var i = 0; i < values.length; i++){
                const y = values[i];

                const colorIndex = layout.customColorsIndex;
                const defaultColor = customColors[colorIndex+i].code;

                const barColor = barColors? barColors[i]: defaultColor;

                const end = Calc.getAxisValuePosition(dv, y);

                const barHeight = (start-end);

                if(start && end){

                    barColor? ctx.fillStyle = barColor: null;//set bar color if exists
                    
                    //draw bar
                    ctx.beginPath();
                    ctx.rect(axisX, end, barWidth, barHeight);
                    ctx.fill();
                }

                axisX += barWidth;
            }
        }

        
    }
}

export default DrawBars;