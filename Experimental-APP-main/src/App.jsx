// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  getCurrentSession,
  getUserData,
  saveTask,
  deleteTask,
  toggleTaskStatus,
  saveSchedule,
  deleteSchedule,
  logoutUser,
  getStoredUsers,
  ensureDefaultUser,
  getFriends,
  addFriend,
  getNotes,
  saveNotes,
  deleteNote,
  saveUsers,
  fetchCloudUserData,
  pullDataFromSupabase,
  subscribeToCloudChanges,
} from './services/storage';
import { isSupabaseConfigured } from './services/supabaseClient';
import { requestNotificationPermission, triggerReminderAlert } from './services/notificationService';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { GreetingCard } from './components/GreetingCard';
import { DailyView } from './components/Views/DailyView';
import { WeeklyView } from './components/Views/WeeklyView';
import { MonthlyView } from './components/Views/MonthlyView';
import { ProductivityView } from './components/Views/ProductivityView';
import { ClassesView } from './components/Views/ClassesView';
import { TasksView } from './components/Views/TasksView';
import { NotesView } from './components/Views/NotesView';
import { PlansView } from './components/Views/PlansView';
import { FriendsView } from './components/Views/FriendsView';
import { SupabaseView } from './components/Views/SupabaseView';
import { SettingsView } from './components/Views/SettingsView';
import { AuthScreen } from './components/AuthScreen';
import { TaskModal } from './components/TaskModal';
import { ClassModal } from './components/ClassModal';
import { AIRecommenderModal } from './components/AIRecommenderModal';
import { CalendarSyncModal } from './components/CalendarSyncModal';
import { NotesModal } from './components/NotesModal';
import { SettingsModal } from './components/SettingsModal';
import { SupabaseModal } from './components/SupabaseModal';

const VALID_TABS = [
  'dashboard',
  'productivity',
  'classes',
  'tasks',
  'notes',
  'plans',
  'friends',
  'supabase',
  'settings',
];

const getInitialTab = () => {
  try {
    const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
    if (VALID_TABS.includes(hash)) {
      return hash;
    }
    const stored = localStorage.getItem('studycal_active_tab_v1');
    if (stored && VALID_TABS.includes(stored)) {
      return stored;
    }
  } catch (err) {
    console.warn('Tab initial state read warning:', err);
  }
  return 'dashboard';
};

const getInitialView = (initialTab) => {
  if (initialTab === 'plans') {
    try {
      const stored = localStorage.getItem('studycal_current_view_v1');
      if (stored === 'monthly' || stored === 'weekly') return stored;
    } catch {}
    return 'weekly';
  }
  return 'daily';
};

export function App() {
  // Synchronous session check prevents 1-second login screen flash on page refresh!
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const session = getCurrentSession();
      return session?.user || null;
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // App Data State (Synchronously pre-loaded for active session to prevent layout shifts)
  const [tasks, setTasks] = useState(() => {
    try {
      const session = getCurrentSession();
      if (session?.user?.id) {
        return getUserData(session.user.id)?.tasks || [];
      }
    } catch {}
    return [];
  });
  const [schedules, setSchedules] = useState(() => {
    try {
      const session = getCurrentSession();
      if (session?.user?.id) {
        return getUserData(session.user.id)?.schedules || [];
      }
    } catch {}
    return [];
  });
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [friends, setFriends] = useState(() => {
    try {
      const session = getCurrentSession();
      if (session?.user?.id) {
        return getFriends(session.user.id) || [];
      }
    } catch {}
    return [];
  });
  const [notes, setNotes] = useState(() => {
    try {
      const session = getCurrentSession();
      if (session?.user?.id) {
        return getNotes(session.user.id) || [];
      }
    } catch {}
    return [];
  });

  // Active View & Tab State (Persisted across refreshes via hash & localStorage)
  const [activeSidebarTab, setActiveSidebarTab] = useState(getInitialTab);
  const [currentView, setCurrentView] = useState(() => getInitialView(activeSidebarTab));
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiSelectedTask, setAiSelectedTask] = useState(null);
  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // 1. Initial Session & Supabase Cloud Sync
  useEffect(() => {
    let unsubscribe = null;

    const init = async () => {
      const session = getCurrentSession();
      const user = session?.user || ensureDefaultUser();
      loadUserData(user);

      // Fetch fresh data from Supabase Cloud
      try {
        const cloudData = await fetchCloudUserData(user.id);
        if (cloudData) {
          if (cloudData.tasks && cloudData.tasks.length > 0) setTasks(cloudData.tasks);
          if (cloudData.schedules && cloudData.schedules.length > 0) setSchedules(cloudData.schedules);
          if (cloudData.courses && cloudData.courses.length > 0) setCourses(cloudData.courses);
          if (cloudData.friends && cloudData.friends.length > 0) setFriends(cloudData.friends);
          if (cloudData.notes && cloudData.notes.length > 0) setNotes(cloudData.notes);
        }
      } catch (err) {
        console.warn('Supabase initial fetch warning:', err);
      }

      // Realtime subscription for cross-device updates (Laptop <-> HP)
      unsubscribe = subscribeToCloudChanges(user.id, (freshTasks) => {
        if (freshTasks) setTasks(freshTasks);
      });
    };

    init();

    // Ask for browser notification permission gently
    requestNotificationPermission();

    return () => {
      if (unsubscribe) unsubscribe();
    };
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

    // If Supabase Cloud is configured, pull latest remote data in background
    if (isSupabaseConfigured() && user?.id) {
      pullDataFromSupabase(user.id)
        .then((merged) => {
          if (merged) {
            if (merged.tasks) setTasks(merged.tasks);
            if (merged.schedules) setSchedules(merged.schedules);
            if (merged.courses) setCourses(merged.courses);
            if (merged.friends) setFriends(merged.friends);
            if (merged.notes) setNotes(merged.notes);
          }
        })
        .catch((e) => console.warn('Cloud sync error on load:', e));
    }
  };

  // Auth Handlers
  const handleAuthSuccess = async (user) => {
    loadUserData(user);
    setIsAuthOpen(false);

    try {
      const cloudData = await fetchCloudUserData(user.id);
      if (cloudData) {
        if (cloudData.tasks && cloudData.tasks.length > 0) setTasks(cloudData.tasks);
        if (cloudData.schedules && cloudData.schedules.length > 0) setSchedules(cloudData.schedules);
        if (cloudData.courses && cloudData.courses.length > 0) setCourses(cloudData.courses);
        if (cloudData.friends && cloudData.friends.length > 0) setFriends(cloudData.friends);
        if (cloudData.notes && cloudData.notes.length > 0) setNotes(cloudData.notes);
      }
    } catch (err) {
      console.warn('Supabase auth cloud fetch warning:', err);
    }

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
    setFriends([]);
    setNotes([]);
    setIsAuthOpen(true);
    try {
      localStorage.removeItem('studycal_active_tab_v1');
      localStorage.removeItem('studycal_current_view_v1');
      window.history.replaceState(null, '', '#dashboard');
    } catch (e) {}
    setActiveSidebarTab('dashboard');
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

  const handleDeleteTask = (taskId) => {
    if (!currentUser) return;
    const updated = deleteTask(currentUser.id, taskId);
    setTasks(updated);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
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

  const handleDeleteSchedule = (scheduleId) => {
    if (!currentUser) return;
    const updated = deleteSchedule(currentUser.id, scheduleId);
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

  const handleDeleteNote = (noteId) => {
    if (!currentUser) return;
    const updated = deleteNote(currentUser.id, noteId);
    setNotes(updated);
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

  // Navigation handlers with persistence and animation trigger
  const handleSelectTab = (tab) => {
    if (!VALID_TABS.includes(tab)) return;
    setActiveSidebarTab(tab);
    setRefreshKey((prev) => prev + 1);

    try {
      localStorage.setItem('studycal_active_tab_v1', tab);
      const currentHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      if (currentHash !== tab) {
        window.history.replaceState(null, '', `#${tab}`);
      }
    } catch (e) {}

    if (tab === 'dashboard') {
      setCurrentView('daily');
    } else if (tab === 'plans' && currentView === 'daily') {
      setCurrentView('weekly');
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    try {
      localStorage.setItem('studycal_current_view_v1', view);
    } catch (e) {}

    if (view === 'daily') {
      handleSelectTab('dashboard');
    } else {
      handleSelectTab('plans');
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);

    try {
      if (currentUser?.id) {
        const cloudData = await fetchCloudUserData(currentUser.id);
        if (cloudData) {
          if (cloudData.tasks && cloudData.tasks.length > 0) setTasks(cloudData.tasks);
          if (cloudData.schedules && cloudData.schedules.length > 0) setSchedules(cloudData.schedules);
          if (cloudData.courses && cloudData.courses.length > 0) setCourses(cloudData.courses);
          if (cloudData.friends && cloudData.friends.length > 0) setFriends(cloudData.friends);
          if (cloudData.notes && cloudData.notes.length > 0) setNotes(cloudData.notes);
        } else {
          loadUserData(currentUser);
        }
      }
    } catch (err) {
      console.warn('Manual refresh warning:', err);
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Synchronize URL hash with active tab & support browser back/forward buttons
  useEffect(() => {
    try {
      const currentHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      if (!currentHash || currentHash !== activeSidebarTab) {
        window.history.replaceState(null, '', `#${activeSidebarTab}`);
      }
      localStorage.setItem('studycal_active_tab_v1', activeSidebarTab);
    } catch (e) {}

    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      if (VALID_TABS.includes(hash) && hash !== activeSidebarTab) {
        setActiveSidebarTab(hash);
        setRefreshKey((prev) => prev + 1);
        try {
          localStorage.setItem('studycal_active_tab_v1', hash);
        } catch (e) {}
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeSidebarTab]);

  // Fullscreen Interactive Auth Screen (100vh & 100vw)
  if (!currentUser || isAuthOpen) {
    return <AuthScreen isOpen={true} onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* 1. Permanent Vertical Sidebar on Far Left (68px) */}
      <Sidebar
        activeTab={activeSidebarTab}
        onSelectTab={handleSelectTab}
        onOpenClassModal={() => setIsClassModalOpen(true)}
        onOpenTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenNotesModal={() => setIsNotesModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        user={currentUser}
      />

      {/* 2. Main Content Area (Spans full width from 68px) */}
      <div
        style={{
          flex: 1,
          marginLeft: '68px',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Top Header spanning from sidebar to right with CodeStack Schedule Logo */}
        <Navbar
          user={currentUser}
          currentView={currentView}
          onViewChange={handleViewChange}
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
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onLogout={handleLogout}
          onRefreshTab={handleManualRefresh}
          isRefreshing={isRefreshing}
          reminders={reminders}
        />

        {/* Top Loading Accent Bar on refresh or tab switch */}
        <div key={`loader-${activeSidebarTab}-${refreshKey}`} className="tab-refresh-bar" />

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
          {/* Animated Tab Content Container */}
          <div
            key={`${activeSidebarTab}-${refreshKey}`}
            className="tab-view-container"
          >
            {/* Conditional View Rendering based on activeSidebarTab */}
            {activeSidebarTab === 'dashboard' && (
            <>
              <GreetingCard user={currentUser} schedules={schedules} />
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
            </>
          )}

          {activeSidebarTab === 'productivity' && (
            <ProductivityView
              tasks={tasks}
              schedules={schedules}
              user={currentUser}
              onToggleTask={handleToggleTask}
              onOpenTaskModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeSidebarTab === 'classes' && (
            <ClassesView
              schedules={schedules}
              onOpenClassModal={() => setIsClassModalOpen(true)}
              onDeleteSchedule={handleDeleteSchedule}
              user={currentUser}
            />
          )}

          {activeSidebarTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              courses={courses}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onOpenTaskModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onEditTask={handleEditTask}
              onSelectTaskForAI={handleSelectTaskForAI}
            />
          )}

          {activeSidebarTab === 'notes' && (
            <NotesView
              notes={notes}
              onSaveNotes={handleSaveNotes}
              onDeleteNote={handleDeleteNote}
              onOpenNotesModal={() => setIsNotesModalOpen(true)}
              user={currentUser}
            />
          )}

          {activeSidebarTab === 'plans' && (
            <PlansView
              tasks={tasks}
              schedules={schedules}
              onToggleTask={handleToggleTask}
              onOpenTaskModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onOpenClassModal={() => setIsClassModalOpen(true)}
              onSelectTaskForAI={handleSelectTaskForAI}
              mode={currentView === 'monthly' ? 'monthly' : 'weekly'}
              onModeChange={setCurrentView}
            />
          )}

          {activeSidebarTab === 'friends' && (
            <FriendsView
              friends={friends}
              onAddFriend={handleAddFriend}
              currentUser={currentUser}
            />
          )}

          {activeSidebarTab === 'supabase' && (
            <SupabaseView
              user={currentUser}
              tasks={tasks}
              schedules={schedules}
              friends={friends}
              notes={notes}
              onDataSynced={() => {
                if (currentUser) loadUserData(currentUser);
              }}
              onOpenConfigModal={() => setIsSupabaseModalOpen(true)}
            />
          )}

          {activeSidebarTab === 'settings' && (
            <SettingsView
              user={currentUser}
              onUpdateUser={handleUpdateUser}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
              onLogout={handleLogout}
            />
          )}
          </div>
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
        onDeleteNote={handleDeleteNote}
        user={currentUser}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={currentUser}
        onUpdateUser={handleUpdateUser}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        user={currentUser}
        onDataSynced={() => {
          if (currentUser) loadUserData(currentUser);
        }}
      />
    </div>
  );
}

export default App;
