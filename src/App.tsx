import { BrowserRouter, useRoutes } from "react-router-dom";
import { routes } from "@/routes";
import DefaultLayout from "./layout";

function AppRoutes() {
  const elements = useRoutes(routes);
  return <DefaultLayout>{elements}</DefaultLayout>;
}

export default function App() {
  return (
    <BrowserRouter basename="/investment-tracker">
      <AppRoutes />
    </BrowserRouter>
  );
}
