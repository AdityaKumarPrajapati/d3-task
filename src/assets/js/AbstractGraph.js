class AbstractGraph {

    data = null;
    svg = null;
    parsedElemen = null;
    originalData = null;
    parseDate = null;
    originalDimensions = {};

    constructor(element) {
    
        let settings = {};
        settings.element = element;
    
        const parsedElement = d3.select(`#${element}`);
        if (!parsedElement._groups[0][0]) {
          console.log(`ERROR: Element with id ${element} does not exists provided`);
          this.setStatus(false);
          return;
        }
    
        this.svg = parsedElement.append('svg').style("overflow", "auto");
        this.parsedElement = parsedElement;
      }

      getSvg = () => this.svg;
      getParsedElement = () => this.parsedElement;
      getGridSettings = () => this.settings.grid

      setData = (data) => {
        this.originalData = data
      }
      getOriginalData = () => this.originalData;
      
}