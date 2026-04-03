import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(reportsRouter);

export default router;
