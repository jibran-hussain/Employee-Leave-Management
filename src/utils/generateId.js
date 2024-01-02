import fs from 'fs/promises'; // Import fs with promises

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Generates the unique id when an employee is created and apllies for leave.

export const generateId = async (entity) => {
    try {
        const data = await fs.readFile(`${__dirname}/../../db/id.json`, 'utf8');
        const idFileData = JSON.parse(data);
        let newId;

        if (entity === 'user') {
            newId = idFileData.userId;
            idFileData.userId++;
        } else if (entity === 'leave') {
            newId = idFileData.leaveId;
            idFileData.leaveId++;
        }

        const updatedIdFileData = JSON.stringify(idFileData);
        await fs.writeFile(`${__dirname}/../../db/id.json`, updatedIdFileData, 'utf8');

        return newId;
    } catch (error) {
        throw new Error(error);
    }
};