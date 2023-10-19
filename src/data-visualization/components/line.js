import DrawElements from "../elements";

const Line = (ctx, dataSet) => {

    if(dataSet){

        DrawElements(ctx, "lines", dataSet);
    }
}

export default Line;