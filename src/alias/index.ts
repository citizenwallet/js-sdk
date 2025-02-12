export const parseAliasFromDomain = (
  domain: string,
  basePath: string
): string => {
  if (domain.endsWith(basePath)) {
    // Remove the base path and any trailing dot
    const alias = domain.slice(0, -basePath.length);
    return alias.endsWith(".") ? alias.slice(0, -1) : alias;
  }

  return domain;
};
