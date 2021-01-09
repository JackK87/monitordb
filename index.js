const koa = require("koa")
const router = require("./routes")
const sql = require("mssql")

const app = new koa()

app.use(router);

app.listen(3000, function () {
  console.log("Сервер запущен!!!");
});
