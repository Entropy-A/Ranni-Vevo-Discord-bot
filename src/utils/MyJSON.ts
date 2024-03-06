import fs from "fs"

export namespace MyJSON {
    export function parse(path: string): any {
        const data = fs.readFileSync(path, "utf-8")
        return  JSON.parse(data)
    }
}