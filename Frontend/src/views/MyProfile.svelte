<script>
    import { onMount } from 'svelte';
    import Navbar from '../Components/Navbar.svelte'
    import Sidebar from '../Components/Sidebar.svelte';
    import UpdateProfileModal from "../Components/UpdateProfileModal.svelte";
    import UserDisplay from '../Components/UserDisplay.svelte';
    import { user } from "../stores/userStore";
    import toast, { Toaster } from 'svelte-french-toast';
    import { goto } from '$app/navigation';

    let loggedInEmployee;
    let showUpdateModal=false;
    let userToUpdate;

    const fetchEmployeeDetail=async()=>{
        try{
            const response = await fetch(`http://localhost:3000/api/v1/me/`,{
                method:"GET",
                headers:{
                    Accept:'application/json',
                    'Content-Type':'application/json',
                    Authorization:`Bearer ${$user.token}`
                }
            });
            const userToUpdate=await response.json();
            loggedInEmployee=userToUpdate.data;
        }catch(error){
            console.log(error.message)
        }
    }
    
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

    onMount(async()=>{
        await fetchEmployeeDetail()
    })

</script>

{#if showUpdateModal}
 <UpdateProfileModal {userToUpdate} on:modalClosed={()=>showUpdateModal=false} />
{/if}

<Toaster />
<Navbar />
<div class="main-container">
    <Sidebar />
    <div class="display-area">
        <!-- Use the UserDisplay component -->
        <UserDisplay
          employee={loggedInEmployee}
          {showUpdateModal}
          {handleDeleteAccount}
        />
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
