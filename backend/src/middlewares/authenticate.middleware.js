import { validateUserSession } from "../modules/auth/session.service.js";

const authenticate = async (req, res, next) => {
  try {
    const sessionToken = req.cookies?.edulearn_session;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const session = await validateUserSession(sessionToken);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session.",
      });
    }

    req.user = {
      id: session.user_id,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
