import chalk from 'chalk';
import { GithubReleasesNotFoundException } from '../errors/GithubReleasesNotFoundException.js';
import { version } from '../version.js';
import { Logger } from './Logger.js';
import { rateLimitingFetch } from './rateLimiter/index.js';

interface GithubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  html_url: string;
  numericVersion: string;
  versionParts: number[];
}

export interface UpdateResult {
  hasUpdate: boolean;
  latestVersion: string;
  latestVersionUrl: string;
  releasedOn: string;
}

const prepareRelease = (release: GithubRelease) => {
  release.numericVersion = release.tag_name.replace('v', '');
  release.versionParts = release.numericVersion.split('.').map((part: string) => parseInt(part, 10));
  return release;
};

const githubReleases = async () => {
  const url = 'https://api.github.com/repos/meza/minecraft-mod-manager/releases';
  const response = await rateLimitingFetch(url);
  if (!response.ok) {
    throw new GithubReleasesNotFoundException();
  }
  const json = await response.json();
  const prereleases = json.filter((release: GithubRelease) => release.prerelease).map(prepareRelease);
  const releases = json.filter((release: GithubRelease) => !release.prerelease && !release.draft).map(prepareRelease);

  return releases.length > 0 ? releases : prereleases;
};

const isFirstLetterANumber = (input: string) => {
  return /^\d/.test(input);
};

const formatDateFromTimeString = (timeString: string) => {
  const date = new Date(timeString);
  return date.toString();
};

export const hasUpdate = async (currentVersion: string, logger: Logger): Promise<UpdateResult> => {
  let latestVersion: GithubRelease = {
    draft: false,
    // eslint-disable-next-line camelcase
    html_url: '<github cannot be reached>',
    name: `v${version}`,
    numericVersion: version,
    prerelease: false,
    // eslint-disable-next-line camelcase
    published_at: new Date().toISOString(),
    // eslint-disable-next-line camelcase
    tag_name: `v${version}`,
    versionParts: version.split('.').map((v) => Number(v))
  };

  try {
    const releases = await githubReleases();
    latestVersion = releases[0];
  } catch (error) {
    if (!(error instanceof GithubReleasesNotFoundException)) {
      throw error;
    }
  }
  const releasedOn = formatDateFromTimeString(latestVersion.published_at);
  if (!isFirstLetterANumber(currentVersion)) {
    logger.log(
      chalk.bgYellowBright(
        chalk.black(
          `\n[update] You are running a development version of MMM. Please update to the latest release from ${releasedOn}.`
        )
      )
    );
    logger.log(chalk.bgYellowBright(chalk.black(`[update] You can download it from ${latestVersion.html_url}\n`)));
    return {
      hasUpdate: false,
      latestVersion: latestVersion.tag_name,
      latestVersionUrl: latestVersion.html_url,
      releasedOn: releasedOn
    };
  }

  const currentVersionParts = currentVersion.split('.').map((part: string) => parseInt(part, 10));
  const latestVersionParts = latestVersion.versionParts;
  if (latestVersionParts[0] > currentVersionParts[0]) {
    return {
      hasUpdate: true,
      latestVersion: latestVersion.tag_name,
      latestVersionUrl: latestVersion.html_url,
      releasedOn: formatDateFromTimeString(latestVersion.published_at)
    };
  }
  if (latestVersionParts[1] > currentVersionParts[1]) {
    return {
      hasUpdate: true,
      latestVersion: latestVersion.tag_name,
      latestVersionUrl: latestVersion.html_url,
      releasedOn: formatDateFromTimeString(latestVersion.published_at)
    };
  }
  if (latestVersionParts[2] > currentVersionParts[2]) {
    return {
      hasUpdate: true,
      latestVersion: latestVersion.tag_name,
      latestVersionUrl: latestVersion.html_url,
      releasedOn: formatDateFromTimeString(latestVersion.published_at)
    };
  }
  return {
    hasUpdate: false,
    latestVersion: latestVersion.tag_name,
    latestVersionUrl: latestVersion.html_url,
    releasedOn: formatDateFromTimeString(latestVersion.published_at)
  };
};
