"use client";

// 学习记录页面 — 任务标签管理 + 学习计时
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BarChart3, Plus, X, Clock, Pencil, Trash2, Play } from "lucide-react";
import StudyTimer from "@/components/StudyTimer";
import GlassCard from "@/components/GlassCard";
import { formatDuration } from "@/lib/utils";

interface Task {
  id: number;
  name: string;
  total_duration: number;
  session_count: number;
}

interface Session {
  id: number;
  start_time: string;
  end_time: string | null;
  duration: number;
  status: string;
}

interface TaskDetail {
  id: number;
  name: string;
  total_duration: number;
  session_count: number;
  sessions: Session[];
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "今天";
  if (d.toDateString() === yesterday.toDateString()) return "昨天";
  return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

export default function StudyPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [editingTask, setEditingTask] = useState<{ id: number; name: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [startTaskId, setStartTaskId] = useState<number | null>(null);

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async () => {
    if (!newTaskName.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTaskName.trim() }),
    });
    if (res.ok) {
      setNewTaskName("");
      setShowCreate(false);
      fetchTasks();
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setDetail(null);
      fetchTasks();
    }
  };

  const handleUpdate = async () => {
    if (!editingTask || !editName.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingTask.id, name: editName.trim() }),
    });
    if (res.ok) {
      setEditingTask(null);
      setEditName("");
      fetchTasks();
      // 刷新详情
      if (detail) {
        const dRes = await fetch(`/api/tasks/${editingTask.id}`);
        if (dRes.ok) setDetail(await dRes.json());
      }
    }
  };

  const openDetail = async (task: Task) => {
    const res = await fetch(`/api/tasks/${task.id}`);
    if (res.ok) {
      const data = await res.json();
      setDetail(data);
    }
  };

  const statusLabel = (s: string) => {
    if (s === "ongoing") return "进行中";
    if (s === "paused") return "已暂停";
    if (s === "completed") return "已完成";
    return s;
  };

  const statusColor = (s: string) => {
    if (s === "ongoing") return "text-green-300";
    if (s === "paused") return "text-yellow-300";
    return "text-white/50";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">学习记录</h1>
        <Link
          href="/study/stats"
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full px-5 py-2.5 transition-all"
        >
          <BarChart3 size={18} />
          学习统计
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 计时器 */}
        <StudyTimer tasks={tasks} onRecordComplete={fetchTasks} startTaskId={startTaskId} />

        {/* 任务标签列表 */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">任务标签</h3>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 rounded-full px-4 py-1.5 text-sm transition-all"
            >
              <Plus size={14} /> 新建任务
            </button>
          </div>

          {loading ? (
            <p className="text-white/50">加载中...</p>
          ) : tasks.length === 0 ? (
            <p className="text-white/50 text-center py-8">还没有任务标签，创建一个开始学习吧</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => openDetail(task)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <div>
                      <p className="font-medium">{task.name}</p>
                      <p className="text-xs text-white/50">{task.session_count} 次学习</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-white/70">{formatDuration(task.total_duration)}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask({ id: task.id, name: task.name });
                          setEditName(task.name);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Pencil size={13} className="text-white/50" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* 创建任务弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass !p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">新建任务标签</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              placeholder="任务名称，如 JavaSE"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 placeholder-white/40 focus:outline-none focus:border-white/40 mb-4"
            />
            <button
              onClick={handleCreate}
              disabled={!newTaskName.trim()}
              className="w-full bg-purple-500/30 hover:bg-purple-500/40 border border-purple-400/30 rounded-xl py-2.5 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              创建
            </button>
          </div>
        </div>
      )}

      {/* 修改任务名称弹窗 */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass !p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">修改任务名称</h3>
              <button onClick={() => setEditingTask(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              autoFocus
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:border-white/40 mb-4"
            />
            <button
              onClick={handleUpdate}
              disabled={!editName.trim()}
              className="w-full bg-purple-500/30 hover:bg-purple-500/40 border border-purple-400/30 rounded-xl py-2.5 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* 任务详情弹窗 */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass !p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{detail.name}</h3>
              <button onClick={() => setDetail(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* 累计信息 */}
            <div className="flex gap-6 mb-6 p-4 rounded-xl bg-white/5">
              <div>
                <p className="text-xs text-white/50 mb-1">累计学习</p>
                <p className="text-xl font-bold">{formatDuration(detail.total_duration)}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1">学习次数</p>
                <p className="text-xl font-bold">{detail.session_count} 次</p>
              </div>
            </div>

            {/* 快捷开始 */}
            <button
              onClick={() => {
                setStartTaskId(detail.id); setDetail(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full flex items-center justify-center gap-2 bg-green-500/30 hover:bg-green-500/40 border border-green-400/30 rounded-xl py-2.5 font-semibold transition-all mb-6"
            >
              <Play size={16} /> 开始学习
            </button>

            {/* 学习记录 */}
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Clock size={16} className="text-white/50" />
              学习记录
            </h4>

            {detail.sessions.length === 0 ? (
              <p className="text-white/50 text-sm text-center py-4">暂无学习记录</p>
            ) : (
              <div className="space-y-2">
                {detail.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                  >
                    <div>
                      <p className="text-sm">
                        {formatDate(session.start_time)} {formatTime(session.start_time)}
                        {session.end_time && ` - ${formatTime(session.end_time)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDuration(session.duration)}</p>
                      <p className={`text-xs ${statusColor(session.status)}`}>
                        {statusLabel(session.status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

