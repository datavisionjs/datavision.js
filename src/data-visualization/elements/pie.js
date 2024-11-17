import * as Calc from '../helpers/math.js'


const DrawPieSlice = (dv, ctx, dataset, startDegrees, endDegrees, holeRadius, label, value, percent, tickFormat, pieColor) => {
    
    const layout = dv.getLayout();

    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    const radius = Calc.getArcRadius(graphWidth, graphHeight);
    const arcCenterX = (graphX+(graphWidth/2)), arcCenterY = (graphY+radius);

    const startPoint = Calc.calculatePointOnCircle(startDegrees, radius, {x: arcCenterX, y: arcCenterY});
    const midPoint = {x: arcCenterX, y: arcCenterY};
    const endPoint = Calc.calculatePointOnCircle(endDegrees, radius, {x: arcCenterX, y: arcCenterY});

    const degreesToRadians = Math.PI / 180;

    //angels are in radians
    const startAngle = (startDegrees)*degreesToRadians;
    const endAngle = (endDegrees)*degreesToRadians;

    ctx.beginPath();
    ctx.fillStyle = pieColor;
    ctx.strokeStyle = pieColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    //draw arc line
    ctx.arc(midPoint.x, midPoint.y, radius, startAngle, endAngle);

    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo((midPoint.x), (midPoint.y));
    ctx.lineTo(endPoint.x, endPoint.y);

    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    //set tooltip
    const customData = dataset.custom;
    const customDataPoints = dataset.customDataPoints;
    const customDataValues = customDataPoints.get(label) || [];

    dv.setToolTipData(
        { 
            type: "pie",
            point: {
                radius: radius, 
                startDegrees: startDegrees, 
                endDegrees: endDegrees,
                startAngle: startAngle, 
                endAngle: endAngle, 
                midPoint: midPoint, 
                holeRadius: holeRadius,
            },
            text: [
                {name: "", value: label},
                {name: "", value: value + " (" + percent + "%)"},
                ...customDataValues.map((value, index) => {
                    return {name: customData[index].name || "", value: value};
                })
            ],
            tickFormat
        }
    );
}

export default DrawPieSlice;