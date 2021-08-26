const service = require("./reservations.service");

async function list(req, res, next) {
  const { date } = req.query;
  try {
    res.json({ data: await service.listByDate(date) });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    res.status(201).json({ data: await service.create(req.body.data) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list: [list],
  create: [create],
};
