import DrawElements from "../elements";

const Scatter = (ctx, dataSet) => {
    
    if(dataSet){

        DrawElements(ctx, "points", dataSet);
    }
}

export default Scatter;