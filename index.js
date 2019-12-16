function display(form) {
  if (form.username.value == "root") {
    if (form.password.value == "root") {
      if (db.users[db.user].isEmployee){
        location = "admin.html"
      }
      else{
        alert("Вы не сотрудник")
      }
    } else {
      alert("Некорректный пароль")
    }
  } else {
    alert("Некорректный логин")
  }
}

function updateDb() {
  localStorage.setItem('libraryDb', JSON.stringify(db))
}

function loadTable() {
  if (db.page === 'customers') {
    loadCustomers()
    $('#remove').show()
  }
  else if (db.page === 'cities') {
    loadCities()
    $('#remove').hide()
  }
  else if (db.page === 'meteo') {
    loadMeteo()
    $('#remove').hide()
  }
}

function loadCities() {
  var data = []
  for (var i = 0; i < db.cities.length; i++) {
    var city = db.cities[i]
    data.push([city.city, city.country, city.lat, city.lon])
  }
  $('.table-container').hide()
  $('#cities').parent().parent().show()
  dts.cities.clear()
  dts.cities.rows.add(data)
  dts.cities.draw()
}

function loadMeteo() {
  var data = []
  for (var i = 0; i < db.meteo.length; i++) {
    var meteo = db.meteo[i]
    data.push([meteo.date, meteo.city, meteo.temperature, meteo.humidity, meteo.pressure, meteo.wind_direction, meteo.wind_speed])
  }
  $('.table-container').hide()
  $('#meteo').parent().parent().show()
  dts.meteo.clear()
  dts.meteo.rows.add(data)
  dts.meteo.draw()
}

function loadCustomers() {
  var data = []
  for (var i = 0; i < db.users.length; i++) {
    var user = db.users[i]
    data.push([user.id, user.login, user.isEmployee ? "Да" : "Нет"])
  }
  $('.table-container').hide()
  $('#customers').parent().parent().show()
  dts.customers.clear()
  dts.customers.rows.add(data)
  dts.customers.draw()
}

function deleteEntity() {
  var q = ({
    customers: 'Какого пользователя удалить? (ID)'
  })[db.page]
  var table = ({
    customers: db.users
  })[db.page]
  var id = parseInt(prompt(q))
  if (isNaN(id) || id >= table.length || id < 0) return
  table.splice(id, 1)
  updateDb()
  loadTable()
}

function addEntity() {
  var scheme = ({
    customers: [['Введите логин', 'login']],
    cities: [['Город', 'city'], ['Страна', 'country'], ['Ширина', 'lat'], ['Долгота', 'lon']],
    meteo: [['Месяц', 'date'], ['Город', 'city'], ['Температура', 'temperature'], ['Влажность', 'humidity'], ['Давление', 'pressure'], ['Направление ветра', 'wind_direction'], ['Скорость ветра', 'wind_speed']]
  }[db.page])
  var endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)
  var ent = ({
    customers: { isEmployee: false },
    orders: { start: new Date().toLocaleString('ru'), end: endDate.toLocaleString('ru') },
    books: {},
    cities: {},
    meteo: {}
  })[db.page]
  var table = ({
    customers: db.users,
    books: db.books,
    orders: db.orders,
    cities: db.cities,
    meteo: db.meteo
  })[db.page]
  ent.id = table.length
  for (var i = 0; i < scheme.length; i++) {
    var qf = scheme[i]
    var q = qf[0]
    var field = qf[1]
    var answer = prompt(q)
    if (answer === null) return
    ent[field] = ~['bookId', 'userId'].indexOf(field) ? Number(answer) : answer
  }
  table.push(ent)
  updateDb()
  loadTable()
}

function loadUser() {
  var user = db.users[db.user]
  $('.greet-name').text(user.login)
  $('.greet-role').text(user.isEmployee ? 'сотрудник' : 'читатель')
  if (user.isEmployee) {
    $('.buttons').show()
  } else {
    $('.buttons').hide()
  }
  updateDb()
}

function loadPage() {
  $('.body').removeClass('loaded')
  $('.nav[data-nav=' + db.page + ']').addClass('selected')
  loadUser()
  loadTable()
  updateDb()
  $('.body').addClass('loaded')
}

$('.nav').click(function () {
  $('.nav').removeClass('selected')
  db.page = $(this).addClass('selected').data('nav')
  updateDb()
  loadTable()
})

$('.greet-name').click(function () {
  var login = prompt('Представьтесь, пожалуйста')
  if (login === null) return
  if (login === 'clr') {
    localStorage.clear('libraryDb')
    location.reload()
    return
  }
  var found = false
  db.user = db.users.length
  $(db.users).each(function (i, user) {
    if (user.login !== login) return
    db.user = i
    found = true
  })
  if (!found) db.users.push({
    id: db.users.length,
    login: login,
    isEmployee: false,
  })
  db.page = 'cities'
  loadPage()
})

function hideTables(document) {
  var table_data = document.getElementsByClassName("table_data")[0];
  var hide_button = document.getElementById("hide_button");
  if (table_data.style.display === "none") {
    table_data.style.display = "block";
  } else {
    table_data.style.display = "none";
  }
}

function makeGraph(document) {
  var data = [];
  cities = [];
  measurement = document.getElementsByName("hero")[0].selectedOptions[0].value.split("|");
  measurement_name = measurement[1];
  measurement_desc = measurement[0];

  for (var i = 0; i < db.cities.length; i++)
    cities.push(db.cities[i].city)
  
  var all_y = [];
  for (var j = 0; j < cities.length; j++) {
    city = cities[j];
    var dataSeries = { type: "line" };
    var dataPoints = [];
    for (var i = 0; i < db.meteo.length; i++) {
      var meteo = db.meteo[i]
      if (city == meteo.city) {
        x = new Date(meteo.date);
        y = meteo[measurement_desc];
        all_y.push(y);
        dataPoints.push({ x: x, y: y });
      }
    }
    dataSeries.showInLegend = true;
    dataSeries.name = city
    dataSeries.dataPoints = dataPoints;
    data.push(dataSeries);
  }
  var max_y = Math.max.apply(null, all_y);
  var min_y = Math.min.apply(null, all_y);

  var options = {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Метеорологические наблюдения по городам"
    },
    axisX: {
      includeZero: false,
      lineThickness: 1,
      crosshair: {
        enabled: true,
        snapToDataPoint: true
      }
    },
    axisY: {
      minimum: min_y - (max_y - min_y) * 0.3,
      maximum: max_y + (max_y - min_y) * 0.3,
      title: measurement_name,
      crosshair: {
        enabled: true
      }
    },
    toolTip: {
      shared: true
    },
    legend: {
      cursor: "pointer",
      verticalAlign: "bottom",
      horizontalAlign: "left",
      dockInsidePlotArea: true,
    },
    data: data
  };

  var chart = new CanvasJS.Chart("chartContainer", options);
  chart.render();
}

if (!localStorage) alert('Ваш браузер устарел, приложение будет работать некорректно')
$('#add').click(addEntity)
$('#remove').click(deleteEntity)

// var db = JSON.parse(defaultDb)
var db = JSON.parse(localStorage.getItem('libraryDb') || defaultDb)
loadPage()
window.onload = makeGraph(document)