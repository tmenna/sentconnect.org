import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import reportsRouter from "./reports";
import storageRouter from "./storage";
import summarizeRouter from "./summarize";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(reportsRouter);
router.use(storageRouter);
router.use(summarizeRouter);

export default router;
