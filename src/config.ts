import process from "node:process";
const HOME = process.env.HOME || process.env.USERPROFILE;
const DB_PATH = process.env.DB_PATH || ".fmext_aliases.sqlite3";
const FMEXT_STATE = `${HOME}/${DB_PATH}`;

export { FMEXT_STATE };
