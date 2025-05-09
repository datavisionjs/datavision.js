import { findAxisBoundPositions, projChartPosition } from "../helpers/math";
import customColors from '../helpers/colors.js';
import { shortenText } from "../helpers/global.js";

const createLegendTitle = (font, label, x, y) => {

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y + font.size * 0.85);
    text.setAttribute("fill", font.color);
    text.setAttribute("font-size", font.size);
    text.setAttribute("font-family", font.family);
    text.setAttribute("font-weight", font.weight);
    text.setAttribute("font-style", font.style);
    text.textContent = label;

    return text;
}

// Create an SVG legend item
const createLegendItem = (fillColor, font, label, title, x, y) => {
    const legendGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", font.size);
    rect.setAttribute("height", font.size);
    rect.setAttribute("fill", fillColor);

    const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "title");
    tooltip.textContent = title;

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x + font.size * 1.5);
    text.setAttribute("y", y + font.size * 0.85);
    text.setAttribute("fill", font.color);
    text.setAttribute("font-size", font.size);
    text.setAttribute("font-family", font.family);
    text.setAttribute("font-weight", font.weight);
    text.setAttribute("font-style", font.style);
    text.textContent = label;


    //add tooltip to text
    text.appendChild(tooltip);

    legendGroup.appendChild(rect);
    legendGroup.appendChild(text);

    return legendGroup;
};

// Create the SVG container for the legend
const createLegendContainerSVG = (dv, range, displaySize) => {
    const {width: chartWidth} = projChartPosition(dv);
    const targetSize = dv.getTargetSize();
    
    const design = dv.getDesign();
    const font = design.legendFont;
    const layout = dv.getLayout();
    const legend = layout.legend;
    const legendTitle = legend.title || {};
    const titleFont = {
        ...font,
        ...legendTitle.font
    };
    const names = legend.names || Object.keys(legend.data);
    const legendPosition = legend.position || "right";
    const isHorizontal = legendPosition === "top" || legendPosition === "bottom";

    const isScrollable = (displaySize < legend.size);

    const containerSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    containerSVG.setAttribute("height", "100%");

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    containerSVG.appendChild(group);

    let position = font.size * (isHorizontal? 0.25: 0.5);
    let offsetX = font.size * 0.5;

    const ctx = dv.getCtx();
    ctx.font = `${font.weight} ${font.style} ${font.size}px ${font.family}`;

    //Implementing legend title

    let titleText = legendTitle.text || "";
    const titleWidth = ctx.measureText(titleText).width;

    const legendWidth = (targetSize.width*0.2);
    const maxTextWidth = isHorizontal? (targetSize.width-(font.size*2.25)): (legendWidth-(font.size*2));

    if(titleWidth > maxTextWidth){
        const lenthDiff = Math.ceil(((titleWidth - maxTextWidth) / titleWidth) * titleText.length);
        titleText = shortenText(titleText, Math.max((titleText.length - lenthDiff), 1));
    }
    
    const titleElement = createLegendTitle(
                            titleFont, 
                            titleText,
                            isHorizontal ? offsetX : font.size * 0.25,
                            position
                        );

    group.appendChild(titleElement);

    if (isHorizontal) {
        offsetX += titleWidth + font.size * 2;
    } else {
        position += font.size * 1.5;
    }

    //Implementing legend values

    for (let i = range.start; i < range.end; i++) {

        const labelWidth = ctx.measureText(names[i]).width;
        let label = names[i];

        if(labelWidth > maxTextWidth){
            const lenthDiff = Math.ceil(((labelWidth - maxTextWidth) / labelWidth) * label.length);
            
            label = shortenText(label, Math.max((label.length - lenthDiff), 1));
        }

        const color = legend.data.get(names[i]);
        const fillColor = Array.isArray(color) ? color[0] : color;

        const title = names[i];
        const legendItem = createLegendItem(
            fillColor,
            font,
            label,
            title,
            isHorizontal ? offsetX : font.size * 0.25,
            position
        );

        group.appendChild(legendItem);

        if (isHorizontal) {
            offsetX += labelWidth + font.size * 2;
        } else {
            position += font.size * 1.5;
        }
    }

    const svgHrWidth = isScrollable? (displaySize*(legend.maxWidth+(font.size*2))): offsetX;
    const hrScrollWidth = isScrollable? Math.min((svgHrWidth+(font.size*2.25)), chartWidth): offsetX;
    const svgWidth = isHorizontal? hrScrollWidth: "100%";

    containerSVG.setAttribute("width", svgWidth);
    return containerSVG;
};

const createNextPrevGroup = (dv, range, displaySize, isHorizontal, refreshLegend) => {
    const {height: chartHeight} = projChartPosition(dv);

    const design = dv.getDesign();
    const font = design.legendFont;

    const layout = dv.getLayout();
    const legend = layout.legend;


    const size = legend.size; // Assuming dv has a method to get the legend size

    const updateRange = (direction) => {
        if (direction === "next") {
            if (range.end < size) {
                range.start = range.end;
                range.end = Math.min(range.start + displaySize, size);
            }
        } else if (direction === "prev") {
            if (range.start > 0) {
                range.end = range.start;
                range.start = Math.max(range.start - displaySize, 0);
            }
        }
        refreshLegend();
    };

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "legend-nav-group");

    const prevPosition = {x: isHorizontal? "100%": (font.size*0.25), y: isHorizontal? font.size: (chartHeight-(font.size*0.25))}

    // Create "Previous" button
    const prevButton = document.createElementNS("http://www.w3.org/2000/svg", "text");
    prevButton.setAttribute("class", "legend-nav-prev");
    prevButton.setAttribute("font-size", font.size);
    prevButton.setAttribute("x", prevPosition.x); // Adjust positioning as needed
    prevButton.setAttribute("y", prevPosition.y);
    isHorizontal? prevButton.setAttribute("transform", "translate(-"+(font.size*2.25)+",0)"): null;
    prevButton.textContent = "◀";
    prevButton.setAttribute("fill", range.start === 0? "#D3D3D3": "black");
    prevButton.style.cursor = "pointer";
    prevButton.addEventListener("click", () => updateRange("prev"));
    group.appendChild(prevButton);

    const nextPosition = {x: isHorizontal? "100%": (font.size*1.25), y: isHorizontal? font.size: (chartHeight-(font.size*0.25))}

    // Create "Next" button
    const nextButton = document.createElementNS("http://www.w3.org/2000/svg", "text");
    nextButton.setAttribute("class", "legend-nav-next");
    nextButton.setAttribute("font-size", font.size);
    nextButton.setAttribute("x", nextPosition.x); // Adjust positioning as needed
    nextButton.setAttribute("y", nextPosition.y);
    isHorizontal? nextButton.setAttribute("transform", "translate(-"+(font.size*1.25)+",0)"): null;
    nextButton.textContent = "▶";
    nextButton.setAttribute("fill", range.end === legend.size? "#D3D3D3": "black");
    nextButton.style.cursor = "pointer";
    nextButton.addEventListener("click", () => updateRange("next"));
    group.appendChild(nextButton);

    return group;
};


// Draw the legend on the chart
const drawLegend = (dv) => {
    const canvasContainer = dv.getCanvasContainer();

    const {height: chartHeight} = projChartPosition(dv);
    const containerDIV = dv.getLegendContainer();

    if (containerDIV.parentElement === canvasContainer) {
        containerDIV.innerHTML = "";
        canvasContainer.removeChild(containerDIV);
    }

    const layout = dv.getLayout();
    const design = dv.getDesign();
    const font = design.legendFont;
    const legend = layout.legend;

    let isDisplay = legend?.display;

    if(isDisplay || (isDisplay !== false && legend.size > 1)){
        const isHorizontal = ["top", "bottom"].includes(legend.position);
        containerDIV.style = isHorizontal
            ? `height: ${font.size * 1.5}px; display: flex; justify-content: center; overflow: hidden;`
            : `height: ${chartHeight}px; overflow: hidden;`;

        if (!isHorizontal) {
            canvasContainer.style.display = "flex";
        }

        const { x, y, width, height } = projChartPosition(dv);
        let displaySize = Math.max((Math.floor(((isHorizontal ? width : height) - (font.size * (isHorizontal? 2.5: 1.25))) / (isHorizontal? (legend.maxWidth+(font.size*2)): (font.size*1.5)))), 1);
        displaySize = Math.min(displaySize, legend.size);

        const range = { start: 0, end: displaySize };

        const refreshLegend = () => {
            containerDIV.innerHTML = ""; // Clear legend

            const containerSVG = createLegendContainerSVG(dv, range, displaySize);

            const navGroup = createNextPrevGroup(dv, range, displaySize, isHorizontal, refreshLegend);
            
            const isScrollable = (displaySize < legend.size);
            isScrollable? containerSVG.appendChild(navGroup): null;
            containerDIV.appendChild(containerSVG);
        };

        refreshLegend();

        if (legend.position === "left" || legend.position === "top") {
            canvasContainer.insertBefore(containerDIV, canvasContainer.firstChild);
        } else {
            canvasContainer.appendChild(containerDIV);
        }
    }
};

export default drawLegend;
