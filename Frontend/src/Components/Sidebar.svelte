<script>
    import { goto } from '$app/navigation';
    import { user } from "../stores/userStore";
    import { onMount } from "svelte";

  let employeeInfo;

  const fetchEmployeeInfo=async()=>{
    try{
      const response = await fetch(`http://localhost:3000/api/v1/me`, {
          method: "GET",
          headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              'Authorization':`Bearer ${$user.token}`
          }
          });
        const data=await response.json();
        return data;
    }catch(e){
      console.log(e.message)
    }
  }
    
  let employee = {
    name: "John Doe",
    designation: "Software Engineer",
    avatar: "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&q=70&fm=webp",
  };

  let menuItems = [
    { label: "All Employees", action: "/dashboard/employees" },
    { label: "Get All Leaves", action: "/dashboard/employees/leaves" },
    { label: "Apply for Leave", action: "/dashboard/me/leave" },
    { label: "List Personal Leaves", action: "/dashboard/me/leaves" },
    { label: "Reset Password", action: "/dashboard/me/password" },
    { label: "My Profile", action: "/dashboard/me/profile"}
  ];

  
  function handleMenuClick(action) {
    goto(action)
  }

  onMount(async()=>{
    try{
      employeeInfo=await fetchEmployeeInfo();
      console.log()
    }catch(e){
      console.log(e.message)
    }
  })

</script>

<!-- {console.log(employeeInfo?.data.name)} -->
<nav id="sidebar" class="col-md-3 col-lg-2 d-md-blocksidebar">
  <div class="text-center d-flex justify-content-around align-items-center">
    <img src={employeeInfo?.data.profilePictureURL} alt="Profile Picture" class="profile-pic img-fluid rounded-circle mt-3 mb-2" width="100" height="100" />
    <div class="d-flex flex-column justify-content-center align-items-center">
      <h5 class="mb-0">{employeeInfo?.data.name}</h5>
      <p class="text-muted m-0 p-0">{employee.designation}</p>
    </div>
  </div>

  <hr />

  <ul class="nav flex-column ">
    {#each menuItems as { label, action }}
      <li class="nav-item">
        <a href="#" style="color:rgb(39 39 42); font-weight:500" on:click={() => handleMenuClick(action)} class="nav-link">{label}</a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .rounded-circle {
  width: 70px; /* Set the desired width */
  height: 65px; /* Set the desired height */
  border-radius: 50%;
  object-fit: cover;
}

</style>