const sql = require('mssql')

class MSSQL {
    static listConnection = [];

    constructor(connectionName, server, dbname, user, pwd) {
        this.connectionName = connectionName
        this.server = server
        this.dbname = dbname
        this.user = user
        this.pwd = pwd
    }

    connection() {
        //Driver=msnodesqlv8;Server=R04PAC1CDB01T\\TEST;Database=R04-AO-ASZUP-TEST;UID=MAIN\\Evgeniy.Krokhin;PWD=Jekagud*/;Encrypt=true
        const connectionString = `Driver=msnodesqlv8;Server=${ this.server };Database=${ this.dbname };UID=${ this.user };PWD=${ this.pwd };Encrypt=true`
        const pool = await sql.connect(connectionString)  

        let findPool = listConnection.find(item => item.connectionName === this.connectionName)

        if (findPool)
            findPool.pool = pool
        else
            listConnection.push({ connectionName: findPool.connectionName, pool: pool})
    }

    cmdExecute(connectionName, sqlCmd) {
        const findPool = listConnection.find(item => item.connectionName === this.connectionName)

        if (findPool) {
            const pool = findPool.pool
            const queryResult = await pool
                        .request()
                        .query(sqlCmd)
                        .catch((err) => console.log(err))

            return queryResult

        } else {
            console.error()
        }
    }
}

module.exports = new MSSQL()