const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./reservations.controller");

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

router
  .route("/:reservation_Id/status")
  .put(controller.statusUpdate)
  .all(methodNotAllowed);

router
  .route("/:reservation_Id")
  .get(controller.read)
  .put(controller.resUpdate)
  .all(methodNotAllowed);

module.exports = router;
