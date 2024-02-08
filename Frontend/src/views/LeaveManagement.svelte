<script>
    import Sidebar from "../Components/Sidebar.svelte";
    import Navbar from "../Components/Navbar.svelte";
    import LeavesStatusComponent from "../Components/Leaves/LeavesStatusComponent.svelte";
    import LeavesInSystemTable from "../Components/Leaves/LeavesInSystemTable.svelte";
    import toast, { Toaster } from 'svelte-french-toast';
    import { user } from "../stores/userStore";
    import { onMount } from "svelte";

    let leaves;
    let leaveStatus='Under Process';
    let searchInput='';



    const fetchLeaves=async()=>{
        try{
            let url=`http://localhost:3000/api/v1/leaves?status=${leaveStatus}&search=${searchInput}`;
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
            else return 'undefined';
        }catch(error){
            console.log(error.message)
        }
    }

    const handlePageChange=async(event,offset)=>{
    try{
      const response=await fetch(`http://localhost:3000/api/v1/leaves?status=${leaveStatus}&offset=${offset}`,{
                method:'GET',
                headers:{
                    Authorization:`Bearer ${$user.token}`
                }
            });
      const data= await response.json();
      if(response.ok){
            leaves= data;
            }
            else return 'undefined';
    }catch(error){
        console.log(error.message)
    }
  }

    const handleStatusChange=async(event)=>{
        leaveStatus=event.detail.status;
        leaves=await fetchLeaves()
    }

    const handleAcceptLeaveButton=async (leaveId)=>{
        try{
            const response=await fetch(`http://localhost:3000/api/v1/leaves/${leaveId}/accept`,{
                method:"POST",
                headers:{
                    Authorization:`Bearer ${$user.token}`
                }
            })

            if(response && response.ok === false){
                toast.error('You cannot approve the leave of this employee',{
                    duration:3000
                });
            }else{
                toast.success('Leave Approved', {
                    duration: 5000,
                    position: 'top-center',
                });
                console.log('boya')
                leaves=await fetchLeaves()
            }

            console.log(response)
        }catch(error){
            console.log(error)
        }
    }

    const handleRejectionSubmit = async(event) => {
    try{
      const response = await fetch(`http://localhost:3000/api/v1/leaves/${event.detail.leaveId}/reject`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            'Authorization':`Bearer ${$user.token}`
        },
        body: JSON.stringify({rejectionReason:event.detail.rejectionReason}),
        });
      const data=await response.json();
      if(response.ok){
        toast.success('Leave Rejected', {
                duration: 5000,
                position: 'top-center',
            });
            leaves=await fetchLeaves();
      }
      else{
        toast.error(data.error || data.message,{
                duration:3000
            });
      }

    }catch(e){
        console.log(e.message)
    }
  };

    onMount(async()=>{
        leaves=await fetchLeaves();
    })


</script>
<Toaster />
<Navbar />
<div class="main-container">
    <Sidebar />
    <div class='display-area'>
        <input type="search" class="form-control form-control-sm w-25 mb-3" bind:value={searchInput} on:keyup={async()=>leaves=await fetchLeaves()} placeholder="Search a leave....."/>
        <div  style="margin-bottom: 3em;">
            <LeavesStatusComponent on:setLeaveStatus={handleStatusChange} selectedStatus={leaveStatus} />
        </div>
        {#if leaves}
             <LeavesInSystemTable leavesData={leaves} {handleAcceptLeaveButton}  {handleRejectionSubmit} {handlePageChange} />
        {:else}
        <h4 class="text-center" style="margin-top:15%; color:#B4B4B8">No such leaves in the system</h4>

        {/if}
    </div>
</div>


<style>
    .main-container{
        display: flex;
        height: 100vh;
    }

    .display-area{
        flex: 1;
        padding:3%;
    }
</style>