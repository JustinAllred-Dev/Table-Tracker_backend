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

  try {
    validProperties.forEach((property) => {
      if (!data[property]) {
        throw { status: 400, message: `A '${property}' property is required.` };
      }
    });
    if (invalidFields.length) {
      throw {
        status: 400,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      };
    }
    if (typeof data.people !== "number" || data.people < 1) {
      throw {
        status: 400,
        message: "the people field must be a number greater than zero.",
      };
    }
    if (!data.reservation_date.match(dateFormat)) {
      throw {
        status: 400,
        message: "the reservation_date field must be a valid date.",
      };
    }
    if (!data.reservation_time.match(timeFormat)) {
      throw {
        status: 400,
        message: "the reservation_time field must be a valid time.",
      };
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function isDuringHours(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const submitDate = new Date(reservation_date + " " + reservation_time);
  const dayAsNum = submitDate.getDay();
  const today = new Date();

  try {
    if (submitDate < today) {
      throw {
        status: 400,
        message: `The date and time must be in the future. Today is ${today}.`,
      };
    }
    if (dayAsNum === 2) {
      throw {
        status: 400,
        message: `The restaurant is closed on Tuesdays. Please select a different day.`,
      };
    }
    if (reservation_time < "10:29:59") {
      throw {
        status: 400,
        message: "The restaurant does not open until 10:30 a.m.",
      };
    }
    if (reservation_time >= "21:30:00") {
      throw {
        status: 400,
        message: `The restaurant closes at 22:30 (10:30 pm). Please schedule your reservation at least one hour before close.`,
      };
    }
    next();
  } catch (err) {
    next(err);
  }
}
async function reservationExists(req, res, next) {
  const { reservation_Id } = req.params;
  try {
    const foundRes = await service.read(reservation_Id);
    if (foundRes) {
      res.locals.res = foundRes;
      // console.log(res.locals.res);
      return next();
    } else {
      throw {
        status: 404,
        message: `No reservation found for id ${reservation_Id}.`,
      };
    }
  } catch (err) {
    next(err);
  }
}

async function read(req, res) {
  try {
    res.json({ data: await service.read(res.locals.res.reservation_id) });
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
  create: [hasValidProperties, isDuringHours, create],
  read: [reservationExists, read],
};
