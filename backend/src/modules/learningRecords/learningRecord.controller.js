import * as service from "./learningRecord.service.js";

const handle = (fn) => async (req, res, next) => {
  try { return await fn(req, res); } catch (error) { return next(error); }
};

export const listRecords = handle(async (req, res) => res.status(200).json({ success: true, data: await service.listRecords({ userId: req.user.id, ...req.query }) }));
export const getRecord = handle(async (req, res) => res.status(200).json({ success: true, data: { learningRecord: await service.getRecord(req.user.id, req.params.id) } }));
export const updateRecord = handle(async (req, res) => res.status(200).json({ success: true, message: "Learning record updated successfully.", data: { learningRecord: await service.updateRecord(req.user.id, req.params.id, req.body) } }));
export const createFromSchedule = handle(async (req, res) => res.status(201).json({ success: true, message: "Learning record created successfully.", data: { learningRecord: await service.createFromSchedule(req.user.id, req.params.scheduleId, req.body) } }));

