import * as service from "./subject.service.js";

const handle = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res);
  } catch (error) {
    return next(error);
  }
};

export const listSubjects = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      data: {
        subjects: await service.listSubjects({
          userId: req.user.id,
          search: req.query.search,
          status: req.query.status,
        }),
      },
    }),
);
export const createSubject = handle(async (req, res) =>
  res
    .status(201)
    .json({
      success: true,
      message: "Subject created successfully.",
      data: {
        subject: await service.createSubject(req.user.id, req.body.name),
      },
    }),
);
export const renameSubject = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      message: "Subject renamed successfully.",
      data: {
        subject: await service.renameSubject(
          req.user.id,
          req.params.id,
          req.body.name,
        ),
      },
    }),
);
export const deactivateSubject = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      message: "Subject deactivated successfully.",
      data: {
        subject: await service.setStatus(
          req.user.id,
          req.params.id,
          "Inactive",
        ),
      },
    }),
);
export const reactivateSubject = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      message: "Subject reactivated successfully.",
      data: {
        subject: await service.setStatus(req.user.id, req.params.id, "Active"),
      },
    }),
);
export const deleteSubject = handle(async (req, res) =>
  res
    .status(200)
    .json({
      success: true,
      message: "Subject deleted successfully.",
      data: {
        subject: await service.deleteSubject(
          req.user.id,
          req.params.id,
          req.body.confirm,
        ),
      },
    }),
);
