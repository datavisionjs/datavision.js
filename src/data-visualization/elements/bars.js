import * as Calc from '../helpers/math.js'
import customColors from '../helpers/colors.js';

//draw the bars

const DrawBars = (dv, category, catKey, dataset) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();
    

    if(category && dataset){
        
        const yValues = category.yValues;
        const barColors = category.barColors;

        //stores the position and dimensions of the graph area
        const graphPosition = layout.graphPosition;
        const graphX = graphPosition.x, graphWidth = graphPosition.width;


        const yRange = Calc.rangeOnAxis(dataset.yRange, 10);

        const maxBarPerCategory = dataset.categoryBarMax;

        const categories = dataset.barCategories;
        const catKeys = Array.from(categories.keys());

        const catPos = catKeys.indexOf(catKey);
        const step = (graphWidth/catKeys.length);
        const barWidth = (step/(maxBarPerCategory+1));

        let axisX = (graphX+((step*catPos)+(barWidth/2)));

        //find the starting position of the bar on the y-axis
        const findY0 = Calc.posOnGraphYAxis(dv, 0);
        const startY = findY0? findY0: Calc.posOnGraphYAxis(dv, yRange[0]);

        for(var i = 0; i < yValues.length; i++){
            const y = yValues[i];

            const colorIndex = layout.customColorsIndex;
            const defaultColor = customColors[colorIndex+i].code;

            const barColor = barColors[i]? barColors[i]: defaultColor;

            const endY = Calc.posOnGraphYAxis(dv, y);

            const barHeight = (startY-endY);

            if(startY && endY){

                barColor? ctx.fillStyle = barColor: null;//set bar color if exists
                
                //draw bar
                ctx.beginPath();
                ctx.rect(axisX, endY, barWidth, barHeight);
                ctx.fill();
            }

            axisX += barWidth;
        }

        
    }
}

export default DrawBars;