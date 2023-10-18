import DrawElements from "../elements";

const Scatter = (ctx, dataSet, layout) => {
    
    if(dataSet){

        DrawElements(ctx, "points", dataSet);
    }
}

export default Scatter;