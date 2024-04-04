import DrawElements from "../elements";

const Scatter = (dv, dataset) => {
    
    if(dataset){

        DrawElements(dv, "points", dataset);
    }
}

export default Scatter;