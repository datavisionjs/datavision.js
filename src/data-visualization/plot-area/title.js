

const DrawTitleLabel = (dv) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const design = dv.getDesign();
    const titleDesign = design.title;
    const genFont = design.font;

    const position = layout.graphPosition;
    const graphWidth = position.width;
    const graphX = position.x;
    const graphY = position.y;

    const title = layout.title;
    let titleLines = title.titleLines;

    //set text alignment
    ctx.textAlign = 'center';
    ctx.textBaseline = "alphabetic";

    if(titleLines.length){
        const font = titleDesign.font;
        
        const fontSize = font.size;
        const fontFamily = font.family;
        const fontWeight = font.weight;
        const fontStyle = font.style;
        const fontColor = font.color;
        const align  = titleDesign.align;

        const titleHeight = (graphY-genFont.size);
        
        let y = ((titleHeight/2)+(fontSize/2));
        if(titleLines.length > 1){
            y = fontSize;
        }

        dv.clearCanvas(0, 0, (position.x + position.width), titleHeight);

        ctx.font = fontWeight + " " + fontStyle + " " + fontSize+"px "+ fontFamily;
        ctx.fillStyle = fontColor;

        for(let i = 0; i < titleLines.length; i++){
            const title = titleLines[i];
            
            const titleWidth = ctx.measureText(title).width;
            const halfTitleWidth = titleWidth/2;

            let x = ((graphX+(graphWidth/2)));
            if(align === "left"){
                x = (graphX+halfTitleWidth);
            }else if(align === "right"){
                x = (((graphX+graphWidth)-halfTitleWidth));
            }
            //draw Title
            ctx.beginPath();
            ctx.fillText(title, x, (y));
            ctx.closePath();

            y += (fontSize);
        }
    }
}

export default DrawTitleLabel;