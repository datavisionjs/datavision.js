import * as Calc from '../helpers/math.js'


const DrawPieSlice = (dv, ctx, dataset, startDegrees, endDegrees, holeRadius, label, value, percent, pieColor, font, tickFormat) => {
    
    const layout = dv.getLayout();
    

    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    const radius = Calc.getArcRadius((graphWidth*0.9), (graphHeight*0.9));
    const arcCenterX = ((graphWidth/2)), arcCenterY = (graphHeight/2);

    const midPoint = {x: arcCenterX, y: arcCenterY};

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
    ctx.moveTo(midPoint.x, midPoint.y); // Move to center
    ctx.arc(midPoint.x, midPoint.y, radius, startAngle, endAngle); // Draw arc
    ctx.lineTo(midPoint.x, midPoint.y); // Close the slice

    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    // Calculate midpoint angle
    const midAngle = (startAngle + endAngle) / 2;

    // Position for the percentage text
    const textRadius = radius * 0.8; // Slightly inside the arc
    const textX = arcCenterX + textRadius * Math.cos(midAngle);
    const textY = arcCenterY + textRadius * Math.sin(midAngle);

    // Calculate arc length
    const arcLength = radius * (endAngle - startAngle);

    // Measure the percentage text width
    ctx.font = `${font.weight} ${font.style} ${font.size}px ${font.family}`;

    const percentText = `${percent}%`;
    const textWidth = ctx.measureText(percentText).width;

    if(textWidth <= arcLength){
        // Draw the percentage text
        ctx.fillStyle = font.color;
        ctx.textAlign = "center"; // Center the text horizontally
        ctx.textBaseline = "middle"; // Center the text vertically
        ctx.fillText(percentText, textX, textY);
    }

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