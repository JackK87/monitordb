const sql = require('mssql')

const router = require('koa-router')
const homeControler = require('./controllers/HomeController')

const mapping = router()

mapping.get("/sql", async (ctx, next) => {
  result = await homeControler()

  ctx.body = result
});
  
  mapping.get("/", async (ctx, next) => {
    let pool = await sql.connect(
      "Driver=msnodesqlv8;Server=R04PAC1CDB01T\\TEST;Database=R04-AO-ASZUP-TEST;UID=MAIN\\Evgeniy.Krokhin;PWD=Jekagud/*;Encrypt=true"
    );
  
    console.log(pool);

   /* let listTables = await pool
      .request()
      .query(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%InfoRg[0-9]%'"
      )
      .catch((err) => {
        console.log(err);
      });
  */
    let listColumns = undefined,
      filteredColumns = undefined,
      dataTable = undefined,
      resultData = undefined,
      isCheckColumns = false,
      isCheckData = false;
   
    if (typeof listTables == "object" && listTables.hasOwnProperty("recordset")) {
      listColumns = await pool
        .request()
        .query(
          "SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME LIKE '%InfoRg[0-9]%'"
        )
        .catch((err) => {
          console.log(err);
        });
  
      listTables = listTables.recordset;
    }
  
    if (
      typeof listColumns == "object" &&
      listColumns.hasOwnProperty("recordset")
    ) {
      listColumns = listColumns.recordset;
  
      for (let index = 0; index < listTables.length; index++) {
        const table = listTables[index];
        filteredColumns = listColumns.filter(
          (columns) => columns.TABLE_NAME == table.TABLE_NAME
        );
  
        if (filteredColumns.length !== 4) continue;
  
        for (let indexRow = 0; indexRow < filteredColumns.length; indexRow++) {
          const columns = filteredColumns[indexRow];
         
          isCheckColumns = checkColumn(columns);
         // console.log('isCheckColumns - ' + isCheckColumns.toString())
          if (isCheckColumns) break;
        }
  
        if (isCheckColumns) {
          dataTable = await pool
            .request()
            .query("SELECT top(5) * FROM " + table.TABLE_NAME)
            .catch((err) => {
              console.log(err);
            });
  
          if (typeof dataTable == 'object' && dataTable.hasOwnProperty('recordset')) {
            dataTable = dataTable.recordset;
  
            for (let indexDataRow = 0; indexDataRow < dataTable.length; indexDataRow++) {
              isCheckData = checkData(dataTable[indexDataRow]);
              
              if (isCheckData)
                break;
            }
          }
        }
  
        if (isCheckData) {
          resultData = await pool.request().query('SELECT * FROM ' + table.TABLE_NAME)
          break;
        }
         
      }
    }
  
    ctx.body = resultData;
  });

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

  module.exports = mapping.routes()