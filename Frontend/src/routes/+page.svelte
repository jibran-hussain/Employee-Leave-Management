<script>
    import { goto } from '$app/navigation';
    import '../global.css';
    import Form from '../Components/Form.svelte';
    import {decodeJwtToken} from '../utils/decodeJwtToken.js'
    import {user} from '../stores/userStore.js'

    const formFields=[
               {type:'email',name:'email',label:'Email',placeholder:'Enter email'},
               {type:'password',name:'password',label:'Password',placeholder:'Password'},
            ]

    let error=''
    let isError=false;
    let data;

    const handleSubmit=async(formData)=>{
        try{
            const response = await fetch(`http://localhost:3000/api/v1/auth/signin`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
            });
             data=await response.json()
            // show the error
            if(data.error){
                isError=true;
            }
            else{
                const {token}=data;
                localStorage.setItem('jwt',`${JSON.stringify(token)}`)
                const decodedToken=decodeJwtToken(token);
                user.set(decodedToken)
                goto('/dashboard')
                console.log($user,'just checking')
            }
            
        }catch(error){
            console.log(error)
        }
    }

    $:{
        if(isError) error=data.error
    }
    console.log("in parent")

</script>

<header>
    <p class="mb-0">EMPLOYEE LEAVE MANAGEMENT SYSTEM</p>
</header>

<Form options={formFields} {handleSubmit} {error} />

<style>
    header{
        display: flex;
        justify-content: center;
        align-items: center;
        background-image: linear-gradient(to left, #553c9a, #b393d3);
        color: white;
        font-weight:600;
        height: 7vh;
        margin-bottom: 7em;
    }
</style>