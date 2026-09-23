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
} from './services/storage';
import { requestNotificationPermission, triggerReminderAlert } from './services/notificationService';
import { Navbar } from './components/Navbar';
import { DashboardHeader } from './components/DashboardHeader';
import { DailyView } from './components/Views/DailyView';
import { WeeklyView } from './components/Views/WeeklyView';
import { MonthlyView } from './components/Views/MonthlyView';
import { AuthModal } from './components/AuthModal';
import { TaskModal } from './components/TaskModal';
import { ClassModal } from './components/ClassModal';
import { AIRecommenderModal } from './components/AIRecommenderModal';
import { CalendarSyncModal } from './components/CalendarSyncModal';

export function App() {
  // Session & User State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // App Data State
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reminders, setReminders] = useState([]);

  // Active View: 'daily' | 'weekly' | 'monthly'
  const [currentView, setCurrentView] = useState('daily');

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiSelectedTask, setAiSelectedTask] = useState(null);
  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);

  // 1. Initial Session Check (Remember Me)
  useEffect(() => {
    const session = getCurrentSession();
    if (session && session.user) {
      loadUserData(session.user);
    } else {
      // Check if any user exists at all, otherwise open auth modal
      const existingUsers = getStoredUsers();
      if (existingUsers.length > 0) {
        // Auto load latest user if remember me was kept or prompt login
        setIsAuthOpen(true);
      } else {
        setIsAuthOpen(true);
      }
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
  };

  // Auth Handler
  const handleAuthSuccess = (user) => {
    loadUserData(user);
    setIsAuthOpen(false);
    triggerReminderAlert(
      `Selamat datang, ${user.name}!`,
      `Jadwal untuk jurusan ${user.major} telah siap digunakan.`
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
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

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        {currentUser ? (
          <>
            {/* Personalized Greeting, Next Class & 3 Focus Items */}
            <DashboardHeader
              user={currentUser}
              tasks={tasks}
              schedules={schedules}
              onToggleTask={handleToggleTask}
              onOpenTaskModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onOpenClassModal={() => setIsClassModalOpen(true)}
              onOpenAIRecommender={() => {
                setAiSelectedTask(null);
                setIsAIModalOpen(true);
              }}
            />

            {/* View Switcher Output */}
            {currentView === 'daily' && (
              <DailyView
                tasks={tasks}
                schedules={schedules}
                onToggleTask={handleToggleTask}
                onOpenTaskModal={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                onOpenClassModal={() => setIsClassModalOpen(true)}
                onSelectTaskForAI={handleSelectTaskForAI}
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
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              maxWidth: '560px',
              margin: '40px auto',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'var(--pastel-lavender-bg)',
                color: 'var(--pastel-lavender-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 16px',
              }}
            >
              🎓
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Mulai Kelola Jadwalmu</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Aplikasi jadwal pintar yang dirancang khusus untuk pelajar SMA dan mahasiswa. Masuk atau buat akun pertamamu untuk memulai!
            </p>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '1rem' }}
            >
              Masuk / Daftar Akun
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => currentUser && setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

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
    </div>
  );
}

export default App;
