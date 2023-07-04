const vname = document.getElementById("evname")
const loc = document.getElementById("elocation")
const para = document.getElementById("evpara")
const capacity = document.getElementById("ecapacity")




const mySelect = document.getElementById('Evenue');
mySelect.addEventListener('change', (event) => {

  const selectedId = event.target.value;
  console.log(selectedId);


  //fetching data from database
  fetch(`/data?id=${selectedId}`)
  .then(response => response.json())
  .then(venue => {
        vname.value = venue.name
        loc.value = venue.location
        para.value = venue.desc
        capacity.value = venue.capacity
  })
  .catch(error => console.error(error));

});  