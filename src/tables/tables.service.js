const knex = require("../db/connection");

function listTables() {
  return knex("tables").select("*").orderBy("table_name");
}

function read(Id) {
  return knex("tables").where({ table_id: Id }).first();
}

function updateTable(reservationId, tableId) {
  return knex("tables")
    .where({ table_id: tableId })
    .update("reservation_id", reservationId)
    .update("occupied", true)
    .returning("*");
}

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

module.exports = { listTables, create, updateTable, read };
