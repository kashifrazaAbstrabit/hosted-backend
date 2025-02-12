import { Router } from "express";
import { DevelopmentController } from "../../controllers/developmentController";
import { apiWrapper } from "../../common/utils/service_wrapper";

const route = Router();

route.get("/github/auth", apiWrapper(DevelopmentController.generateGithubAuthUrl));

route.get("/github/callback", apiWrapper(DevelopmentController.handleGithubCallback));

route.post("/github/repo", apiWrapper(DevelopmentController.createRepository));

export default route;