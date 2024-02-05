<script>
    import Navbar from "../Components/Navbar.svelte";
    import Sidebar from "../Components/Sidebar.svelte";
    import Form from "../Components/Form.svelte";
    import formatDate from '../utils/formatDate.js'
    import { user } from "../stores/userStore";
    import toast, { Toaster } from 'svelte-french-toast';


    const formFields = [
    { type: 'date', name: 'fromDate', label: 'From' },
    { type: 'date', name: 'toDate', label: 'To' },
    { type: 'textarea', name: 'reason', label: 'Reason', placeholder: 'Enter reason for taking leave' },
  ];


  let error=''
  let success=false;
  let isError=false;
  let data;

const handleSubmit=async(formData)=>{
    try{
        let formatedFromDate=formatDate(formData.fromDate);
       let  formatedToDate=formatDate(formData.toDate);

       const response = await fetch(`http://localhost:3000/api/v1/me/leaves`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            'Authorization':`Bearer ${$user.token}`
        },
        body: JSON.stringify({
            fromDate:formatedFromDate,
            toDate:formatedToDate,
            reason:formData.reason
        }),
        });

        const data=await response.json();
        console.log(data)
        if(response.ok){
            toast.success('Leave applied successfully', {
                    duration: 5000,
                    position: 'top-center', 
                });
        }else{
            toast.error(data.message || data.error,{
                    duration:3000
                });
        }
        
    }catch(error){
        console.log(error)
    }
}

</script>
<Toaster />
<Navbar />
<div class="main-container">
    <Sidebar />
    <div class="display-area">
        <Form options={formFields}  formHeading="Apply for Leave" buttonLabel="Apply Leave" {handleSubmit} {error} {success} width="45%" />
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

