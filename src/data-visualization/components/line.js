import DrawElements from "../elements";

const Line = (ctx, dataset) => {

    if(dataset){

        DrawElements(ctx, "lines", dataset);
    }
}

export default Line;