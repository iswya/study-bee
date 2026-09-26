import { PageTitle } from "@/components/ui";
import { NewSetForm } from "./new-set-form";

export default function NewSetPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 md:py-10">
      <PageTitle>New set</PageTitle>
      <NewSetForm />
    </div>
  );
}
