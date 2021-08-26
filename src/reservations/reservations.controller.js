/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");

async function list(req, res, next) {
  const { date } = req.query;
  try {
    const datesReservations = await service.list(date);
    return res.json({ data: datesReservations });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list: [list],
  create: [create],
};
