const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");

const validProperties = ["table_name", "capacity"];

function tableValidProperties(req, res, next) {
  const newTable = req.body.data;
  const invalidFields = Object.keys(newTable).filter(
    (field) => !validProperties.includes(field)
  );
  try {
    validProperties.forEach((property) => {
      if (!newTable[property]) {
        throw { status: 400, message: `A '${property}' property is required.` };
      }
    });
    if (!newTable) {
      throw { status: 400, message: "please choose a table." };
    }
    if (invalidFields.length && invalidFields[0] !== "reservation_id") {
      throw {
        status: 400,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      };
    }
    if (newTable.table_name.length == 1 || 0) {
      throw {
        status: 400,
        message: "the table_name field must be more than two characters long.",
      };
    }
    if (typeof newTable.capacity !== "number" || newTable.capacity < 1) {
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

async function tableExists(req, res, next) {
  try {
    const tableId = req.params.table_id || req.body.data.table_id;
    const table = await service.read(tableId);
    if (!table) {
      throw { status: 404, message: `Table not found:${req.params.table_id}` };
    }
    res.locals.tableId = tableId;
    res.locals.table = table;
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

    const reservationId = req.body.data.reservation_id;
    const reservation = await reservationsService.read(reservationId);

    if (!reservation) {
      throw {
        status: 404,
        message: `Reservation not found:${req.body.data.reservation_id}`,
      };
    }
    if (res.locals.table.occupied === true) {
      throw {
        status: 400,
        message: `This table is currently occupied, select another table`,
      };
    }
    if (reservation.people > res.locals.table.capacity) {
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
    if (!data.reservation_id) {
      res.status(201).json({ data: await service.create(data) });
    } else {
      const newTable = await service.create(data);
      const reservationId = req.body.data.reservation_id;
      const updatedTable = await service.updateTable(
        reservationId,
        newTable.table_id
      );
      res.status(200).json({
        data: updatedTable[0],
      });
    }
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  const reservationId = req.body.data.reservation_id;
  try {
    res.status(200).json({
      data: await service.updateTable(reservationId, res.locals.tableId),
    });
  } catch (err) {
    next(err);
  }
}

async function occupiedCheck(req, res, next) {
  try {
    const table = await service.read(res.locals.tableId);
    if (table.occupied == false) {
      throw { status: 400, message: "the table is alread not occupied." };
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    res
      .status(200)
      .json({ data: await service.clearTable(res.locals.tableId) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list: [list],
  create: [tableValidProperties, create],
  update: [tableExists, seatingValidProperties, update],
  destroy: [tableExists, occupiedCheck, destroy],
};
