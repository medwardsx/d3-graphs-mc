//colourLegend handlers
(function() {

const colourLegend = (selection, props) => {
  const {
    colorScale,
    width,
    height,
  } = props;

  const groups = selection.selectAll('g')
    .data(colorScale.domain());


  const groupsEnter = groups
    .enter().append('g')
      .attr('class', 'tick');
  groupsEnter
    .merge(groups)
      .attr('transform', (d, i) =>
        `translate(${i * 100}, ${0})`
      );
  groups.exit().remove();

  groupsEnter.append('rect')
  .attr('width', width)
  .attr('height', height)
  .attr('stroke', 'black')
  .attr('stroke-width', 2)

    // .merge(groups.select('rect'))
      .attr('fill', colorScale);

  groupsEnter.append('text')
    .merge(groups.select('text'))
      .text(d => d)
      .attr('dy', '0.32em')
      .attr('x', 30)
      .attr('y', 10)
}








// select the svg conatiner first
const svg = d3.select('.figure4')
.append('svg')
.attr('width', 700)
.attr('height', 700);

// create margins and dimensions

const margin = {top: 150, right: 20, bottom: 100, left: 200}
const graphWidth = 600 - margin.left - margin.right
const graphHeight = 600 - margin.top - margin.bottom

const graph = svg.append('g')
.attr('width', graphWidth)
.attr('height', graphHeight)
.attr('transform', `translate(${margin.left}, ${margin.top})`)


const xAxisGroup = graph.append('g').attr('transform', `translate(0, ${graphHeight})`)
.attr('stroke', 'black')
.attr('stroke-width', 1.2)
const yAxisGroup = graph.append('g')
.attr('stroke', 'black')
.attr('stroke-width', 1.2)



const y = d3.scaleLinear() 
.range([graphHeight, 0]); 

 const x = d3.scaleBand()
.range([0, 500])
.paddingInner(0.2)
.paddingOuter(0.2);

//create and call axis
const xAxis = d3.axisBottom(x)
const yAxis = d3.axisLeft(y)
.ticks(10)
.tickFormat(d => d);

// xAxisGroup.selectAll('text')
// .attr('transform', 'rotate(-40)')
// .attr('text-anchor', 'end')





yAxisGroup.append("text")
.attr('transform', 'rotate(-90)')
.attr("y", -70)//magic number here
.attr("x",  -250)
.attr('text-anchor', 'start')

.attr("class", "myLabel")//easy to style with CSS
.text("Proportion (%) of patients in remission")



  //update function
  
  const update = (data) => {

    //updating scale domains
    //100 can be d3.max(data, d => d.order)] for scaling
    y.domain([0, 100])
    //manually ordered from d => data.name
    x.domain(['Month 2', 'Month 12', 'Month 24', 'Month 36'])
   //join the data to rects

    const rects = graph.selectAll('rect')
    .data(data);

    // graph.append('rect')
    // graph.append('rect')
    // graph.append('rect')
    
//remove unwanted rects from dom rather than just remove from d3 scales
    rects.exit().remove();

    //attr current shapes in dom from start e.g in html or appended
    rects.attr('width', x.bandwidth)
    .attr('fill', 'blue') 
    .attr('x', d=>x(d.name))
    .transition().duration(2000)
    .attr("height", d => graphHeight - y(d.order))
    .attr('y', d=>y(d.order))
    


    // .attr('x', d => x(d.name))
 

  // attr shapes ready in virtual dom to be created based on data amount
  rects.enter()
    .append('rect')
      .attr('width', x.bandwidth)
      //set 0 initial to transition
     .attr('height', 0)
     .attr('stroke', 'black')
     .attr('stroke-width', 2)
    //   .attr("height", d => graphHeight -  y(d.orders))
      .attr('fill', 'blue')
      .attr('x', (d) => x(d.name))
    .attr('y', graphHeight)
    .transition().duration(2000)
    .attrTween('width', widthTween)
    //final transition values
          .attr('y', d=>y(d.order))
          .attr("height", d => graphHeight - y(d.order))
      
          rects.enter()
          .append('rect')
            .attr('width', x.bandwidth)
            //set 0 initial to transition
           .attr('height', 0)
           .attr('stroke', 'black')
           .attr('stroke-width', 2)
          //   .attr("height", d => graphHeight -  y(d.orders))
            .attr('fill', '#87CEFA')
            .attr('x', (d) => x(d.name))
          .attr('y', graphHeight)
          .transition().duration(2000)
          .attrTween('width', widthTween)
          //final transition values
                .attr('y', d=>y(d.order2))
                .attr("height", d => graphHeight - y(d.order2))
                .attr('transform', `translate(47.5, 0)`)
        
             


                rects.enter().append("text")
                .attr("class", "bar")
                .attr("text-anchor", "middle")
                .attr("x", function(d) { return x(d.name) + 22.5})
                .attr("y", function(d) { return  y(d.order) - 7; })
                .text(function(d) { return d.order; })
                rects.enter().append("text")
                .attr("class", "bar")
                .attr("text-anchor", "middle")
                .attr("x", function(d) { return x(d.name) + 72.5})
                .attr("y", function(d) { return  y(d.order2) - 7; })
                .text(function(d) { return d.order2; });




                //legend 
                //in firebase can add values then domain can be d => d.type
                const colorScale = d3.scaleOrdinal()
                .domain(['Observed', 'NRI-LOFC'])
                .range(['blue', '#87CEFA']);
              
              svg.append('g')
                  .attr('transform', `translate(${(graphWidth + margin.left + margin.right) / 2}, 100)`)
                  .call(colourLegend, {
                    colorScale,
                    width: 20,
                    height: 20
                  });

               
              
                  
      // call puts inside the group
      xAxisGroup.call(xAxis)
      yAxisGroup.call(yAxis)
      
  }


  // onSnapchat is eventlistener for db
  
  var data = []; 

  db.collection('billable-remission').onSnapshot(res => {
      //docChanges give us the difference between first snapshot (nothing) and second get which is our data basically
      console.log(res.docChanges());

    
      //each doc of actual data
      res.docChanges().forEach((change) => {
          console.log(change.doc.data());
        const doc = {...change.doc.data(), id: change.doc.id}
        console.log(doc);

        // if new then add
        //if find index of item in old array by matching ids 'change.doc.id' 
        // replace that index with new doc
        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
                case 'modified':
                    const index = data.findIndex(item => item.id == doc.id);
                    data[index] = doc;
                    break;
                    case 'removed':
                        data = data.filter(item => item.id !== doc.id);
                        break;
                        default:
                            break;
        }
         
      })
 
      update(data);
  })
  
  
  
//   .get().then(res => {

//     var data = [];

//     res.docs.forEach(doc => {
//        doc = doc.data();
//        data.push(doc)
//     })
//     update(data);

// should add event listener rather than use interval to update
    // d3.interval(() => {
    //    data[0].orders += 30
    //    update(data);
    // }, 5000)
  
// });

const widthTween = (data) => {

  let i = d3.interpolate(0, x.bandwidth());

  return function(t){
    console.log(i, t)
    return i(t) / 2;
  }
}
})();