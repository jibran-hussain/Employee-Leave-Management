<script>
  import { createEventDispatcher } from 'svelte';
  import Form from './Form.svelte';
  import { user } from '../stores/userStore';

  const dispatch = createEventDispatcher();

  let showModal = true;

  function closeModal() {
    showModal = false;
    dispatch('modalClosed');
  }

  const formFields = [
    { type: 'text', name: 'name', label: 'Name', placeholder: 'Enter name' },
    { type: 'email', name: 'email', label: 'Email', placeholder: 'Enter email' },
    { type: 'password', name: 'password', label: 'Password', placeholder: 'Enter Password' },
    { type: 'number', name: 'mobileNumber', label: 'Mobile Number', placeholder: 'Enter Mobile Number' },
    { type: 'number', name: 'salary', label: 'Salary', placeholder: 'Enter Salary' },
    { type: 'select', name: 'role', label: 'Select Role', options:['superadmin','admin','employee'] }
  ];

  let error=''
  let success=false;
  let isError=false;
  let data;

const handleSubmit=async(formData)=>{
    try{
      console.log($user)
      console.log(formData,'here is the register data')
        const response = await fetch(`http://localhost:3000/api/v1/auth/signup`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            'Authorization':`Bearer ${$user.token}`
        },
        body: JSON.stringify(formData),
        });
         data=await response.json()
        // show the error
        if(data.error){
            isError=true;
            error=data.error
        }else{
          success=true;
          error=false
        }
        
    }catch(error){
        console.log(error)
    }
}

// $:{
//         if(isError) error=data.error
//     }
</script>


<div class="container-fluid  outer-model-container">
  <div class="modal-content">
      <!-- Add your form elements and logic here -->
      <Form options={formFields}  formHeading="Register Employee" {handleSubmit} {error} {success} />
      <button on:click={closeModal}>Close</button>
  </div>
</div>

<style>
  /* Add your modal styles here */
  .outer-model-container {
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
  }

  .modal-content {
      background-color: white;
      max-width: 50%;
      max-height: 80%;
      overflow-y: auto;
      padding: 20px;
      border-radius: 10px;
  }

  h2 {
      margin-bottom: 20px;
      color: black;
  }

  button {
      margin-top: 20px;
      padding: 10px;
      cursor: pointer;
  }
</style>
