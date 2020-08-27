class LineGraph extends AbstractGraph {

    DEFAULT = {
        "WIDTH" : 500,
        "HEIGHT" : 300,
        "TOP" : 30,
        "RIGHT" : 10,
        "BOTTOM" : 10,
        "LEFT" : 30,
        "MARGIN" : 50,
        "DURATION" : 250,
        "LINE" : {
            "OPACITY" : 0.25,
            "OPACITY_HOVER" : 0.85,
            "OTHER_LINE_OPACITY_HOVER" : 0.1,
            "STROKE" : "1.5px",
            "STROKE_HOVER" : "2.5px"
        },
        "CIRCLE" : {
            "OPACITY" : 0.85,
            "OPACITY_ON_LINE_HOVER" : "2.5px",
            "RADIUS" : 2,
            "RADIUS_HOVER" : 6
        }
    }

    init() {
        const parseDate = d3.timeParse("%Y");
        const data = this.getOriginalData();
        data.forEach(function(d) { 
            d.values.forEach(function(d) {
                d.date = parseDate(d.date);
                d.value = +d.value;    
            });
        });


        /* Scale */
        const xScale = d3.scaleTime()
                        .domain(d3.extent(data[0].values, d => d.date))
                        .range([0, this.DEFAULT.WIDTH-this.DEFAULT.MARGIN]);

        const yScale = d3.scaleLinear()
                        .domain([-d3.max(data[0].values, d => d.value), d3.max(data[0].values, d => d.value)])
                        .range([this.DEFAULT.HEIGHT-this.DEFAULT.MARGIN, 0]);

        /* Add SVG */
        const svg = this.getSvg()
                    .attr("width", (this.DEFAULT.WIDTH+this.DEFAULT.MARGIN)+"px")
                    .attr("height", (this.DEFAULT.HEIGHT+this.DEFAULT.MARGIN)+"px")
                    .append('g')
                    .attr("transform", `translate(${this.DEFAULT.MARGIN}, ${this.DEFAULT.MARGIN})`);


        /* Add line into SVG */
        const line = d3.line()
                        .x(d => xScale(d.date))
                        .y(d => yScale(d.value));

        let lines = svg.append('g')
                        .attr('class', 'lines');

        lines.selectAll('.line-group')
            .data(data).enter()
            .append('g')
            .attr('class', 'line-group')  
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .on("mouseover", function(d, i) {
                svg.append("text")
                    .attr("class", "title-text")
                    .style("fill", d => d.color )        
                    .text(d.name)
                    .attr("text-anchor", "middle")
                    .attr("x", (this.DEFAULT.WIDTH-this.DEFAULT.MARGIN)/2)
                    .attr("y", 5);
                })
            .on("mouseout", function(d) {
                svg.select(".title-text").remove();
                })
            .append('path')
            .attr('class', 'line')  
            .attr('d', d => line(d.values))
            .style('stroke', d => d.color)
            .style('opacity', this.DEFAULT.LINE.OPACITY)
            .on("mouseover", function(d) {
                d3.selectAll('.line')
                                .style('opacity', this.DEFAULT.LINE.OTHER_LINE_OPACITY_HOVER);
                d3.selectAll('.circle')
                                .style('opacity', this.DEFAULT.CIRCLE.OPACITY_ON_LINE_HOVER);
                d3.select(this)
                    .style('opacity', this.DEFAULT.LINE.OPACITY_HOVER)
                    .style("stroke-width", this.DEFAULT.LINE.STROKE_HOVER)
                    .style("cursor", "pointer");
                })
            .on("mouseout", function(d) {
                d3.selectAll(".line")
                                .style('opacity', this.DEFAULT.LINE.OPACITY);
                d3.selectAll('.circle')
                                .style('opacity', this.DEFAULT.CIRCLE.OPACITY);
                d3.select(this)
                    .style("stroke-width", this.DEFAULT.LINE.STROKE)
                    .style("cursor", "none");
                });

        /* Add circles in the line */
        lines.selectAll("circle-group")
            .data(data).enter()
            .append("g")
            .style("fill", d => d.color)
            .selectAll("circle")
            .data(d => d.values).enter()
            .append("g")
            .attr("class", "circle")  
            .on("mouseover", function(d) {
                d3.select(this)     
                .style("cursor", "pointer")
                .append("text")
                .attr("class", "text")
                .text(`${d.value}`)
                .attr("x", d => xScale(d.date) + 5)
                .attr("y", d => yScale(d.value) - 10);
            })
            .on("mouseout", function(d) {
                d3.select(this)
                .style("cursor", "none")  
                .transition()
                .duration(this.DEFAULT.DURATION)
                .selectAll(".text").remove();
            })
            .append("circle")
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d.value))
            .attr("r", this.DEFAULT.CIRCLE.RADIUS)
            .style('opacity', this.DEFAULT.CIRCLE.OPACITY)
            .on("mouseover", function(d) {
                d3.select(this)
                    .transition()
                    .duration(this.DEFAULT.DURATION)
                    .attr("r", this.DEFAULT.CIRCLE.RADIUS_HOVER);
                })
            .on("mouseout", function(d) {
                d3.select(this) 
                    .transition()
                    .duration(this.DEFAULT.DURATION)
                    .attr("r", this.DEFAULT.CIRCLE.RADIUS);  
                });


        /* Add Axis into SVG */
        const xAxis = d3.axisBottom(xScale).ticks(10).tickPadding(8).tickSize(0);
        const yAxis = d3.axisLeft(yScale).ticks(10).tickPadding(8).tickSize(0);

        svg.append("g")
            .attr("class", "xAxis axis")
            .attr("transform", `translate(0, ${this.DEFAULT.HEIGHT-this.DEFAULT.MARGIN + 10})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "yAxis axis")
            .call(yAxis)
            .append('text')
            .attr("y", 15)
            .attr("transform", "rotate(-90)")
            .attr("fill", "#000");
    }

    render(data) {
        this.setData(data);
        this.init();
    }
}