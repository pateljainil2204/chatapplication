import express from "express";
import router from "./src/route/index.js";

const expressconfig = async ( app ) => {
    app.use(express.json());
    app.use("/api", router);
}

export default expressconfig;