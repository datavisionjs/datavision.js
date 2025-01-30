import { projChartPosition } from "../helpers/math";

const TitleLine = (x, y, title, font) => {
    // Create the title text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x); // Offset text horizontally
    text.setAttribute("y", y + font.size * 0.85); // Align text vertically
    text.setAttribute("fill", font.color);
    text.setAttribute("font-size", font.size);
    text.setAttribute("font-family", font.family);
    text.setAttribute("font-weight", font.weight);
    text.setAttribute("font-style", font.style);
    text.textContent = title;

    return text;
};

const GetTitle = (dv, genFont, design, titleLines) => {
    const targetSize = dv.getTargetSize();
    
    const layout = dv.getLayout();
    const {y: graphY } = layout.graphPosition;

    if (titleLines.length) {
        const { font, align } = design;

        const { size: fontSize, family: fontFamily, weight: fontWeight, style: fontStyle, color: fontColor } = font;

        //set title space from top;
        let titleTop = titleLines.length? (((titleLines.length)*fontSize)+fontSize): fontSize;

        const titleHeight = graphY - genFont.size;
        let y = titleHeight / 2 + fontSize / 2;

        if (titleLines.length > 1) {
            y = fontSize; // Adjust y for multiple lines
        }

        // Clear the canvas area for the title
        //dv.clearCanvas(0, 0, graphX + graphWidth, titleHeight);

        // Set font properties for measurement
        const ctx = dv.getCtx();
        ctx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;

        const containerSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        containerSVG.setAttribute("width", "100%");
        containerSVG.setAttribute("height", titleTop);

        const titleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        const {x: chartX, width: chartWidth} = projChartPosition(dv);
        titleLines.forEach((line) => {
            const titleWidth = ctx.measureText(line).width;
            const halfTitleWidth = titleWidth / 2;

            let x = (chartX+(chartWidth*0.5))-halfTitleWidth; // Center align by default
            if (align === "left") {
                x = genFont.size;
            } else if (align === "right") {
                x = (targetSize.width-(titleWidth+genFont.size));
            }

            const titleLine = TitleLine(x, y, line, font);
            titleGroup.appendChild(titleLine);

            y += fontSize; // Increment y for the next line
        });

        //insert the title groupt into SVG
        containerSVG.appendChild(titleGroup);

        return containerSVG;
    }else {
        return null;
    }
}

const AddTitle = (dv) => {
    const mainContainer = dv.getMainContainer();

    const containerDIV = dv.getTitleContainer();

    if (containerDIV.parentElement === mainContainer) {
        mainContainer.removeChild(containerDIV);
        containerDIV.innerHTML = "";
    }

    const layout = dv.getLayout();
    const design = dv.getDesign();
    const genFont = design.font;

    //title
    const titleDesign = design.title;

    const title = layout.title;
    const titleLines = title.lines;

    const TitleSVG = GetTitle(dv, genFont, titleDesign, titleLines);

    TitleSVG && containerDIV.appendChild(TitleSVG);

    //subTitle 
    const subTitleDesign = design.subTitle;

    const subTitle = layout.subTitle;
    const subTitleLines = subTitle.lines;

    const SubTitleSVG = GetTitle(dv, genFont, subTitleDesign, subTitleLines);

    SubTitleSVG && containerDIV.appendChild(SubTitleSVG);
    
    // Insert the div container into the target
    mainContainer.insertBefore(containerDIV, mainContainer.firstChild);
};

export default AddTitle;
