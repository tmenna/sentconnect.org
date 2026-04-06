import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import reportsRouter from "./reports";
import storageRouter from "./storage";
import authRouter from "./auth";
import superAdminRouter from "./super-admin";
import adminUsersRouter from "./admin-users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(reportsRouter);
router.use(storageRouter);
router.use(superAdminRouter);
router.use(adminUsersRouter);

export default router;
