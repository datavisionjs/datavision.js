import * as Calc from '../helpers/math.js';

const DrawArc = (dv) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    const radius = Calc.getArcRadius(graphWidth, graphHeight);
    const arcCenterX = (graphX+(graphWidth/2)), arcCenterY = (graphY+radius);

    //draw a rectangle representing the graph area
    ctx.beginPath();
    
    ctx.arc(arcCenterX, arcCenterY, radius, 0, 2 * Math.PI);
    ctx.stroke();

}

export default DrawArc;