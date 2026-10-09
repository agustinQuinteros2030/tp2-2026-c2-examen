import {
    getListings,
    getListingById,
    getListingsByPropertyType,
    getListingsByHost,
    getListingsWithTotalPrice,
    updateAvailability,
    getTopHosts
} from "../services/listingsService.js";

// Respuesta de error compartida entre los controladores.
function handleError(error, res) {
    const status = error.statusCode ?? 500;

    if (status === 500) {
        console.error("Error en listings:", error);
    }

    return res.status(status).json({
        message: status === 500
            ? "Error interno del servidor"
            : error.message
    });
}

export const getAllListings = async (req, res) => {
    try {
        const { page, pageSize } = req.query;

        const listings = await getListings(page, pageSize);

        res.json(listings);
    } catch (error) {
        handleError(error, res);
    }
};

export const getListingId = async (req, res) => {
    try {
        const listing = await getListingById(req.params.id);

        res.json(listing);
    } catch (error) {
        handleError(error, res);
    }
};

export const getByPropertyType = async (req, res) => {
    try {
        const { page, pageSize } = req.query;

        const listings = await getListingsByPropertyType(
            req.params.type,
            page,
            pageSize
        );

        res.json(listings);
    } catch (error) {
        handleError(error, res);
    }
};

export const getByHost = async (req, res) => {
    try {
        const { page, pageSize } = req.query;

        const listings = await getListingsByHost(
            req.params.host_id,
            page,
            pageSize
        );

        res.json(listings);
    } catch (error) {
        handleError(error, res);
    }
};

export const getWithTotalPrice = async (req, res) => {
    try {
        const { page, pageSize } = req.query;

        const listings = await getListingsWithTotalPrice(
            page,
            pageSize
        );

        res.json(listings);
    } catch (error) {
        handleError(error, res);
    }
};

export const updateAvailabilityController = async (req, res) => {
    try {
        const listing = await updateAvailability(
            req.params.id,
            req.body
        );

        res.json(listing);
    } catch (error) {
        handleError(error, res);
    }
};

export const getTopHostsController = async (req, res) => {
    try {
        const hosts = await getTopHosts(req.query.limit);

        res.json(hosts);
    } catch (error) {
        handleError(error, res);
    }
};