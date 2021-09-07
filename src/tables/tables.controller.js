const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");

const validProperties = ["table_name", "capacity"];

function tableValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !validProperties.includes(field)
  );
  try {
    validProperties.forEach((property) => {
      if (!data[property]) {
        throw { status: 400, message: `A '${property}' property is required.` };
      }
    });
    if (!data) {
      throw { status: 400, message: "please choose a table." };
    }
    if (invalidFields.length) {
      throw {
        status: 400,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      };
    }
    if (data.table_name.length == 1 || 0) {
      throw {
        status: 400,
        message: "the table_name field must be more than two characters long.",
      };
    }
    if (typeof data.capacity !== "number" || data.capacity < 1) {
      throw {
        status: 400,
        message: "the capacity field must be a number greater than zero.",
      };
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function seatingValidProperties(req, res, next) {
  try {
    if (!req.body.data || !req.body.data.reservation_id) {
      throw { status: 400, message: `please enter a valid reservation_id` };
    }

    const tableId = req.params.table_id || req.body.data.table_id;
    const reservationId = req.body.data.reservation_id;
    const table = await service.read(tableId);
    const reservation = await reservationsService.read(reservationId);

    if (!table) {
      throw { status: 404, message: `Table not found:${req.params.table_id}` };
    }
    if (!reservation) {
      throw {
        status: 404,
        message: `Reservation not found:${req.body.data.reservation_id}`,
      };
    }
    if (table.occupied === true) {
      throw {
        status: 400,
        message: `This table is currently occupied, select another table`,
      };
    }
    if (reservation.people > table.capacity) {
      throw {
        status: 400,
        message: `Reservation capacity is greater than table capacity`,
      };
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    res.status(200).json({ data: await service.listTables() });
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

async function update(req, res, next) {
  const tableId = req.params.table_id || req.body.data.table_id;
  const reservationId = req.body.data.reservation_id;
  try {
    res
      .status(200)
      .json({ data: await service.updateTable(reservationId, tableId) });
  } catch (err) {
    next(err);
  }
}

async function occupiedCheck(req, res, next) {
  const tableId = req.params.table_id || req.body.data.table_id;
  try {
    const table = await service.read(tableId);
    if (table.occupied == false) {
      throw { status: 400, message: "the table is already free to seat." };
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  const tableId = req.params.table_id || req.body.data.table_id;
  try {
    res.status(200).json({ data: await service.clearTable(tableId) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list: [list],
  create: [tableValidProperties, create],
  update: [seatingValidProperties, update],
  destroy: [occupiedCheck, destroy],
};
