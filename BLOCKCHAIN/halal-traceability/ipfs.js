import { create } from "ipfs-http-client";

const ipfs = create({ host: "localhost", port: "5001", protocol: "http" });

const uploadToIPFS = async (fileContent) => {
    try {
        const added = await ipfs.add(fileContent);
        console.log("File added to IPFS:", added.path);
        return added.cid.toString(); // CID file
    } catch (error) {
        console.error("Error uploading to IPFS:", error);
    }
};

// Contoh unggah teks ke IPFS
uploadToIPFS("Hello, IPFS!");

const getFromIPFS = async (hash) => {
    const stream = ipfs.cat(hash);
    let data = '';

    for await (const chunk of stream) {
        data += chunk.toString();
    }

    console.log("File Content:", data);
};
