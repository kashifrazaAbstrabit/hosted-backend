import { Router } from "express";
import { SecureStoreController } from "../../controllers/secureStoreController";
import { apiWrapper } from "../../common/utils/service_wrapper";
import { isAuthenticatedUser } from "../../middleware/auth";


const route = Router();


route.post("/credentials",isAuthenticatedUser, apiWrapper(SecureStoreController.createCredentialsStore));

route.get("/credentials",isAuthenticatedUser, apiWrapper(SecureStoreController.getCredentialById));

route.post("/file",isAuthenticatedUser, apiWrapper(SecureStoreController.createFileStore));

route.get("/file",isAuthenticatedUser, apiWrapper(SecureStoreController.getFileStoreById));

route.post("/file/upload",isAuthenticatedUser, apiWrapper(SecureStoreController.generatePresignedUrl));

route.post("/",isAuthenticatedUser, apiWrapper(SecureStoreController.getFileStoreByUserId));

route.put("/file",isAuthenticatedUser, apiWrapper(SecureStoreController.updateFileStore));

route.delete("/file",isAuthenticatedUser, apiWrapper(SecureStoreController.deleteFileStore));

route.delete("/credentials",isAuthenticatedUser, apiWrapper(SecureStoreController.deleteCredentialsStore));

route.put("/credentials",isAuthenticatedUser, apiWrapper(SecureStoreController.updateCredentialsStore));

export default route;