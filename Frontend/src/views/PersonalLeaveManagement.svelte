<script>
    import { onMount } from "svelte";
    import Sidebar from "../Components/Sidebar.svelte";
    import Navbar from "../Components/Navbar.svelte";
    import LeavesStatusComponent from '../Components/Leaves/LeavesStatusComponent.svelte'
    import LeavesInSystemTable from '../Components/Leaves/LeavesInSystemTable.svelte'
    import { user } from "../stores/userStore";
    import toast, { Toaster } from 'svelte-french-toast';

    let leaves;
    let leaveStatus='approved';

    const fetchLeaves=async()=>{
        try{
            let url=`http://localhost:3000/api/v1/me/leaves?status=${leaveStatus}`;
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

    const handleStatusChange=async(event)=>{
        leaveStatus=event.detail.status;
        leaves=await fetchLeaves()
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

    onMount(async()=>{
        leaves=await fetchLeaves();
    })
</script>

<Toaster />
<Navbar />
<div class="main-container">
    <Sidebar />
    <div class="display-area">
        <div  style="margin-bottom: 3em;">
            <LeavesStatusComponent on:setLeaveStatus={handleStatusChange} selectedStatus={leaveStatus} />
        </div>
            {#if leaves}
                <LeavesInSystemTable leavesData={leaves.data} {handleDeleteLeaveButton} />
            {:else}
                <h3>No such leaves are present</h3>
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