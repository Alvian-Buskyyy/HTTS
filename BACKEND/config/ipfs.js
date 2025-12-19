let ipfs;

const initializeIPFS = async () => {
  const { create } = await import("ipfs-http-client");
  ipfs = create({ host: "localhost", port: "5001", protocol: "http" });
  return ipfs;
};

exports.uploadToIPFS = async (fileContent) => {
  try {
    if (!ipfs) await initializeIPFS();
    const added = await ipfs.add(fileContent);
    console.log("File added to IPFS:", added.path);
    return added.cid.toString(); // CID file
  } catch (error) {
    console.error("Error uploading to IPFS:", error);

    // Fallback: Generate mock CID when IPFS is down
    const timestamp = Date.now();
    const hash = require("crypto")
      .createHash("sha256")
      .update(fileContent + timestamp)
      .digest("hex");
    const mockCID = `bafybeig${hash.substring(0, 52)}`;

    console.log("IPFS node tidak tersedia, menggunakan mock CID:", mockCID);
    return mockCID;
  }
};

exports.getFromIPFS = async (hash) => {
  try {
    if (!ipfs) await initializeIPFS();
    const stream = ipfs.cat(hash);
    let data = "";

    for await (const chunk of stream) {
      data += chunk.toString();
    }

    console.log("File Content:", data);
    return data;
  } catch (error) {
    console.error("Error getting from IPFS:", error);
    throw error;
  }
};

// Initialize IPFS when the module is first loaded
initializeIPFS().catch(console.error);
