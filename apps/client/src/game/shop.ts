// LP-B4: the looks shop's catalog (content/shop/catalog.json), checked once at start-up.
import { loadShopCatalog } from '@dojo/sim';
import RAW from '../../../../content/shop/catalog.json';

export const SHOP = loadShopCatalog(RAW);
export const SHOP_WORDS = RAW.words;
