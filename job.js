const CronJob = require("cron").CronJob;
const { sendInfo } = require("./utils");
const { update } = require("./index");

// Every 10 minutes: "0 */10 * * * *"
// At midnight: "00 00 00 * * *"
// At 16:00?: "00 16 00 * * *"

const job = new CronJob("00 16 00 * * *", async () => {
  try {
    await update();
  } catch (error) {
    await sendInfo("!!! Error on the update !!!");
  }
});

job.start();
