import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import cookieParser from "cookie-parser";
import projectRoute from "./routes/projectRoutes";
import { PasspORt } from "./utils/passport";
import session from "express-session";
import { GoogleLoginStrategy } from "./utils/GoogleLoginStrategy";
import { GoogleSignUpStrategy } from "./utils/GoogleSignUpStrategy";
import { GithubLoginStrategy } from "./utils/GithubLoginStrategy";
import { GithubSignUpStrategy } from "./utils/GithubSignUpStrategy";
import { errorHandler } from "./common/utils/handlers";
import devRoute from "./routes/devRoutes";
import routes from "./routes";
import { createClient } from "redis";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.connect().catch(console.error);

//sever
const app = express();

//middleware
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://kaleidoscopic-empanada-97d619.netlify.app",
      "https://hosted-frontend-8d7h04xyq-kashifrazaabstrabits-projects.vercel.app",
      "https://hosted-frontend-wheat.vercel.app",
    ], // Frontend URL
    credentials: true, // Allow cookies and credentials
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "development", // Secure only in production
      httpOnly: true,
      sameSite: "strict",
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(PasspORt.initialize());
app.use(PasspORt.session());
PasspORt.use("google-signup", GoogleSignUpStrategy);
PasspORt.use("google-login", GoogleLoginStrategy);

PasspORt.use("github-signup", GithubSignUpStrategy);
PasspORt.use("github-login", GithubLoginStrategy);

//router
app.use("/api/v1", userRoutes);
app.use("/api/v1", devRoute);
app.use("/api/v1", projectRoute);

app.use("/api", routes);

app.use(errorHandler);

export default app;
