import { ShopSettings } from '@/types';

export let shopSettingsStore: ShopSettings = {
  shopName: 'Omachi 🌸 Phụ Kiện Handmade & Charm',
  slogan: 'Vòng cườm, kẹp tóc pastel, charm hoa xinh lấp lánh custom theo yêu cầu ✨',
  hotline: '0988.888.888',
  zaloPhone: '0988888888',
};

export function getShopSettings(): ShopSettings {
  return shopSettingsStore;
}

export function updateShopSettings(newSettings: Partial<ShopSettings>): ShopSettings {
  shopSettingsStore = {
    ...shopSettingsStore,
    ...newSettings,
  };
  return shopSettingsStore;
}

