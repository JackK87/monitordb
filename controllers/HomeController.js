const { RequestError } = require('mssql')
const mssql = require('../db_modules/mssql')

function checkColumn(columns) {
    if (typeof columns == "object" && columns.hasOwnProperty('COLUMN_NAME') && columns.COLUMN_NAME == '_Period') 
      return true
  
    return false
}
  
function checkData(data) {
    let isPointExchange = false, isVersionPlatform = false
  
    for (const key in data) {
      if (data.hasOwnProperty(key) && data[key] == 'ALT')
        isPointExchange = true
        
      if ( data.hasOwnProperty(key) && ( data[key].toString().indexOf('8.2.') || data[key].toString().indexOf('8.3.') ) ) 
        isVersionPlatform = true
    }
  
    return isPointExchange && isVersionPlatform;
}

module.exports = async () => {
    
    let workersql = new mssql('R04', 'R04PAC1CDB01T\\TEST', 'R04-AO-ASZUP-TEST', 'MAIN\\Evgeniy.Krokhin', 'Jekagud/*')

    await workersql.connection()

    let tables = await workersql.cmdExecute('R04', `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%InfoRg[0-9]%'`)
    let columns, resultData, isCheckData, isCheckColumns, filteredColumns, dataTable;

    if (typeof tables == "object" && tables.hasOwnProperty("recordset")) {
        tables = tables.recordset

        columns = await workersql.cmdExecute('R04', `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME LIKE '%InfoRg[0-9]%'`)  
        
        if (typeof columns == "object" && columns.hasOwnProperty("recordset")) {
            columns = columns.recordset
            
            for (let index = 0; index < tables.length; index++) {
                const table = tables[index];

                filteredColumns = columns.filter( (columns) => columns.TABLE_NAME == table.TABLE_NAME)

                if (filteredColumns.length !== 4) continue

                for (let indexRow = 0; indexRow < filteredColumns.length; indexRow++) {
                    const column = filteredColumns[indexRow];                   
                    isCheckColumns = checkColumn(column);
                  
                    if (isCheckColumns) break;
                }

                if (isCheckColumns) {
                    dataTable = await workersql.cmdExecute('R04', `SELECT top(5) * FROM ${ table.TABLE_NAME }`)                     
            
                    if (typeof dataTable == 'object' && dataTable.hasOwnProperty('recordset')) {
                      dataTable = dataTable.recordset;
            
                      for (let indexDataRow = 0; indexDataRow < dataTable.length; indexDataRow++) {
                        isCheckData = checkData(dataTable[indexDataRow]);
                        
                        if (isCheckData) break;
                      }
                    }

                    if (isCheckData) {
                        resultData = await workersql.cmdExecute('R04', `SELECT * FROM ${ table.TABLE_NAME }`)
                        return resultData
                    }
                }
            }
        }
    }

    return undefined
}

