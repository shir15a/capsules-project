const usersData = 'https://appleseed-wa.herokuapp.com/api/users/'

const table = document.querySelector(".table")
const tableBody = document.querySelector(".table-body");
const dropDown = document.querySelector(".drop-down");
const inputBox = document.querySelector(".input-box");
const sortBy = document.querySelector(".sort-by");
const dropDownObj = { firstName: 1, lastName: 2, capsule: 3, age: 4, city: 5, gender: 6, hobby: 7 };

let dropDownValue = '';
let valueSort = '';
let studentDataRow = [];
let curStusentDetails = [];

// sort by (drop down) eventListener
sortBy.addEventListener('change', (e) => {
  valueSort = e.target.value;
  sortTableBy();
})

// input search eventListener
inputBox.addEventListener('input', (e) => {
  searchInTable(e.target.value)
})

// drop down eventListener
dropDown.addEventListener('change', (e) => {
  dropDownValue = dropDownObj[e.currentTarget.value];
})

//Icon`s Events:
tableBody.addEventListener('click', (e) => {
  // let rowIndex = e.target.parentElement.parentElement.parentElement.rowIndex;
  tableActions(e.target)
})

function tableActions(tragetEl) {
  if (tragetEl.classList.contains('delete')) {
    tragetEl.parentElement.parentElement.parentElement.remove();
  }
  if (tragetEl.classList.contains('edit')) {
    edit(tragetEl.parentElement.parentElement.parentElement);
  }
  if (tragetEl.classList.contains('accept')) {
    updateAfterEdit(tragetEl.parentElement.parentElement.parentElement);
  }
  if (tragetEl.classList.contains('cancel')) {
    cancelEdit(tragetEl.parentElement.parentElement.parentElement);
  }
}

async function sortTableBy() {
  let arr = await allData();
  let arrAfterSort = arr.sort((a, b) => a[valueSort].toString().localeCompare(b[valueSort].toString()));
  tableBody.innerHTML = "";
  arrAfterSort.forEach((row) => addToTable(row))
}

// search in table
function searchInTable(input) {
  let filter, tr, td, i, txtValue;
  filter = input.toUpperCase();
  tr = document.querySelectorAll("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[parseInt(dropDownValue)];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) tr[i].style.display = "";
      else tr[i].style.display = "none";
    }
  }
}

async function updateTd(studentDetails) {
  let cityWeather = await citiesWeather(studentDetails[5])
  return `
      <td>${studentDetails[0]}</td>
      <td>${studentDetails[1]}</td>
      <td>${studentDetails[2]}</td>
      <td>${studentDetails[3]}</td>
      <td>${studentDetails[4]}</td>
      <td class="tooltip">${studentDetails[5]}
      <span class="tooltiptext">${cityWeather}°C</span></td>
      <td>${studentDetails[6]}</td>
      <td>${studentDetails[7]}</td>
      <td><a href="#" class="btn-i"> <i class="fas fa-edit edit"></i></a></td>
      <td><a href="#" class="btn-i"><i class="fas fa-trash-alt delete"></i></a></td>`
}

async function cancelEdit(row) {
  row.innerHTML = await updateTd(studentDataRow)
}

async function updateAfterEdit(rowToUpdate) {
  curStusentDetails = []
  for (let i = 0; i < 8; i++) {
    if (i === 0) { curStusentDetails.push(rowToUpdate.children[i].innerHTML) }
    else { curStusentDetails.push(rowToUpdate.children[i].firstChild.value) };
  }
  rowToUpdate.innerHTML = await updateTd(curStusentDetails)
  studentDataRow = curStusentDetails;
}

function edit(studentRow) {
  let allTd = studentRow.querySelectorAll('td');
  studentDataRow = [];
  allTd.forEach((col, index) => {
    if (index === 5) { studentDataRow.push(col.firstChild.nodeValue) }
    else { studentDataRow.push(col.innerHTML) }

  })
  studentRow.innerHTML = `
  <td>${studentDataRow[0]}</td>
  <td><input class="input" value="${studentDataRow[1]}"></td>
  <td><input class="input" value="${studentDataRow[2]}"></td>
  <td><input class="input" value="${studentDataRow[3]}"></td>
  <td><input class="input" value="${studentDataRow[4]}"></td>
  <td><input  class="input" value="${studentDataRow[5]}"></td>
  <td><input class="input" value="${studentDataRow[6]}"></td>
  <td><input  class="input" value="${studentDataRow[7]}"></td>
  <td><a href="#" class="btn-i"><i class="far fa-times-circle cancel"></i></a></td>
  <td><a href="#" class="btn-i"><i class="far fa-check-circle accept"></i></a></td>`;
}

function addToTable(student) {
  const row = document.createElement('tr');
  row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.firstName}</td>
      <td>${student.lastName}</td>
      <td>${student.capsule}</td>
      <td>${student.age}</td>
      <td class="tooltip">${student.city}
      <span class="tooltiptext">${student.cityWeather}°C</span></td>
      <td>${student.gender}</td>
      <td>${student.hobby}</td>
      <td><a href="#" class="btn-i"> <i class="fas fa-edit edit"></i></a></td>
      <td><a href="#" class="btn-i"><i class="fas fa-trash-alt delete"></i></a></td>`;
  tableBody.appendChild(row);
}

async function citiesWeather(cityName) {
  const weatherApi = 'http://api.openweathermap.org/data/2.5/weather?q=';
  const endweatherApi = '&APPID=4862b650f44d0f9aff5e6d1f242624be';
  const proxy = 'https://api.codetabs.com/v1/proxy/?quest=';
  const country = 'israel';
  const response = await fetch(`${proxy}${weatherApi}${cityName},${country}${endweatherApi}`);
  const data = await response.json();
  if (data.main) {
    let celsius = parseInt(data.main.temp) - 273.15;
    return celsius.toFixed(2);
  }
  return "city not found"
}

function meargeAllData(student, studentSecond, weather) {
  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    capsule: student.capsule,
    age: studentSecond.age,
    city: studentSecond.city,
    gender: studentSecond.gender,
    hobby: studentSecond.hobby,
    cityWeather: weather
  }
}

//students arr with all data
async function allData() {
  let studentsArr = [];
  const students = `${usersData}`;
  const response = await fetch(students);
  const firstData = await response.json();
  for (let i = 0; i < firstData.length; i++) {
    const studentSecond = `${usersData}+${firstData[i].id}`
    const response = await fetch(studentSecond);
    const secondData = await response.json();
    studentsArr.push(meargeAllData(firstData[i], secondData, await citiesWeather(secondData.city)))
  }
  return studentsArr;
}

async function setDataToTable() {
  let tableData = await allData()
  tableData.forEach((row) => {
    addToTable(row)
  })
}

setDataToTable()