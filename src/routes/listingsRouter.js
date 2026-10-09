import express from "express";

import {
    getAllListings,
    getListingId,
    getByPropertyType,
    getByHost,
    getWithTotalPrice,
    updateAvailabilityController,
    getTopHostsController
} from "../controllers/listingsController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();


router.use(authMiddleware);

router.get("/", getAllListings);

router.get("/property-type/:type", getByPropertyType);

router.get("/with-total-price", getWithTotalPrice);

router.get("/host/:host_id", getByHost);

router.get("/top-hosts", getTopHostsController);

router.patch("/:id/availability", updateAvailabilityController);


router.get("/:id", getListingId);

export default router;