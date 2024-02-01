<script>
export let options;

export let handleSubmit
let formData={};
export let error;
console.log('in form')
</script>
{JSON.stringify({formData})}<br>

<div class="container mt-5 w-25">
    <h2 class="mb-5">Signin</h2>
    {#if error}
        <p class="text-center text-danger">{error}</p>
    {/if}

    <form class="form" on:submit|preventDefault={()=>handleSubmit(formData)}>
        
        {#each options as option(option)}
            {#if option.type === 'text'}

                <div class="mb-3 mt-3">
                    <label for={option.name} class="form-label">{option.label}:</label>
                    <input type="text" class="form-control" bind:value={formData[option.name]} id={option.name} placeholder={option.placeholder} name={option.name}>
                </div>
    
            {:else if option.type === 'password'}

                <div class="mb-3">
                    <label for={option.name} class="form-label">{option.label}</label>
                    <input type="password" class="form-control" bind:value={formData[option.name]} id={option.name} placeholder={option.placeholder}>
                </div>
    
            {:else if option.type === 'email'}

            <div class="mb-3 mt-3">
                <label for={option.name} class="form-label">{option.label}</label>
                <input type="email" class="form-control" bind:value={formData[option.name]} id={option.name} placeholder={option.placeholder} name={option.name}>
              </div>
    
            <!-- {:else if option.type === 'date'}
            <div class="form-input">
                <label>{option.label}
                    <br>
                    <input type='date' placeholder={option.placeholder} bind:value={formData[option.name]} />
                </label><br>
            </div>
            
            {:else if option.type === 'select' }
                <div class="form-input">
                    <label>{option.label}
                        <br>
                        <select bind:value={formData[option.name]}>{option.label}
                            <option selected disabled>--select--</option>
                            {#each option.options as option}
                                <option value={option.value}>{option.value}</option>
                            {/each}
                        </select>
                    </label><br>
                </div> -->
            {/if}
        {/each}
    
        <button type="submit" class="btn btn-primary w-100 mt-3">Submit</button>

    </form>
</div>
