const config = require("dotenv").config();
const fs = require("fs");
const {
  sendInfo,
  readInfo,
  saveInfo,
  isRpcAlive,
  sortNetworks,
  difference,
  timeout,
} = require("./utils");

const { NETWORKS_ENDPOINT } = config.parsed;
const NETWORKS_FILE = "./networks.json";
const SOURCES_FILE = "./sources.json";
const excludedIds = [
  1, 3, 4, 56, 97, 137, 5, 6, 10, 25, 180, 43114, 250, 122, 1285, 1666600000,
  1313161554, 200, 42161,
];
const excludedNames = new RegExp(
  [
    "testnet|ethereum|Popcateum|Double|Permission|BitTorren|BMC|AIOZ|EtherInc|Next|Garizon|Polis|",
    "Nova|GateChain|Zenith|Ontology|Darwinia|Genesis|ShibaChain|Diode|Metadium|Expanse|Palm|GoChain|",
    "Zyx|Performance|Ubiq|Shiden|Energy|TomoChain|Meter|Callisto|Nahmii|Syscoin|Elastos|ThunderCore|",
    "CoinEx|Fuse|Velas|Boba|Wanchain|Emerald|IoTeX|Theta|Telos|Metis|Hoo|KCC|Moonbeam|Astar|Harmony|",
    "Fusion|Celo|Moonriver|Huobi|Klaytn|Aurora|Optimism|Gnosis|RSK|Moonbase|smartBCH",
  ].join(""),
  "i"
);

async function fetchNetworksInfo() {
  try {
    const networks = await fetch(NETWORKS_ENDPOINT).then((res) => res.json());
    const filtered = networks.filter(
      ({
        chainId,
        name = "",
        title = "",
        chain = "",
        infoURL = "",
        rpc = [],
        explorers = [],
      }) => {
        const allow =
          !excludedIds.includes(chainId) &&
          !name.match(excludedNames) &&
          !title.match(excludedNames) &&
          !chain.match(excludedNames) &&
          !!infoURL &&
          !!rpc.length &&
          !!explorers?.length;

        return !!allow;
      }
    );

    return sortNetworks(filtered);
  } catch (error) {
    console.error(error);
  }
}

async function createSourcesList() {
  try {
    const networks = await readInfo(NETWORKS_FILE);
    const sources = [];

    for (let i = 0; i < networks.length; i += 1) {
      const { infoURL, rpc } = networks[i];

      if (!sources.includes(infoURL)) {
        await timeout(50);
        const alive = await isRpcAlive(rpc);

        if (alive) {
          sources.push(infoURL);
        }
      }
    }

    await saveInfo(SOURCES_FILE, JSON.stringify(sources));
  } catch (error) {
    console.error("Error in sources list management");
  }
}

async function checkDifference() {
  const net1 = await readInfo(NETWORKS_FILE);
  const net2 = await fetchNetworksInfo();

  const diff = difference(net1, net2);

  if (diff.length) {
    sendInfo(JSON.stringify(diff));
  }

  await saveInfo(NETWORKS_FILE, sortedNet2);
}

async function init() {
  const networks = fetchNetworksInfo();

  await saveInfo(NETWORKS_FILE, JSON.stringify(networks));
}

// init();
// fetchNetworksInfo();
// createSourcesList();
