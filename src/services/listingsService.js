import {
    findAllListings,
    findListingById,
    findListingsByPropertyType,
    findListingsByHost,
    findListingsWithTotalPrice,
    updateListingAvailability,
    findTopHosts
} from "../data/listingsData.js";

// Creamos un error con su código HTTP.
function httpError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Los query params llegan como strings.
// Evitamos aceptar valores como "2abc", que parseInt convertiría a 2.
function positiveInteger(value, name, max = Number.MAX_SAFE_INTEGER) {
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
        throw httpError(`${name} debe ser un entero positivo`);
    }

    const number = Number(value);

    if (!Number.isSafeInteger(number) || number > max) {
        throw httpError(`${name} debe ser menor o igual a ${max}`);
    }

    return number;
}

function validatePagination(page, pageSize) {
    // Sin parámetros conservamos el comportamiento del proyecto:
    // devolver todas las propiedades.
    if (page === undefined && pageSize === undefined) {
        return {};
    }

    // Si llega solamente uno, completamos el otro.
    const validPage = positiveInteger(page ?? "1", "page");
    const validPageSize = positiveInteger(
        pageSize ?? "20",
        "pageSize",
        100
    );

    if (!Number.isSafeInteger((validPage - 1) * validPageSize)) {
        throw httpError("La página solicitada es demasiado grande");
    }

    return {
        page: validPage,
        pageSize: validPageSize
    };
}

function requiredText(value, name) {
    if (
        typeof value !== "string" ||
        !value.trim() ||
        value.length > 100
    ) {
        throw httpError(
            `${name} debe ser un texto no vacío de hasta 100 caracteres`
        );
    }

    return value.trim();
}

export const getListings = async (page, pageSize) => {
    const pagination = validatePagination(page, pageSize);

    return await findAllListings(
        pagination.page,
        pagination.pageSize
    );
};

export const getListingById = async (id) => {
    const validId = requiredText(id, "id");

    const listing = await findListingById(validId);

    if (!listing) {
        throw httpError("Propiedad no encontrada", 404);
    }

    return listing;
};

export const getListingsByPropertyType = async (type, page, pageSize) => {
    const validType = requiredText(type, "type");
    const pagination = validatePagination(page, pageSize);

    return await findListingsByPropertyType(
        validType,
        pagination.page,
        pagination.pageSize
    );
};

export const getListingsByHost = async (hostId, page, pageSize) => {
    const validHostId = requiredText(hostId, "host_id");
    const pagination = validatePagination(page, pageSize);

    return await findListingsByHost(
        validHostId,
        pagination.page,
        pagination.pageSize
    );
};

export const getListingsWithTotalPrice = async (page, pageSize) => {
    const pagination = validatePagination(page, pageSize);

    return await findListingsWithTotalPrice(
        pagination.page,
        pagination.pageSize
    );
};

export const updateAvailability = async (id, body) => {
    const validId = requiredText(id, "id");

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError("El body debe ser un objeto JSON");
    }

    // Aceptamos:
    // { availability: { available_30: 20 } }
    // o:
    // { available_30: 20 }
    const nested = Object.hasOwn(body, "availability");

    if (nested && Object.keys(body).length !== 1) {
        throw httpError("Solo se permite modificar availability");
    }

    const availability = nested ? body.availability : body;

    if (
        !availability ||
        typeof availability !== "object" ||
        Array.isArray(availability) ||
        Object.keys(availability).length === 0
    ) {
        throw httpError("Enviá al menos un campo de disponibilidad");
    }

    // Aceptamos el nombre del enunciado y el nombre real del dataset.
    const allowedFields = {
        available_30: 30,
        availability_30: 30,

        available_60: 60,
        availability_60: 60,

        available_90: 90,
        availability_90: 90,

        available_365: 365,
        availability_365: 365
    };

    const validatedFields = {};

    for (const [field, value] of Object.entries(availability)) {
        if (!Object.hasOwn(allowedFields, field)) {
            throw httpError(`Campo no permitido: ${field}`);
        }

        const days = allowedFields[field];

        if (
            !Number.isInteger(value) ||
            value < 0 ||
            value > days
        ) {
            throw httpError(
                `${field} debe ser un entero entre 0 y ${days}`
            );
        }

        // Normalizamos al nombre real de MongoDB.
        const realField = `availability_${days}`;

        if (Object.hasOwn(validatedFields, realField)) {
            throw httpError(
                `No repitas la disponibilidad de ${days} días`
            );
        }

        validatedFields[realField] = value;
    }

    const listing = await updateListingAvailability(
        validId,
        validatedFields
    );

    if (!listing) {
        throw httpError("Propiedad no encontrada", 404);
    }

    return listing;
};

export const getTopHosts = async (limit) => {
    const validLimit = positiveInteger(
        limit ?? "10",
        "limit",
        100
    );

    return await findTopHosts(validLimit);
};


