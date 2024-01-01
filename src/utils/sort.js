import { getDate } from "./Date/getDate.js";

export const sort= (arr,sortBy,order)=>{
    if (sortBy === 'name' || sortBy === 'role' || sortBy === 'salary' || sortBy === 'id' || sortBy === 'date') {
        arr.sort((a, b) => {
            let fieldA,fieldB;
            if(sortBy === 'name' || sortBy === 'role'){
                fieldA = a[sortBy].toUpperCase();
                fieldB = b[sortBy].toUpperCase();
                return order === 1 ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            }
            else if(sortBy === 'salary' || sortBy === 'id'){
                 fieldA = a[sortBy];
                 fieldB = b[sortBy];
                 return order === 1 ? fieldA - fieldB : fieldB - fieldA;
            }
            else if(sortBy =='date'){
                fieldA = getDate(a[sortBy]);
                fieldB = getDate(b[sortBy]);
                return order === 1 ? fieldA.getTime() - fieldB.getTime() : fieldB.getTime() - fieldA.getTime();
            }
        });
    }
}