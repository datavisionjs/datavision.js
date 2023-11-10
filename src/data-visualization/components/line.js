import DrawElements from "../elements";

const Line = (dv, dataset) => {

    if(dataset){

        DrawElements(dv, "lines", dataset);
    }
}

export default Line;