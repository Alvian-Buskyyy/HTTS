import Web3 from "web3";
import { create } from "ipfs-http-client";
const halalContract = require("./build/contracts/HalalTraceability.json");

// Koneksi ke Ganache
const web3 = new Web3("http://127.0.0.1:8545");

// Koneksi ke IPFS
const ipfs = create({ host: "localhost", port: "5001", protocol: "http" });

// Alamat kontrak pintar yang sudah dideploy
const contractAddress = "0x40dCFA351B99e5c5E8ad3959574E9BC0d6E05825"; // Ganti dengan alamat kontrak Anda
const halalTraceability = new web3.eth.Contract(halalContract.abi, contractAddress);

// Fungsi untuk mengambil data dari IPFS berdasarkan CID
const fetchDataFromIPFS = async (cid) => {
    try {
        console.log(`Fetching data from IPFS with CID: ${cid}`);
        const chunks = [];
        for await (const chunk of ipfs.cat(cid)) {
            chunks.push(chunk);
        }
        const fileContent = Buffer.concat(chunks).toString();
        console.log("Data retrieved from IPFS:", fileContent);
        return fileContent;
    } catch (error) {
        console.error("Error fetching data from IPFS:", error);
    }
};

// Fungsi untuk mengambil CID dari kontrak pintar dan menampilkan data
const retrieveData = async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        const cid = await halalTraceability.methods.getCID().call({ from: accounts[0] });
        console.log("CID retrieved from contract:", cid);

        // Ambil data dari IPFS menggunakan CID
        const fileContent = await fetchDataFromIPFS(cid);
        console.log("File content retrieved from IPFS:", fileContent);
    } catch (error) {
        console.error("Error retrieving data:", error);
    }
};

// Panggil fungsi retrieveData untuk memulai proses
retrieveData();
