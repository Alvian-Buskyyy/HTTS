let ipfs;

const initializeIPFS = async () => {
  const { create } = await import('ipfs-http-client');
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
    throw error;
  }
};

exports.getFromIPFS = async (hash) => {
  try {
    if (!ipfs) await initializeIPFS();
    const stream = ipfs.cat(hash);
    let data = '';

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