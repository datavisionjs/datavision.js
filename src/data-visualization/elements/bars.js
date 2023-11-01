import * as Calc from '../helpers/math.js'

//draw the bars

const DrawBars = (ctx, category, catKey) => {
    if(category){

        const defaultColor = layout.defaultColor;
        
        const yValues = category.yValues;
        const barColors = category.barColors;

        const canvas = ctx.canvas;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        //stores the position and dimensions of the graph area
        const graphPosition = Calc.graphPosition(canvasWidth, canvasHeight);
        const graphX = graphPosition.x, graphY = graphPosition.y;
        const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

        let ranges = layout.ranges;

        const yRange = Calc.rangeOnAxis(ranges.yRange, 10);

        const maxBarPerCategory = ranges.categoryBarMax;

        const categories = ranges.barCategories;
        const catKeys = Array.from(categories.keys());

        const catPos = catKeys.indexOf(catKey);
        const step = (graphWidth/catKeys.length);
        const barWidth = (step/(maxBarPerCategory+1));

        let axisX = (graphX+((step*catPos)+(barWidth/2)));

        //find the starting position of the bar on the y-axis
        const findY0 = Calc.posOnGraphYAxis(ctx, 0);
        const startY = findY0? findY0: Calc.posOnGraphYAxis(ctx, yRange[0]);

        for(var i = 0; i < yValues.length; i++){
            const y = yValues[i];
            const barColor = barColors[i]? barColors[i]: defaultColor;

            const endY = Calc.posOnGraphYAxis(ctx, y);

            const barHeight = (startY-endY);

            console.log(yRange[0], findY0, startY);

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