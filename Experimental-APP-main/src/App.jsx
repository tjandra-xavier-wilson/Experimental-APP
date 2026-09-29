// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  getCurrentSession,
  getUserData,
  saveTask,
  toggleTaskStatus,
  saveSchedule,
  logoutUser,
  getStoredUsers,
  ensureDefaultUser,
  getFriends,
  addFriend,
  getNotes,
  saveNotes,
  saveUsers,
} from './services/storage';
import { requestNotificationPermission, triggerReminderAlert } from './services/notificationService';
import { Sidebar } from './components/Sidebar';
import { ProductivityPanel } from './components/ProductivityPanel';
import { Navbar } from './components/Navbar';
import { GreetingCard } from './components/GreetingCard';
import { DailyView } from './components/Views/DailyView';
import { WeeklyView } from './components/Views/WeeklyView';
import { MonthlyView } from './components/Views/MonthlyView';
import { AuthScreen } from './components/AuthScreen';
import { TaskModal } from './components/TaskModal';
import { ClassModal } from './components/ClassModal';
import { AIRecommenderModal } from './components/AIRecommenderModal';
import { CalendarSyncModal } from './components/CalendarSyncModal';
import { NotesModal } from './components/NotesModal';
import { SettingsModal } from './components/SettingsModal';

export function App() {
  // Session & User State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // App Data State (Empty default tasks & friends as requested)
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [friends, setFriends] = useState([]);
  const [notes, setNotes] = useState([]);

  // Active View & Tab State
  const [currentView, setCurrentView] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  const [isProdCollapsed, setIsProdCollapsed] = useState(false);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiSelectedTask, setAiSelectedTask] = useState(null);
  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 1. Initial Session Check (Load or Ensure Default User Tjandra)
  useEffect(() => {
    const session = getCurrentSession();
    if (session && session.user) {
      loadUserData(session.user);
    } else {
      // Auto-seed default user Tjandra
      const user = ensureDefaultUser();
      loadUserData(user);
    }

    // Ask for browser notification permission gently
    requestNotificationPermission();
  }, []);

  // Helper to load user bundle
  const loadUserData = (user) => {
    setCurrentUser(user);
    const data = getUserData(user.id);
    if (data) {
      setTasks(data.tasks || []);
      setSchedules(data.schedules || []);
      setCourses(data.courses || []);
      setCategories(data.categories || []);
      setReminders(data.reminders || []);
    }
    setFriends(getFriends(user.id));
    setNotes(getNotes(user.id));
  };

  // Auth Handlers
  const handleAuthSuccess = (user) => {
    loadUserData(user);
    setIsAuthOpen(false);
    triggerReminderAlert(
      `Selamat datang, ${user.name}!`,
      `Akun ${user.educationLevel} (${user.major}) siap digunakan di CodeStack Schedule.`
    );
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setTasks([]);
    setSchedules([]);
    setIsAuthOpen(true);
  };

  // Task Handlers
  const handleToggleTask = (taskId) => {
    if (!currentUser) return;
    const updated = toggleTaskStatus(currentUser.id, taskId);
    setTasks(updated);
  };

  const handleSaveTask = (taskData) => {
    if (!currentUser) return;
    const updated = saveTask(currentUser.id, taskData);
    setTasks(updated);
    setEditingTask(null);
  };

  const handleSelectTaskForAI = (task) => {
    setAiSelectedTask(task);
    setIsAIModalOpen(true);
  };

  const handleApplyAIRec = (taskId, rec) => {
    if (!currentUser) return;
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      const updatedTask = {
        ...target,
        aiRecommendedSlot: rec,
      };
      const updated = saveTask(currentUser.id, updatedTask);
      setTasks(updated);
      triggerReminderAlert(
        'Rekomendasi AI Diterapkan',
        `Slot belajar untuk "${target.title}" dijadwalkan pada ${rec.suggestedDate} ${rec.startTime} WIB.`
      );
    }
  };

  // Schedule / Class Handlers
  const handleSaveSchedule = (scheduleData) => {
    if (!currentUser) return;
    const updated = saveSchedule(currentUser.id, scheduleData);
    setSchedules(updated);
  };

  // Friends Handlers
  const handleAddFriend = (friendData) => {
    if (!currentUser) return;
    const updated = addFriend(currentUser.id, friendData);
    setFriends(updated);
  };

  // Notes Handlers
  const handleSaveNotes = (updatedNotes) => {
    if (!currentUser) return;
    saveNotes(currentUser.id, updatedNotes);
    setNotes(updatedNotes);
  };

  // User Profile Update
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === updatedUser.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
      saveUsers(users);
    }
  };

  // Fullscreen Interactive Auth Screen (100vh & 100vw)
  if (!currentUser || isAuthOpen) {
    return <AuthScreen isOpen={true} onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* 1. Permanent Vertical Sidebar on Far Left (68px) */}
      <Sidebar
        activeTab={activeSidebarTab}
        onSelectTab={(tab) => {
          setActiveSidebarTab(tab);
          if (tab === 'main' || tab === 'dashboard') {
            setCurrentView('daily');
          } else if (tab === 'plans') {
            setCurrentView('weekly');
          }
        }}
        onOpenClassModal={() => setIsClassModalOpen(true)}
        onOpenTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenNotesModal={() => setIsNotesModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        user={currentUser}
      />

      {/* 2. Productivity Widget / Panel on Left (Next to Sidebar) */}
      <ProductivityPanel
        completedTasksCount={tasks.filter((t) => t.isCompleted).length}
        totalTasksCount={tasks.length}
        user={currentUser}
        isCollapsed={isProdCollapsed}
        onToggleCollapse={() => setIsProdCollapsed(!isProdCollapsed)}
      />

      {/* 3. Main Content Area next to Productivity Panel */}
      <div
        style={{
          flex: 1,
          marginLeft: isProdCollapsed ? '92px' : '308px',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 240ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Top Header spanning from sidebar to right with CodeStack Schedule Logo */}
        <Navbar
          user={currentUser}
          currentView={currentView}
          onViewChange={setCurrentView}
          onOpenTaskModal={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          onOpenClassModal={() => setIsClassModalOpen(true)}
          onOpenCalendarSync={() => setIsCalendarSyncOpen(true)}
          onOpenAIRecommender={() => {
            setAiSelectedTask(null);
            setIsAIModalOpen(true);
          }}
          onLogout={handleLogout}
          reminders={reminders}
        />

        {/* Content Container */}
        <main
          style={{
            flex: 1,
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
            padding: '24px 28px',
          }}
        >
          {/* Full-width Greeting Card */}
          <GreetingCard user={currentUser} schedules={schedules} />

          {/* View Output */}
          {currentView === 'daily' && (
            <DailyView
              tasks={tasks}
              schedules={schedules}
              friends={friends}
              onToggleTask={handleToggleTask}
              onOpenTaskModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onOpenClassModal={() => setIsClassModalOpen(true)}
              onSelectTaskForAI={handleSelectTaskForAI}
              onOpenAIRecommender={() => {
                setAiSelectedTask(null);
                setIsAIModalOpen(true);
              }}
              onAddFriend={handleAddFriend}
              userName={currentUser.name}
            />
          )}

          {currentView === 'weekly' && (
            <WeeklyView
              tasks={tasks}
              schedules={schedules}
              onToggleTask={handleToggleTask}
              onOpenTaskModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onSelectTaskForAI={handleSelectTaskForAI}
            />
          )}

          {currentView === 'monthly' && (
            <MonthlyView
              tasks={tasks}
              schedules={schedules}
              onToggleTask={handleToggleTask}
              onOpenTaskModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSaveTask={handleSaveTask}
        courses={courses}
        schedules={schedules}
        userPreference={currentUser?.studyPreference || 'balanced'}
        initialTask={editingTask}
      />

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSaveSchedule={handleSaveSchedule}
      />

      <AIRecommenderModal
        isOpen={isAIModalOpen}
        onClose={() => {
          setIsAIModalOpen(false);
          setAiSelectedTask(null);
        }}
        tasks={tasks}
        schedules={schedules}
        user={currentUser}
        initialTask={aiSelectedTask}
        onApplyRecommendation={handleApplyAIRec}
      />

      <CalendarSyncModal
        isOpen={isCalendarSyncOpen}
        onClose={() => setIsCalendarSyncOpen(false)}
        tasks={tasks}
        schedules={schedules}
        user={currentUser}
      />

      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        notes={notes}
        onSaveNotes={handleSaveNotes}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={currentUser}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
}

export default App;
