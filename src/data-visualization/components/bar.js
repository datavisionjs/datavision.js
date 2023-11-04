import DrawElements from "../elements";

const Bar = (ctx, dataset) => {

    if(dataset){

        DrawElements(ctx, "bars", dataset);
    }

}

export default Bar;