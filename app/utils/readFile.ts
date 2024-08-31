import {promises as fs} from "fs";

// Read json file from name
export default async function readFile(name: string){
    const indexBuffer = await fs.readFile(process.cwd() + `/public/data/${name}.json`);
    return JSON.parse(indexBuffer.toString());
}