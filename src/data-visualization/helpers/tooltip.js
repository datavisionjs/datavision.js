
function ToolTip(){

}

function Lines(){

}

function Bars(){

}

function Pie(){

}

const DisplayToolTip = (dv, position) => {
    if(dv && position){
        const ctx = dv.getCtx();
        const layout = dv.getLayout();

        dv.updateTargetCanvas();

        const type = layout.firstDataType;

        if(type === "bar"){

        }else if(type === "pie"){
            
        }else {
            
        }

    }
};

export default DisplayToolTip;