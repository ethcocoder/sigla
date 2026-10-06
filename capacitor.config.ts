/// <reference types="@capacitor-firebase/authentication" />
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "space.manus.sigla.t014857708537585",
  appName: "SIGLA — ሲግላ",
  webDir: "dist-web",
  server: { androidScheme: "https" },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ["google.com"],
    },
  },
};

export default config;
