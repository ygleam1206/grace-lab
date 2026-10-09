"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square } from "lucide-react";
import GlassCard from "./GlassCard";
import { formatDuration } from "@/lib/utils";

interface Task {
  id: number;
  name: string;
  total_duration: number;
}

interface StudyTimerProps {
  tasks: Task[];
  onRecordComplete: () => void;
  /** 设置后自动选中该任务并立即开始计时 */
  startTaskId?: number | null;
}

export default function StudyTimer({ tasks, onRecordComplete, startTaskId }: StudyTimerProps) {
  const [status, setStatus] = useState<"idle" | "ongoing" | "paused">("idle");
  const [recordId, setRecordId] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startingRef = useRef(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // 外部请求开始计时：选中任务 + 调用 API + 进入 ongoing
  const doStart = useCallback(async (taskId: number) => {
    if (startingRef.current) return;
    startingRef.current = true;
    setSelectedTaskId(taskId);
    const res = await fetch("/api/study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", task_id: taskId }),
    });
    if (res.ok) {
      const data = await res.json();
      setRecordId(data.id);
      setStatus("ongoing");
      setElapsed(0);
    }
    startingRef.current = false;
  }, []);

  // 监听 startTaskId 变化，自动开始
  useEffect(() => {
    if (startTaskId != null && status === "idle") {
      doStart(startTaskId);
    }
  }, [startTaskId, status, doStart]);

  // 计时器 interval：ongoing 时每秒 +1
  useEffect(() => {
    if (status === "ongoing") {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const handleStart = async () => {
    if (!selectedTaskId) return;
    await doStart(selectedTaskId);
  };

  const handlePause = async () => {
    if (!recordId) return;
    await fetch("/api/study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pause", id: recordId }),
    });
    setStatus("paused");
  };

  const handleResume = async () => {
    if (!recordId) return;
    await fetch("/api/study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resume", id: recordId }),
    });
    setStatus("ongoing");
  };

  const handleStop = async () => {
    if (!recordId) return;
    await fetch("/api/study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stop", id: recordId }),
    });
    setStatus("idle");
    setRecordId(null);
    setElapsed(0);
    onRecordComplete();
  };

  return (
    <GlassCard>
      <h3 className="text-xl font-semibold mb-4">学习计时器</h3>

      {status === "idle" ? (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-white/50 text-sm py-4 text-center">
              请先创建任务标签，再开始计时
            </p>
          ) : (
            <>
              <select
                value={selectedTaskId ?? ""}
                onChange={(e) => setSelectedTaskId(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/40 appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-800">选择学习任务</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id} className="bg-gray-800">
                    {task.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStart}
                disabled={!selectedTaskId}
                className="w-full flex items-center justify-center gap-2 bg-green-500/30 hover:bg-green-500/40 border border-green-400/30 rounded-xl py-3 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play size={18} /> 开始学习
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-lg text-white/70">{selectedTask?.name}</p>
          <div className="text-5xl font-mono font-bold tracking-wider">
            {formatDuration(elapsed)}
          </div>
          <p className={`text-sm ${status === "ongoing" ? "text-green-300" : "text-yellow-300"}`}>
            {status === "ongoing" ? "学习中..." : "已暂停"}
          </p>
          <div className="flex gap-3">
            {status === "ongoing" ? (
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-500/30 hover:bg-yellow-500/40 border border-yellow-400/30 rounded-xl py-3 font-semibold transition-all"
              >
                <Pause size={18} /> 暂停
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500/30 hover:bg-green-500/40 border border-green-400/30 rounded-xl py-3 font-semibold transition-all"
              >
                <Play size={18} /> 继续
              </button>
            )}
            <button
              onClick={handleStop}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500/30 hover:bg-red-500/40 border border-red-400/30 rounded-xl py-3 font-semibold transition-all"
            >
              <Square size={18} /> 结束
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
