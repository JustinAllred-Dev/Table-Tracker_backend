const { returning } = require("../db/connection");
const knex = require("../db/connection");

function listByDate(date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date: date })
    .whereNot({ status: "finished" })
    .orderBy("reservation_time", "asc");
}
function read(reservationId) {
  return knex("reservations").where({ reservation_id: reservationId }).first();
}

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function updateStatus(id, status) {
  return knex("reservations")
    .where({ reservation_id: id })
    .update("status", status)
    .returning("status")
    .then((newStatus) => newStatus[0]);
}

module.exports = { listByDate, read, create, updateStatus };
