import { Request, Response, NextFunction } from "express";

function convertToInt(value: string | number): number {
    return typeof value === "string" ? parseInt(value) : value as number;
}