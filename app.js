// Work Tracker App - Complete Version with All Views
class WorkTrackerApp {
    constructor() {
        this.activeSession = null;
        this.timerInterval = null;
        this.sessions = [];
        this.projects = [];
        this.weeklyGoal = 40;
        this.userName = 'Alex Johnson';
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.showPage('dashboard');
        this.registerServiceWorker();
        if (this.activeSession) this.startTimer();
        setInterval(() => this.saveData(), 30000);
    }

    loadData() {
        try {
            const data = localStorage.getItem('workTrackerData');
            if (data) {
                const parsed = JSON.parse(data);
                this.sessions = parsed.sessions || [];
                this.projects = parsed.projects || [];
                this.activeSession = parsed.activeSession || null;
                this.weeklyGoal = parsed.weeklyGoal || 40;
                this.userName = parsed.userName || 'Alex Johnson';
            } else {
                this.projects = [
                    { id: this.generateId(), name: 'Brand Identity Design', color: 'blue', icon: 'palette', createdAt: new Date().toISOString() },
                    { id: this.generateId(), name: 'Frontend Development', color: 'amber', icon: 'code', createdAt: new Date().toISOString() },
                    { id: this.generateId(), name: 'Documentation', color: 'purple', icon: 'description', createdAt: new Date().toISOString() }
                ];
                this.saveData();
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    saveData() {
        try {
            const data = { sessions: this.sessions, projects: this.projects, activeSession: this.activeSession, weeklyGoal: this.weeklyGoal, userName: this.userName, lastSaved: new Date().toISOString() };
            localStorage.setItem('workTrackerData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => this.updateTimerDisplay(), 1000);
        this.updateTimerDisplay();
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const display = document.getElementById('timerDisplay');
        if (!display) return;
        if (!this.activeSession) {
            display.textContent = '00:00:00';
            return;
        }
        const diff = Math.floor((new Date() - new Date(this.activeSession.startTime)) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        display.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    punchIn() {
        if (this.activeSession) {
            this.showToast('Already tracking! Punch out first.', 'warning');
            return;
        }
        const project = this.projects[0] || { name: 'General Work', icon: 'work', color: 'blue', id: this.generateId() };
        this.activeSession = { id: this.generateId(), projectId: project.id, projectName: project.name, projectIcon: project.icon, projectColor: project.color, startTime: new Date().toISOString(), notes: '' };
        this.saveData();
        this.startTimer();
        this.updatePunchButton();
        this.showToast('Timer started! 🚀', 'success');
    }

    punchOut() {
        if (!this.activeSession) {
            this.showToast('No active session to stop', 'warning');
            return;
        }
        const durationMinutes = Math.floor((new Date() - new Date(this.activeSession.startTime)) / 1000 / 60);
        if (durationMinutes < 1) {
            this.showToast('Session too short (< 1 minute)', 'warning');
            this.activeSession = null;
            this.stopTimer();
            this.saveData();
            this.updatePunchButton();
            return;
        }
        const completedSession = { ...this.activeSession, endTime: new Date().toISOString(), durationMinutes, status: 'completed' };
        this.sessions.unshift(completedSession);
        this.activeSession = null;
        this.stopTimer();
        this.saveData();
        this.showPage('dashboard');
        this.showToast(`Session completed! ${this.formatDuration(durationMinutes)} tracked ✅`, 'success');
    }

    getTodayTotal() {
        const today = new Date().toISOString().split('T')[0];
        let total = 0;
        this.sessions.forEach(s => {
            if (new Date(s.startTime).toISOString().split('T')[0] === today && s.status === 'completed') total += s.durationMinutes;
        });
        if (this.activeSession && new Date(this.activeSession.startTime).toISOString().split('T')[0] === today) {
            total += Math.floor((new Date() - new Date(this.activeSession.startTime)) / 1000 / 60);
        }
        return total;
    }

    getWeeklyTotal() {
        const weekStart = this.getWeekStart();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        let total = 0;
        this.sessions.forEach(s => {
            const d = new Date(s.startTime);
            if (d >= weekStart && d < weekEnd && s.status === 'completed') total += s.durationMinutes;
        });
        if (this.activeSession) {
            const d = new Date(this.activeSession.startTime);
            if (d >= weekStart && d < weekEnd) total += Math.floor((new Date() - d) / 1000 / 60);
        }
        return total;
    }

    getStreak() {
        if (this.sessions.length === 0) return 0;
        const dates = new Set();
        this.sessions.forEach(s => {
            if (s.status === 'completed') dates.add(new Date(s.startTime).toISOString().split('T')[0]);
        });
        const sorted = Array.from(dates).sort().reverse();
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let check = new Date(today);
        const todayStr = check.toISOString().split('T')[0];
        if (!sorted.includes(todayStr)) check.setDate(check.getDate() - 1);
        while (true) {
            const dateStr = check.toISOString().split('T')[0];
            if (sorted.includes(dateStr)) {
                streak++;
                check.setDate(check.getDate() - 1);
            } else break;
        }
        return streak;
    }

    getWeekStart() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now);
        monday.setDate(diff);
        monday.setHours(0, 0, 0, 0);
        return monday;
    }

    formatDuration(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    }

    updatePunchButton() {
        const icon = document.getElementById('punchIcon');
        const text = document.getElementById('punchText');
        const proj = document.getElementById('currentProject');
        if (!icon || !text || !proj) return;
        if (this.activeSession) {
            icon.textContent = 'pause';
            text.textContent = 'Punch Out';
            proj.innerHTML = `Currently working on<br><span class="text-primary font-bold tracking-wide text-lg">${this.activeSession.projectName}</span>`;
        } else {
            icon.textContent = 'play_arrow';
            text.textContent = 'Punch In';
            proj.textContent = 'Ready to start tracking';
        }
    }

    updateStats() {
        const todayEl = document.getElementById('todayTotal');
        const weekEl = document.getElementById('weeklyProgress');
        const pctEl = document.getElementById('weeklyPercentage');
        const barEl = document.getElementById('weeklyProgressBar');
        const streakEl = document.getElementById('streakDays');
        if (todayEl) todayEl.textContent = this.formatDuration(this.getTodayTotal());
        const weeklyMinutes = this.getWeeklyTotal();
        const weeklyHours = Math.floor(weeklyMinutes / 60);
        const pct = Math.min(100, Math.round((weeklyHours / this.weeklyGoal) * 100));
        if (weekEl) weekEl.innerHTML = `${weeklyHours}h <span class="text-slate-400 font-normal text-sm">/ ${this.weeklyGoal}h</span>`;
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (barEl) barEl.style.width = `${pct}%`;
        const streak = this.getStreak();
        if (streakEl) streakEl.textContent = `${streak} ${streak === 1 ? 'Day' : 'Days'}`;
    }

    updateRecentSessions() {
        const container = document.getElementById('recentSessions');
        if (!container) return;
        const recent = this.sessions.filter(s => s.status === 'completed').slice(0, 10);
        if (recent.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-slate-400"><span class="material-symbols-outlined text-4xl mb-2 block">schedule</span><p class="text-sm">No sessions yet. Start tracking!</p></div>';
            return;
        }
        container.innerHTML = recent.map(s => this.renderSessionCard(s)).join('');
    }

    renderSessionCard(session) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const isToday = start.toDateString() === new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = start.toDateString() === yesterday.toDateString();
        let dateStr;
        if (isToday) {
            dateStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' - ' + end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (isYesterday) {
            dateStr = 'Yesterday, ' + start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else {
            dateStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        const colorMap = { blue: 'bg-primary/10 text-primary', amber: 'bg-amber-500/10 text-amber-500', purple: 'bg-purple-500/10 text-purple-500', green: 'bg-emerald-500/10 text-emerald-500', red: 'bg-red-500/10 text-red-500' };
        const colorClass = colorMap[session.projectColor] || 'bg-primary/10 text-primary';
        return `<div class="flex items-center gap-4 bg-white dark:bg-[#1c2630] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-primary transition-colors cursor-pointer fade-in" onclick="app.showSessionDetails('${session.id}')"><div class="size-10 flex items-center justify-center rounded-lg ${colorClass}"><span class="material-symbols-outlined">${session.projectIcon || 'work'}</span></div><div class="flex-1"><h4 class="text-sm font-bold">${session.projectName}</h4><p class="text-xs text-slate-500 dark:text-slate-400">${dateStr}</p></div><div class="text-right"><p class="text-sm font-bold">${this.formatDuration(session.durationMinutes)}</p><p class="text-[10px] text-emerald-500 font-bold uppercase">Completed</p></div></div>`;
    }

    updateUserInfo() {
        const nameEl = document.getElementById('userName');
        const avatarEl = document.getElementById('userAvatar');
        if (nameEl) nameEl.textContent = this.userName;
        if (avatarEl) avatarEl.textContent = this.userName.split(' ').map(n => n[0]).join('');
    }

    setupEventListeners() {
        setInterval(() => {
            if (this.activeSession) this.updateStats();
        }, 60000);
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && e.ctrlKey) {
                e.preventDefault();
                if (this.activeSession) this.punchOut();
                else this.punchIn();
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<div class="flex items-center gap-2"><span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'}</span><span>${message}</span></div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    showModal(title, content, actions = []) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `<div class="modal-content"><h3 class="text-xl font-bold mb-4">${title}</h3><div class="mb-6">${content}</div><div class="flex gap-3 justify-end">${actions.map(a => `<button onclick="${a.onClick}" class="px-4 py-2 rounded-lg ${a.primary ? 'bg-primary text-white' : 'bg-slate-700 text-white'} hover:opacity-80 transition-opacity">${a.label}</button>`).join('')}</div></div>`;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        document.body.appendChild(modal);
        return modal;
    }

    showPage(page) {
        this.currentPage = page;
        document.querySelectorAll('nav button').forEach(btn => {
            btn.classList.remove('text-primary');
            btn.classList.add('text-slate-400');
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) icon.style.fontVariationSettings = "'FILL' 0";
        });
        const activeBtn = document.getElementById(`nav${page.charAt(0).toUpperCase() + page.slice(1)}`);
        if (activeBtn) {
            activeBtn.classList.remove('text-slate-400');
            activeBtn.classList.add('text-primary');
            const icon = activeBtn.querySelector('.material-symbols-outlined');
            if (icon) icon.style.fontVariationSettings = "'FILL' 1";
        }
        switch (page) {
            case 'dashboard': this.renderDashboard(); break;
            case 'reports': this.renderReports(); break;
            case 'projects': this.renderProjects(); break;
            default: this.renderDashboard();
        }
    }

    renderDashboard() {
        const main = document.getElementById('mainContent');
        main.innerHTML = `<div class="flex flex-col items-center py-8"><h2 id="timerDisplay" class="text-5xl font-extrabold tracking-tight mb-8 tabular-nums">00:00:00</h2><div class="relative group"><div class="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-active:blur-3xl transition-all"></div><button id="punchButton" class="relative size-44 rounded-full bg-primary flex flex-col items-center justify-center text-white glow-blue active:scale-95 hover:scale-105 transition-all duration-200 border-8 border-primary/30"><span id="punchIcon" class="material-symbols-outlined text-4xl mb-1" style="font-variation-settings: 'FILL' 1">play_arrow</span><span id="punchText" class="text-sm font-bold uppercase tracking-widest">Punch In</span></button></div><p id="currentProject" class="mt-6 text-slate-500 dark:text-slate-400 text-sm font-medium text-center">Ready to start tracking</p></div><div class="grid grid-cols-2 gap-4 mb-8"><div class="bg-white dark:bg-[#1c2630] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-md transition-shadow cursor-pointer" onclick="app.showTodayDetails()"><div class="flex items-center gap-2 mb-2 text-primary"><span class="material-symbols-outlined text-lg">schedule</span><p class="text-xs font-bold uppercase">Today's Total</p></div><p id="todayTotal" class="text-2xl font-bold">0h 0m</p></div><div class="bg-white dark:bg-[#1c2630] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-md transition-shadow cursor-pointer" onclick="app.showStreakDetails()"><div class="flex items-center gap-2 mb-2 text-emerald-500"><span class="material-symbols-outlined text-lg">local_fire_department</span><p class="text-xs font-bold uppercase">Active Streak</p></div><p id="streakDays" class="text-2xl font-bold">0 Days</p></div></div><div class="bg-white dark:bg-[#1c2630] p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/50 mb-8 hover:shadow-md transition-shadow cursor-pointer" onclick="app.editWeeklyGoal()"><div class="flex justify-between items-end mb-4"><div><h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Weekly Goal</h3><p id="weeklyProgress" class="text-xl font-bold">0h <span class="text-slate-400 font-normal text-sm">/ 40h</span></p></div><div class="text-right"><span id="weeklyPercentage" class="text-primary font-bold text-sm">0%</span></div></div><div class="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div id="weeklyProgressBar" class="h-full bg-primary rounded-full transition-all duration-500" style="width: 0%"></div></div></div><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-bold">Recent Sessions</h3></div><div id="recentSessions" class="space-y-3"></div><div class="mt-8 grid grid-cols-2 gap-3"><button onclick="app.exportData()" class="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-[#1c2630] rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-primary transition-colors"><span class="material-symbols-outlined text-primary">download</span><span class="text-sm font-bold">Export Data</span></button><button onclick="app.clearData()" class="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-[#1c2630] rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-red-500 transition-colors"><span class="material-symbols-outlined text-red-500">delete</span><span class="text-sm font-bold">Clear Data</span></button></div>`;
        document.getElementById('punchButton').addEventListener('click', () => {
            if (this.activeSession) this.punchOut();
            else this.punchIn();
        });
        this.updatePunchButton();
        this.updateStats();
        this.updateRecentSessions();
        this.updateUserInfo();
    }

    renderReports() {
        const total = this.sessions.filter(s => s.status === 'completed').length;
        const totalMin = this.sessions.reduce((sum, s) => s.status === 'completed' ? sum + s.durationMinutes : sum, 0);
        const avg = total > 0 ? Math.round(totalMin / total) : 0;
        const projectStats = {};
        this.sessions.forEach(s => {
            if (s.status === 'completed') {
                if (!projectStats[s.projectName]) projectStats[s.projectName] = { minutes: 0, count: 0, color: s.projectColor };
                projectStats[s.projectName].minutes += s.durationMinutes;
                projectStats[s.projectName].count++;
            }
        });
        const main = document.getElementById('mainContent');
        main.innerHTML = `<div class="mb-6"><h2 class="text-2xl font-bold mb-2">Reports & Analytics</h2><p class="text-slate-500 dark:text-slate-400">Your productivity insights</p></div><div class="grid grid-cols-3 gap-4 mb-8"><div class="bg-white dark:bg-[#1c2630] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50"><p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Time</p><p class="text-2xl font-bold text-primary">${this.formatDuration(totalMin)}</p></div><div class="bg-white dark:bg-[#1c2630] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50"><p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Sessions</p><p class="text-2xl font-bold text-primary">${total}</p></div><div class="bg-white dark:bg-[#1c2630] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50"><p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg Session</p><p class="text-2xl font-bold text-primary">${this.formatDuration(avg)}</p></div></div><div class="bg-white dark:bg-[#1c2630] p-5 rounded-xl border border-slate-100 dark:border-slate-800/50 mb-8"><h3 class="text-lg font-bold mb-4">Time by Project</h3><div class="space-y-3">${Object.keys(projectStats).map(name => {
            const stat = projectStats[name];
            const pct = Math.round((stat.minutes / totalMin) * 100);
            return `<div><div class="flex justify-between mb-2"><span class="text-sm font-bold">${name}</span><span class="text-sm text-slate-500">${this.formatDuration(stat.minutes)} (${pct}%)</span></div><div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full" style="width: ${pct}%"></div></div></div>`;
        }).join('') || '<p class="text-center text-slate-400 py-4">No data yet</p>'}</div></div><div class="bg-white dark:bg-[#1c2630] p-5 rounded-xl border border-slate-100 dark:border-slate-800/50"><h3 class="text-lg font-bold mb-4">Last 7 Days</h3><div id="weekChart" class="h-48 flex items-end justify-between gap-2"></div></div>`;
        this.renderWeekChart();
    }

    renderWeekChart() {
        const container = document.getElementById('weekChart');
        if (!container) return;
        const last7 = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            last7.push(d);
        }
        const dayData = last7.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const dayMin = this.sessions.reduce((sum, s) => {
                if (s.status === 'completed' && new Date(s.startTime).toISOString().split('T')[0] === dateStr) return sum + s.durationMinutes;
                return sum;
            }, 0);
            return { date, minutes: dayMin };
        });
        const maxMin = Math.max(...dayData.map(d => d.minutes), 1);
        container.innerHTML = dayData.map(d => {
            const height = (d.minutes / maxMin) * 100;
            const dayName = d.date.toLocaleDateString('en-US', { weekday: 'short' });
            return `<div class="flex-1 flex flex-col items-center gap-2"><div class="w-full bg-primary rounded-t-lg transition-all" style="height: ${height}%"></div><span class="text-xs text-slate-500">${dayName}</span></div>`;
        }).join('');
    }

    renderProjects() {
        const main = document.getElementById('mainContent');
        main.innerHTML = `<div class="mb-6 flex items-center justify-between"><div><h2 class="text-2xl font-bold mb-2">Projects</h2><p class="text-slate-500 dark:text-slate-400">${this.projects.length} projects</p></div><button onclick="app.addProject()" class="px-4 py-2 bg-primary text-white rounded-xl hover:opacity-80 transition-opacity flex items-center gap-2"><span class="material-symbols-outlined">add</span><span class="font-bold">New Project</span></button></div><div class="grid gap-4">${this.projects.map(p => this.renderProjectCard(p)).join('')}</div>`;
    }

    renderProjectCard(project) {
        const pSessions = this.sessions.filter(s => s.projectId === project.id && s.status === 'completed');
        const totalMin = pSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
        const colorMap = { blue: 'bg-primary/10 text-primary border-primary/20', amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20', purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20', green: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', red: 'bg-red-500/10 text-red-500 border-red-500/20' };
        const colorClass = colorMap[project.color] || colorMap['blue'];
        return `<div class="bg-white dark:bg-[#1c2630] p-5 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-primary transition-colors"><div class="flex items-start gap-4"><div class="size-12 flex items-center justify-center rounded-xl ${colorClass} border"><span class="material-symbols-outlined text-2xl">${project.icon}</span></div><div class="flex-1"><h3 class="text-lg font-bold mb-1">${project.name}</h3><p class="text-sm text-slate-500 dark:text-slate-400 mb-3">${pSessions.length} sessions · ${this.formatDuration(totalMin)}</p><div class="flex gap-2"><button onclick="app.editProject('${project.id}')" class="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Edit</button><button onclick="app.deleteProject('${project.id}')" class="text-xs px-3 py-1 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">Delete</button></div></div></div></div>`;
    }

    showSettings() {
        this.showModal('Settings', `<div class="space-y-4"><div><label class="block text-sm font-bold mb-2">Your Name</label><input type="text" id="settingsName" value="${this.userName}" class="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-primary outline-none"></div><div><label class="block text-sm font-bold mb-2">Weekly Goal (hours)</label><input type="number" id="settingsGoal" value="${this.weeklyGoal}" min="1" max="168" class="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-primary outline-none"></div></div>`, [
            { label: 'Cancel', onClick: 'this.closest(\'.modal-overlay\').remove()' },
            { label: 'Save', primary: true, onClick: 'app.saveSettings(); this.closest(\'.modal-overlay\').remove()' }
        ]);
    }

    saveSettings() {
        const name = document.getElementById('settingsName')?.value;
        const goal = parseInt(document.getElementById('settingsGoal')?.value);
        if (name) this.userName = name;
        if (goal && goal > 0) this.weeklyGoal = goal;
        this.saveData();
        this.showPage(this.currentPage);
        this.showToast('Settings saved!', 'success');
    }

    editWeeklyGoal() {
        this.showSettings();
    }

    addProject() {
        this.showModal('Add Project', `<div class="space-y-4"><div><label class="block text-sm font-bold mb-2">Project Name</label><input type="text" id="projectName" placeholder="My Project" class="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-primary outline-none"></div><div><label class="block text-sm font-bold mb-2">Icon</label><select id="projectIcon" class="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-primary outline-none"><option value="work">Work</option><option value="code">Code</option><option value="palette">Design</option><option value="description">Documentation</option><option value="school">Learning</option><option value="fitness_center">Exercise</option></select></div><div><label class="block text-sm font-bold mb-2">Color</label><select id="projectColor" class="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-primary outline-none"><option value="blue">Blue</option><option value="amber">Amber</option><option value="purple">Purple</option><option value="green">Green</option><option value="red">Red</option></select></div></div>`, [
            { label: 'Cancel', onClick: 'this.closest(\'.modal-overlay\').remove()' },
            { label: 'Add Project', primary: true, onClick: 'app.saveNewProject(); this.closest(\'.modal-overlay\').remove()' }
        ]);
    }

    saveNewProject() {
        const name = document.getElementById('projectName')?.value;
        const icon = document.getElementById('projectIcon')?.value;
        const color = document.getElementById('projectColor')?.value;
        if (!name) {
            this.showToast('Please enter a project name', 'warning');
            return;
        }
        this.projects.push({ id: this.generateId(), name, icon, color, createdAt: new Date().toISOString() });
        this.saveData();
        this.showPage('projects');
        this.showToast('Project added!', 'success');
    }

    editProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        this.showModal('Edit Project', `<div class="space-y-4"><div><label class="block text-sm font-bold mb-2">Project Name</label><input type="text" id="editProjectName" value="${project.name}" class="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-primary outline-none"></div><div><label class="block text-sm font-bold mb-2">Icon</label><select id="editProjectIcon" class="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-primary outline-none"><option value="work" ${project.icon === 'work' ? 'selected' : ''}>Work</option><option value="code" ${project.icon === 'code' ? 'selected' : ''}>Code</option><option value="palette" ${project.icon === 'palette' ? 'selected' : ''}>Design</option><option value="description" ${project.icon === 'description' ? 'selected' : ''}>Documentation</option><option value="school" ${project.icon === 'school' ? 'selected' : ''}>Learning</option><option value="fitness_center" ${project.icon === 'fitness_center' ? 'selected' : ''}>Exercise</option></select></div><div><label class="block text-sm font-bold mb-2">Color</label><select id="editProjectColor" class="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-primary outline-none"><option value="blue" ${project.color === 'blue' ? 'selected' : ''}>Blue</option><option value="amber" ${project.color === 'amber' ? 'selected' : ''}>Amber</option><option value="purple" ${project.color === 'purple' ? 'selected' : ''}>Purple</option><option value="green" ${project.color === 'green' ? 'selected' : ''}>Green</option><option value="red" ${project.color === 'red' ? 'selected' : ''}>Red</option></select></div></div>`, [
            { label: 'Cancel', onClick: 'this.closest(\'.modal-overlay\').remove()' },
            { label: 'Save Changes', primary: true, onClick: `app.saveEditedProject('${projectId}'); this.closest('.modal-overlay').remove()` }
        ]);
    }

    saveEditedProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        const name = document.getElementById('editProjectName')?.value;
        const icon = document.getElementById('editProjectIcon')?.value;
        const color = document.getElementById('editProjectColor')?.value;
        if (name) {
            project.name = name;
            project.icon = icon;
            project.color = color;
            this.saveData();
            this.showPage('projects');
            this.showToast('Project updated!', 'success');
        }
    }

    deleteProject(projectId) {
        if (confirm('Delete this project? Sessions will not be deleted.')) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveData();
            this.showPage('projects');
            this.showToast('Project deleted', 'success');
        }
    }

    showSessionDetails(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        this.showModal('Session Details', `<div class="space-y-3"><div class="flex items-center gap-3"><span class="material-symbols-outlined text-primary text-3xl">${session.projectIcon}</span><div><h4 class="font-bold">${session.projectName}</h4><p class="text-sm text-slate-400">${start.toLocaleDateString()}</p></div></div><div class="grid grid-cols-2 gap-4 pt-4"><div><p class="text-xs text-slate-400">Start Time</p><p class="font-bold">${start.toLocaleTimeString()}</p></div><div><p class="text-xs text-slate-400">End Time</p><p class="font-bold">${end.toLocaleTimeString()}</p></div><div class="col-span-2"><p class="text-xs text-slate-400">Duration</p><p class="font-bold text-2xl text-primary">${this.formatDuration(session.durationMinutes)}</p></div></div></div>`, [
            { label: 'Close', primary: true, onClick: 'this.closest(\'.modal-overlay\').remove()' }
        ]);
    }

    showTodayDetails() {
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = this.sessions.filter(s => new Date(s.startTime).toISOString().split('T')[0] === today && s.status === 'completed');
        const total = this.getTodayTotal();
        this.showModal('Today\'s Summary', `<div class="space-y-4"><div class="text-center"><p class="text-4xl font-bold text-primary">${this.formatDuration(total)}</p><p class="text-sm text-slate-400">Total time tracked today</p></div><div><p class="text-sm font-bold mb-2">${todaySessions.length} Sessions</p><div class="space-y-2 max-h-60 overflow-y-auto">${todaySessions.map(s => `<div class="flex justify-between items-center p-2 bg-slate-700 rounded-lg"><span class="text-sm">${s.projectName}</span><span class="text-sm font-bold">${this.formatDuration(s.durationMinutes)}</span></div>`).join('') || '<p class="text-center text-slate-400 py-4">No completed sessions yet</p>'}</div></div></div>`, [
            { label: 'Close', primary: true, onClick: 'this.closest(\'.modal-overlay\').remove()' }
        ]);
    }

    showStreakDetails() {
        const streak = this.getStreak();
        this.showModal('Work Streak', `<div class="text-center space-y-4"><div class="text-6xl">🔥</div><div><p class="text-4xl font-bold text-primary">${streak}</p><p class="text-lg text-slate-400">${streak === 1 ? 'Day' : 'Days'} Streak</p></div><p class="text-sm text-slate-400">${streak > 0 ? `Keep it up! You've worked ${streak} consecutive ${streak === 1 ? 'day' : 'days'}.` : 'Start tracking to build your streak!'}</p></div>`, [
            { label: 'Close', primary: true, onClick: 'this.closest(\'.modal-overlay\').remove()' }
        ]);
    }

    exportData() {
        const data = { sessions: this.sessions, projects: this.projects, userName: this.userName, weeklyGoal: this.weeklyGoal, exportDate: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `work-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Data exported successfully!', 'success');
    }

    clearData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
            localStorage.removeItem('workTrackerData');
            location.reload();
        }
    }

    toggleTheme() {
        document.documentElement.classList.toggle('dark');
        const icon = document.querySelector('#themeToggle .material-symbols-outlined');
        icon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
        this.showToast('Theme toggled!', 'info');
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js').then(reg => console.log('Service Worker registered')).catch(err => console.log('Service Worker registration failed'));
        }
    }
}

let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new WorkTrackerApp();
    });
} else {
    app = new WorkTrackerApp();
}
