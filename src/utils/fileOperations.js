import fs from 'fs'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export const writeFile=(path,updatedFile)=>{
    try{
        fs.writeFile(path,updatedFile,'utf8',(error)=>{
            if(error) throw new Error(`Internal Server Error`);
            return true;
        });
    }catch(e){
        throw new Error(e);
    }
}