import * as Calc from '../helpers/math.js'
import customColors from '../helpers/colors.js';

//draw the bars

const DrawBars = (dv, category, catKey, dataset) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();
    

    if(category && dataset){
        console.log("Loving the Blues!");
        const isHorizontal = dataset.direction === "hr";

        const values = category.values;

        const barColors = category.barColors;

        //stores the position and dimensions of the graph area
        const graphPosition = layout.graphPosition;
        const graphX = graphPosition.x, graphY = graphPosition.y;
        const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

        const maxDist = isHorizontal? 7: 10;
        const range = Calc.rangeOnAxis(dataset.range, maxDist);

        const maxBarPerCategory = dataset.categoryBarMax;

        const categories = dataset.barCategories;
        const catKeys = Array.from(categories.keys());

        const catPos = catKeys.indexOf(catKey);
        const step = isHorizontal? (graphHeight/catKeys.length): (graphWidth/catKeys.length);
        const barSize = (step/(maxBarPerCategory+1));

        //find the starting position of the bar on the y-axis
        const find0 = isHorizontal? Calc.posOnGraphXAxis(dv, 0): Calc.posOnGraphYAxis(dv, 0);
        const start = find0? find0: isHorizontal? Calc.posOnGraphXAxis(dv, range[0]): Calc.posOnGraphYAxis(dv, range[0]);


        if(isHorizontal){

            const barHeight = barSize;
            let axisY = (graphY+((step*catPos)+(barHeight/2)));

            for(var i = 0; i < values.length; i++){
                const x = values[i];

                const colorIndex = layout.customColorsIndex;
                const defaultColor = customColors[colorIndex+i].code;

                const barColor = barColors[i]? barColors[i]: defaultColor;

                const end = Calc.posOnGraphXAxis(dv, x);

                const barWidth = (start-end);

                if(start && end){

                    barColor? ctx.fillStyle = barColor: null;//set bar color if exists
                    
                    //draw bar
                    ctx.beginPath();
                    ctx.rect(graphX, axisY, barWidth, barHeight);
                    ctx.fill();
                }

                axisY += barWidth;
            }

        }else {
            const barWidth = barSize;

            let axisX = (graphX+((step*catPos)+(barWidth/2)));

            for(var i = 0; i < values.length; i++){
                const y = values[i];

                const colorIndex = layout.customColorsIndex;
                const defaultColor = customColors[colorIndex+i].code;

                const barColor = barColors[i]? barColors[i]: defaultColor;

                const end = Calc.posOnGraphYAxis(dv, y);

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