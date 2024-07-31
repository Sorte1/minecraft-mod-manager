import { DefaultOptions } from '../mmm.js';
import { Loader, ModsJson, ReleaseType } from '../lib/modlist.types.js';
import inquirer from 'inquirer';
import { fileExists, writeConfigFile } from '../lib/config.js';
import path from 'node:path';
import { verifyMinecraftVersion } from '../lib/minecraftVersionVerifier.js';
import { IncorrectMinecraftVersionException } from '../errors/IncorrectMinecraftVersionException.js';
import { configFile } from './configFileOverwrite.js';
import { getLatestMinecraftVersion } from './getLatestMinecraftVersion.js';
import { Logger } from '../lib/Logger.js';

export interface InitializeOptions extends DefaultOptions {
  loader?: Loader,
  gameVersion?: string,
  allowVersionFallback?: boolean,
  defaultAllowedReleaseTypes?: string,
  modsFolder?: string
}

interface IQInternal extends ModsJson {
  config: string;
}

const validateGameVersion = async (input: string): Promise<boolean | string> => {
  if (await verifyMinecraftVersion(input)) {
    return true;
  }
  return 'The game version is invalid. Please enter a valid game version';
};

const mergeOptions = (options: InitializeOptions, iq: IQInternal) => {
  return {
    loader: iq.loader || options.loader,
    gameVersion: iq.gameVersion || options.gameVersion,
    defaultAllowedReleaseTypes: iq.defaultAllowedReleaseTypes || options.defaultAllowedReleaseTypes?.replace(/\s/g, '').split(','),
    modsFolder: iq.modsFolder || options.modsFolder,
    mods: []
  };
};

const validateModsFolder = async (input: string, cwd: string) => {
  let dir = path.resolve(cwd, input);

  if (path.isAbsolute(input)) {
    dir = input;
  }

  if (!await fileExists(dir)) {
    return `The folder: ${dir} does not exist. Please enter a valid one and try again.`;
  }
  return true;
};

const validateInput = async (options: InitializeOptions, cwd: string) => {
  /**
   * @todo Handle cli option validation better for the init function
   *
   * Currently the negative case is just throwing errors. It would be nice
   * to properly communicate the errors and offer solutions.
   */
  if (options.gameVersion) {
    if (!await verifyMinecraftVersion(options.gameVersion)) {
      throw new IncorrectMinecraftVersionException(options.gameVersion);
    }
  }
  if (options.modsFolder) {
    const result = await validateModsFolder(options.modsFolder, cwd);
    if (result !== true) {
      throw new Error(result);
    }
  }
};

export const initializeConfig = async (options: InitializeOptions, cwd: string, logger: Logger): Promise<ModsJson> => {
  await validateInput(options, cwd);

  options.config = await configFile(options, cwd);

  const latestMinercraftDefault = await getLatestMinecraftVersion(options, logger);

  const prompts = [
    {
      when: !options.loader,
      name: 'loader',
      type: 'list',
      message: 'Which loader would you like to use?',
      choices: Object.values(Loader)
    },
    {
      when: !options.gameVersion,
      name: 'gameVersion',
      type: 'input',
      default: latestMinercraftDefault,
      message: 'What exact Minecraft version are you using? (eg: 1.18.2, 1.19, 1.19.1)',
      validateText: 'Verifying the game version',
      validate: validateGameVersion
    },
    {
      when: !options.defaultAllowedReleaseTypes,
      name: 'defaultAllowedReleaseTypes',
      type: 'checkbox',
      choices: Object.values(ReleaseType),
      default: [ReleaseType.RELEASE, ReleaseType.BETA],
      message: 'Which types of releases would you like to consider to download?'
    },
    {
      when: !options.modsFolder,
      name: 'modsFolder',
      type: 'input',
      default: './mods',
      message: `where is your mods folder? (full or relative path from ${cwd}):`,
      validate: async (input: string) => {
        return validateModsFolder(input, cwd);
      }
    }
  ];
  const iq = await inquirer.prompt(prompts) as IQInternal;
  const answers = mergeOptions(options, iq) as ModsJson;

  await writeConfigFile(answers, options, logger);

  return answers as ModsJson;
};

