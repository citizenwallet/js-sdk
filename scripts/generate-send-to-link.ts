import { toUtf8Bytes } from "ethers";
import { keccak256 } from "ethers";
import { readFileSync } from "fs";
import path from "path";
import { CommunityConfig } from "../src/config";
import { generateReceiveLink } from "../src/receive";

const main = async () => {
  let communityFileLocation = process.argv[2];
  if (!communityFileLocation) {
    // use community.json in the root of the project
    communityFileLocation = path.join(__dirname, "../community.json");
  }

  const config = JSON.parse(readFileSync(communityFileLocation, "utf8"));

  const community = new CommunityConfig(config);

  console.log(
    generateReceiveLink(
      "https://app.citizenwallet.xyz/#",
      community,
      "0x4250526126491EF53ca4A73e97151b5c2597F43c",
      "10.0",
      "Hello",
      {
        destination: "0x38810cA6F83e82F2CDF2bD3fb050dB5ca2775F32",
        amount: "1.0",
        description: "Hello 2",
      }
    )
  );
};

main();
