const svg = d3.select("#container")
    .append("svg")
    .attr("width", 800)
    .attr("height", 420);

svg.append("rect")
    .attr("x", 60).attr("y", 40)
    .attr("width", 50).attr("height", 100)
    .attr("fill", "red");
  
svg.append("circle")
    .attr("cx", 450).attr("cy", 110).attr("r", 50)
    .attr("fill", "green");
  
svg.append("line")
    .attr("x1", 80).attr("y1", 350)
    .attr("x2", 240).attr("y2", 230)
    .attr("stroke", "black")
    .attr("stroke-width", 3);
  
svg.append("polygon")
    .attr("points", "380,360 450,240 520,360")
    .attr("fill", "yellow");

svg.append("path")
    .attr("d", "M 250 60 Q 330 130 250 200 Q 170 130 250 60 Z")
    .attr("fill", "dodgerblue")
    .attr("stroke", "navy")
    .attr("stroke-width", 3);

svg.append("ellipse")
    .attr("cx", 650)
    .attr("cy", 250)
    .attr("rx", 100)
    .attr("ry", 150)
    .attr("fill", "orange")
    .attr("stroke", "darkorange")
    .attr("stroke-width", 3);

const arc = d3.arc()
    .innerRadius(30)
    .outerRadius(60)
    .startAngle(0)
    .endAngle(Math.PI * 1.5);

svg.append("path")
    .attr("d", arc())
    .attr("transform", "translate(250, 320)")
    .attr("fill", "teal");


// -------- Tech2: Linked Views ---------
const data = [
    {name: "Apple", value: 5, color: "red"},
    {name: "Banana", value: 7, color: "yellow"},
    {name: "Orange", value: 4, color: "orange"},
    {name: "Cucumber", value: 3, color: "green"},
    {name: "Pineapple", value: 1, color: "gold"},
    {name: "Grape", value: 10, color: "purple"}
];

const W = 800, H = 380;
const linked = d3.select("#container")
    .append("svg")
    .attr("width", W)
    .attr("height", H);

// scales map data values to pixels
const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([40, W - 40])
    .padding(0.3);
const radius = d3.scaleSqrt().domain([0, 10]).range([0, 50]);
const barY = d3.scaleLinear().domain([0, 10]).range([H - 30, 190]);

// view 1: bubbles
const bubbles = linked.append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.name) + x.bandwidth() / 2)
    .attr("cy", 90)
    .attr("r", d => radius(d.value))
    .attr("fill", d => d.color);

// view 2: bars
const bars = linked.append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.name))
    .attr("y", d => barY(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => barY(0) - barY(d.value))
    .attr("fill", d => d.color);

// x axis labels under the bars
linked.append("g")
    .attr("transform", `translate(0, ${H - 30})`)
    .call(d3.axisBottom(x));

// linking: one function updates BOTH views
function highlight(name) {
  [bubbles, bars].forEach(sel => sel
      .attr("opacity", d => d.name === name ? 1 : 0.25)
      .attr("stroke", d => d.name === name ? "black" : "none")
      .attr("stroke-width", 3));
}
function reset() {
  [bubbles, bars].forEach(sel => sel
      .attr("opacity", 1)
      .attr("stroke", "none"));
}

// ---------- Tech3: tooltip, labels, animation ----------
const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "rgba(0,0,0,0.85)")
    .style("color", "white")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font", "14px sans-serif")
    .style("opacity", 0);

[bubbles, bars].forEach(sel => sel
    .on("mouseover", (event, d) => {
        highlight(d.name);
        tooltip.style("opacity", 1)
            .html(`<b>${d.name}</b><br>Value: ${d.value}`);
    })
    .on("mousemove", event => {
        tooltip.style("left", (event.pageX + 12) + "px")
               .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
        reset();
        tooltip.style("opacity", 0);
    }));

// value labels on the bars
linked.append("g")
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("x", d => x(d.name) + x.bandwidth() / 2)
    .attr("y", d => barY(d.value) - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 14)
    .attr("pointer-events", "none")
    .text(d => d.value);

// entrance animation
bars.attr("y", barY(0))
    .attr("height", 0)
    .transition()
    .duration(1000)
    .delay((d, i) => i * 150)
    .attr("y", d => barY(d.value))
    .attr("height", d => barY(0) - barY(d.value));

bubbles.attr("r", 0)
    .transition()
    .duration(1000)
    .delay((d, i) => i * 150)
    .attr("r", d => radius(d.value));