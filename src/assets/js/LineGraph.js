class LineGraph extends AbstractGraph {
    
    init() {
        const width = 500;
        const height = 300;
        const margin = 50;
        const duration = 250;

        const lineOpacity = "0.25";
        const lineOpacityHover = "0.85";
        const otherLinesOpacityHover = "0.1";
        const lineStroke = "1.5px";
        const lineStrokeHover = "2.5px";

        const circleOpacity = '0.85';
        const circleOpacityOnLineHover = "0.25"
        const circleRadius = 3;
        const circleRadiusHover = 6;
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
                        .range([0, width-margin]);

        const yScale = d3.scaleLinear()
                        .domain([-d3.max(data[0].values, d => d.value), d3.max(data[0].values, d => d.value)])
                        .range([height-margin, 0]);

        /* Add SVG */
        const svg = this.getSvg()
            .attr("width", (width+margin)+"px")
            .attr("height", (height+margin)+"px")
            .append('g')
            .attr("transform", `translate(${margin}, ${margin})`);


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
                    .attr("x", (width-margin)/2)
                    .attr("y", 5);
                })
            .on("mouseout", function(d) {
                svg.select(".title-text").remove();
                })
            .append('path')
            .attr('class', 'line')  
            .attr('d', d => line(d.values))
            .style('stroke', d => d.color)
            .style('opacity', lineOpacity)
            .on("mouseover", function(d) {
                d3.selectAll('.line')
                    .style('opacity', otherLinesOpacityHover);
                d3.selectAll('.circle')
                    .style('opacity', circleOpacityOnLineHover);
                d3.select(this)
                    .style('opacity', lineOpacityHover)
                    .style("stroke-width", lineStrokeHover)
                    .style("cursor", "pointer");
                })
            .on("mouseout", function(d) {
                d3.selectAll(".line")
                    .style('opacity', lineOpacity);
                d3.selectAll('.circle')
                    .style('opacity', circleOpacity);
                d3.select(this)
                    .style("stroke-width", lineStroke)
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
                .duration(duration)
                .selectAll(".text").remove();
            })
            .append("circle")
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d.value))
            .attr("r", circleRadius)
            .style('opacity', circleOpacity)
            .on("mouseover", function(d) {
                d3.select(this)
                    .transition()
                    .duration(duration)
                    .attr("r", circleRadiusHover);
                })
            .on("mouseout", function(d) {
                d3.select(this) 
                    .transition()
                    .duration(duration)
                    .attr("r", circleRadius);
                });


        /* Add Axis into SVG */
        const xAxis = d3.axisBottom(xScale).ticks(6).tickPadding(8).tickSize(0);
        const yAxis = d3.axisLeft(yScale).ticks(6).tickPadding(8).tickSize(0);

        svg.append("g")
            .attr("class", "xAxis axis")
            .attr("transform", `translate(0, ${height-margin})`)
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