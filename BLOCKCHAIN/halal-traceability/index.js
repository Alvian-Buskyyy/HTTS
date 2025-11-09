const Web3 = require("web3");
const contract = require("./build/contracts/HalalTraceability.json");

const deploy = async () => {
    try {
        const web3 = new Web3("http://127.0.0.1:8545"); // URL Ganache
        const accounts = await web3.eth.getAccounts();
        console.log("Available accounts:", accounts);

        const instance = new web3.eth.Contract(contract.abi);
        const deployedContract = await instance.deploy({ data: contract.bytecode })
            .send({ from: accounts[0], gas: 1500000 });
        console.log("Contract deployed at:", deployedContract.options.address);
    } catch (error) {
        console.error("Error deploying contract:", error);
    }
};

deploy();



