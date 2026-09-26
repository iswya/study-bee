import { BooksIcon } from "@phosphor-icons/react/ssr";
import { PageTitle } from "@/components/ui";
import { getSets } from "@/lib/data";
import { Library } from "./library";

export default async function LibraryPage() {
  const sets = await getSets();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 md:py-10">
      <PageTitle icon={<BooksIcon size={24} weight="duotone" />}>Library</PageTitle>
      <Library sets={sets} />
    </div>
  );
}
