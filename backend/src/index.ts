

import express from "express";
import cors from "cors";
import { PORT } from "./config/server";
import userRoutes from "./routes/userRoutes";
import groupRoutes from "./routes/groupRoutes";


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Expense Sharing API running" });
});

app.use("/users", userRoutes);
app.use("/groups", groupRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

export default app;
