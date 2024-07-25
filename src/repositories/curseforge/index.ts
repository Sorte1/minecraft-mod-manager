import { UnknownLoaderException } from '../../errors/UnknownLoaderException.js';
import { Loader, ReleaseType, RemoteModDetails } from '../../lib/modlist.types.js';
import { PlatformLookupResult, Repository } from '../index.js';
import { getMod } from './fetch.js';
import { lookup as cfLookup } from './lookup.js';

export enum CurseforgeLoader {
  ANY = 0,
  FORGE = 1,
  CAULDRON = 2,
  LITELOADER = 3,
  FABRIC = 4,
  QUILT = 5,
  NEOFORGE = 6
}

export class Curseforge implements Repository {

  static curseforgeLoaderFromLoader = (loader: Loader) => {
    switch (loader) {
      case Loader.CAULDRON:
        return CurseforgeLoader.CAULDRON;
      case Loader.FORGE:
        return CurseforgeLoader.FORGE;
      case Loader.FABRIC:
        return CurseforgeLoader.FABRIC;
      case Loader.QUILT:
        return CurseforgeLoader.QUILT;
      case Loader.NEOFORGE:
        return CurseforgeLoader.NEOFORGE;
      case Loader.LITELOADER:
        return CurseforgeLoader.LITELOADER;
      default:
        throw new UnknownLoaderException(loader);
    }
  };

  fetchMod(projectId: string, allowedReleaseTypes: ReleaseType[], allowedGameVersion: string, loader: Loader, allowFallback: boolean): Promise<RemoteModDetails> {
    return getMod(projectId, allowedReleaseTypes, allowedGameVersion, loader, allowFallback);
  }

  lookup(lookup: string[]): Promise<PlatformLookupResult[]> {
    return cfLookup(lookup);
  }
}
