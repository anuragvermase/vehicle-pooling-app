// src/services/storage.ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export const Storage = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch {}
  },

  async deleteToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {}
  },
};

// Export default too, so both `import { Storage }` and `import Storage` work.
export default Storage;
