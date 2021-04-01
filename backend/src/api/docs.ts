import express from "express";
import { guildPlugins } from "../plugins/availablePlugins";
import { notFound } from "./responses";
import { indentLines } from "../utils";

function formatConfigSchema(schema) {
  switch (schema._tag) {
    case "InterfaceType":
    case "PartialType": {
      return (
        `{\n` +
        Object.entries(schema.props)
          .map(([k, value]) => indentLines(`${k}: ${formatConfigSchema(value)}`, 2))
          .join("\n") +
        "\n}"
      );
    }
    case "DictionaryType": {
      return "{\n" + indentLines(`[string]: ${formatConfigSchema(schema.codomain)}`, 2) + "\n}";
    }
    case "ArrayType": {
      return `Array<${formatConfigSchema(schema.type)}>`;
    }
    case "UnionType": {
      if (schema.name.startsWith("Nullable<")) {
        return `Nullable<${formatConfigSchema(schema.types[0])}>`;
      } else {
        return schema.types.map(t => formatConfigSchema(t)).join(" | ");
      }
    }
    case "IntersectionType": {
      return schema.types.map(t => formatConfigSchema(t)).join(" & ");
    }
    default: {
      return schema.name;
    }
  }
}

export function initDocs(app: express.Express) {
  const docsPlugins = guildPlugins.filter(plugin => plugin.showInDocs);

  app.get("/docs/plugins", (req: express.Request, res: express.Response) => {
    res.json(
      docsPlugins.map(plugin => {
        const thinInfo = plugin.info ? { prettyName: plugin.info.prettyName } : {};
        return {
          name: plugin.name,
          info: thinInfo,
        };
      }),
    );
  });

  app.get("/docs/plugins/:pluginName", (req: express.Request, res: express.Response) => {
    // prettier-ignore
    const plugin = docsPlugins.find(_plugin => _plugin.name === req.params.pluginName);
    if (!plugin) {
      return notFound(res);
    }

    const name = plugin.name;
    const info = plugin.info || {};

    const commands = (plugin.commands || []).map(cmd => ({
      trigger: cmd.trigger,
      permission: cmd.permission,
      signature: cmd.signature,
      description: cmd.description,
      usage: cmd.usage,
      config: cmd.config,
    }));

    const defaultOptions = plugin.defaultOptions || {};
    const configSchema = plugin.configSchema && formatConfigSchema(plugin.configSchema);

    res.json({
      name,
      info,
      configSchema,
      defaultOptions,
      commands,
    });
  });
}
