//function for INSERT
var insertIntoSet = function(tableName) {
    var query = `INSERT INTO ${tableName} SET ?`;
    return query;
}

var insertIntoValues = function(tableName, properties) {
    var counter = 0;
    var values = '';
    for (var key in properties) {
        if (counter === 0) {
            values += "" + key
        } else {
            values += "," + key
        }
        counter++
    }
    var query = `INSERT INTO ${tableName} (${values} ) VALUES ?`;
    return query;
}

var selectWhere = function(tableName, tableProperty) {
    var query = `SELECT * FROM ${tableName} WHERE ${tableProperty} = ?`;
    return query;
}

var selectWhereOr = function(tableName, tableProperty1, tableProperty2) {
    var query = `SELECT * FROM ${tableName} WHERE ${tableProperty1} = ? or ${tableProperty2} = ?`;
    return query;
}

var selectInnerJoinWhereTblOne = function(tbl1name, tbl2name, tbl1Id, tbl2Id, tbl1Property) {
    //MODEL
    //SELECT * FROM user_roles 
    //INNER JOIN roles 
    //ON user_roles.roleId = roles.id
    // where user_roles.userId = 13

    var query = `SELECT * FROM ${tbl1name} ` +
        `INNER JOIN ${tbl2name} ` +
        `ON ${tbl1name}.${tbl1Id} = ${tbl2name}.${tbl2Id} ` +
        `WHERE ${tbl1Property} = ? `;
    return query;
}

//function for READ
var selectAll = function(tableName) {
    var query = `SELECT * FROM ${tableName}`;
    return query;
}

const queries = {
    insertIntoSet: insertIntoSet,
    insertIntoValues: insertIntoValues,
    selectWhere: selectWhere,
    selectWhereOr: selectWhereOr,
    selectInnerJoinWhereTblOne: selectInnerJoinWhereTblOne,
    selectAll: selectAll
}
module.exports = queries;