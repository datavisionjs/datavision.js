import * as Global from '../helpers/global.js';
import customColors from '../helpers/colors.js';

const DrawDatasetNames = (dv) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const labelStyle = dv.getStyle().label;

    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

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

    const datasetData = dv.getData();

    let hasMultiBarChart = false;

    if(datasetData.length === 1){
        const dataset = datasetData[0];
        dataset.type === "bar"? dataset.names.length > 1? hasMultiBarChart = true: null: null; 
    }

    
    if(datasetData.length > 1 || !layout.hasAxisData || hasMultiBarChart){

        let startY = (graphY+(fontSize/2));

        let namesCount = 0;

        for (let i = 0; i < datasetData.length; i++) {
            const dataset = datasetData[i]; // Assuming datasetData is your array of datasets
            const names = dataset.names || [dataset.name || ""]; // Check if dataset has 'names' property, else fallback to 'name'
            namesCount += names.length;
        }

        const strollTop = dv.getDatasetNamesScrollTop();
        const contentHeight = (namesCount*pixelSpace);

        const scrollIndexDecimal = (strollTop/contentHeight)*namesCount;
        const scrollIndex = Math.floor(scrollIndexDecimal);

        startY -= (fontSize*(scrollIndexDecimal-scrollIndex));

        //clear dataset area names
        const labelFontX = (labelX-(fontSize/2));
        ctx.clearRect(labelFontX, graphY, (canvasWidth-labelFontX), graphHeight);

        for(let o = 0; o < datasetData.length; o++){
            const dataset = datasetData[o];

            if(dataset){
                let labels = dataset.labels;
                const dataType = dataset.type;
                let colors = dataset.colors;

                const axisChartTypes = Global.getAxisChartTypes();
                if(axisChartTypes.includes(dataType)){
                    if(dataType === "bar"){
                        labels = dataset.names;
                        colors = dataset.colors;
                    }else {
                        labels = [dataset.name];

                        const designColor = dataset.design.color;
                        colors = Array.isArray(designColor)? designColor: [designColor];
                    }
                }

                if(labels){

                    for (let i = scrollIndex; i < labels.length; i++) {

                        //set defualtColor
                        const defaultColor = customColors.get(i).code;

                        let label = labels[i];
                        const labelWidth = ctx.measureText(label).width;

                        if((labelWidth+pixelSpace) > labelAreaWidth){
                            if(label.length > 3){
                                const estSizePerChar = (labelWidth/label.length);
                                label = Global.shortenText(label, Math.floor((labelAreaWidth-(fontSize*2))/estSizePerChar));
                            }
                        }
                        

                        const pieColor = colors? colors[i]: null;

                        const fillColor = pieColor? pieColor: defaultColor;
                        fillColor? ctx.fillStyle = fillColor: null;//set bar color if exists

                    
                        const textPosX = (labelX+fontSize), textPosY = startY;

                        ctx.beginPath();
                        ctx.arc(labelX, startY, (fontSize/2), 0, 2*Math.PI);
                        ctx.fill();

                        //add text
                        ctx.beginPath();
                        ctx.fillStyle = "black";
                        ctx.textAlign = "start";
                        ctx.textBaseline = "middle";
                        ctx.fillText(label, textPosX, textPosY);

                        startY += pixelSpace;
                        
                    }
                }
            }
        }

        //clear top of dataset names 
        ctx.clearRect(labelFontX, 0, (canvasWidth-labelFontX), graphY);
         //clear bottom of dataset names 
        ctx.clearRect(labelFontX, (graphY+graphHeight), (canvasWidth-labelFontX), (canvasHeight-(graphY+graphHeight)));

        dv.addDatasetNamesScrollBar({x: labelFontX, y: graphY, width: (canvasWidth-labelFontX), height: graphHeight}, contentHeight);
    }
}

export default DrawDatasetNames;