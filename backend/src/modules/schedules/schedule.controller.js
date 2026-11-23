import * as service from "./schedule.service.js";
import * as learningRecordService from "../learningRecords/learningRecord.service.js";

const handle = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res);
  } catch (error) {
    return next(error);
  }
};

export const listSchedules = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      data: await service.listSchedules({ userId: req.user.id, ...req.query }),
    }),
);
export const getSchedule = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      data: { schedule: await service.getSchedule(req.user.id, req.params.id) },
    }),
);
export const createSchedule = handle(async (req, res) => {
  const result = await service.createSchedule(req.user.id, req.body);
  return res
    .status(201)
    .json({
      success: true,
      message: "Schedule created successfully.",
      data: result,
    });
});
export const updateSchedule = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      message: "Schedule updated successfully.",
      data: await service.updateSchedule(req.user.id, req.params.id, req.body),
    }),
);
export const cancelSchedule = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      message: "Schedule cancelled successfully.",
      data: {
        schedule: await service.cancelSchedule(req.user.id, req.params.id),
      },
    }),
);
export const deleteSchedule = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      message: "Schedule deleted successfully.",
      data: await service.deleteSchedule(
        req.user.id,
        req.params.id,
        req.body.confirm,
      ),
    }),
);
export const recordLesson = handle(async (req, res) =>
  res
    .status(201)
    .json({
      success: true,
      message: "Learning record created successfully.",
      data: {
        learningRecord: await learningRecordService.createFromSchedule(
          req.user.id,
          req.params.id,
          req.body,
        ),
      },
    }),
);
