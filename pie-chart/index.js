const form = document.querySelector('form');
const name = document.querySelector('#name');
const cost = document.querySelector('#cost');
const error = document.querySelector('#error');


form.addEventListener('submit', (e)=>{
   e.preventDefault();

   if (name.value && cost.value) {
      const item = {
          name: name.value,
          cost: +cost.value
      }
      db.collection('expenses').doc(name.value).set(item).then((res) => {
        console.log(res);
        name.value = "";
        cost.value = "";
    })
}
//     if (!cost.value) {
//       db.collection('expenses').remove(name.value);
    
//    } 

else {
       error.textContent = 'Enter values'
   }

  
})



// trying to do a delete
// db.collection('expenses').get().then((res) => {
//     console.log(res);
//     var data = [];
//     res.docs.forEach((doc) => {
//         data.push(doc.data())
//         console.log(data);
//     })
// })