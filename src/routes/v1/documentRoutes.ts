import { Router } from "express";
import { apiWrapper } from "../../common/utils/service_wrapper";
import { DocumentController } from "../../controllers/documentsController";
import { isAuthenticatedUser } from "../../middleware/auth";

const route = Router();

route.get(
  "/google/drive/auth",
  apiWrapper(DocumentController.generateGoogleAuthUrl)
);

route.get(
  "/google/drive/callback",
  isAuthenticatedUser,
  apiWrapper(DocumentController.handleGoogleCallback)
);

route.post(
  "/google/docs/files",
  isAuthenticatedUser,
  apiWrapper(DocumentController.getGoogleDocsFiles)
);

route.post(
  "/google/docs/file",
  isAuthenticatedUser,
  apiWrapper(DocumentController.createGoogleDocsFile)
);

route.delete(
  "/google/docs/file",
  isAuthenticatedUser,
  apiWrapper(DocumentController.deleteGoogleDocsFile)
);

route.post(
  "/google/docs/add-developers",
  apiWrapper(DocumentController.addAllProjectDevelopersToGoogleDoc)
);

route.post(
  "/google/docs/remove-developers",
  apiWrapper(DocumentController.removeProjectDevelopersFromGoogleDoc)
);

route.post(
  "/azure/upload",
  isAuthenticatedUser,

  apiWrapper(DocumentController.getUploadUrl)
);

route.post(
  "/azure/list",
  isAuthenticatedUser,

  apiWrapper(DocumentController.listDocuments)
);

route.delete(
  "/azure/delete",

  isAuthenticatedUser,
  apiWrapper(DocumentController.deleteDocuments)
);

export default route;
