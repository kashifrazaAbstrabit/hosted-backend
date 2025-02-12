import { Router } from "express";
import documentRoutes from "./documentRoutes";
import secureStoreRoutes from "./secureStoreRoutes";
import developmentRoutes from "./developmentRoutes";


const router = Router();

router.use("/documents", documentRoutes);

router.use("/secure-store", secureStoreRoutes);

router.use("/development", developmentRoutes)


export default router;


