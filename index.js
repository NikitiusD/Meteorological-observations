function updateDb() {
  localStorage.setItem('libraryDb', JSON.stringify(db))
}

function loadTable() {
  // if (db.page === 'orders')
  //   loadOrders()
  if (db.page === 'customers')
    loadCustomers()
  // else if (db.page === 'books')
  //   loadBooksTable()
  else if (db.page === 'cities')
    loadCities()
  else if (db.page === 'meteo')
    loadMeteo()
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

// function loadBooksTable() {
//   var data = []
//   for (var i = 0; i < db.books.length; i++) {
//     var book = db.books[i]
//     data.push([book.id, book.title, book.author, book.desc, '<img height=128 src="' + book.coverUrl + '">'])
//   }
//   $('.table-container').hide()
//   $('#books').parent().parent().show()
//   dts.books.clear()
//   dts.books.rows.add(data)
//   dts.books.draw()
// }

function loadCustomers() {
  var data = []
  for (var i = 0; i < db.users.length; i++) {
    var user = db.users[i]
    if (!user.isEmployee)
      data.push([user.id, user.login])
  }
  $('.table-container').hide()
  $('#customers').parent().parent().show()
  dts.customers.clear()
  dts.customers.rows.add(data)
  dts.customers.draw()
}

// function loadOrders() {
//   var data = []
//   for (var i = 0; i < db.orders.length; i++) {
//     var order = db.orders[i]
//     data.push([order.id, order.userId, order.bookId, order.start, order.end])
//   }
//   $('.table-container').hide()
//   $('#orders').parent().parent().show()
//   dts.orders.clear()
//   dts.orders.rows.add(data)
//   dts.orders.draw()
// }

function addEntity() {
  var scheme = ({
    customers: [['Введите логин', 'login']],
    orders: [['Пользователь (ID)', 'userId'], ['Книга (ID)', 'bookId']],
    books: [['Название', 'title'], ['Автор', 'author'], ['Описание', 'desc'], ['Обложка', 'coverUrl']],
    cities: [['Город', 'city'], ['Страна', 'country'], ['Ширина', 'lat'], ['Долгота', 'lon']],
    meteo: [['Месяц', 'date'], ['Город', 'city'], ['Температура', 'temperature'], ['Влажность', 'humidity'], ['Давление', 'pressure'], ['Направление ветра', 'wind_direction'], ['Скорость ветра', 'wind_speed']]
  }[db.page])
  var endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)
  var ent = ({
    customers: { isEmployee: false },
    orders: { start: new Date().toLocaleString('ru'), end: endDate.toLocaleString('ru') },
    books: {},
  })[db.page]
  var table = ({
    customers: db.users,
    books: db.books,
    orders: db.orders
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

$('.nav').click(function() {
  $('.nav').removeClass('selected')
  db.page = $(this).addClass('selected').data('nav')
  updateDb()
  loadTable()
})

$('.greet-name').click(function() {
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

$('#add').click(addEntity)

if (!localStorage) alert('Ваш браузер устарел, приложение будет работать некорректно')

var db = JSON.parse(defaultDb)
// var db = JSON.parse(localStorage.getItem('libraryDb') || defaultDb)
loadPage()
