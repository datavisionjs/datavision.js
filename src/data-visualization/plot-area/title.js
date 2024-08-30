

const DrawTitleLabel = (dv) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const design = dv.getDesign();
    const titleDesign = design.title;

    const canvas = dv.getCanvas();
    const canvasWidth = canvas.width;

    const position = layout.graphPosition;
    const graphWidth = position.width;
    const graphX = position.x;
    const graphY = position.y;

    const title = layout.title;
    let titleLines = title.titleLines;

    //set text alignment
    ctx.textAlign = 'center';
    ctx.textBaseline = "alphabetic";

    if(titleLines){
        const font = titleDesign.font;
        
        const fontSize = font.size;
        const fontFamily = font.family;
        const fontColor = font.color;
        const align  = titleDesign.align;
        
        let y = ((graphY/2)+(fontSize/2));
        if(titleLines.length > 1){
            y = fontSize;
        }

        ctx.font = fontSize+"px "+ fontFamily;
        ctx.fillStyle = fontColor;

        ctx.clearRect(0, 0, (position.x + position.width), position.y);

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
            ctx.fillText(title, x, y);
            ctx.closePath();

            y += (fontSize);
        }
    }
}

export default DrawTitleLabel;