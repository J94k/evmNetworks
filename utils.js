const config = require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const { TELEGRAM_API, BOT_KEY, CHAT_ID } = config.parsed;

const LOG_FILE = "./logs.txt";

async function sendInfo(message) {
  try {
    const request = `${TELEGRAM_API}${BOT_KEY}/sendMessage?chat_id=${CHAT_ID}&text=${message}`;
    const { status, data } = await axios.post(request);

    if (status !== 200) {
      await saveInfo(
        LOG_FILE,
        JSON.stringify({
          type: "ERROR",
          function: "sendInfo",
          reason: data?.description,
          error_code: data?.error_code,
          date: new Date(),
        }) + "\n"
      );
    }
  } catch (error) {
    console.error("Sending error", error.message);
    await saveInfo(
      LOG_FILE,
      JSON.stringify({
        type: "ERROR",
        function: "sendInfo",
        reason: error?.message,
        error_code: error?.code,
        date: new Date(),
      }) + "\n"
    );
  }
}

async function saveInfo(file, content, flag = "a+") {
  return new Promise((resolve, reject) => {
    try {
      fs.writeFile(file, content, { flag }, (error) => {
        return error ? reject(error) : resolve(true);
      });
    } catch (error) {
      console.warn("CANNOT SAVE");
      console.error(error);
      reject(error);
    }
  });
}

async function readInfo(file) {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(file)) return resolve(false);

      const rawData = fs.readFileSync(file);

      try {
        const data = JSON.parse(rawData);

        resolve(data);
      } catch (error) {
        resolve(false);
      }
    } catch (error) {
      console.warn("CANNOT READ");
      console.error(error);
      reject(error);
    }
  });
}

function sortNetworks(networks) {
  return networks.sort((n1, n2) => n1.chainId - n2.chainId);
}

/* 
@todo case when we have the same length, but something changed in the previous version
*/
function difference(net1, net2) {
  try {
    const diff = [];

    if (net1.length >= net2.length) return diff;

    if (!net1.length) return net2;

    if (net1.length === 1) {
      const remaningOfNet2 = net1[0].chainId === net2[0].chainId;
      const net = remaningOfNet2 ? net2.slice(1) : net2;

      diff.push(...net);
    } else {
      for (let i = 0; i < net1.length; i += 1) {
        const n1 = net1[i];
        const n2 = net2[i];

        if (n1.chainId !== n2.chainId) {
          diff.push(n2);
          diff.push(...difference(net1.slice(i), net2.slice(i + 1)));
          break;
        }
      }
    }

    return diff;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function isRpcAlive(rpcArr) {
  const rpcBody = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    params: [],
    id: 1,
  });

  try {
    for (let i = 0; i < rpcArr.length; i++) {
      const endpoint = rpcArr[i];

      // skip if API key is required
      if (!!endpoint.match(/\$\{.+\}/)) continue;

      try {
        const { status, data } = await axios({
          method: "post",
          url: endpoint,
          timeout: 1_200,
          data: rpcBody,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const blockNumber = Number(data?.result);

        if (
          status === 200 &&
          Number.isInteger(blockNumber) &&
          blockNumber > 0
        ) {
          return true;
        }
      } catch (error) {
        console.error("Problem with RPC. Skip:", endpoint);
        continue;
      }
    }

    return false;
  } catch (error) {
    console.error("Error in RPC check. Error:" + error?.message);
    return false;
  }
}

async function timeout(ms) {
  return new Promise((res) => {
    setTimeout(() => res(true), ms);
  });
}

module.exports = {
  readInfo,
  sendInfo,
  saveInfo,
  isRpcAlive,
  sortNetworks,
  difference,
  timeout,
};
