import { toUtf8Bytes } from "ethers";
import { keccak256 } from "ethers";

const main = async () => {
  const instanceId = process.argv[2];
  if (!instanceId) {
    console.error("Instance ID is required");
    process.exit(1);
  }

  const hashedId = keccak256(toUtf8Bytes(instanceId.trim()));

  console.log("instance id hash:", hashedId);
};

main();
