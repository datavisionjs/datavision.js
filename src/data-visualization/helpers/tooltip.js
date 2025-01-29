import * as Global from './global.js';
import * as Calc from './math.js';


const DrawHover = (dv, ctx, data) => {

    const canvasSize = dv.getCanvasSize();
    const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;
    
    ctx.beginPath();

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    const type = data.type;
    const point = data.point;

    if(type === "bar"){
        ctx.rect(point.x, point.y, point.width, point.height); // Fill
    }else if(type === "pie"){
        //draw arc line
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";

        const lineWidth = canvasWidth * 0.0063;
        ctx.lineWidth = lineWidth;
        
        ctx.arc(point.midPoint.x, point.midPoint.y, (point.radius-2), point.startAngle, point.endAngle);
    }else if(type === "line"){
        const hover = data.hover || {};
        
        ctx.strokeStyle = hover.color || "#000";
        ctx.fillStyle = hover.color || "transparent";
        ctx.arc(point.midPoint.x, point.midPoint.y, (point.radius+1), 0, 2 * Math.PI);
        ctx.fill();
    }else {
        ctx.arc(point.midPoint.x, point.midPoint.y, point.radius, 0, 2 * Math.PI);
    }

    ctx.stroke();
}

const ShowToolTip = (dv, ctx, pos, data) => {

    const canvas = ctx.canvas;

    // Draw hover effect
    DrawHover(dv, ctx, data);

    const design = dv.getDesign();
    const fontSize = design.font.size;
    const mainContainer = dv.getMainContainer();

    const layout = dv.getLayout();
    const tooltip = layout.tooltip || {}
    const formatter = tooltip.formatter;
    
    let toolTipCard = mainContainer.querySelector("#dv_tooltip");

    // Create tooltip if it doesn't exist
    if (!toolTipCard) {
        toolTipCard = document.createElement("div");
        toolTipCard.setAttribute("id", "dv_tooltip");
        toolTipCard.setAttribute("style", `
            position: absolute;
            padding: 10px;
            background-color: white;
            display: block;
            font-size: ${fontSize}px;
            white-space: nowrap;
            border: 1px solid #ccc;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
            pointer-events: none;  /* Makes tooltip non-interactable */
            z-index: 1000;
        `);
        mainContainer.appendChild(toolTipCard);  // Append to document
    }

    // Clear previous content
    toolTipCard.innerHTML = '';

    // Add content to tooltip
    if(formatter){
        const dataText = data.text;
        const first = dataText[0], second = dataText[1];
        const tooltipDataset = {name: second.name};

        tooltipDataset.label = first.value;
        tooltipDataset.value = second.value;

        //set x and y
        tooltipDataset.x = first.value;
        tooltipDataset.y = second.value;
        if(first.hasOwnProperty("xIsLabel") && !first.xIsLabel){
            tooltipDataset.y = first.value;
            tooltipDataset.x = second.value;
        }

        //add in the custom data 
        const custom = dataText.slice(2, dataText.length);
        custom.length && (tooltipDataset.custom = custom);

        toolTipCard.innerHTML = formatter(tooltipDataset) || "";
    }else {
        data.text.forEach((textObj) => {
            const container = document.createElement("div");
            const text = document.createElement("span");

            text.textContent = Global.numberFormat(textObj.name, data.tickFormat) + ": " + Global.numberFormat(textObj.value, data.tickFormat); // Create text content

            // Add to container
            container.appendChild(text);

            // Add to tooltip
            toolTipCard.appendChild(container);
        });
    }

    // Show the tooltip
    toolTipCard.style.display = 'block';

    // Adjust tooltip position to ensure it's within the viewport
    const tooltipWidth = toolTipCard.offsetWidth;
    const tooltipHeight = toolTipCard.offsetHeight;


    //get canvasRect 
    const canvasRect = canvas.getBoundingClientRect();

    // Set initial position based on `pos`
    let posX = (canvas.offsetLeft+pos.x); 
    let posY = (canvas.offsetTop+pos.y); 

    let tooltipX = posX + 10;  // Offset by 10 pixels
    let tooltipY = posY + 10;  // Offset by 10 pixels

    // Ensure the tooltip doesn't overflow horizontally

    if ((tooltipX + tooltipWidth + canvasRect.x) > window.innerWidth) {
        tooltipX = posX - tooltipWidth - 10;  // Flip to the left side
    }

    // Ensure the tooltip doesn't overflow vertically
    if ((tooltipY + tooltipHeight + canvasRect.y) > window.innerHeight) {
        tooltipY = posY - tooltipHeight - 10;  // Move upwards
    }

    // Apply final tooltip position
    toolTipCard.style.left = `${tooltipX}px`;
    toolTipCard.style.top = `${tooltipY}px`;
};



const DisplayToolTip = (event, dv, position) => {
    if(dv && position){
        const ctx = dv.getCtx();

        const mainContainer = dv.getMainContainer();
        
        var rect = ctx.canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        dv.updateTargetCanvas();

        const toolTipData = [...dv.getToolTipData()].reverse();

        const currentRect = {x: x, y: y, width: 1, height: 1};

        let closestData = null;

        //hide tooltip 
        let toolTipCard = mainContainer.querySelector("#dv_tooltip");
        toolTipCard? toolTipCard.style.display = "none": null;

        for (let i = 0; i < toolTipData.length; i++) {
            const data = toolTipData[i];

            const type = data.type;

            if(type === "bar"){
                if(Global.crashWithRect(currentRect, data.point)){
                    ShowToolTip(dv, ctx, {x: x, y: y}, data);
                    closestData = null;
                    break;
                }
            }else if(type === "pie"){
                if(Global.crashWithAngle(currentRect, data.point)){
                    ShowToolTip(dv, ctx, {x: x, y: y}, data);
                    closestData = null;
                    break;
                }
            }else {

                if(Global.crashWithCircle(currentRect, data.point)){
                    ShowToolTip(dv, ctx, {x: x, y: y}, data);
                    closestData = null;
                    break;
                }else {

                    const newPoint = Global.crashWithDistance(currentRect, data.point, 22);
                    if(newPoint){
                        if(closestData){
                            if(closestData.point.dist > newPoint.dist){
                                closestData = {...data, point: {...newPoint}};
                            }
                        }else {
                            closestData = {...data, point: {...newPoint}};
                        }
                    }

                }
            }
            
        }

        if(closestData){
            ShowToolTip(dv, ctx, {x: x, y: y}, closestData);
        }

    }
};

export default DisplayToolTip;