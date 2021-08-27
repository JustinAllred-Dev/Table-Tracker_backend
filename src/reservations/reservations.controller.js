const service = require("./reservations.service");

const validProperties = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

function hasProperties(req, res, next) {
  const { data = {} } = req.body;

  try {
    validProperties.forEach((property) => {
      if (!data[property]) {
        throw { status: 400, message: `A '${property}' property is required.` };
      }
    });
    next();
  } catch (err) {
    next(err);
  }
}

function hasValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const dateFormat = /\d\d\d\d-\d\d-\d\d/;
  const timeFormat = /\d\d:\d\d/;
  const invalidFields = Object.keys(data).filter(
    (field) => !validProperties.includes(field)
  );
  try {
    if (invalidFields.length) {
      throw {
        status: 400,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      };
    }
    if (typeof data.people !== "number" || data.people < 1) {
      throw {
        status: 400,
        message: "the people field must be a number",
      };
    }
    if (!data.reservation_date.match(dateFormat)) {
      throw {
        status: 400,
        message: "the reservation_date field must be a valid date",
      };
    }
    if (!data.reservation_time.match(timeFormat)) {
      throw {
        status: 400,
        message: "the reservation_time field must be a valid time",
      };
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  const { date } = req.query;
  try {
    res.status(200).json({ data: await service.listByDate(date) });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  const { data } = req.body;
  try {
    res.status(201).json({ data: await service.create(data) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list: [list],
  create: [hasProperties, hasValidProperties, create],
};
