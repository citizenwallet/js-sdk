const main = async () => {
  console.log("Bumping version");

  const denoJsonFile = await Deno.readTextFile(`${Deno.cwd()}/deno.json`);

  const denoJson = JSON.parse(denoJsonFile);

  const newVersion = Deno.args[0];

  denoJson.version = newVersion;

  await Deno.writeTextFile(
    `${Deno.cwd()}/deno.json`,
    JSON.stringify(denoJson, null, 2)
  );

  console.log(`Bumped version to ${newVersion}`);
};

main();
