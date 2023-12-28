export const pagination=(data,offset,limit)=>{
    const startIndex = (offset - 1)*limit;
    const endIndex = startIndex + limit;
    const paginatedArray = data.slice(startIndex,endIndex)
    return paginatedArray;
}