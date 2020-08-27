class VerticalAxisGraph extends AbstractGraph {
  HORIZONTAL_PADDING_INNER = 0.2;
  HORIZONTAL_PADDING_OUTER = 0.2;
  VERTICAL_PADDING_INNER = 0.2;
  VERTICAL_PADDING_OUTER = 0.2;

  BAR_DEFAULT = {
    RADIUS: 0,
    ON_CLICK: () => { },
  };

  YAXIS_FORMATTER = (d) => d3.format(",.0f")(d);
  XAXIS_FORMATTER = (d) => this.isDateScale() ? d3.timeFormat("%m-%d-%Y")(d) : d;

  mappedData = null;

  constructor(element) {
    super(element);
  }

  setOptions(options) {
    super.setOptions(options);

    // const { barOptions = {} } = options;
    // this.setBarOptions(barOptions);
  }

  transformAreaData = (data) => {
    const disabledLegends = this.getDisabledLegends();

    const defaultLegendsMap = new Map();

    data.forEach(({Label, Type = 'solid', Color}) => {
      defaultLegendsMap.set(Label, {
        Label,
        Value: 0,
        Type,
        Color,
      });
    });

    const mappedData = new Map();
    data.forEach(item => {
      item.Points.forEach(point => {
        if (!mappedData.has(point.Label)) {
          mappedData.set(point.Label, new Map(defaultLegendsMap))
        }
        
        const dimensionsMap = mappedData.get(point.Label);
        dimensionsMap.set(item.Label, {
          ...dimensionsMap.get(item.Label),
          Value: !disabledLegends.has(item.Label) ? point.Value : 0,
          Disabled: disabledLegends.has(item.Label),
        });
        mappedData.set(point.Label, dimensionsMap);
      })
    });

    const finalData = [...mappedData].map(dates => {
      return {
        Label: this.isDateScale() ? new Date(dates[0]) : dates[0],
        Points: [...dates[1]].map(point => ({
          ...point[1],
        })),
      };
    }).sort((a, b) => a.Label - b.Label);
  
    this.mappedData = mappedData;
    return finalData;
  }

  buildAreaData = (data) => {
    const disabledLegends = this.getDisabledLegends();
    const originalData = this.getOriginalData();

    return originalData.map(({Label, Type, Color}) => {
      const Points = [...data].map(item => {
        return {
          Label: item.Label,
          Value: item.Points.find(point => point.Label === Label).Value,
        }
      })
      return {
        Label,
        Type,
        Color: !disabledLegends.has(Label) ? Color : 'transparent',
        Points,
        Max: d3.max(Points, (d => d.Value))
      }
    })
  }

  /**=========================== */
  /** BAR OPTIONS BLOCK: STARTED */
  setBarOptions = ({ radius, onClick }) => {
    const barOptions = {
      radius: radius || this.BAR_DEFAULT.RADIUS,
      onClick: onClick || this.BAR_DEFAULT.ON_CLICK,
    };

    this.mergeSettings({
      barOptions,
    })
  }

  getBarOptions = () => this.settings.barOptions;
  getBarRadius = (width = 0) => !this.settings.barOptions.radius ? 0 : width / 2;
  /** BAR OPTIONS BLOCK: ENDED */

  geGroupedBarCounts = () => {
    return d3.max(this.getData().map(item => item.Points.length))
  }

  /** SVG HELPERS */
  getYScale = () => this.yScale;
  getXDimensionScale = () => this.xDimensionScale;
  getXGroupedSale = () => this.xGroupedSale;
  getXAxis = () => this.xAxis;
  getYAxis = () => this.yAxis;

  getMetricsScale = (size) => {
    const data = this.getData();
    let maxValue = d3.max(data.map(item => {
      return d3.max(
        item.Points.map(point => point.Value)
      );
    }))

    if (!maxValue) {
      maxValue = 1;
    }

    let minValue = 0;
    if (!this.zeroStart) {

      minValue = d3.min(data.map(item => {
        return d3.min(
          item.Points.filter(point => !point.Disabled).map(point => point.Value)
        );
      }))

      if (minValue) {
        minValue *= 0.90;
      } else {
        minValue = 0;
      }
    }

    maxValue = maxValue ? maxValue * 1.20 : 1
    
    return d3.scaleLinear()
      .domain(this.isAxisReverted(this.YAXIS) ? [maxValue, minValue] : [minValue, maxValue])
      .range(this.isVerticalOrientation() ? [size, 0] : [0, size]);
  }

  getDimensionsScale = (size) => {
    const data = this.getData();

    if (this.isDateScale()) {
      const dates = d3.extent(data.map(item => item.Label))
      return d3.scaleTime()
        .range([0, size])
        .domain([new Date(dates[0]), new Date(dates[1])]);
    }

    return d3.scaleBand()
      .range([0, size], this.HORIZONTAL_PADDING_INNER)
      .domain(data.map(item => item.Label))
      .paddingInner(this.HORIZONTAL_PADDING_INNER)
      .paddingOuter(this.HORIZONTAL_PADDING_OUTER);
  }

  // Scale for Vertical Chart :Started
  setYScale = () => {
    const { height } = this.getDimensions();
    this.yScale = this.getMetricsScale(height)
  }

  setYDimensionScale = () => {
    const { height } = this.getDimensions();
    const data = this.getData();

    this.yScale = d3.scaleBand()
      .range([0, height], this.VERTICAL_PADDING_INNER)
      .domain(data[0].Points.map(item => item.Label))
      .paddingInner(this.VERTICAL_PADDING_INNER)
      .paddingOuter(this.VERTICAL_PADDING_OUTER);
  }

  setXDimensionsScale = () => {
    const { width } = this.getDimensions();
    this.xDimensionScale = this.getDimensionsScale(width);
  }
  // Scale for Vertical Chart :Ended

  // Scale for Horizontal Chart :Started
  setHorizontalYScale = () => {
    const { height } = this.getDimensions();
    this.yScale = this.getDimensionsScale(height);
  }

  setHorizontalXScale = () => {
    const { width } = this.getDimensions();
    this.xDimensionScale = this.getMetricsScale(width)
  }
  // Scale for Horizontal Chart :Ended

  // This is for Stacks and Grouping
  setXGroupedScale = () => {
    const data = this.getData();
    const groupedDimensions = new Set();
    data.forEach(item => {
      item.Points.forEach(point => groupedDimensions.add(point.Label))
    })

    this.xGroupedSale = d3.scaleBand()
      .range([0, this.getXDimensionScale().bandwidth()], .01)
      .domain([...groupedDimensions])
      .paddingInner(0.05)
      .paddingOuter(0)
  }

  renderXAxisLabel = () => {
    const label = this.getAxisLabel(this.XAXIS);
    if (!label.show) {
      return;
    }

    const { top, left } = this.getXAxisLabelPosition()

    if (this.getSvg().select('g.xlabel text').empty()) {
      this.getSvg().append('g').attr('class', 'xlabel').append('text');
    }

    this.getSvg().select('g.xlabel')
      .attrs({
        'class': 'xlabel',
        "transform": "translate(" + left + "," + top + ")"
      })
      .select("text")
      .attr("font-size", `${label.size}px`)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(label.text);
  }

  renderYAxisLabel = () => {
    const label = this.getAxisLabel(this.YAXIS);
    if (!label.show) {
      return;
    }

    const { top, left } = this.getYAxisLabelPosition()

    if (this.getSvg().select('g.ylabel text').empty()) {
      this.getSvg().append('g').attr('class', 'ylabel').append('text');
    }

    this.getSvg().selectAll(".ylabel")
      .attrs({ 'class': 'ylabel' })
      .attr("transform", "translate(" + left + "," + top + ")")
      .select("text")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .style('fill', label.color)
      .attr("font-size", `${label.size}px`)
      .text(label.text);
  }

  renderXAxis = () => {
    const { xAxis, width, color, dasharray } = this.getGridSettings();
    const { show, count, size, color: tickColor } = this.getAxisTicks(this.XAXIS);

    const { height } = this.getDimensions();
    const { top, left } = this.getXAxisPosition();
    const formatter = this.getAxisFomater(this.XAXIS);

    const join = this.getSvg().selectAll('g.x-axis').data(['main']);
    join.enter()
      .append('g').attr({ 'class': 'x-axis' })
      .attr("transform", "translate(" + left + "," + top + ")");
    join.exit().remove();

    let tickValues = show ? this.getData().map((item) => item.Label) : [];
    const skipLength = Math.ceil(tickValues.length / count);

    if (count > 0 && skipLength > 1) {
      tickValues = tickValues.filter((value, index) => index % skipLength === 0)
    }

    const axis = this.isTopAxis() ? d3.axisTop(this.getXDimensionScale()) : d3.axisBottom(this.getXDimensionScale());
    this.getSvg().selectAll(".x-axis")
      .call(
          axis
            .tickFormat(formatter)
            .tickValues(tickValues)
            .tickSize(xAxis ? -height : 0)
            .tickPadding(10)
      )
      .call(g => !this.isAxisEnabled(this.XAXIS) ? g.selectAll(".domain").remove() : null)
      .call(g => g.selectAll("line").attrs({
        "stroke-width": width,
        "stroke": color,
        "stroke-dasharray": dasharray,
        "shape-rendering": "crispEdges",
      }))
      .call(g => g.selectAll("text").attrs({
        "font-size": `${size}px`,
        "color": tickColor,
      }));
  }

  renderYAxis = () => {
    const { yAxis, width: strokeWidth, color, dasharray } = this.getGridSettings();
    const { show, count, size, color: tickColor } = this.getAxisTicks(this.YAXIS);

    const { width } = this.getDimensions();
    const { top, left } = this.getYAxisPosition();
    const formatter = this.getAxisFomater(this.YAXIS);

    let domain = this.getYScale().domain();
    let tickValues = domain;

    if (domain.length == 2) {
      const diff = Math.abs(domain[1] - domain[0]);
      const steps = diff / ((count > 0 ? count : 5) - 1);
      tickValues = new Set();
      
      if (this.isAxisReverted(this.YAXIS)) {
        console.log(domain)
        for(let counter = domain[0]; counter >= domain[1]; counter -= steps) {
          tickValues.add(parseInt(counter));
        }
      } else {
        for(let counter = domain[0]; counter <= domain[1]; counter += steps) {
          tickValues.add(parseInt(counter));
        }
      }

      tickValues = [...tickValues];
    }

    const join = this.getSvg().selectAll('g.y-axis').data(['main']);
    join.enter()
      .append('g').attrs({ 'class': 'y-axis' })
      .attr("transform", "translate(" + left + "," + top + ")");
    join.exit().remove();

    const axis = this.isRightAxis() ? d3.axisRight(this.getYScale()) : d3.axisLeft(this.getYScale());
    this.getSvg().selectAll(".y-axis")
      .call(
        axis
          .tickFormat(formatter)
          .tickValues(tickValues)
          .tickSize(yAxis ? -width : 0)
          .tickPadding(10)
      )
      .call(g => (
        !this.isAxisEnabled(this.YAXIS) 
          ? g.selectAll(".domain").remove() 
          : null
      ))
      .call(g => g.selectAll("line").attrs({
        "stroke-width": strokeWidth,
        "stroke": color,
        "stroke-dasharray": dasharray,
      }))
      .call(g => g.selectAll("text").attrs({
        "font-size": `${size}px`,
        "color": tickColor,
      }));
  }

  renderLegends = () => {
    const { top, left } = this.getLegendPosition();
    const { width } = this.getDimensions();
    const disabledLegends = this.getDisabledLegends();

    const { show, color, unselectedColor, size, position } = this.getLegendOptions();
    if (!show) {
      return;
    }

    const legends = new Map();
    this.getData().forEach(item => {
      item.Points.forEach(point => legends.set(point.Label, point.Color))
    });

    if (this.getSvg().select('g.legend').empty()) {
      this.getSvg().append('g').attr('class', 'legend');
    }

    this.getSvg().select('g.legend')
      .attr("transform", "translate(" + left + "," + top + ")")

    const lgAccessor = this.getSvg().select('g.legend').selectAll('g')
      .data([...legends.keys()]);

    const container = lgAccessor.enter()
      .append('g');
    lgAccessor.exit().remove();
    container.append('circle');
    container.append('path');
    container.append('text');

    const center = size / 2;

    const lg = this.getSvg().select('g.legend').selectAll('g')
      .attr('transform', (d, i) => `translate(${10 + i * 100},${0})`)
      .style('cursor', 'pointer')
      .on("click", this.enableDisableLegend);

    lg.select('circle')
      .style('fill', d => disabledLegends.has(d) ? unselectedColor : legends.get(d))
      .attr('cx', center)
      .attr('cy', center)
      .attr('r', center);
    
    
    lg.select('path')
      .attr('d', `M${center - 4},${center}L${center - 1},${center + 3}L${center + 4},${center - 3}`)
      .attr('fill', 'none')
      .style('stroke', 'white')
      .style('stroke-width', '2');

    lg.select('text')
      .attr('fill', d => disabledLegends.has(d) ? unselectedColor : color)
      .style('font-size', `${size}px`)
      .style("alignment-baseline", "central")
      .attr('x', parseInt(size) + 5)
      .attr('y', center)
      .text(d => d);

    let offset = 0;
    let y = 0;

    lg.attr('transform', (d, i, nodes) => {
      let legendWidth = this.getNodeWidth(nodes[i]);
      let x = offset;

      offset += legendWidth + this.DEFAULT.LEGEND.PADDING;
      if (offset > width) {
        x = 0;
        offset = legendWidth + this.DEFAULT.LEGEND.PADDING;
        y += 15;
      }

      return `translate(${x},${y})`;
    });

    // Positioning of Legend
    const legendBlock = this.getSvg().select('g.legend');
    const freeSpace = (width - legendBlock.node().getBBox().width);
    if (position.includes('center')) {
      legendBlock.attr("transform", "translate(" + (left + freeSpace / 2) + "," + top + ")")
    }

    if (position.includes('right')) {
      legendBlock.attr("transform", "translate(" + (left + freeSpace) + "," + top + ")")
    }
  }

  renderVoronoi = () => {
    const data = this.getData();
    const vertices = [];
    const xScale  = this.getXDimensionScale();
    const yScale  = this.getYScale();
    const { top, left } = this.getYAxisPosition();

    const dimensions = this.getDimensions();

    data.forEach(item => {
      item.Points.forEach(point => {
        vertices.push({
          Label: item.Label,
          ChildLabel: point.Label,
          Value: point.Value,
        });
      });
    });

    const voronoi = d3.voronoi().extent([[0, 0], [dimensions.width, dimensions.height]]);
    voronoi.x((d) => xScale(d.Label))
    voronoi.y((d) => yScale(d.Value))

    this.getSvg().selectAll('g.voronoi').remove();

    const join = this.getSvg().selectAll('g.voronoi').data(['main']);
    join.enter()
      .append('g').attr('class', 'voronoi')
      .attr("transform", "translate(" + left + "," + top + ")");
    join.exit().remove();

    const paths = this.getSvg().select('g.voronoi').selectAll('path')
      .data(voronoi.polygons(vertices));

    const newPaths = paths.enter()
      .append('path')
      .attr('d', this.voronoiPolygon)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer');
    
    newPaths.on("mouseover", (d, i, nodes) => {
        const mouseCoords = d3.mouse(nodes[i]);
        let x = d3.event.x + xScale(d.data.Label) - mouseCoords[0];
        let y = d3.event.y + yScale(d.data.Value) - mouseCoords[1];

        this.handleLineTooltip(d);
        this.renderTooltip(d, {x, y: y - 5});
      })
      .on("touchend mouseleave", (d, i, nodes) => {
        this.hideTooltip();
        this.handleRemoveLineTooltip();
      })
      .on("touch click", (d, i, nodes) => {
        const Points = this.getData().find(item => item.Label === d.data.Label).Points.filter(item => item.Value === d.data.Value).map(({Label, Value}) => ({
          Label,
          Value,
        }));

        this.getOnClick()({
          Label: d3.timeFormat('%Y-%m-%d')(d.data.Label),
          Points,
        });
      });
  }

  voronoiPolygon = (d) => { 
    if(!d) return;
    return "M" + d.join("L") + "Z"; 
  }

  handleLineTooltip = (d) => {
    const date =  d3.timeFormat("%Y-%m-%d")(d.data.Label);
    const selectedData = [...this.mappedData.get(date)].filter(value => !value[1].Disabled);

    const dimensions = this.getDimensions();
    const { top, left } = this.getYAxisPosition();

    const dimensionScale = this.getXDimensionScale();

    this.getSvg().select('g.hoverLine').remove();
    this.getSvg().selectAll('g.hoverCircles').remove();

    this.handleLineHovering(d);

    this.getSvg()
      .append('g')
      .attrs({
        'class': 'hoverLine',
        'transform': "translate(" + left + "," + top + ")",
      })
      .append('line')
      .attrs({
        x1: dimensionScale(d.data.Label),
        y1: 0,
        x2: dimensionScale(d.data.Label),
        y2: dimensions.height,
        stroke: '#dedede',
        "stroke-dasharray": "3 3",
      });

    this.getSvg().selectAll('g.hoverCircles').data(selectedData)
      .enter()
      .append('g')
      .attrs({
        'class': 'hoverCircles',
        'transform': "translate(" + left + "," + top + ")",
      })
      .append('circle')
      .attrs({
        cx: dimensionScale(d.data.Label),
        cy: d1 => this.yScale(d1[1].Value),
        r: 5,
        stroke: d1 => d1[1].Color,
        "stroke-width": d1 => d.data.Value === d1[1].Value ? 3 : 0,
      })
      .style('fill', d1 => d.data.Value === d1[1].Value ? '#ffffff' : d1[1].Color);
    
      this.getSvg().select('g.voronoi').moveToFront();
  }

  renderTooltip = ({data}, { x, y}) => {
    const date =  d3.timeFormat("%Y-%m-%d")(data.Label);
    const selectedData = this.mappedData.get(date);
    const yFormatter = this.getAxisFomater(this.YAXIS);
    const xFormatter = this.getAxisFomater(this.XAXIS);

    if (!selectedData) return;
    let content = `<div style="padding-bottom: 5px;">${xFormatter(data.Label)}</div>`;
    [...selectedData].filter(a => !a[1].Disabled).sort((a, b) => b[1].Value - a[1].Value).forEach(item => {
      content += `<div ${item[1].Value === data.Value ? `style="font-weight: bold; color: ${item[1].Color}"` : ''}>${item[1].Label}: <span style="color: ${item[1].Color}">${yFormatter(item[1].Value)}</span></div>`
    })

    this.showTooltip({
      content,
      x,
      y
    })
  }

  handleLineHovering = () => {};
  removeLineHovering = () => {};

  handleRemoveLineTooltip = () => {
    this.getSvg().select('g.hoverLine').remove();
    this.getSvg().selectAll('g.hoverCircles').remove();
    this.removeLineHovering();
  }
}
