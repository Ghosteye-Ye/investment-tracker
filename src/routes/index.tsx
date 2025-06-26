// routes/index.tsx
import type { RouteObject } from "react-router-dom";
import HomePage from "@/pages/Home";
import AccountPage from '@/pages/account/page';
import AccountSettingsPage from '@/pages/account/settings/page';
import AssetPage from '@/pages/asset/page';

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/account/:accountId",
    element: <AccountPage />,
  },
  {
    path: "/account/:accountId/settings",
    element: <AccountSettingsPage />,
  },
  {
    path: "/asset/:accountId/:assetId",
    element: <AssetPage />,
  },
];
