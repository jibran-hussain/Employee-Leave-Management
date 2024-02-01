<script>
    
    let employee = {
      name: "John Doe",
      designation: "Software Engineer",
      avatar: "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&q=70&fm=webp",
    };
  
    let menuItems = [
      { label: "All Employees", action: "listAllEmployees" },
      { label: "Get All Leaves", action: "getAllLeaves" },
      { label: "List Personal Leaves", action: "listPersonalLeaves" },
      { label: "Reset Password", action: "resetPassword" },
    ];

    
    function handleMenuClick(action) {
      // Handle menu item click based on the action
      console.log(`Clicked on ${action}`);
    }

  </script>
  

  <nav id="sidebar" class="col-md-3 col-lg-2 d-md-blocksidebar">
    <div class="text-center">
      <img src={employee.avatar} alt="Profile Picture" class="img-fluid rounded-circle mt-3 mb-2" width="100" height="100" />
      <h5 class="mb-0">{employee.name}</h5>
      <p class="text-muted">{employee.designation}</p>
    </div>

    <hr />

    <ul class="nav flex-column">
      {#each menuItems as { label, action }}
        <li class="nav-item">
          <a href="#" on:click={() => handleMenuClick(action)} class="nav-link text-dark">{label}</a>
        </li>
      {/each}
    </ul>
  </nav>
  
