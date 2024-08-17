

const DrawTitleLabel = (dv) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();
    const titleStyle = dv.getStyle().title;

    const canvas = dv.getCanvas();
    const canvasWidth = canvas.width;

    const position = layout.graphPosition;
    const graphY = position.y;

    let titleLines = layout.titleLines;

    //set text alignment
    ctx.textAlign = 'center';
    ctx.textBaseline = "alphabetic";

    if(titleLines){

        const fontSize = titleStyle.fontSize;
        ctx.font = fontSize+"px "+titleStyle.fontFamily;

        let x = (canvasWidth/2);
        let y = ((graphY/2)+(fontSize/2));

        
        if(titleLines.length > 1){
            y = fontSize;
        }

        ctx.fillStyle = "black";

        ctx.clearRect(0, 0, (position.x + position.width), position.y);

        for(let i = 0; i < titleLines.length; i++){
            const title = titleLines[i];

            //draw Title
            ctx.beginPath();
            ctx.fillText(title, x, y);
            ctx.closePath();

            y += (fontSize);
        }
    }
}

export default DrawTitleLabel;