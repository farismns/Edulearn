import * as service from "./dashboard.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    const data = await service.getDashboard(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

