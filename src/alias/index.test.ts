import { parseAliasFromDomain } from "./index";

describe("parseAliasFromDomain", () => {
  const basePath = "citizenwallet.xyz";

  it("should extract alias from subdomain with base path", () => {
    const domain = "gratitude.citizenwallet.xyz";
    const result = parseAliasFromDomain(domain, basePath);
    expect(result).toBe("gratitude");
  });

  it("should return full domain when base path does not match", () => {
    const domain = "wallet.sfluv.org";
    const result = parseAliasFromDomain(domain, basePath);
    expect(result).toBe("wallet.sfluv.org");
  });

  it("should handle multiple subdomains with base path", () => {
    const domain = "something.other.citizenwallet.xyz";
    const result = parseAliasFromDomain(domain, basePath);
    expect(result).toBe("something.other");
  });
});
