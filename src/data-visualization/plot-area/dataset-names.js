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


    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;
    const yAxisRight = graphPosition.yAxisRight;

    const labelAreaWidth = (canvasWidth*0.2);
    const labelAreaHeight = (canvasHeight-graphY);

    const labelX = ((graphX+graphWidth)+yAxisRight)+fontSize;

    const datasetNameData = layout.datasetNameData;
    const datasetTotal = datasetNameData.total;

    const datasetData = dv.getData();

    let hasMultiBarChart = false;

    if(datasetData.length === 1){
        const dataset = datasetData[0];
        dataset.type === "bar"? dataset.names.length > 1? hasMultiBarChart = true: null: null; 
    }

    
    if(datasetData.length > 1 || !layout.hasAxisData || hasMultiBarChart){

        let startY = (graphY+(fontSize/2));

        for(let o = 0; o < datasetData.length; o++){
            const dataset = datasetData[o];

            if(dataset){
                let labels = dataset.labels;
                const dataType = dataset.type;
                let colors = dataset.colors;

                const axisChartTypes = ["line", "scatter", "bar"];
                if(axisChartTypes.includes(dataType)){
                    if(dataType === "bar"){
                        labels = dataset.names;
                        const categories = dataset.categories;
                        const firstCat = Array.from(categories.values())[0];

                        colors = firstCat.colors;

                    }else {
                        labels = [dataset.name];

                        const designColor = dataset.design.color;
                        colors = Array.isArray(designColor)? designColor: [designColor];
                    }
                }

                if(labels){

                    let pixelSpace = (fontSize*2);

                    if((datasetTotal*(fontSize*2)) >= (graphHeight+(fontSize/2))){
                        pixelSpace = Math.round(labelAreaHeight/datasetTotal);
                    }

                    for (let i = 0; i < labels.length; i++) {

                        //set defualtColor
                        const defaultColor = customColors[i].code;

                        let label = labels[i];
                        const labelWidth = ctx.measureText(label).width;

                        if((labelWidth+pixelSpace) > labelAreaWidth){
                            if(label.length > 3){
                                const estSizePerChar = (labelWidth/label.length);
                                label = Global.shortenText(label, Math.floor((labelAreaWidth-(fontSize*2))/estSizePerChar));
                            }
                        }
                        

                        const pieColor = colors? dataType === "bar"? colors[i][0]: colors[i]: null;

                        const fillColor = pieColor? pieColor: defaultColor;
                        fillColor? ctx.fillStyle = fillColor: null;//set bar color if exists

                    
                        const textPosX = (labelX+(fontSize)), textPosY = startY;

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
    }
}

export default DrawDatasetNames;