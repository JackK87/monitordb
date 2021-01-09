const sql = require('mssql')

module.exports = class MsSql {

    constructor(connectionName, server, dbname, user, pwd) {
        this.listConnection = []

        this.connectionName = connectionName
        this.server = server
        this.dbname = dbname
        this.user = user
        this.pwd = pwd
    }

    async connection() {

        const connectionString = `Driver=msnodesqlv8;Server=${ this.server };Database=${ this.dbname };UID=${ this.user };PWD=${ this.pwd };Encrypt=true`

        try {
            const pool = await sql.connect(connectionString)

            let findPool = this.listConnection.find(item => item.connectionName === this.connectionName)

            if (findPool)
                findPool.pool = pool
            else
                this.listConnection.push({ connectionName: this.connectionName, pool: pool})
                
        } catch (error) {
            console.log(error);
        }        
    }

    async cmdExecute(connectionName, sqlCmd) {
        const findPool = this.listConnection.find(item => item.connectionName === connectionName)

        if (findPool) {
            const pool = findPool.pool
            const queryResult = await pool
                        .request()
                        .query(sqlCmd)
                        .catch((err) => console.log(err))

            return queryResult

        } else {
            console.error('Error')
        }
    }
}

 