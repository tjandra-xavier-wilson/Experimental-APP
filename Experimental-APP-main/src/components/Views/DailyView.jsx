// src/components/Views/DailyView.jsx
import React from 'react';
import { ThreeFocusCard } from '../ThreeFocusCard';
import { ClassesCard } from '../ClassesCard';
import { TaskProgressCard } from '../TaskProgressCard';
import { FriendsWidget } from '../FriendsWidget';
import { DeadlinesCard } from '../DeadlinesCard';

export const DailyView = ({
  tasks = [],
  schedules = [],
  friends = [],
  onToggleTask,
  onOpenTaskModal,
  onOpenClassModal,
  onSelectTaskForAI,
  onOpenAIRecommender,
  onAddFriend,
  userName = 'Tjandra',
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '22px',
        alignItems: 'start',
      }}
    >
      {/* Kolom Kiri: 3 Fokus Utama Hari Ini & Jadwal Perkuliahan / Kelas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <ThreeFocusCard
          tasks={tasks}
          onToggleTask={onToggleTask}
          onOpenAIRecommender={onOpenAIRecommender}
          onOpenTaskModal={onOpenTaskModal}
        />
        <ClassesCard
          schedules={schedules}
          onOpenClassModal={onOpenClassModal}
        />
      </div>

      {/* Kolom Kanan: Progres Tugas (Donut), Teman & Progress, Tenggat & Agenda Tugas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <TaskProgressCard
          tasks={tasks}
          onOpenTaskModal={onOpenTaskModal}
          onOpenClassModal={onOpenClassModal}
          userName={userName}
        />
        <FriendsWidget
          friends={friends}
          onAddFriend={onAddFriend}
          currentUserName={userName}
        />
        <DeadlinesCard
          tasks={tasks}
          onToggleTask={onToggleTask}
          onOpenTaskModal={onOpenTaskModal}
          onSelectTaskForAI={onSelectTaskForAI}
        />
      </div>
    </div>
  );
};
