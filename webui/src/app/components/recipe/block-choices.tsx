import { AudioWaveform, Mic, Music, Radio } from "lucide-react";
import AddBlockButton from "./add-button";

export default function BlockChoices() {
  return (
    <div className="grid grid-cols-2 gap-3 m-3">
      <AddBlockButton>
        <Music className="inline-block" />
        <span>Add Navidrome</span>
      </AddBlockButton>
      <AddBlockButton>
        <Mic className="inline-block" />
        <span>Add Podcast</span>
      </AddBlockButton>
      <AddBlockButton>
        <AudioWaveform className="inline-block" />
        <span>Add Caddy File</span>
      </AddBlockButton>
      <AddBlockButton>
        <Radio className="inline-block" />
        <span>Add Radio Station</span>
      </AddBlockButton>
    </div>
  );
}
