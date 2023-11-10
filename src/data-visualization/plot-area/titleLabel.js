

const DrawTitleLabel = (dv) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const canvas = dv.getCanvas();
    const canvasWidth = canvas.width;

    const position = layout.graphPosition;
    const graphY = position.y;

    let title = layout.title;

    //set text alignment
    ctx.textAlign = 'center'; 

    if(title){
        //draw Title
        ctx.beginPath();

        const fontSize = 20;
        ctx.font = fontSize+"px Arial";

        ctx.fillText(title, (canvasWidth/2), ((graphY/2)+(fontSize/2)));
        ctx.closePath();
    }
}

export default DrawTitleLabel;