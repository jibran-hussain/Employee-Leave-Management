<script>
    import { createEventDispatcher } from "svelte";

    const dispatch =createEventDispatcher()

    export let employee;
    export let showUpdateModal;
    export let handleDeleteAccount;
    $: console.log(employee)
  </script>
  
  <div class="user-info">
      <img class="profile-picture" src="{employee?.profilePictureURL}" alt="Profile Picture">
      <div class="info-item">
          <span class="label">Name :</span>
          <span class="value">{employee?.name}</span>
      </div>
      <div class="info-item">
        <span class="label">Email :</span>
        <span class="value">{employee?.email}</span>
        </div>
        <div class="info-item">
            <span class="label">Mobile Number :</span>
            <span class="value">{employee?.mobileNumber}</span>
        </div>
        <div class="info-item">
            <span class="label">Profile Picture Link :</span>
            <span class="value">{employee?.profilePictureURL}</span>
        </div>
        <div class="info-item">
            <span class="label">Salary :</span>
            <span class="value">{employee?.salary}</span>
        </div>
        <div class="info-item">
            <span class="label">Role :</span>
            <span class="value">{employee?.role}</span>
        </div>
        <div class="info-item">
            <span class="label">Leaves left :</span>
            <span class="value">{employee?.leavesLeft}</span>
        </div>

        <button type="button" class="btn btn-danger" on:click={handleDeleteAccount}>Delete account</button>
        <button type="button" class="btn btn-primary" on:click={() => dispatch('showUpdateModal')}>Update Profile</button>
    </div>
  
    <style>
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
            color: #40A2E3;
        }
    .value{
            margin-left: 2%;
        }
    </style>

  