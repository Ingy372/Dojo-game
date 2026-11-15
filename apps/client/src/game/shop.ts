// LP-B4: the looks shop's catalog (content/shop/catalog.json), checked once at start-up.
import { loadShopCatalog, wornColors, wornFx } from '@dojo/sim';
import { loadSave } from './save';
import RAW from '../../../../content/shop/catalog.json';

export const SHOP = loadShopCatalog(RAW);
export const SHOP_WORDS = RAW.words;

/** The effects and wall paint the student wears now (read fresh, so a purchase shows next scene). */
export const wornShop = () => {
  const profile = loadSave();
  return { fx: wornFx(profile, SHOP), wall: wornColors(profile, SHOP).wall };
};
