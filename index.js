


// select the svg conatiner first
const svg = d3.select('.canvas')
.append('svg')
.attr('width', 600)
.attr('height', 600);

// create margins and dimensions

const margin = {top: 20, right: 20, bottom: 100, left: 100}
const graphWidth = 600 - margin.left - margin.right
const graphHeight = 600 - margin.top - margin.bottom

const graph = svg.append('g')
.attr('width', graphWidth)
.attr('height', graphHeight)
.attr('transform', `translate(${margin.left}, ${margin.top})`)


const xAxisGroup = graph.append('g').attr('transform', `translate(0, ${graphHeight})`)
const yAxisGroup = graph.append('g')

const y = d3.scaleLinear() 
.range([graphHeight, 0]); 

 const x = d3.scaleBand()
.range([0, 500])
.paddingInner(0.2)
.paddingOuter(0.2);

//create and call axis
const xAxis = d3.axisBottom(x)
const yAxis = d3.axisLeft(y)
.ticks(3)
.tickFormat(d => d + ' orders');

xAxisGroup.selectAll('text')
.attr('transform', 'rotate(-40)')
.attr('text-anchor', 'end')
.attr('fill', 'orange')




  //update function
  
  const update = (data) => {
    
    //updating scale domains
    y.domain([0, d3.max(data, d => d.orders)])
    x.domain(data.map(item => item.name))
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
    .attr('fill', 'orange') 
    .attr('x', d=>x(d.name))
    .transition().duration(2000)
    .attr("height", d => graphHeight - y(d.orders))
    .attr('y', d=>y(d.orders))


    // .attr('x', d => x(d.name))
 

  // attr shapes ready in virtual dom to be created based on data amount
  rects.enter()
    .append('rect')
      .attr('width', x.bandwidth)
      //set 0 initial to transition
     .attr('height', 0)
    //   .attr("height", d => graphHeight -  y(d.orders))
      .attr('fill', 'orange')
      .attr('x', (d) => x(d.name))
    .attr('y', graphHeight)
    .transition().duration(2000)
    .attrTween('width', widthTween)
    //final transition values
          .attr('y', d=>y(d.orders))
          .attr("height", d => graphHeight - y(d.orders))

      // call puts inside the group
      xAxisGroup.call(xAxis)
      yAxisGroup.call(yAxis)
      
  }


  // onSnapchat is eventlistener for db
  
  var data = []; 

  db.collection('dishes').onSnapshot(res => {
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
    return i(t);
  }

}