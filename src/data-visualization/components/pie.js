import DrawElements from "../elements";

const Pie = (dv, dataset) => {
    if(dataset){

        DrawElements(dv, "pie", dataset);
    }
}

export default Pie;