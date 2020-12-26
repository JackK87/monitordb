const koa = require("koa")
const router = require("./routes")
const sql = require("mssql")

const app = new koa()

function checkColumn(columns) {
  if (typeof columns == "object" && columns.hasOwnProperty('COLUMN_NAME') && columns.COLUMN_NAME == '_Period') 
    return true

  return false
}

function checkData(data) {
  let isPointExchange = false,
  isVersionPlatform = false

  for (const key in data) {
    if (data.hasOwnProperty(key) && data[key] == 'ALT')
      isPointExchange = true
      
    if (data.hasOwnProperty(key) && (data[key].toString().indexOf('8.2.') || data[key].toString().indexOf('8.3.'))) 
      isVersionPlatform = true
  }

  return isPointExchange && isVersionPlatform;
}

app.use(router);

app.listen(3000, function () {
  console.log("Сервер запущен!!!");
});
