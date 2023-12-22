import express, { Router, Request, Response, NextFunction } from "express";

const router: Router = express.Router();

router.get("/main", function (req, res) {
    res.render("main");
});
router.get("/profile", function (req, res) {
    res.render("profile");
});

export default router;