import { exit } from "process";

export function exitWMessage(msg: string, code: number): void {
    console.error(msg)
    exit(code)
}