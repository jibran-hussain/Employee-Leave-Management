<script>
    import { onMount } from "svelte";
    import Navbar from "../Components/Navbar.svelte";
    import Sidebar from "../Components/Sidebar.svelte";
    import { user } from "../stores/userStore";
    import toast, { Toaster } from 'svelte-french-toast';
    import UpdateEmployeeModal from "../Components/UpdateEmployeeModal.svelte";
    import EmployeeListTable from "../Components/EmployeeListTable.svelte";


    let employeesListData;
    let showDeletedEmployees=false;
    let searchInput=''
    let selectedOption=''
    let showUpdateModal=false;
    let userToUpdate;

    const openUpdateModel=()=>{
        showUpdateModal=true;
    }



    $:{
        console.log(selectedOption,'here is the selected Option')
    }

    const {id,email,role,token}=$user;
    console.log(`here is ${id},${email} and ${role}`)

    $: {
        if (showDeletedEmployees) {
            fetchDeletedEmployees().then(data => {
                console.log(data,'hi')
                if(data.message) employeesListData='';
                else employeesListData=data
            });
        } else {
            fetchActiveEmployees().then(data => {
                employeesListData = data;
            });
        }
}



    const fetchActiveEmployees=async()=>{
        try{
            let url= `http://localhost:3000/api/v1/employees`;

            if(searchInput) url += `?search=${searchInput}`;
            if(selectedOption) searchInput?url += `&sortBy=${selectedOption}`:url += `?sortBy=${selectedOption}`
            const response=await fetch(url,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            const data=await response.json();
            return data;
        }catch(e){
            console.log(`Here is the error`, e.message)
        }
    }


    const fetchDeletedEmployees=async()=>{
        try{
            console.log('asssalamunalaikum')
            let url=`http://localhost:3000/api/v1/employees?deleted=true`;
            if(searchInput) url += `&search=${searchInput}`;
            if(selectedOption) url += `&sortBy=${selectedOption}`
            const response=await fetch(url,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            const data=await response.json();
            return data;
        }catch(e){
            console.log(`Here is the error`, e.message)
        }
    }

    const handleSearch=async ()=>{
        try{
            
            let url=`http://localhost:3000/api/v1/employees?search=${searchInput}`;
            if(showDeletedEmployees) url += `&deleted=true`
            if(selectedOption) url += `&sortBy=${selectedOption}`
            else url=url
            const response=await fetch(url,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            const data=await response.json();
            if(data.message) employeesListData='';
            else employeesListData = data;
            

            console.log(data,'seeeeeeeeeeeeeeeeeaaaaaaaaaaaaaaaaaaaarrrrrrrrrccccccccchhhhhhhhhhhhhhhh')
        }catch(error){
            console.log(error.message)
        }
    }

    const handleSortBy=async()=>{
        try{
            console.log('select changedd')
            let url=`http://localhost:3000/api/v1/employees?sortBy=${selectedOption}`;
            if(showDeletedEmployees) url += `&deleted=true`
            if(searchInput) url += `&search=${searchInput}`
            const response=await fetch(url,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            const data=await response.json();
            if(data.message) employeesListData='';
            else employeesListData = data;
        }catch(error){
            console.log(error)
        }
    }

const handleDeleteEmployee=async(employeeId)=>{
    try{
        let url=`http://localhost:3000/api/v1/employees/${employeeId}`;
        const response=await fetch(url,{
                method:'DELETE',
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })

            if(response.ok){
                toast.success('Employee deleted successfully', {
                    duration: 5000,
                    position: 'top-center', // Set the position to 'top'
                });
            employeesListData=await fetchActiveEmployees();
            }else{
                toast.error('You are not authorized to delete this employee',{
                    duration:3000
                });
            }
    }catch(error){
        console.log(error.message)
    }
}

const handleUpdateEmployee=async(employeeId)=>{
    try{
        const response=await fetch(`http://localhost:3000/api/v1/employees/${employeeId}`,{
            headers:{
                'Authorization':`Bearer ${$user.token}`
            }
        })
        const data=await response.json();
        userToUpdate=data.data;
        showUpdateModal=true;
        console.log(data,'here is the data from update button')
    }catch(e){
        console.log(e.message)
    }
}

const handleActivateEmployee=async(employeeId)=>{
    try{
        const response=await fetch(`http://localhost:3000/api/v1/employees/${employeeId}/activate`,{
                method:'POST',
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })

            if(response.ok){
                toast.success('Employee Activated successfully', {
                    duration: 5000,
                    position: 'top-center', // Set the position to 'top'
                });
            employeesListData=await fetchDeletedEmployees();
            }else{
                toast.error('You are not authorized to delete this employee',{
                    duration:3000
                });
            }
    }catch(error){

    }
}

    onMount(async()=>{
        employeesListData=await fetchActiveEmployees();
    })

    const handlePageChange=async(event,offset)=>{
        try{
            console.log(searchInput,'Here is the search input')
            let url=`http://localhost:3000/api/v1/employees?offset=${offset}`;

            if (searchInput.trim() !== '') {
            url += `&search=${encodeURIComponent(searchInput.trim())}`;
        }

        // Check if there is a sort option selected
        if (selectedOption.trim() !== '') {
            url += `&sortBy=${encodeURIComponent(selectedOption.trim())}`;
        }
            const response=await fetch(url,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            const data=await response.json();
            employeesListData=data;
        }catch(error){
            console.log(`Here is the error in page change`, e.message)
        }
    }

</script>
<Toaster />

{#if showUpdateModal}
 <UpdateEmployeeModal {userToUpdate} on:modalClosed={()=>showUpdateModal=false} />
{/if}

<Navbar />
<div class="container-fluid">
    <div class="row vh-100">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main content -->
    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4 bg-light">
            <!-- <h1>Display Area</h1> -->
        
        <div class="chartjs-size-monitor pt-4">
            <!-- Searching and sorting -->
            <div class="mb-3">
                <div class="row  align-items-center justify-content-end">
                    <div class="col-4 d-flex  justify-content-center">
                        <input type="text" id="searchInput" class="form-control input-lg" bind:value={searchInput} on:keyup={()=>searchInput && handleSearch()} placeholder="Search" style="height: 50%;">
                    </div>
                    <div class="col-4 d-flex  justify-content-center align-items-center">
                        <label for="sortBySelect" class="col-form-label"><span style="white-space: nowrap; padding-right:10px">Sort By</span></label>
                        <select id="sortBySelect" class="form-select custom-select" bind:value={selectedOption} on:change={handleSortBy} style="height: 50%;">
                            <option selected>Choose...</option>
                            <option value="id">Id</option>
                            <option value="name">Name</option>
                            <option value="salary">Salary</option>
                            <option value="mobileNumber">Mobile Number</option>
                            <option value="role">Role</option>
                        </select>
                    </div>
                    <div class="col-4">
                        <div class="form-check d-flex  justify-content-center">
                            <input class="form-check-input" type="checkbox" id="deletedCheckbox" bind:checked={showDeletedEmployees}>
                            <label class="form-check-label" for="deletedCheckbox">
                                Deleted
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            {#if employeesListData}
    
            <EmployeeListTable {employeesListData} {showDeletedEmployees} {handleActivateEmployee} {handleDeleteEmployee} {handleUpdateEmployee}
          />

                
                {:else}
                    <h1>The List is empty</h1>
            {/if}


            <!-- Pagination -->

            {#if employeesListData}
            <nav aria-label="..." class="d-flex justify-content-center align-items-center">
                <ul class="pagination">
                <li class="page-item disabled">
                    <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
                </li>
                
                {#each Array.from({ length: employeesListData.metadata.totalPages }) as _, i (i+1)}
                    {#if employeesListData.metadata.currentPage === i+1}
                    <li class="page-item active" aria-current="page">
                        <a class="page-link" href="#" on:click|preventDefault={(event)=>handlePageChange(event,i+1)}>{i+1}</a>
                    </li>
                    {:else}
                    <li class="page-item"><a class="page-link" href="#" on:click|preventDefault={(event)=>handlePageChange(event,i+1)}>{i+1}</a></li>
                    {/if}
                {/each}
                
                <li class="page-item">
                    <a class="page-link" href="#">Next</a>
                </li>
                </ul>
            </nav>
            
            {/if}
        </div>
    </main>
    </div>
</div>
