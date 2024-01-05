// Takes input an array,offset and limit and then paginates the data bassed on that

export const pagination=(data,offset,limit)=>{
    if(offset < 1 || limit < 1) throw new Error("Invalid offset or limit")
    
    const startIndex = (offset - 1)*limit;
    const endIndex = startIndex + limit;

    if(startIndex >= data.length) throw new Error('Offset exceeds the array length');
    const paginatedArray = data.slice(startIndex,endIndex)
    const totalPages=Math.ceil(data.length/limit);
    const currentPage=offset;
    return {paginatedArray,totalPages,currentPage};
}