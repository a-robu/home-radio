"use client";

import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "radix-ui";

export default function PlayerPage() {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  let currentTrack = {
    title: "Sample Track",
    artist: "Sample Artist",
    duration: 240,
  };
  // currentTrack = false;
  let isPlaying = false;
  let currentTime = 100;
  let localCurrentTime = currentTime;

  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center h-full text-white/90">
        <p>Playlist is empty</p>
      </div>
    );
  }

  return (
    // Container for all the controls - it brings them down to the bottom
    <div className="flex flex-col h-full justify-end px-8 pb-6">
      {/* Song name and artist */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2 text-white">
          {currentTrack.title}
        </h1>
        <p className="text-lg text-white/90">{currentTrack.artist}</p>
      </div>
      {/* Progress Bar */}
      <div className="mb-6">
        <Slider.Root
          defaultValue={[currentTime]}
          max={currentTrack.duration}
          className="relative flex items-center touch-none select-none"
        >
          <Slider.Track className="h-1 bg-black/50 w-full">
            <Slider.Range className="h-1 bg-knob-white absolute" />
          </Slider.Track>
          <Slider.Thumb className="block size-4 rounded-full bg-knob-white" />
        </Slider.Root>

        <div className="flex justify-between text-sm mt-2.5">
          <span className="bg-black/50 px-2 py-1 rounded text-white">
            {formatTime(localCurrentTime)}
          </span>
          <span className="bg-black/50 px-2 py-1 rounded text-white">
            {formatTime(currentTrack.duration)}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <button
          // onClick={handlePrevious}
          className={
            "w-12 h-12 bg-white/30 rounded-full flex items-center justify-center " +
            "hover:bg-white/40"
          }
        >
          <SkipBack size={20} className="text-white" fill="white" />
        </button>

        <button
          // onClick={handlePlayPause}
          className={
            "w-16 h-16 bg-white rounded-full flex items-center justify-center " +
            "hover:bg-white/90"
          }
        >
          {isPlaying ? (
            <Pause size={24} className="text-primary" fill="black" />
          ) : (
            <Play size={24} className="text-primary" fill="black" />
          )}
        </button>

        <button
          // onClick={handleNext}
          className={
            "w-12 h-12 bg-white/30 rounded-full flex items-center justify-center " +
            "hover:bg-white/40"
          }
        >
          <SkipForward size={20} className="text-white" fill="white" />
        </button>
      </div>
    </div>
  );
}
