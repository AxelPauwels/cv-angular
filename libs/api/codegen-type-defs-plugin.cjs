// @ts-check
const { printSchema } = require('graphql');

/**
 * Codegen plugin: the schema of type-defs.graphql as a TypeScript string,
 * so neither the app build nor the tests need a loader for .graphql files.
 *
 * @type {import('@graphql-codegen/plugin-helpers').PluginFunction}
 */
const plugin = (schema) => {
  const sdl = printSchema(schema).replace(
    /`|\\|\$\{/g,
    (match) => `\\${match}`
  );
  return [
    '/** The schema of type-defs.graphql, for makeExecutableSchema */',
    `export const typeDefs = /* GraphQL */ \`\n${sdl}\n\`;`,
    '',
  ].join('\n');
};

module.exports = { plugin };
