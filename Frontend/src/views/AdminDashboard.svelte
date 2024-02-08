<script>
    import { onMount } from "svelte";
    import Navbar from "../Components/Navbar.svelte";
    import Sidebar from "../Components/Sidebar.svelte";
    import { user } from "../stores/userStore";
    import toast, { Toaster } from 'svelte-french-toast';
    import UpdateEmployeeModal from "../Components/UpdateEmployeeModal.svelte";
    import EmployeeListTable from "../Components/EmployeeListTable.svelte";
    import Pagination from "../Components/Pagination.svelte";


    let employeesListData;
    let showDeletedEmployees=false;
    let searchInput=''
    let selectedOption=''
    let orderOption;
    let showUpdateModal=false;
    let userToUpdate;

    const {id,email,role,token}=$user;

    $: {
        if (showDeletedEmployees) {
            fetchDeletedEmployees().then(data => {
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
            if(selectedOption && orderOption) url += `&order=${orderOption}`
            const response=await fetch(url,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            const data=await response.json();
            if(response.ok) return data;
            else return ''
        }catch(e){
            console.log(e.message)
        }
    }


    const fetchDeletedEmployees=async()=>{
        try{
            let url=`http://localhost:3000/api/v1/employees?deleted=true`;
            if(searchInput) url += `&search=${searchInput}`;
            if(selectedOption) url += `&sortBy=${selectedOption}`
            if(selectedOption && orderOption) url += `&order=${orderOption}`
            const response=await fetch(url,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            const data=await response.json();
            if(response.ok) return data;
            else return ''
        }catch(e){
            console.log(e.message)
        }
    }

    const handleSearch=async ()=>{
        try{
            
            let url=`http://localhost:3000/api/v1/employees?search=${searchInput}`;
            if(showDeletedEmployees) url += `&deleted=true`
            if(selectedOption) url += `&sortBy=${selectedOption}`
            if(selectedOption && orderOption) url += `&order=${orderOption}`
            else url=url
            const response=await fetch(url,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            const data=await response.json();
            if(data.message) employeesListData='';
            else employeesListData = data;
        }catch(error){
            console.log(error.message)
        }
    }

    const handleSortBy=async()=>{
        try{
            let url=`http://localhost:3000/api/v1/employees?sortBy=${selectedOption}`;
            if(showDeletedEmployees) url += `&deleted=true`
            if(searchInput) url += `&search=${searchInput}`
            if(orderOption) url += `&order=${orderOption}`
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

    const handleOrder = async () => {
    try {
        if (!selectedOption) {
            console.error('Please select a Sort By option before ordering.');
            return;
        }

        let url = `http://localhost:3000/api/v1/employees?sortBy=${selectedOption}&order=${orderOption}`;

        if (showDeletedEmployees) url += `&deleted=true`;
        if (searchInput) url += `&search=${searchInput}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if(response.ok){
            employeesListData=data;
        }else{
            employeesListData='';
        }
    } catch (error) {
        console.log(error);
    }
};


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
                    position: 'top-center', 
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
                    position: 'top-center',
                });
                employeesListData=await fetchDeletedEmployees();
            }else{
                toast.error('You are not authorized to delete this employee',{
                    duration:3000
                });
                employeesListData=''
            }
    }catch(error){
        console.log(error.message)
    }
}

    onMount(async()=>{
        employeesListData=await fetchActiveEmployees();
    })

    const handlePageChange=async(offset)=>{
        try{
            let url=`http://localhost:3000/api/v1/employees?offset=${offset}`;

            if (searchInput.trim() !== '') {
            url += `&search=${encodeURIComponent(searchInput.trim())}`;
        }

        // Check if there is a sort option selected
        if (selectedOption.trim() !== '') {
            url += `&sortBy=${encodeURIComponent(selectedOption.trim())}`;
        }

        if(selectedOption && orderOption) url += `&order=${orderOption}`
            const response=await fetch(url,{
                headers:{
                    'Authorization':`Bearer ${token}`
                }
            })
            const data=await response.json();
            employeesListData=data;
        }catch(error){
            console.log( e.message)
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
        
        <div class="chartjs-size-monitor pt-4">
            <div class="mb-3">
                <div class="row  align-items-center justify-content-end">
                    <div class="col-4 d-flex  justify-content-center">
                        <input type="text" id="searchInput" class="form-control input-lg" bind:value={searchInput} on:keyup={()=>searchInput && handleSearch()} placeholder="Search" style="height: 50%;">
                    </div>
                    <div class="col-5 d-flex  justify-content-center align-items-center">
                        <div class="col-4 d-flex  justify-content-center align-items-center">
                            <label for="sortBySelect" class="col-form-label"><span style="white-space: nowrap; padding-right:10px">Sort By</span></label>
                            <select id="sortBySelect" class="form-select custom-select" bind:value={selectedOption} on:change={handleSortBy} style="height: 50%;">
                                <option value=''>none</option>
                                <option value="id">Id</option>
                                <option value="name">Name</option>
                                <option value="salary">Salary</option>
                                <option value="mobileNumber">Mobile Number</option>
                                <option value="role">Role</option>
                            </select>
                        </div>
                        <div class="col-4 d-flex justify-content-center align-items-center">
                            <label for="orderSelect" class="col-form-label"><span style="white-space: nowrap; padding-right:10px; padding-left:10px">Order</span></label>
                            <select id="orderSelect" class="form-select custom-select" bind:value={orderOption} on:change={handleOrder} style="height: 50%;">
                                <option value=''>none</option>
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>

                    

                    <div class="col-3">
                        <div class="form-check d-flex  justify-content-center">
                            <input class="form-check-input" type="checkbox" id="deletedCheckbox" bind:checked={showDeletedEmployees}>
                            <label class="form-check-label" for="deletedCheckbox" style="margin-left: 3%;">
                                Deleted
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            {#if employeesListData}
                <EmployeeListTable {employeesListData} {showDeletedEmployees} {handleActivateEmployee} {handleDeleteEmployee} {handleUpdateEmployee} />
            {:else}
            <h3 class="text-center" style="margin-top:15%; color:#B4B4B8">No such employees found in the system</h3>
            {/if}

            <!-- Pagination -->

            {#if employeesListData}
            {console.log(employeesListData,'here is employee data')}
            <Pagination totalPages={employeesListData.metadata.totalPages} currentPage={employeesListData.metadata.currentPage} onPageChange={handlePageChange} />
            {/if}

        </div>
    </main>
    </div>
</div>
