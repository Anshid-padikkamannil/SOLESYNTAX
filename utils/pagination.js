const paginate = async (model, filter = {}, options = {}) => {
  const page = Math.max(
    parseInt(options.page) || 1,
    1
  );
  
  const limit = Math.min(
    Math.max(
      parseInt(options.limit) || 10,
      1
    ),
    100
  )
  const skip = (page -1) * limit;
  const sort = options.sort || { createdAt: -1 };
  const populate = options.populate || null;

  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  const data = await query;
  const total = await model.countDocuments(filter);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  }
}

module.exports = paginate;