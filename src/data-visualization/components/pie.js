import DrawElements from "../elements";

const Pie = (ctx, dataset) => {
    if(dataset){

        DrawElements(ctx, "pie", dataset);
    }
}

export default Pie;