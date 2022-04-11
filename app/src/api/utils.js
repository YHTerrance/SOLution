const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const pollConfirmation = async (connection, signature, ticks) => {
  let status = "";
  let ret;
  while (status != "finalized") {
    await sleep(2000);
    ret = await connection.getSignatureStatuses([signature]);
    status = ret.value[0].confirmationStatus;
    if (ticks) ticks.value += 1;
    console.log(status);
  }
  return status;
};

export { sleep, pollConfirmation };
