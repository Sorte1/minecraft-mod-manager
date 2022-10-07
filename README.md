# <p align="center">🚀 Minecraft Mod Manager 🚀</p>

<p align="center">A command line utility to install and update Minecraft mods (for the Java edition) without a launcher.</p>

<br/><br/>

Minecraft Mod Manager is a helpful utility for players, modpack creators and server owners who want to keep their
Minecraft mods up to date without the need for a launcher or having to manually check and download new files.

It can currently use mods from [Curseforge](https://curseforge.com/minecraft) and [Modrinth](https://modrinth.com/).

If you want support for other platforms, please feel free to submit a pull request or a feature request.

It's purposefully made to have a very explicit configuration file to avoid any "magic". This allows you to have full
control over the mods that are installed.

## Installation

Go to the [releases page](https://github.com/meza/minecraft-mod-manager/releases) and download the latest version for
your platform.

For the best results, put the downloaded executable into your minecraft folder in the same level as the `mods` folder.

![Folder Structure](/doc/images/mmm-folder-structure.png)

## Running

To use the tool, you need to have a command line / terminal open and be in the folder where the tool is.

<details>
<summary>Opening a terminal in Windows</summary>
1. Navigate to the folder
</details>


---

## How it works

> _If you know `npm` or `yarn` from the web development world, this works just the same_

There are 3 main responsibilities (and commands for these) of the app

### ADD

`mmm add <platform> <id>`

This adds a given mod to the configuration file and downloads the relevant mod file to the configured mod folder.

You would run this command to add a given mod to the configuration file.

Adding a mod also downloads the corresponding jar file.

#### Platforms

Currently the 2 possible values of the platform are:

- curseforge
- modrinth

#### How to find the Mod ID?

**On Curseforge** you need the **Project ID** which you can find in the **top right hand corner** of every mod's page.

**On Modrinth** you need to **Project ID** which you can find in the **bottom left hand corner** of every mod's page.

<details>
  <summary>Click for examples</summary>


Adding
the [Fabric API from Curseforge](https://www.curseforge.com/minecraft/mc-mods/fabric-api): `mmm add curseforge 306612`

Adding [Sodium from Modrinth](https://modrinth.com/mod/sodium/): `mmm add modrinth AANobbMI`
</details>

---

### INSTALL

`mmm install` or `mmm i`

This makes sure that every mod that is specified in the config file is downloaded and ready to use.

You need to run this command whenever you want to make sure that the previously added mods are downloaded and ready to
use.

The install command works off of the `modlist-lock.json` file which contains the exact version information for any given
mod.

If a `modlist-lock.json` does not exist, the install command will download the latest version of every mod. This is a
limitation of the Minecraft modding ecosystem and the lack of enforced versioning.

> If you are in charge of Modrinth or Curseforge, please mandate the use of semver!

If a `modlist-lock.json` exists, then the install command will *always* download the exact same version of the mods
listed inside of it.

Sending both the `modlist.json` and the `modlist-lock.json` file to other people is the surefire way to ensure that
everyone has the exact same versions of everything.

---

### UPDATE

`mmm update` or `mmm u`

This will try and find newer versions of every mod defined in the `modlist.json` file that matches the given game
version and loader. If a new mod is found, it will be downloaded and the old one will be removed. If the download fails,
the old one will be kept.

You would run this command when you want to make sure that you're using the newest versions of the mods.

Due to the Minecraft modding community's lack of consistent versioning, the "newness" of a mod is defined by the release
date of a file being newer than the old one + the hash of the file being different.

## Explaining the configuration

### modlist-lock.json

You have seen this file mentioned in this document and you might be wondering what to do with it.

The lockfile is 100% managed by the app itself and it ensures consistency across [`install`](#install) runs. It
effectively "locks" the versions to the exact versions you installed with the last [`add`](#add) or [`update`](#update)
commands.

**You don't have to do anything with it!**

If you use version control to manage your server/modpack/configuration then make sure to commit **both**
the `modlist.json` and the `modlist-lock.json`. Together they ensure that you are in full control of what gets
installed.

### modlist.json

The modlist.json is the main configuration file of Minecraft Mod Manager.

It is in JSON format. If you're unfamiliar with JSON or want to make sure that everything is in order, please use
the [JSON Validator](https://jsonlint.com/) website to make sure that the file contents are valid before running the
app.

This is how it looks like if you followed the examples in the [`add`](#add) section:

```json
{
  "loader": "fabric",
  "gameVersion": "1.19.2",
  "modsFolder": "mods",
  "defaultAllowedReleaseTypes": [
    "release",
    "beta"
  ],
  "allowVersionFallback": true,
  "mods": [
    {
      "type": "curseforge",
      "id": "306612",
      "name": "Fabric API"
    },
    {
      "type": "modrinth",
      "id": "AANobbMI",
      "name": "Sodium"
    }
  ]
}
```

> The **mods** field is managed by the [`add`](#add) command but you can also edit it by hand if you wish.

#### loader _required_

Possible values: `fabric`, `forge`

The loader defines which minecraft loader you're using.

#### gameVersion _required_

This needs to be the game version as listed by Mojang. `1.19`, `1.19.1`, `1.19.2`, etc

#### modsFolder _required_

This points to your mods folder. Traditionally it would be "mods" but you can modify it to whatever your situation needs

#### defaultAllowedReleaseTypes _required_

Possible values is one or all of the following: `alpha`, `beta`, `release`

This setting will be overridable on an individual mod basis in the next release. Currently it's a global setting.

#### allowVersionFallback _optional_

This is a field that exist due to the chaotic nature of Minecraft mod versioning. Setting this `true` will do the
following:

- If a suitable mod isn't found for the given Minecraft version, say 1.19.2, it will try for 1.19.1 (the previous minor
  version)
- If a suitable mod isn't found for the previous minor version, it will try for 1.19 (the previous major version)

This happens quite frequently unfortunately because mod developers either don't update their mods but they still work or
they forget to list the supported Minecraft versions correctly.

This setting will be overridable on an individual mod basis in the next release. Currently it's a global setting.

<br/><hr/>

## <p align="center">Contribute to the project</p>

Feel free to contribute to the project but please read the [contribution guidelines](CONTRIBUTING.md) first before
making any changes.

### Setup

#### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v7.13 or higher)

#### Install dependencies

```bash
pnpm install
```

#### Validate

```bash
pnpm ci
 ```

### Code Considerations

#### Conventional commmit messages

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to generate the changelog and
to automatically bump the version number.

> **Changes not following the Conventional Commits specification will be rejected.**

#### Using `console.log` and `console.error`

> To make sure that we communicate with the user on the right level,
> all invocations to the `console.log` and the `console.error` functions should
> be done in the `actions` folder. This means that the `console.log` and the
> `console.error` functions should not be used in the `lib` folder.

Read more about this in the [Architecture Decision Record](doc/adr/0002-console-log-only-in-actions.md).
