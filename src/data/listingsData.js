import { getDb } from "./connection.js";

// Consulta compartida para listar y filtrar.
async function findListings(filter, page, pageSize) {
    const db = getDb();

    const cursor = db.collection("listingsAndReviews")
        .find(filter)
        .sort({ _id: 1 });

    if (page !== undefined && pageSize !== undefined) {
        cursor
            .skip((page - 1) * pageSize)
            .limit(pageSize);
    }

    return await cursor.toArray();
}
export async function findAllListings(page, pageSize) {
    return await findListings({}, page, pageSize);
}


export async function findListingById(id) {
    const db = getDb();

    
    return await db.collection("listingsAndReviews")
        .findOne({ _id: id });
}


export async function findListingsByPropertyType(type, page, pageSize) {
    return await findListings(
        { property_type: type },
        page,
        pageSize
    );
}

export async function findListingsByHost(hostId, page, pageSize) {
    return await findListings(
        { "host.host_id": hostId },
        page,
        pageSize
    );
}


export async function findListingsWithTotalPrice(page, pageSize) {
    const db = getDb();

    const pipeline = [
        { $sort: { _id: 1 } }
    ];

    if (page !== undefined && pageSize !== undefined) {
        pipeline.push(
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize }
        );
    }

    pipeline.push({
        $addFields: {
            totalPrice: {
              
                $toDouble: {
                    $add: [
                        { $ifNull: ["$price", 0] },
                        { $ifNull: ["$cleaning_fee", 0] },
                        { $ifNull: ["$security_deposit", 0] },
                        { $ifNull: ["$extra_people", 0] }
                    ]
                }
            }
        }
    });

    return await db.collection("listingsAndReviews")
        .aggregate(pipeline)
        .toArray();
}

// Actualizar solamente los campos de disponibilidad recibidos.
export async function updateListingAvailability(id, availability) {
    const db = getDb();

    const fieldsToUpdate = {};

    for (const [field, value] of Object.entries(availability)) {
        fieldsToUpdate[`availability.${field}`] = value;
    }

    
    return await db.collection("listingsAndReviews")
        .findOneAndUpdate(
            { _id: id },
            { $set: fieldsToUpdate },
            {
                returnDocument: "after",
                includeResultMetadata: false
            }
        );
}

// Ranking según la cantidad real de propiedades en esta colección.
export async function findTopHosts(limit) {
    const db = getDb();

    return await db.collection("listingsAndReviews")
        .aggregate([
            {
                $match: {
                    "host.host_id": {
                        $type: "string",
                        $ne: ""
                    }
                }
            },
            {
                $group: {
                    _id: "$host.host_id",
                    hostName: { $first: "$host.host_name" },
                    totalProperties: { $sum: 1 }
                }
            },
            {
                $sort: {
                    totalProperties: -1,
                    _id: 1
                }
            },
            {
                $limit: limit
            },
            {
                $project: {
                    _id: 0,
                    hostId: "$_id",
                    hostName: 1,
                    totalProperties: 1
                }
            }
        ])
        .toArray();
}