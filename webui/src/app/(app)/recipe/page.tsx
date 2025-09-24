"use client";

import BlockChoices from "@/app/components/recipe/block-choices";
import { useSortable } from "@dnd-kit/react/sortable";

const styles: React.CSSProperties = {
  display: "inline-flex",
  flexDirection: "column",
  gap: 20,
};

function Sortable({ id, index }: { id: number; index: number }) {
  const { ref } = useSortable({ id, index });

  return <button ref={ref}>Item {id}</button>;
}

export default function Page() {
  const items = [0, 1, 2, 3];
  return (
    <>
      <p className="text-center text-white m-4">
        Add configuration blocks to procedurally generate your daily playlist.
      </p>
      <div style={styles}>
        {items.map((id, index) => (
          <Sortable key={id} id={id} index={index} />
        ))}
      </div>
      <BlockChoices />
    </>
  );
}
