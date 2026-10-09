"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TopicData {
  topic: string;
  total_duration: number;
  count: number;
}

interface StudyPieChartProps {
  data: TopicData[];
  totalDuration: number;
}

const COLORS = [
  "#F472B6", // 粉红
  "#5EEAD4", // 青绿
  "#A78BFA", // 紫
  "#FBBF24", // 金黄
  "#34D399", // 绿
  "#60A5FA", // 蓝
  "#FB923C", // 橙
  "#F87171", // 红
  "#C084FC", // 浅紫
  "#2DD4BF", // 青
];

function formatMinutes(seconds: number): string {
  const totalMin = Math.round(seconds / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0 && m > 0) return `${h}小时${m}分钟`;
  if (h > 0) return `${h}小时`;
  return `${m}分钟`;
}

// 自定义 Tooltip
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const totalDuration = payload[0].payload.__totalDuration;
  const pct = totalDuration > 0 ? ((item.total_duration / totalDuration) * 100).toFixed(1) : "0";

  return (
    <div className="glass !p-3 !rounded-xl text-sm">
      <p className="font-semibold mb-1">{item.topic}</p>
      <p className="text-white/70">学习时长：{formatMinutes(item.total_duration)}</p>
      <p className="text-white/70">占比：{pct}%</p>
    </div>
  );
}

// 自定义 Legend
function CustomLegend({ payload }: any) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
      {payload.map((entry: any, index: number) => {
        const item = entry.payload;
        const totalDuration = item.__totalDuration;
        const pct = totalDuration > 0 ? ((item.total_duration / totalDuration) * 100).toFixed(1) : "0";
        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/80">{item.topic}</span>
            <span className="text-white/50">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function StudyPieChart({ data, totalDuration }: StudyPieChartProps) {
  // 空状态
  if (data.length === 0) {
    return (
      <div className="glass p-10 text-center">
        <div className="text-4xl mb-3">📚</div>
        <p className="text-white/60 text-lg">还没有学习记录</p>
        <p className="text-white/40 text-sm mt-1">开始今天的学习吧！</p>
      </div>
    );
  }

  // 给每条数据附加总时长，供 Tooltip/Legend 使用
  const chartData = data.map((item) => ({
    ...item,
    __totalDuration: totalDuration,
  }));

  return (
    <div className="glass p-6">
      <h3 className="text-lg font-semibold mb-4">学习时长分布</h3>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="total_duration"
            nameKey="topic"
            strokeWidth={0}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                className="outline-none cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      {/* 总计 */}
      <p className="text-center text-white/50 text-sm mt-2">
        总计：{formatMinutes(totalDuration)}
      </p>
    </div>
  );
}
