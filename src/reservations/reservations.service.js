const knex = require("../db/connection");

function listByDate(date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date: date })
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

module.exports = { listByDate, read, create };
