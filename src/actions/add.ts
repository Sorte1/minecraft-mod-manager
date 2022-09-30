import path from 'path';
import { fetchModDetails } from '../repositories/index.js';
import { Mod, Platform } from '../lib/modlist.types.js';
import { readConfigFile, readLockFile, writeConfigFile, writeLockFile } from '../lib/config.js';
import { downloadFile } from '../lib/downloader.js';
import { DefaultOptions } from '../mmm.js';
import { UnknownPlatformException } from '../errors/UnknownPlatformException.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { CouldNotFindModException } from '../errors/CouldNotFindModException.js';
import { NoFileFound } from '../errors/NoFileFound.js';

const handleUnknownPlatformException = async (error: UnknownPlatformException, id: string, options: DefaultOptions) => {
  const platformUsed = error.platform;
  const platformList = Object.values(Platform);

  if (options.quiet === true) {
    console.error(chalk.red(`Unknown platform "${chalk.whiteBright(platformUsed)}". Please use one of the following: ${platformList.join(', ')}`));
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'platform',
      default: false,
      choices: [...platformList, 'cancel'],
      message: chalk.redBright(`The platform you entered (${chalk.whiteBright(platformUsed)}) is not a valid platform.\n`)
        + chalk.whiteBright('Would you like to retry with a valid one?')
    }
  ]);

  if (answers.platform === 'cancel') {
    return;
  }

  // eslint-disable-next-line no-use-before-define
  await add(answers.platform, id, options);

};

export const add = async (platform: Platform, id: string, options: DefaultOptions) => {
  const configuration = await readConfigFile(options.config);

  if (configuration.mods.find((mod: Mod) => (mod.id === id && mod.type === platform))) {
    if (options.debug) {
      console.debug(`Mod ${id} for ${platform} already exists in the configuration`);
    }

    return;
  }

  try {
    const modData = await fetchModDetails(
      platform,
      id,
      configuration.defaultAllowedReleaseTypes,
      configuration.gameVersion,
      configuration.loader,
      configuration.allowVersionFallback);

    await downloadFile(modData.downloadUrl, path.resolve(configuration.modsFolder, modData.fileName));

    const installations = await readLockFile(options.config);

    configuration.mods.push({
      type: platform,
      id: id,
      name: modData.name,
      allowedReleaseTypes: configuration.defaultAllowedReleaseTypes
    });

    installations.push({
      name: modData.name,
      type: platform,
      id: id,
      fileName: modData.fileName,
      releasedOn: modData.releaseDate,
      hash: modData.hash,
      downloadUrl: modData.downloadUrl
    });

    await writeConfigFile(configuration, options.config);
    await writeLockFile(installations, options.config);

  } catch (error) {
    if (error instanceof UnknownPlatformException) {
      await handleUnknownPlatformException(error, id, options);
      return;
    }

    if (error instanceof CouldNotFindModException) {
      console.error(chalk.redBright(`Mod "${chalk.whiteBright(id)}" for ${chalk.whiteBright(platform)} does not exist`));
      return;
    }

    if (error instanceof NoFileFound) {
      console.error(
        chalk.red(`Could not find a file for the version ${chalk.whiteBright(configuration.gameVersion)} `
          + `for ${chalk.whiteBright(configuration.loader)}`)
      );
    }

    console.error(error);
  }

};
