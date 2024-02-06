<script>
    import { onMount } from 'svelte';
    import Navbar from '../Components/Navbar.svelte'
    import Sidebar from '../Components/Sidebar.svelte';
    import UpdateProfileModal from "../Components/UpdateProfileModal.svelte";
    import UserDisplay from '../Components/UserDisplay.svelte';
    import { user } from "../stores/userStore";
    import toast, { Toaster } from 'svelte-french-toast';
    import { goto } from '$app/navigation';

    let employeeId;
    let employee;
    let showUpdateModal=false;
    let userToUpdate;
    
    const handleDeleteAccount=async()=>{
        try{
            const response=await fetch(`http://localhost:3000/api/v1/me`,{
                method:'DELETE',
                headers:{
                    'Authorization':`Bearer ${$user.token}`
                }
            })

            if(response.ok){
                toast.success('Account deleted successfully', {
                    duration: 5000,
                    position: 'top-center', 
                });
            goto('/');
            }else{
                const data=await response.json();
                toast.error(data.error,{
                    duration:5000
                });
            }
        }catch(error){
            console.log(error.message)
        }
    }

    const handleSearchEmployee=async()=>{
        try{
            const response = await fetch(`http://localhost:3000/api/v1/employees/${employeeId}`,{
                method:"GET",
                headers:{
                    Accept:'application/json',
                    'Content-Type':'application/json',
                    Authorization:`Bearer ${$user.token}`
                }
            });
            const {data}=await response.json();
            console.log(data,'in handle search bar')
            if(response.ok) employee=data
            else employee=''
        }catch(error){

        }
    }

</script>

{#if showUpdateModal}
 <UpdateProfileModal {userToUpdate} on:modalClosed={()=>showUpdateModal=false} />
{/if}

<Toaster />
<Navbar />
<div class="main-container">
    <Sidebar />
    <div class="display-area">
        <form on:submit|preventDefault={handleSearchEmployee}>
            <label>
                <input type="number" bind:value={employeeId} placeholder="Enter employee id">
            </label>
            <button>Search</button>
        </form>
        {#if employee}
        {console.log(employee,'data near props')}
            <UserDisplay
            {employee}
            {showUpdateModal}
            {handleDeleteAccount}
        />
        {:else}
        <h3 class="text-center" style="margin-top:15%; color:#B4B4B8">No Employee found</h3>

        {/if}
    </div>
</div>

<style>
    .main-container {
            display: flex;
            height: 100vh;
        }

        .display-area {
            flex: 1;
            padding: 3%;
        }
</style>
