import fs from 'fs/promises'; // Import fs with promises

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateId = async (entity) => {
    try {
        const data = await fs.readFile(`${__dirname}/../../db/id.json`, 'utf8');
        const idFileData = JSON.parse(data);
        let newId;

        if (entity === 'admin') {
            newId = idFileData.newAdminId;
            idFileData.newAdminId++;
        } else if (entity === 'employee') {
            newId = idFileData.newEmployeeId;
            idFileData.newEmployeeId++;
        } else if (entity === 'leave') {
            newId = idFileData.employeeLeaveId;
            idFileData.employeeLeaveId++;
        }

        const updatedIdFileData = JSON.stringify(idFileData);
        await fs.writeFile(`${__dirname}/../../db/id.json`, updatedIdFileData, 'utf8');

        console.log(newId, "newId");
        return newId;
    } catch (error) {
        throw new Error(error);
    }
};