import DrawElements from "../elements";

const Scatter = (ctx, dataset) => {
    
    if(dataset){

        DrawElements(ctx, "points", dataset);
    }
}

export default Scatter;