const service = require("./reservations.service");

const validProperties = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

function hasValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const dateFormat = /\d\d\d\d-\d\d-\d\d/;
  const timeFormat = /\d\d:\d\d/;
  const invalidFields = Object.keys(data).filter(
    (field) => !validProperties.includes(field)
  );
  const { reservation_date, reservation_time } = req.body.data;
  const invalidDate = 2;
  const submitDate = new Date(reservation_date + " " + reservation_time);
  const dayAsNum = submitDate.getDay();
  const today = new Date();
  let errors = [];

  try {
    validProperties.forEach((property) => {
      if (!data[property]) {
        errors.push(`A '${property}' property is required.`);
      }
    });
    if (invalidFields.length) {
      errors.push(`Invalid field(s): ${invalidFields.join(", ")}`);
    }
    if (typeof data.people !== "number" || data.people < 1) {
      errors.push("the people field must be a number.");
    }
    if (!data.reservation_date.match(dateFormat)) {
      errors.push("the reservation_date field must be a valid date.");
    }
    if (!data.reservation_time.match(timeFormat)) {
      errors.push("the reservation_time field must be a valid time.");
    }
    if (submitDate < today) {
      errors.push(
        `The date and time must be in the future. Today is ${today}.`
      );
    }
    if (dayAsNum === invalidDate) {
      errors.push(
        `The restaurant is closed on Tuesdays. Please select a different day.`
      );
    }
    if (reservation_time < "10:29:59") {
      errors.push("The restaurant does not open until 10:30 a.m.");
    }
    if (reservation_time >= "21:30:00") {
      errors.push(
        `The restaurant closes at 22:30 (10:30 pm). Please schedule your reservation at least one hour before close.`
      );
    }
    if (errors.length > 1) {
      throw { status: 400, message: errors };
    }
    if (errors.length == 1) {
      throw { status: 400, message: errors[0] };
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
  create: [hasValidProperties, create],
};
