<script>
    import { onMount } from 'svelte';
    import Navbar from '../Components/Navbar.svelte'
    import Sidebar from '../Components/Sidebar.svelte';
    import UpdateProfileModal from "../Components/UpdateProfileModal.svelte";
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
        <div class="user-info">
            <img class="profile-picture" src="{loggedInEmployee?.profilePictureURL}" alt="Profile Picture">
            <div class="info-item">
                <span class="label">Name :</span>
                <span class="value">{loggedInEmployee?.name}</span>
            </div>
            <div class="info-item">
                <span class="label">Email :</span>
                <span class="value">{loggedInEmployee?.email}</span>
            </div>
            <div class="info-item">
                <span class="label">Mobile Number :</span>
                <span class="value">{loggedInEmployee?.mobileNumber}</span>
            </div>
            <div class="info-item">
                <span class="label">Profile Picture Link :</span>
                <span class="value">{loggedInEmployee?.profilePictureURL}</span>
            </div>
            <div class="info-item">
                <span class="label">Salary :</span>
                <span class="value">{loggedInEmployee?.salary}</span>
            </div>
            <div class="info-item">
                <span class="label">Role :</span>
                <span class="value">{loggedInEmployee?.role}</span>
            </div>
            <div class="info-item">
                <span class="label">Leaves left :</span>
                <span class="value">{loggedInEmployee?.leavesLeft}</span>
            </div>

            <button type="button" class="btn btn-danger" on:click={handleDeleteAccount}>Delete account</button>
            <button type="button" class="btn btn-primary" on:click={()=>{showUpdateModal=true}}>Update Profile</button>
        </div>
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

    .user-info {
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        padding: 20px;
        margin: 20px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    }

    .user-info img.profile-picture {
        max-width: 100%;
        height: auto;
        border-radius: 50%;
        margin-bottom: 20px;
    }

    .user-info span {
        display: block;
        margin-bottom: 15px;
        font-size: 18px;
        color: #555555;
    }

    .user-info span.label {
        font-weight: bold;
        color: #333333;
    }

    .user-info span.value {
        font-weight: normal;
    }

    img {
        width: 6%;
    }

    .user-info .info-item {
        display: flex;;
        margin-bottom: 15px;
    }

    .user-info span.label {
        font-weight: 500;
        color: #007bff;
    }
   .value{
        margin-left: 2%;
    }
</style>
