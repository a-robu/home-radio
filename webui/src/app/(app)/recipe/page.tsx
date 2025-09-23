import BlockChoices from "@/app/components/recipe/block-choices";

export default function Page() {
  return (
    <>
      <p className="text-center text-white m-4">
        Add configuration blocks to procedurally generate your daily playlist.
      </p>
      <BlockChoices />
    </>
  );
}
