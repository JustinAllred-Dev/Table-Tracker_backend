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
  .put(controller.update)
  .all(methodNotAllowed);

router.route("/:reservation_Id").get(controller.read).all(methodNotAllowed);

module.exports = router;
