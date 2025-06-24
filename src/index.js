
import { cloneDeep } from 'lodash';
import * as dataVis from './data-visualization/index.js'

//import helpers
import * as Calc from './data-visualization/helpers/math.js';
import Design from './data-visualization/helpers/design.js';
import * as Prop from './data-visualization/helpers/properties.js'
import DisplayToolTip from './data-visualization/helpers/tooltip.js';

//import all global functions 
import * as Global from './data-visualization/helpers/global.js';

//drawdataset names 
import DrawLegend from './data-visualization/plot-area/legend.js';
import { addBars } from './data-visualization/plot-area/scrollbar.js';

class DataVision {
    constructor(targetId) {
        if (!targetId || typeof targetId !== 'string') {
            throw new Error("A valid target ID is required to initialize DataVision.");
        }

        // Ensure the chart is destroyed before plotting new data
        this.destroy();

        // Styles and data
        this.rawData = [];
        this.data = [];
        this.isSetUpChart = false;
        this.layout = {};
        this.design = {};

        // DOM elements
        this.titleContainer = document.createElement("div");
        this.scrollWheelArea = document.createElement("div");
        this.hrScrollBar = document.createElement("div");
        this.vrScrollBar = document.createElement("div");
        this.legendScrollBar = document.createElement("div");
        this.legendContainer = document.createElement("div");
        this.target = document.getElementById(targetId);
        this.targetCanvas = document.createElement("canvas");
        this.mainContainer = document.createElement("div");
        this.canvasContainer = document.createElement("div");
        this.canvas = document.createElement("canvas");
        this.tempCanvas = document.createElement("canvas");
        this.canvasCopy = document.createElement("canvas");

        //set target id
        this.targetId = targetId;

        // State
        this.canvasSize = { width: 1, height: 1 };
        this.scrollData = { topIndex: 0, leftIndex: 0, isScrollY: false, isScrollX: false };
        this.legendScrollTop = 0;
        this.toolTipData = [];
        this.ctx = null;

        // Initialize
        this.clearTarget();
    }

    createCanvas(canvas, width, height) {
        const newCanvas = canvas || document.createElement("canvas");
        const ctx = newCanvas.getContext("2d");
        const ratio = window.devicePixelRatio || 1;
        const ratioWidth = width * ratio;
        const ratioHeight = height * ratio;

        newCanvas.width = ratioWidth;
        newCanvas.height = ratioHeight;
        newCanvas.style.width = `${width}px`;
        newCanvas.style.height = `${height}px`;

        ctx.scale(ratio, ratio);
        ctx.clearRect(0, 0, width, height);

        return newCanvas;
    }

    clearTarget() {
        const target = this.getTarget();
        target.innerHTML = "";
    }

    // Data getters and setters
    setData(data) {
        this.data = data;
    }

    getData() {
        return [...this.data];
    }

    // Layout methods
    setLayout(layout) {
        if (layout) {
            this.setDesign(layout);

            // Handle title
            const title = layout.title || "";
            if (Global.isObject(title)) {
                const titleText = title.text || "";
                layout.title.lines = Global.splitTitleText(this, titleText);
            } else {
                layout.title = { lines: Global.splitTitleText(this, title) };
            }

            // Handle subtitle
            const subTitle = layout.subTitle || "";
            if (Global.isObject(subTitle)) {
                const titleText = subTitle.text || "";
                layout.subTitle.lines = Global.splitTitleText(this, titleText);
            } else {
                layout.subTitle = { lines: Global.splitTitleText(this, subTitle) };
            }

            layout.customColorsIndex = 0;
            this.layout = { ...layout };
        }
    }

    getLayout() {
        return this.layout || {};
    }

    // Design methods
    setDesign(layout) {
        this.design = Design(this, layout);
    }

    getDesign() {
        return this.design || {};
    }

    // Title methods
    getTitleContainer() {
        return this.titleContainer || {};
    }

    // Canvas methods
    setCanvas() {
        const chartArea = Calc.projChartPosition(this);
        const { width, height } = chartArea;
        const canvas = this.createCanvas(this.getCanvas(), width, height);
        
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvasSize = { width, height };
    }

    getCanvasContainer() {
        return this.canvasContainer || {};
    }

    getCanvas() {
        return this.canvas;
    }

    clearCanvas(x, y, width, height) {
        const ctx = this.getCtx();
        const layout = this.getLayout();
        const canvasSize = this.getCanvasSize();
        
        if (ctx) {
            const newX = x || 0;
            const newY = y || 0;
            const newWidth = width || canvasSize.width;
            const newHeight = height || canvasSize.height;
            
            const bgColor = layout.backgroundColor || "transparent";
            const newCanvas = this.createCanvas(null, newWidth, newHeight);
            const newCtx = newCanvas.getContext("2d");
            newCtx.fillStyle = bgColor;
            newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            
            ctx.beginPath();
            ctx.clearRect(newX, newY, newWidth, newHeight);
            ctx.drawImage(newCanvas, newX, newY, newWidth, newHeight);
        }
    }

    getCanvasSize() {
        return this.canvasSize;
    }

    addCanvas() {
        const canvasContainer = this.getCanvasContainer();
        canvasContainer.style.width = "100%";
        canvasContainer.style.height = "auto";

        const mainContainer = this.getMainContainer();
        const canvas = this.getCanvas();

        if (!mainContainer) return;

        if (canvasContainer.parentElement !== mainContainer) {
            mainContainer.style.position = "relative";

            Global.on(canvas, "wheel", () => {
                const wheelArea = this.getScrollbar().wheelArea;
                if (wheelArea) wheelArea.style.pointerEvents = "";
            });

            Global.on(canvas, "mousedown", () => {
                const wheelArea = this.getScrollbar().wheelArea;
                if (wheelArea) wheelArea.style.pointerEvents = "";
            }, "touchstart");

            Global.on(canvas, "mousemove", (event) => {
                event.stopPropagation();
                const mousePosition = Global.getMousePosition(event);
                DisplayToolTip(event, this, mousePosition);
            }, "touchend");

            Global.on(canvas, "mouseleave", () => {
                let toolTipCard = mainContainer.querySelector("#dv_tooltip");
                if (toolTipCard) toolTipCard.style.display = "none";
            }, "");

            Global.on(document, "click", () => {
                if (!(navigator.maxTouchPoints > 0)) {
                    this.updateTargetCanvas();
                }
            }, "");

            canvasContainer.appendChild(canvas);
            mainContainer.appendChild(canvasContainer);
        }
    }

    // Tooltip methods
    setToolTipData(data) {
        this.toolTipData.push(data);
    }

    getToolTipData() {
        return this.toolTipData;
    }

    clearToolTipData() {
        this.toolTipData = [];
    }

    // Canvas copy methods
    updateCanvasCopy() {
        const canvas = this.getCanvas();
        const { width, height } = this.getCanvasSize();
        const canvasCopy = this.createCanvas(null, width, height);
        const ctx = canvasCopy.getContext("2d");

        ctx.drawImage(canvas, 0, 0, width, height);
        this.canvasCopy = canvasCopy;
    }

    getCanvasCopy() {
        return this.canvasCopy;
    }

    // Context and temp canvas
    getCtx() {
        return this.ctx || this.getCanvas().getContext("2d");
    }

    getTempCanvas() {
        return this.tempCanvas;
    }

    // Scroll methods
    getScrollData() {
        return this.scrollData;
    }

    getScrollbar() {
        return {
            wheelArea: this.scrollWheelArea,
            hr: this.hrScrollBar,
            vr: this.vrScrollBar
        };
    }

    getLegendContainer() {
        return this.legendContainer;
    }

    // Target methods
    getTarget() {
        return this.target;
    }

    getTargetId() {
        return this.targetId || ""; 
    }

    setTargetSize() {
        this.targetSize = Calc.targetSize(this);
    }

    getTargetSize() {
        return this.targetSize || {};
    }

    updateTargetCanvas() {
        const canvasCopy = this.getCanvasCopy();
        const { width, height } = this.getCanvasSize();
        const ctx = this.getCtx();

        this.clearCanvas();
        ctx.drawImage(canvasCopy, 0, 0, width, height);
    }

    // Main container methods
    getMainContainer() {
        return this.mainContainer;
    }

    addMainContainer() {
        const target = this.getTarget();
        const { width, height } = this.getTargetSize();
        const mainContainer = this.getMainContainer();

        mainContainer.setAttribute("style", `position: relative; width: ${width}px; height: ${height}px`);

        if (target) {
            // Clear all existing children from target
            while (target.firstChild) {
                target.removeChild(target.firstChild);
            }

            // Append mainContainer after clearing
            target.appendChild(mainContainer);
        }
    }


    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    update() {

        // If target element is missing or no longer in DOM, do not proceed
        if (!this.target || !document.body.contains(this.target)) {
            console.warn("Target element is not present in the DOM. Chart update aborted.");
            return;
        }

        //sets the size of the target
        this.setTargetSize();
        
        //clear tooltipData 
        this.clearToolTipData();

        //set canvas 
        this.setCanvas();

        //set graph position
        Prop.setGraphPosition(this);

        //clear rect
        this.clearCanvas();

        dataVis.DrawPlotArea(this);

        dataVis.Chart(this);

        //update date canvas copy with main canvas
        this.updateCanvasCopy();

        //add main canvas to user target element
        this.addCanvas();

        //add scrollBars
        addBars(this, Calc.projChartPosition(this));

        //Draw dataset names
        DrawLegend(this);

        //add mainCanvas to target
        this.addMainContainer();
    }

    observeTarget() {
        if (!this.target || this._mutationObserver) return;

        const observer = new MutationObserver(() => {
            if (!document.body.contains(this.target)) {
                console.info("Target element removed from DOM, destroying chart instance.");
                console.log("target Was Removed: ");
                this.destroy(); // Call destroy after disconnecting
            }
        });

        const parent = this.target.parentElement || document.body;
        observer.observe(parent, {
            childList: true,
            subtree: true
        });

        this._mutationObserver = observer;
    }

    observeTargetSize() {
        if (!this.target || this._resizeObserver) return;

        const resizeObserver = new ResizeObserver(
            this.debounce(entries => {
                const currentTarget = document.getElementById(this.targetId);
                if (currentTarget && currentTarget === this.target) {

                    const targetSize = this.getTargetSize() || {};
                    const currentSize = Calc.targetSize(this) || {};

                    const isSameSize = targetSize.width === currentSize.width && targetSize.height === currentSize.height;

                    if(isSameSize) return;
                    this.update();
                }else {
                    this.destroy();
                }
            }, 100)
        );

        resizeObserver.observe(this.target);
        this._resizeObserver = resizeObserver;
    }


    async plot (data, layout) {

        if (!data || !layout) {
            throw new Error("Data and layout are required to plot the chart.");
        }

        // Deep copy to prevent modifying original data
        data = cloneDeep(data); // Simple deep copy; consider lodash for complex cases
        layout = cloneDeep(layout);

        // Clear tooltip data
        this.clearToolTipData();

        // Set data and layout
        this.setData(data);
        this.setLayout(layout);

        try {
            await Prop.setUpChart(this);
        } catch (error) {
            console.error('Error setting up chart:', error);
            throw error;
        }

        this.update();
        this.observeTarget();

        const isResponsive = layout?.responsive !== undefined ? layout.responsive : true;

        if(isResponsive){
            this.observeTargetSize();
        }
    }

    destroy() {
        if (this._mutationObserver) {
            this._mutationObserver.disconnect();
            this._mutationObserver = null;
        }

        if(this._resizeObserver) {
            this._resizeObserver.unobserve(this.target);
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }

        // Remove any canvas or custom elements added
        if (this.target) {
            while (this.target.firstChild) {
                this.target.removeChild(this.target.firstChild);
            }
        }

        // Reset all properties
        this.targetId = null;
        this.target = null;
        this.canvas = null;
        this.tempCanvas = null;
        this.canvasCopy = null;
        this.canvasContainer = null;
        this.rawData = [];     
        this.data = [];
        this.isSetUpChart = false;
        this.layout = {};
        this.design = {};
    }
}

export default DataVision;
