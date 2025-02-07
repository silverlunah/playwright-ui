<script>
  import { onMount } from "svelte";
  import { io } from "socket.io-client";

  let output = "Enter a test ID and click 'Run Test'...\n";
  let socket;
  let testCompleted = false;
  let testID = ""; // Store user input for test ID

  onMount(() => {
    socket = io("http://localhost:3001");

    socket.on("log", (data) => {
      output += data + "\n";
    });

    socket.on("done", () => {
      output += "✅ Test completed!\n";
      testCompleted = true;
    });
  });

  function runTest() {
    if (!testID.trim()) {
      alert("Please enter a test ID!");
      return;
    }

    output = "Running test with ID: ${testID}...\n";
    testCompleted = false; // Hide button while running
    socket.emit("run-test", testID);
  }
</script>

<input type="text" bind:value={testID} placeholder="Enter test ID" />
<button on:click={runTest}>Run Playwright Test</button>

{#if testCompleted}
  <a href="http://localhost:3001/reports/cucumber_report.html" target="_blank">
    <button>View Report</button>
  </a>
{/if}

<pre>{output}</pre>