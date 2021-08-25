/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");

async function list(req, res) {
  res.json({
    data: [],
  });
}

async function create(req, res) {}

module.exports = {
  list: [list],
  create: [create],
};
