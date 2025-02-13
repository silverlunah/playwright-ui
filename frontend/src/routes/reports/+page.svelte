<script>
  import { onMount } from 'svelte';

  let reports = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  async function fetchReports() {
    const response = await fetch('http://localhost:3001/reports');
    const data = await response.json();
    
    reports = data.reports.map((fileName) => {
      const match = fileName.match(/(PASS|FAIL)_cucumber_report_(\d{4})_(\d{2})_(\d{2})T(\d{2})_(\d{2})_(\d{2})_\d{3}Z\.html/);
      if (!match) return { fileName, status: "Unknown", date: "Invalid Date" };

      const [_, status, year, month, day, hour, minute, second] = match;
      const rawDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
      const formattedDate = rawDate.toLocaleString(); // Converts to local timezone

      return { fileName, status, date: formattedDate };
    });
  }

  // Calculate the start and end indices for pagination
  function paginatedReports() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return reports.slice(startIndex, endIndex);
  }

  function goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages()) return;
    currentPage = pageNumber;
  }

  function totalPages() {
    return Math.ceil(reports.length / itemsPerPage);
  }

  onMount(fetchReports);
</script>

<div class="flex justify-center items-center w-full my-4">
  <div class="card bg-base-300 rounded-box p-4">
    <div class="card-body text-left">
      <h2 class="card-title sticky top-0 bg-base-300 z-10">Reports</h2>
      <div class="mt-4">
        {#if reports.length > 0}
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {#each paginatedReports() as report}
                  <tr>
                    <td>
                      <span class="badge" class:badge-success={report.status === 'PASS'} class:badge-error={report.status === 'FAIL'}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <a href={`http://localhost:3001/reports/${report.fileName}`} target="_blank" class="text-blue-500">
                        {report.date}
                      </a>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <!-- Pagination Controls -->
          <div class="btn-group mt-4 mx-auto">
            <button class="btn btn-ghost" on:click={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            {#each Array(totalPages()) as _, i}
              <button class="btn mx-1" on:click={() => goToPage(i + 1)} class:btn-active={currentPage === i + 1}>
                {i + 1}
              </button>
            {/each}
            <button class="btn btn-primary" on:click={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages()}>
              Next
            </button>
          </div>
        {:else}
          <p>No reports available.</p>
        {/if}
      </div>
    </div>
  </div>
</div>
