const dims = { height: 300, width: 300, radius: 150}
const cent = { x: (dims.width / 2 + 100), y: (dims.height / 2 + 5)};

const svg = d3.select('.canvas').append('svg')
.attr('width', dims.width + 150)
.attr('height', dims.height + 150)

const graph = svg.append('g')
.attr('transform', `translate(${cent.x}, ${cent.y})`)

const pie = d3.pie()
.sort(null)
//generates angles based on cost path generator needs these angles as input
.value(d => d.cost);

// const angles = pie([
//     { name: 'rent', cost:500},
//     { name: 'bills', cost:300},
//     { name: 'gaming', cost:200}
// ]) 

const arcPath = d3.arc()
.outerRadius(dims.radius )
.innerRadius(dims.radius / 2)

const colour = d3.scaleOrdinal(d3['schemeSet3']);

//legend setup

const legendGroup = svg.append('g')
.attr('transform', `translate(${dims.width + 120}, 10)`)

const legend = d3.legendColor()
.shape('circle')
.shapePadding(10)
.scale(colour);

// tips
// tip card is materialize css class
const tip = d3.tip()
.attr('class', 'tip card')
.html(d => {
   let content = `<div class="name">${d.data.name}</div>`;
   content+= `<div class="cost">${d.data.cost}</div>`
   content+= `<div class="delete">Click slice to delete</div>`
   return content;
})

graph.call(tip);


console.log(colour);

console.log(arcPath);

// data array and firestore


const update = (data) => {
    console.log(data);

//update color scale domain
colour.domain(data.map((d) => {
return d.name
})) 


// update and call legend

legendGroup.call(legend);
legendGroup.selectAll('text').attr('fill', 'white');



    //join enahnced (pie) data to path elements
    const paths = graph.selectAll('path')
    .data(pie(data));

   paths.exit()
   .transition().duration(750)
   .attrTween("d", arcTweenExit)
   .remove()

   //updates current attrs in dom with new paths 
   paths.attr('d', arcPath)
   .transition()
   .duration(750)
   .attrTween('d', arcTweenUpdate);

   //appends new ones / virtual
    paths.enter()
    .append('path')
    .attr('class', 'arc')
    //dont need this 'd' arcpath below cause done above i think?
    .attr('d', arcPath)
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .attr('fill', d => colour(d.data.name))
    .each(function(d){
        //this = current path
        this._current = d
    })
    .transition().duration(750)
    .attrTween("d", arcTweenEnter)

//add events

graph.selectAll('path')
// if only using one mouseover justu use e.g .on('mouseover', handleMouseOver)
.on('mouseover', (d, i, n) => {
    //n[i] same as 'this' but cant use 'this' cause of syntax?
    tip.show(d, n[i]);
    handleMouseOver(d, i, n)

})
.on('mouseout', (d,i,n) => {
    tip.hide();
    handleMouseOut(d, i, n);
})
.on('click', handleClick)

    console.log(paths.enter());
}




var data = [];

db.collection('expenses').onSnapshot((res)=>{
    res.docChanges().forEach((change => {
        const doc = {...change.doc.data(), id: change.doc.id};
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
         
    }))
    
    update(data);
})



const arcTweenEnter = (d) => {

    var i = d3.interpolate(d.endAngle, d.startAngle);
  
    // t = ticker value between 0 and 1 how far in transition you are?
   // d = individual piece from data
  
    return function(t){
        // console.log(t);
        // console.log(d);
      d.startAngle = i(t);
      return arcPath(d)
    }
  }

  const arcTweenExit = (d) => {

    var i = d3.interpolate(d.startAngle, d.endAngle);
  
    // t = ticker value between 0 and 1 how far in transition you are?
   // d = individual piece from data
  
    return function(t){
        // console.log(t);
        // console.log(d);
      d.startAngle = i(t);
      return arcPath(d)
    }
  }

  function arcTweenUpdate(d) {
      // d here = updated data
      // original data stored above in each()
      //current state to new state of each data piece
var i = d3.interpolate(this._current, d);
//this = current , d = next angle
      console.log(this._current, d);

      //update current prop with new updated data

      this._current = d; // can also write this._current = i(1);

return function(t){
    //redraw paths with arc
    return arcPath(i(t));
}

  }
// auto passes d, i, n
  const handleMouseOver = (d, i, n) => {
   console.log(n[i]);
   d3.select(n[i])
     .transition('changeSliceFill').duration(150)
     .attr('fill', 'white')
  }

  const handleMouseOut = (d, i ,n) => {
      d3.select(n[i])
      .transition('changeSliceFill').duration(150)
      .attr('fill', colour(d.data.name));
  }

  const handleClick = (d) => {
       console.log(d);
      const id = d.data.id;

      db.collection('expenses').doc(id).delete();
  }