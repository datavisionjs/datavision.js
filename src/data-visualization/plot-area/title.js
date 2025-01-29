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

const DrawTitleLabel = (dv) => {
    const mainContainer = dv.getMainContainer();
    const targetSize = dv.getTargetSize();

    const containerDIV = dv.getTitleContainer();

    if (containerDIV.parentElement === mainContainer) {
        mainContainer.removeChild(containerDIV);
        containerDIV.innerHTML = "";
    }

    const layout = dv.getLayout();
    const design = dv.getDesign();
    const titleDesign = design.title;
    const genFont = design.font;

    const {y: graphY } = layout.graphPosition;
    const title = layout.title;
    const titleLines = title.titleLines;

    if (titleLines.length) {
        const { font, align } = titleDesign;

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
                x = fontSize;
            } else if (align === "right") {
                x = (targetSize.width-(titleWidth+fontSize));
            }

            const titleLine = TitleLine(x, y, line, font);
            titleGroup.appendChild(titleLine);

            y += fontSize; // Increment y for the next line
        });

        //insert the title groupt into SVG
        containerSVG.appendChild(titleGroup);

        containerDIV.appendChild(containerSVG);

        // Insert the div container into the target
        titleLines.length? mainContainer.insertBefore(containerDIV, mainContainer.firstChild): null;
    }
};

export default DrawTitleLabel;
