const service = require("./reservations.service");

const requiredProperties = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

const waivedFields = ["reservation_id", "status", "created_at", "updated_at"];

const validStatus = ["booked", "seated", "finished", "cancelled"];

function hasValidProperties(req, res, next) {
  const data = req.body.data;
  if (!data) {
    throw { status: 400, message: "please fill out all fields." };
  }
  const dateFormat = /\d\d\d\d-\d\d-\d\d/;
  const timeFormat = /\d\d:\d\d/;
  const invalidFields = Object.keys(data).filter(
    (field) =>
      !requiredProperties.includes(field) && !waivedFields.includes(field)
  );

  try {
    requiredProperties.forEach((property) => {
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
    if (data.status && data.status !== "booked") {
      throw {
        status: 400,
        message: "new reservation status can not be seated or finished",
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

async function validReservationStatusUpdate(req, res, next) {
  const id = res.locals.res.reservation_id;
  const status = req.body.data.status;
  try {
    const thisReservation = await service.read(id);
    if (thisReservation.status === "finished") {
      throw {
        status: 400,
        message: "a finished reservation can not be updated",
      };
    }
    if (!validStatus.includes(status)) {
      throw {
        status: 400,
        message: `status must be either booked, seated, finished, or cancelled, not ${status}`,
      };
    }
    next();
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
  const { date, mobile_number } = req.query;
  try {
    if (date) {
      res.status(200).json({ data: await service.listByDate(date) });
    } else if (mobile_number) {
      const reservations = await service.listByNumber(mobile_number);
      if (!reservations) {
        throw { status: 400, message: "No reservations found" };
      }
      res.status(200).json({ data: reservations });
    }
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

async function statusUpdate(req, res, next) {
  const id = res.locals.res.reservation_id;
  const status = req.body.data.status;
  try {
    res
      .status(200)
      .json({ data: { status: await service.updateStatus(id, status) } });
  } catch (err) {
    next(err);
  }
}

async function resUpdate(req, res, next) {
  const id = res.locals.res.reservation_id;
  const data = req.body.data;
  try {
    res.status(200).json({
      data: await service.updateReservation(
        id,
        data.first_name,
        data.last_name,
        data.mobile_number,
        data.reservation_date,
        data.reservation_time,
        data.people
      ),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list: [list],
  create: [hasValidProperties, isDuringHours, create],
  read: [reservationExists, read],
  statusUpdate: [reservationExists, validReservationStatusUpdate, statusUpdate],
  resUpdate: [hasValidProperties, isDuringHours, reservationExists, resUpdate],
};
