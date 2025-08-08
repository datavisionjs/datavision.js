import * as Global from '../helpers/global.js';

const DrawKPI = (ctx, valueDataset, targetDataset, trendDataset, width, height) => {
    if (!ctx || !valueDataset) {
        return;
    }

    //const { width, height } = ctx.canvas;
    const halfWidth = width * 0.5;

    const value =  Global.numberFormat(valueDataset?.value || "", {abbreviate: true});
    const targets = targetDataset ? targetDataset?.targets?.flat() || [] : [];

    const labels = trendDataset?.labels || [];
    const trendMap = trendDataset?.map || new Map();

    const trendDirection = trendDataset?.direction || "";
    let trendColor = "rgba(0, 0, 0, 0.1)";
    let globalAlpha = 1;

    if(targets.length){
        const targetRange = targetDataset?.range || [null, null];
        const trendColors = trendDataset?.colors || {};
        const minValue = targetRange[0];
        const maxValue = targetRange[1];

        if(minValue && maxValue){
            const upDefaultColor = "#28a745";
            const downDefaultColor = "#dc3545";
            const neutralDefaultColor = "#6c757d";

            if(trendDirection === "up"){
                globalAlpha = 0.2;

                if(valueDataset?.value >= maxValue){
                    trendColor = trendColors["up"] || upDefaultColor;
                }else if(valueDataset?.value < maxValue){
                    trendColor = trendColors["down"] || downDefaultColor;
                }else {
                    trendColor = trendColors["neutral"] || neutralDefaultColor;
                }
                
            }else if(trendDirection === "down"){
                globalAlpha = 0.2;
                
                if(valueDataset?.value <= minValue){
                    trendColor = trendColors["up"] || upDefaultColor;
                }else if(valueDataset?.value > maxValue){
                    trendColor = trendColors["down"] || downDefaultColor;
                }else {
                    trendColor = trendColors["neutral"] || neutralDefaultColor;
                }
            }
        }
    }

    //clear canvas
    ctx.clearRect(0, 0, width, height);

    //set canvas trend
    const values = valueDataset?.data || [];

    if(labels.length > 0 && values.length > 0){
        //draw trend line
        const size = labels.length;
        const valueRange = valueDataset?.range || [0, 1];
        const minValue = valueRange[0];
        const maxValue = valueRange[1];

        ctx.beginPath();
        ctx.globalAlpha = globalAlpha;
        ctx.fillStyle = trendColor;

        ctx.moveTo(0, height); // Start at the bottom left corner

        for(let i = 0; i < labels.length; i++){
            const value = trendMap.get(labels[i]) || 0;
            const posX = (i / (size - 1)) * width; // Calculate x position based on index
            
            const newHeight = (height/2); // 80% of the height
            const posY = height - ((value - minValue) / (maxValue - minValue)) * newHeight; // Calculate y position based on value
            
            ctx.lineTo(posX, posY);
        }

        ctx.lineTo(width, height); // End at the bottom right corner
        ctx.lineTo(0, height);
        ctx.fill();

        ctx.closePath();

    }


    const textX = halfWidth;
    let textY = height * 0.5;

    if(labels.length){
        textY = height * 0.30;
    }

    const valueSize = valueDataset?.font?.size || 45;
    const targetSize = targetDataset?.font?.size || 20;

    if(textY < valueSize){
        textY = valueSize; //fit on canvas
    }

    console.log("TX: ", textX, width, textY, height);

    //displaying value
    ctx.beginPath();
    ctx.globalAlpha = 1;
    const valueFont = valueDataset?.font || { size: 45, family: "Arial", weight: "bold" };
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `${valueFont.weight} ${valueFont.size}px ${valueFont.family}`;
    ctx.fillStyle = "#333";
    ctx.fillText(value, textX, textY - valueSize / 2);

    //displaying target
    ctx.beginPath();
    ctx.fillStyle = "#666";
    let targetText = "";
    if (targets.length > 0) {
        targetText = (targetDataset?.text || "Target") + ": ";
        targetText += targets.map((target, index) => {
            const targetFont = targetDataset?.font || { size: 20, family: "Arial", weight: "normal" };
            ctx.font = `${targetFont.weight} ${targetFont.size}px ${targetFont.family}`;
            return Global.numberFormat(target, { abbreviate: true });
        }).join(", ");
        targetText += targets.length === 1? " ("+(targetDataset?.progress || 0).toFixed(2)+"%)": "";
    }

    ctx.fillText(targetText, textX, textY + targetSize);
    
    
}

export default DrawKPI;