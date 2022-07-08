const { difference } = require("./utils");

const net1 = [
  {
    chainId: 1,
    name: "Ethereum",
  },
  {
    chainId: 56,
    name: "BSC",
  },
  {
    chainId: 137,
    name: "Polygon",
  },
];

const net2 = [
  {
    chainId: 1,
    name: "Ethereum",
  },
  {
    chainId: 4,
    name: "Rinkeby",
  },
  {
    chainId: 56,
    name: "BSC",
  },
  {
    chainId: 137,
    name: "Polygon",
  },
];

console.log("difference", difference(net1, net2));
