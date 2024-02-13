<script>
    import { onMount } from "svelte";
    import LeavesStatusComponent from '../Components/Leaves/LeavesStatusComponent.svelte'
    import LeavesInSystemTable from '../Components/Leaves/LeavesInSystemTable.svelte'
    import UpdateLeaveModal from "../Components/UpdateLeaveModal.svelte";
    import Pagination from "../Components/Pagination.svelte";
    import { user } from "../stores/userStore";
    import toast from 'svelte-french-toast';

    let leaves;
    let leaveStatus='approved';
    let leaveTypesSummary;
    let showUpdateLeaveModal=false;
    let leaveToUpdate;
    let searchInput='';

    const fetchLeaves=async()=>{
        try{
            let url=`http://localhost:3000/api/v1/me/leaves?status=${leaveStatus}&search=${searchInput}`;
            const response=await fetch(url,{
                method:'GET',
                headers:{
                    Authorization:`Bearer ${$user.token}`
                }
            });
            if(response.ok){
                let data=await response.json();
                console.log(data)
                return data;
            }
            else return undefined;
        }catch(error){
            console.log(error.message)
        }
    }

    const fetchLeaveSummary=async()=>{
        try{
            const response=await fetch(`http://localhost:3000/api/v1/me/leaves/summary`,{
                method:'GET',
                headers:{
                    Authorization:`Bearer ${$user.token}`
                }
            });
            const data=await response.json();
            return data;
        }catch(error){
            console.log(error.message)
        }
    }

    const handleStatusChange=async(event)=>{
        leaveStatus=event.detail.status;
        leaves=await fetchLeaves()
        leaveTypesSummary=await fetchLeaveSummary();
    }

    const handleDeleteLeaveButton=async (leaveId)=>{ 
        try{
            const response=await fetch(`http://localhost:3000/api/v1/me/leaves/${leaveId}`,{
                method:"DELETE",
                headers:{
                    Authorization:`Bearer ${$user.token}`
                }
            })
            const data=await response.json();
            if(response.ok){
                toast.success('Leave deleted successfully', {
                        duration: 5000,
                        position: 'top-center',
                    });
            leaves=await fetchLeaves()
            leaveTypesSummary=await fetchLeaveSummary();
            }
            else{
                toast.error(data.error || data.message,{
                        duration:3000
                    });
            }
        }catch(error){
            console.log(error.message)
        }
    }

    const handlePageChange=async(event,offset)=>{
    try{
      const response=await fetch(`http://localhost:3000/api/v1/me/leaves/${leaveId}&offset=${offset}&search=${searchInput}`,{
                method:'GET',
                headers:{
                    Authorization:`Bearer ${$user.token}`
                }
            });
      const data= await response.json();
      if(response.ok){
            leaves= data;
            }
            else return undefined;
    }catch(error){
        console.log(error.message)
    }
  }

    const handleUpdateLeaveButton=(leaveId)=>{
        showUpdateLeaveModal=true;
        leaveToUpdate=leaveId   
    }

    const handleCloseModal=async()=>{
        showUpdateLeaveModal=false
        leaves=await fetchLeaves();
        leaveTypesSummary=await fetchLeaveSummary();
    }

    onMount(async()=>{
        leaves=await fetchLeaves();
        leaveTypesSummary=await fetchLeaveSummary();
    })
</script>

{#if showUpdateLeaveModal}
    <UpdateLeaveModal {leaveToUpdate} on:modalClosed={handleCloseModal} />
{/if}

<div class="mt-3 mb-4">
<input type="search" class="form-control form-control-sm w-25 mb-3 mt-4" bind:value={searchInput} on:keyup={async()=>leaves=await fetchLeaves()} placeholder="Search a leave....."/>
</div>
<div  style="margin-bottom: 3em;">
    <LeavesStatusComponent on:setLeaveStatus={handleStatusChange} {leaveTypesSummary} selectedStatus={leaveStatus} />
</div>

{#if leaves}
    <LeavesInSystemTable leavesData={leaves} {handleDeleteLeaveButton} {handleUpdateLeaveButton} />
    <Pagination totalPages={leaves.metadata.totalPages} currentPage={leaves.metadata.page} onPageChange={handlePageChange} />
{:else}
    <h4 class="text-center" style="margin-top:15%; color:#B4B4B8">No such leaves in the system</h4>
{/if}
