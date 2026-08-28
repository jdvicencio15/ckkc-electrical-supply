const checkReferenceExists = async (
  Model,
  id,
  fieldName
) => {
  if (id === undefined || id === null || id === "") {
    return;
  }

  const exists = await Model.exists({
    _id: id,
  });

  if (!exists) {
    const error = new Error(
      `${fieldName} not found`
    );

    error.statusCode = 400;
    throw error;
  }
};

const checkReferencesExist = async (
  Model,
  ids,
  fieldName
) => {
  if (!ids || ids.length === 0) {
    return;
  }

  const uniqueIds = [
    ...new Set(ids.map((id) => id.toString())),
  ];

  const existingDocuments = await Model.find({
    _id: { $in: uniqueIds },
  }).select("_id");

  const existingIds = new Set(
    existingDocuments.map((doc) => doc._id.toString())
  );

  const missingId = uniqueIds.find(
    (id) => !existingIds.has(id)
  );

  if (missingId) {
    const error = new Error(
      `${fieldName} not found: ${missingId}`
    );

    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  checkReferenceExists,
  checkReferencesExist,
};