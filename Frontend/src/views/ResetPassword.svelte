<script>
    import Navbar from "../Components/Navbar.svelte";
    import Sidebar from "../Components/Sidebar.svelte";
    import Form from "../Components/Form.svelte";
    import { user } from "../stores/userStore";
    import toast, { Toaster } from 'svelte-french-toast';


    const formFields=[
               {type:'password',name:'oldPassword',label:'Enter Old Password',placeholder:'Old Password'},
               {type:'password',name:'newPassword',label:'Enter New Password',placeholder:'New Password'},
               {type:'password',name:'confirmPassword',label:'Confirm Password',placeholder:'Confirm Password'}
            ]

    let success;
    let isSuccess=false
    let error=''
    let isError=false;
    let data;

    const handleSubmit=async(formData)=>{
        try{
            console.log(formData)
            const response = await fetch(`http://localhost:3000/api/v1/me/password`, {
            method: "PATCH",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization:`Bearer ${$user.token}`
            },
            body: JSON.stringify(formData),
            });
             data=await response.json()
            
            if(response.ok){
                success=`Password changed successfully`
                isSuccess=true;
            }else{
                isError=true;
            }
            
        }catch(error){
            // console.log(error)
        }
    }

    $:{
        if(isError) error=data.error
    }
</script>

<Toaster />
<Navbar />
<div class="main-container">
    <Sidebar />
    <div class="display-area">
        <Form options={formFields} formHeading="Reset Password" {handleSubmit} {error} {success} width='45%' />
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