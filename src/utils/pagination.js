// Takes input an array,offset and limit and then paginates the data bassed on that

export const pagination=(data,offset,limit)=>{
    const startIndex = (offset - 1)*limit;
    const endIndex = startIndex + limit;
    const paginatedArray = data.slice(startIndex,endIndex)
    return paginatedArray;
}