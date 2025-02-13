<script>
    import { onMount } from 'svelte';
  
    let scheduledTests = [];
    let cronExpression = '';
    let taskName = '';
    let tags = '';
    let successMessage = '';
    let errorMessage = '';
    let isModalOpen = false;

    // Fetch scheduled tests (cron jobs) from the backend API
    async function fetchScheduledTests() {
      try {
        const res = await fetch('http://localhost:3001/cron-jobs');
        const data = await res.json();
        if (data.cronJobs) {
          scheduledTests = data.cronJobs;
        }
      } catch (error) {
        errorMessage = "Error fetching scheduled tests.";
        console.error("Error fetching scheduled tests:", error);
      }
    }
  
    // Add a new cron job via the API
    async function addCronJob() {
      if (!cronExpression || !taskName || !tags) {
        errorMessage = 'Please fill in all fields';
        return;
      }
  
      try {
        const res = await fetch('http://localhost:3001/cron-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cronExpression, taskName, tags }),
        });
        const data = await res.json();
        if (data.message) {
          successMessage = `Cron job added: ${data.message}`;
          fetchScheduledTests(); // Refresh the list
          setTimeout(() => {
            successMessage = ''; // Clear success message after 5 seconds
          }, 5000);
        } else {
          errorMessage = 'Failed to add cron job';
        }
      } catch (error) {
        errorMessage = 'Error adding cron job.';
        console.error('Error adding cron job:', error);
      }
    }
  
    // Delete a cron job
    async function deleteCronJob(taskName) {
      try {
        const res = await fetch(`http://localhost:3001/cron-jobs/${taskName}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.message) {
          successMessage = `Cron job deleted: ${data.message}`;
          fetchScheduledTests(); // Refresh the list
          setTimeout(() => {
            successMessage = ''; // Clear success message after 5 seconds
          }, 5000);
        } else {
          errorMessage = 'Failed to delete cron job';
        }
      } catch (error) {
        errorMessage = 'Error deleting cron job.';
        console.error('Error deleting cron job:', error);
      }
    }
  
    onMount(fetchScheduledTests);
</script>
  

<dialog id="my_modal_1" class="modal" class:modal-open={isModalOpen}>
    <div class="modal-box">
        <div class="modal-header">
            <button 
                class="btn btn-sm btn-circle absolute right-2 top-2" 
                on:click={() => isModalOpen = false}
            >
                ✖
            </button>
        </div>
        
        {#if successMessage}
            <div role="alert" class="alert alert-success">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMessage}</span>
            </div>
        {/if}
    
        {#if errorMessage}
            <div role="alert" class="alert alert-error">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
            </div>
        {/if}
        <h2 class="card-title mb-4">Add New Cron Job</h2>
        <form
            on:submit|preventDefault={addCronJob}
            class="space-y-4"
        >
            <div>
                <div for="taskName" class="label">
                    <span class="label-text">Task Name</span>
                    <span class="label-text-alt">Use a meaningful name</span>
                </div>
                <input
                    type="text"
                    id="taskName"
                    bind:value={taskName}
                    class="input input-bordered w-full"
                    placeholder="Task Name"
                    required
                />
            </div>
            <div>
                <div for="cronExpression" class="label">
                    <span class="label-text">Cron Expression</span>
                    <span class="label-text-alt">You can use AI to construct your expression</span>
                </div>
                <input
                    type="text"
                    id="cronExpression"
                    bind:value={cronExpression}
                    class="input input-bordered w-full"
                    placeholder="Cron Expression"
                    required
                />
            </div>
            <div>
                <div for="tags" class="label">
                    <span class="label-text">Tags</span>
                    <span class="label-text-alt">If using multiple tags, "@test-1 OR test-2"</span>
                </div>
                <input
                    type="text"
                    id="tags"
                    bind:value={tags}
                    class="input input-bordered w-full"
                    placeholder="tags"
                    required
                />
            </div>
            <button type="submit" class="btn btn-success w-full">
                Add Cron Job
            </button>
        </form>
    </div>
</dialog>
  
<div class="flex justify-center items-center w-full my-4">
    <div class="card bg-base-300 rounded-box p-4">
      <div class="card-body text-left">
        <h2 class="card-title sticky top-0 bg-base-300 z-10">Scheduled Tests</h2>
        <div class="mt-4">
            {#if scheduledTests.length > 0}
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Frequency</th>
                    <th>Tags</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {#each scheduledTests as scheduledTest}
                    <tr>
                      <td>{scheduledTest.taskName}</td>
                      <td>{scheduledTest.cronExpression}</td>
                      <td>{scheduledTest.tags}</td>
                      <td>
                        <button
                          class="btn btn-error btn-sm"
                          on:click={() => deleteCronJob(scheduledTest.taskName)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <p>No Scheduled Tests Available.</p>
          {/if}
        </div>
        <button class="btn mt-2" on:click={() => isModalOpen = true}>Add New Cron Job</button>
      </div>
    </div>
</div>