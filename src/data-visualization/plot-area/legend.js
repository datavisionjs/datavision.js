import * as Global from '../helpers/global.js';
import customColors from '../helpers/colors.js';

const DrawLegend = (dv) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const design = dv.getDesign();
    const font = design.legendFont;

    const canvasSize = dv.getCanvasSize();
    const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;

    const fontSize = font.size;
    ctx.font = font.weight + " " + font.style + " " + fontSize+"px "+font.family;

    let pixelSpace = (fontSize+(fontSize/2));


    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;
    const yAxisRight = graphPosition.yAxisRight;

    const labelAreaWidth = (canvasWidth*0.2);
    //const labelAreaHeight = (canvasHeight-graphY);

    const labelX = ((graphX+graphWidth)+yAxisRight)+fontSize;

    //const datasetNameData = layout.datasetNameData;
    //const datasetTotal = datasetNameData.total;

    const legend = layout.legend;
    const legendData = legend.data;
    const names = legend.names || Object.keys(legendData);

    //const names = legend.names;
    //const colors = legend.colors;
    const size = legend.size;
    const isDefault = legend.isDefault;
    const display = legend.display;

    const data = dv.getData();

    let hasMultiBarChart = false;

    if(data.length === 1){
        const dataset = data[0];
        dataset.type === "bar"? size > 1? hasMultiBarChart = true: null: null; 
    }
    
    if(((isDefault && data.length > 1) || !layout.hasAxisData || hasMultiBarChart) || display){

        let startY = (graphY+(fontSize/2));

        const strollTop = dv.getLegendScrollTop();
        const contentHeight = (size*pixelSpace);

        const scrollIndexDecimal = (strollTop/contentHeight)*size;
        const scrollIndex = Math.floor(scrollIndexDecimal);

        startY -= (fontSize*(scrollIndexDecimal-scrollIndex));

        //clear dataset area names
        const labelFontX = (labelX-((fontSize/2)+1));
        ctx.clearRect(labelFontX, graphY, (canvasWidth-labelFontX), graphHeight);

        if(legendData){

            for (let i = scrollIndex; i < size; i++) {

                let label = names[i];
                const pieColor = legendData.get(names[i]);

                const labelWidth = ctx.measureText(label).width;

                if((labelWidth+pixelSpace) > labelAreaWidth){
                    if(label.length > 3){
                        const estSizePerChar = (labelWidth/label.length);
                        label = Global.shortenText(label, Math.floor((labelAreaWidth-(fontSize*2))/estSizePerChar));
                    }
                }

                const fillColor = pieColor;

                const textPosX = (labelX+fontSize), textPosY = startY;

                ctx.beginPath();
                fillColor? ctx.fillStyle = fillColor: null;//set bar color if exists
                ctx.arc(labelX, startY, (fontSize/2), 0, 2*Math.PI);
                ctx.fill();

                //add text
                ctx.beginPath();
                ctx.fillStyle = font.color;
                ctx.textAlign = "start";
                ctx.textBaseline = "middle";
                ctx.fillText(label, textPosX, textPosY);

                startY += pixelSpace;
                
            }
        }

        //clear top of dataset names 
        ctx.clearRect(labelFontX, 0, (canvasWidth-labelFontX), graphY);
         //clear bottom of dataset names 
        ctx.clearRect(labelFontX, (graphY+graphHeight), (canvasWidth-labelFontX), (canvasHeight-(graphY+graphHeight)));

        dv.addLegendScrollBar({x: labelFontX, y: graphY, width: (canvasWidth-labelFontX), height: graphHeight}, contentHeight);
    }
}

export default DrawLegend;