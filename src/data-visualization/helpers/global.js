
export function splitTitleText(dv, text) {
    const canvas = dv.getCanvas();
    const ctx = dv.getCtx();

    const style = dv.getStyle().title;

    const maxWidth = canvas.width;

    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    const fontSize = style.fontSize;
    ctx.font = style.fontWeight+" "+fontSize+"px "+style.fontFamily;

    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const testWidth = (ctx.measureText(testLine).width+fontSize);

        if (testWidth < maxWidth) {
            currentLine = testLine;
        } else {
            const currWidth = ctx.measureText(currentLine).width;

            lines.push(currentLine);
            currentLine = words[i];
        }
    }

    lines.push(currentLine);
    return lines;
}

//get space for charts like line scatter and bar
export function getXSpace(dv, graphWidth){
    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const labelStyle = dv.getStyle().label;

    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

    //set initial space 
    let space = (fontSize*4);


    const barData = layout.barData;

    const categories = barData.barCategories;
    const catKeys = Array.from(categories.keys());

    const step = (graphWidth/catKeys.length);


    let widerTextSize = 0;

    for(var i = 0; i < catKeys.length; i++){

        const label = catKeys[i];

        //set text width
        const textWidth = ctx.measureText(label).width;

        if(textWidth >= step && textWidth > widerTextSize){
            widerTextSize = textWidth;
        }

    }

    return (space+widerTextSize);
    
}