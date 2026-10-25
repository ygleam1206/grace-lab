"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, ExternalLink, Music } from "lucide-react";
import { siteConfig } from "@/siteConfig";

interface SongInfo {
  name: string;
  artist: string;
  cover: string;
  url: string;
}

const METING_API = "https://api.injahow.cn/meting/?server=netease&type=song&id=";

export default function MusicPlayer() {
  const songId = siteConfig.musicSongId;
  const audioRef = useRef<HTMLAudioElement>(null);

  const [song, setSong] = useState<SongInfo | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // 加载歌曲信息
  useEffect(() => {
    if (!songId) return;
    let cancelled = false;

    const fetchSong = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${METING_API}${songId}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          const s = data[0];
          setSong({
            name: s.name || "未知歌曲",
            artist: s.artist || "未知歌手",
            cover: s.cover || s.pic || "",
            url: s.url || "",
          });
        } else {
          throw new Error("No data");
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSong();
    return () => { cancelled = true; };
  }, [songId]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !song?.url) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setError(true));
    }
  }, [playing, song]);

  const handleEnded = useCallback(() => setPlaying(false), []);
  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => setPlaying(false), []);

  if (!songId) return null;

  const neteaseUrl = `https://music.163.com/song?id=${songId}`;

  return (
    <div className="fixed bottom-4 left-4 z-40 hidden lg:block">
      <audio
        ref={audioRef}
        src={song?.url}
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
        preload="none"
      />

      <button
        onClick={togglePlay}
        disabled={loading}
        className="group flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        title={playing ? "暂停" : "播放"}
      >
        {/* 封面 */}
        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gray-200 shrink-0">
          {song?.cover ? (
            <img
              src={song.cover}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music size={14} className="text-gray-400" />
            </div>
          )}
          {/* 播放中旋转动画 */}
          {playing && (
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin" style={{ animationDuration: "3s" }} />
          )}
        </div>

        {/* 歌名 */}
        <div className="flex flex-col items-start min-w-0">
          {loading ? (
            <span className="text-xs text-gray-400">加载中...</span>
          ) : error ? (
            <span className="text-xs text-red-400">加载失败</span>
          ) : (
            <>
              <span className="text-xs font-medium text-gray-700 truncate max-w-[120px] leading-tight">
                {song?.name || "未知歌曲"}
              </span>
              <span className="text-[10px] text-gray-400 truncate max-w-[120px] leading-tight">
                {song?.artist || ""}
              </span>
            </>
          )}
        </div>

        {/* 播放/暂停按钮 */}
        <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center shrink-0 group-hover:bg-black/15 transition-colors">
          {error ? (
            <a
              href={neteaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center"
              title="在网易云音乐中打开"
            >
              <ExternalLink size={11} className="text-gray-500" />
            </a>
          ) : playing ? (
            <Pause size={11} className="text-gray-600" />
          ) : (
            <Play size={11} className="text-gray-600 ml-0.5" />
          )}
        </div>
      </button>
    </div>
  );
}
