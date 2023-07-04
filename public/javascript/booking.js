const prev = document.getElementById("prev")
const next = document.getElementById("next")
const optionsTop = document.getElementById('optionsTop');
const extraData = document.getElementById('extra-data');



prev.addEventListener('click', function() {
    refresh()
  });


next.addEventListener('click', function() {
    refresh()
});


let curDate = document.getElementById("current-date")
let cdate = curDate.innerHTML.split(' ');
let month = cdate[0]
let year = cdate[1]


refresh()  




function refresh(){
    curDate = document.getElementById("current-date")
    cdate = curDate.innerHTML.split(' ');
    month = cdate[0]
    year = cdate[1]

    monthNumber = getMonthNumber(month)

    const listItems = document.querySelectorAll('#days li');



    listItems.forEach(function(day) {
        day.addEventListener('click', function() {
        getDate(year, monthNumber, day.innerText)
      });
    });

}





function getDate(year, monthNum, day) {
    const week = getWeekday(year, monthNum-1, day)
    console.log(week + " " + day + "/" + monthNum + "/" + year);
    
   
    // adding a new element to dom

    const dateText = `${day} ${month}`;
  
    // Check if an existing element has the same date
    const existingElement = [...optionsTop.querySelectorAll('.options-date')].find(el => el.textContent === dateText);
    if (existingElement) {
      console.log('Element already exists with date:', dateText);
      return;
    }




    const newDiv = document.createElement('div')
    newDiv.classList.add('options-day')
    const id = day+"-"+month
    newDiv.setAttribute('id',id);
    newDiv.innerHTML = `
      <div class="options-date">${day} ${month}</div>
      <div class="options-time">
        <div class="options-start-time">
          <!-- <label for="">START TIME</label> -->
          <input name="stime" type="time">
        </div>
        <div class="options-end-time">
          <!-- <label for="">END TIME</label> -->
          <input name="etime" type="time">
        </div>
      </div>
      <input value=${year} name="year" class="hide" type="text">
      <input value=${monthNum-1} name="month" class="hide" type="text">
      <input value=${day} name="day" class="hide" type="text">
      <button onclick="deleteEle('${id}')" class="del-date"><i class="fa-solid fa-xmark" ></i></button>
    `
    optionsTop.appendChild(newDiv)


    // const inputDay = document.createElement('input')
    // inputDay.classList.add('hide')
    // inputDay.classList.add(id)
    // inputDay.setAttribute('value', day);
    // inputDay.setAttribute('name', 'day');
    // extraData.appendChild(inputDay)

    // const inputYear = document.createElement('input')
    // inputYear.classList.add('hide')
    // inputYear.classList.add(id)
    // console.log(year);
    // inputYear.setAttribute('value', year);
    // inputYear.setAttribute('name', 'year');
    // extraData.appendChild(inputYear)



    }





function getWeekday(year, month, day) {
    const date = new Date(year, month, day);
    const weekdayIndex = date.getDay();
    const options = { weekday: 'long' };
    const weekdayName = date.toLocaleDateString('en-US', options);
    return weekdayName
  }




function getMonthNumber(monthName) {
    let monthNumber;
    switch(monthName.toLowerCase()) {
      case 'january':
        monthNumber = 1;
        break;
      case 'february':
        monthNumber = 2;
        break;
      case 'march':
        monthNumber = 3;
        break;
      case 'april':
        monthNumber = 4;
        break;
      case 'may':
        monthNumber = 5;
        break;
      case 'june':
        monthNumber = 6;
        break;
      case 'july':
        monthNumber = 7;
        break;
      case 'august':
        monthNumber = 8;
        break;
      case 'september':
        monthNumber = 9;
        break;
      case 'october':
        monthNumber = 10;
        break;
      case 'november':
        monthNumber = 11;
        break;
      case 'december':
        monthNumber = 12;
        break;
      default:
        monthNumber = null;
    }
    return monthNumber;
  }



//remove div from dom

function deleteEle(id){
    ele = document.getElementById(id)
    ele.remove()
    
    // delElements = document.getElementsByClassName(id)
    // // console.log(delElements[]);
 
    // for (var i = 0; i < delElements.length; i++) {
    //     const e = delElements[i];
    //     console.log(e);
    //     e.remove()
    //   }
    
}



