const service = require("./tables.service");

const validProperties = ["table_name", "capacity"];

function hasValidProperties(req, res, next) {
  const { data } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !validProperties.includes(field)
  );
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
    if (data.table_name.length < 2) {
      errors.push("the table name must be more than two characters long.");
    }
    if (typeof data.capacity !== "number" || data.capacity < 1) {
      errors.push("the capacity field must be a number greater than zero.");
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

module.exports = {
  list: [list],
  create: [hasValidProperties, create],
};
