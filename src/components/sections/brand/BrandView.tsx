import { useAppStore } from "@/store/app-store";
import { BrandCatalog } from "./BrandCatalog";
import { BrandDetail } from "./BrandDetail";
import { BrandForm } from "./BrandForm";

export function BrandView() {
  const brandSubView = useAppStore((s) => s.brandSubView);

  if (brandSubView === "detail") {
    return <BrandDetail />;
  }

  if (brandSubView === "new") {
    return <BrandForm />;
  }

  return <BrandCatalog />;
}
