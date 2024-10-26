import process from "node:process";

// Add a fake Deno declaration for Node environments
declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

export const getEnv = (key: string): string | undefined => {
  try {
    if (typeof Deno !== "undefined") {
      // Deno environment
      return Deno.env.get(key);
    } else if (typeof process !== "undefined") {
      // Node.js environment
      return process.env[key];
    }
  } catch (error) {
    console.warn(`Unable to determine runtime environment for ${key}`);
  }
  return undefined;
};
