**_I. How to Run:_**

1. Run `docker-compose up --build`
2. After build is done, go to: `http://localhost:5173/` (this will also appear in console)
3. Enter the testcase ID in the textbox without `@` or click the test id from the test list in the right panel
4. Click Run button
5. View Report button will appear after the run is over

**_II. To run without using UI:_**

1. Go to backend folder `cd backend`
2. Run `npm install`
3. Run `TAG="@test-1" npm run test` (need to put `@` in the test ID here)<br/>
   We will not run it as `npx playwright test` because we installed `cucumber-js`. In the package.json, you will find "scripts" where there's one child called "test" which contains the cucumber command, we can call "test" using "npm run" and the command can also catch a TAG.

**_III. Running Headful_**

Headful will not work when running using UI, we don't need to run headful in production anyway. This is a best practice to reduce cost and time.<br /><br />

But during development and debugging, you can go to `backend/tests/utils/hooks.js`: <br />
Then change `this.browser = await chromium.launch({ headless: true });` to `{ headless: false }`<br />
This is while running using CLI (see II.).<br />
