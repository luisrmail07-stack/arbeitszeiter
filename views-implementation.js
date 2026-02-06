// Add this to your existing index.html - Replace the showPage, showAllSessions functions and add new view rendering

// In the WorkTrackerApp class, add these methods:

showPage(page) {
    this.currentPage = page;
    const mainContent = document.getElementById('mainContent');

    // Update navigation active states
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('text-primary');
        btn.classList.add('text-slate-400');
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) icon.style.fontVariationSettings = "'FILL' 0";
    });

    const activeBtn = document.querySelector(`nav button[onclick*="${page}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-400');
        activeBtn.classList.add('text-primary');
        const icon = activeBtn.querySelector('.material-symbols-outlined');
        if (icon) icon.style.fontVariationSettings = "'FILL' 1";
    }

    // Render appropriate view
    switch (page) {
        case 'dashboard':
            this.renderDashboard();
            break;
        case 'reports':
            this.renderReports();
            break;
        case 'projects':
            this.renderProjects();
            break;
        case 'sessions':
            this.renderAllSessions();
            break;
        default:
            this.renderDashboard();
    }
}

renderDashboard() {
    // Keep existing dashboard HTML
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="flex flex-col items-center py-8">
            <h2 id="timerDisplay" class="text-5xl font-extrabold tracking-tight mb-8 tabular-nums">00:00:00</h2>
            <div class="relative group">
                <div class="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-active:blur-3xl transition-all"></div>
                <button id="punchButton" class="relative size-44 rounded-full bg-primary flex flex-col items-center justify-center text-white glow-blue active:scale-95 hover:scale-105 transition-all duration-200 border-8 border-primary/30">
                    <span id="punchIcon" class="material-symbols-outlined text-4xl mb-1" style="font-variation-settings: 'FILL' 1">play_arrow</span>
                    <span id="punchText" class="text-sm font-bold uppercase tracking-widest">Punch In</span>
                </button>
            </div>
            <p id="currentProject" class="mt-6 text-slate-500 dark:text-slate-400 text-sm font-medium text-center">Ready to start tracking</p>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-8">
            <div class="bg-white dark:bg-[#1c2630] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-md transition-shadow cursor-pointer" onclick="app.showTodayDetails()">
                <div class="flex items-center gap-2 mb-2 text-primary">
                    <span class="material-symbols-outlined text-lg">schedule</span>
                    <p class="text-xs font-bold uppercase">Today's Total</p>
                </div>
                <p id="todayTotal" class="text-2xl font-bold">0h 0m</p>
            </div>
            <div class="bg-white dark:bg-[#1c2630] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-md transition-shadow cursor-pointer" onclick="app.showStreakDetails()">
                <div class="flex items-center gap-2 mb-2 text-emerald-500">
                    <span class="material-symbols-outlined text-lg">local_fire_department</span>
                    <p class="text-xs font-bold uppercase">Active Streak</p>
                </div>
                <p id="streakDays" class="text-2xl font-bold">0 Days</p>
            </div>
        </div>
        <div class="bg-white dark:bg-[#1c2630] p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/50 mb-8 hover:shadow-md transition-shadow cursor-pointer" onclick="app.editWeeklyGoal()">
            <div class="flex justify-between items-end mb-4">
                <div>
                    <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Weekly Goal</h3>
                    <p id="weeklyProgress" class="text-xl font-bold">0h <span class="text-slate-400 font-normal text-sm">/ 40h</span></p>
                </div>
                <div class="text-right">
                    <span id="weeklyPercentage" class="text-primary font-bold text-sm">0%</span>
                </div>
            </div>
            <div class="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div id="weeklyProgressBar" class="h-full bg-primary rounded-full transition-all duration-500" style="width: 0%"></div>
            </div>
        </div>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold">Recent Sessions</h3>
            <button class="text-primary text-sm font-bold hover:underline" onclick="app.showPage('sessions')">View All</button>
        </div>
        <div id="recentSessions" class="space-y-3"></div>
        <div class="mt-8 grid grid-cols-2 gap-3">
            <button onclick="app.exportData()" class="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-[#1c2630] rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-primary transition-colors">
                <span class="material-symbols-outlined text-primary">download</span>
                <span class="text-sm font-bold">Export Data</span>
            </button>
            <button onclick="app.clearData()" class="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-[#1c2630] rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-red-500 transition-colors">
                <span class="material-symbols-outlined text-red-500">delete</span>
                <span class="text-sm font-bold">Clear Data</span>
            </button>
        </div>
    `;

    // Re-attach event listeners
    document.getElementById('punchButton').addEventListener('click', () => {
        if (this.activeSession) {
            this.punchOut();
        } else {
            this.punchIn();
        }
    });

    this.updateUI();
}

renderAllSessions() {
    const mainContent = document.getElementById('mainContent');
    const allSessions = this.sessions.filter(s => s.status === 'completed');

    mainContent.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold mb-2">All Sessions</h2>
            <p class="text-slate-500 dark:text-slate-400">${allSessions.length} total sessions</p>
        </div>
        
        <div class="mb-6">
            <input type="text" id="sessionSearch" placeholder="Search sessions..." 
                class="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1c2630] border border-slate-100 dark:border-slate-800/50 focus:border-primary outline-none"
                oninput="app.filterSessions(this.value)">
        </div>
        
        <div id="allSessionsList" class="space-y-3"></div>
    `;

    this.renderSessionsList(allSessions);
}

filterSessions(query) {
    const allSessions = this.sessions.filter(s => s.status === 'completed');
    const filtered = allSessions.filter(s =>
        s.projectName.toLowerCase().includes(query.toLowerCase())
    );
    this.renderSessionsList(filtered);
}

renderSessionsList(sessions) {
    const container = document.getElementById('allSessionsList');

    if (sessions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-slate-400">
                <span class="material-symbols-outlined text-5xl mb-3 block">search_off</span>
                <p>No sessions found</p>
            </div>
        `;
        return;
    }

    // Group by date
    const grouped = {};
    sessions.forEach(session => {
        const date = new Date(session.startTime).toLocaleDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(session);
    });

    container.innerHTML = Object.keys(grouped).map(date => `
        <div class="mb-6">
            <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">${date}</h3>
            <div class="space-y-2">
                ${grouped[date].map(session => this.renderSessionCard(session)).join('')}
            </div>
        </div>
    `).join('');
}

renderSessionCard(session) {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const timeStr = `${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const colorMap = {
        'blue': 'bg-primary/10 text-primary',
        'amber': 'bg-amber-500/10 text-amber-500',
        'purple': 'bg-purple-500/10 text-purple-500',
        'green': 'bg-emerald-500/10 text-emerald-500',
        'red': 'bg-red-500/10 text-red-500'
    };
    const colorClass = colorMap[session.projectColor] || 'bg-primary/10 text-primary';

    return `
        <div class="flex items-center gap-4 bg-white dark:bg-[#1c2630] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-primary transition-colors cursor-pointer" onclick="app.showSessionDetails('${session.id}')">
            <div class="size-10 flex items-center justify-center rounded-lg ${colorClass}">
                <span class="material-symbols-outlined">${session.projectIcon || 'work'}</span>
            </div>
            <div class="flex-1">
                <h4 class="text-sm font-bold">${session.projectName}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400">${timeStr}</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-bold">${this.formatDuration(session.durationMinutes)}</p>
            </div>
        </div>
    `;
}

renderReports() {
    const mainContent = document.getElementById('mainContent');

    // Calculate statistics
    const totalSessions = this.sessions.filter(s => s.status === 'completed').length;
    const totalMinutes = this.sessions.reduce((sum, s) => s.status === 'completed' ? sum + s.durationMinutes : sum, 0);
    const avgSessionMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // Project breakdown
    const projectStats = {};
    this.sessions.forEach(s => {
        if (s.status === 'completed') {
            if (!projectStats[s.projectName]) {
                projectStats[s.projectName] = { minutes: 0, count: 0, color: s.projectColor };
            }
            projectStats[s.projectName].minutes += s.durationMinutes;
            projectStats[s.projectName].count++;
        }
    });

    mainContent.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold mb-2">Reports & Analytics</h2>
            <p class="text-slate-500 dark:text-slate-400">Your productivity insights</p>
        </div>
        
        <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="bg-white dark:bg-[#1c2630] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Time</p>
                <p class="text-2xl font-bold text-primary">${this.formatDuration(totalMinutes)}</p>
            </div>
            <div class="bg-white dark:bg-[#1c2630] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Sessions</p>
                <p class="text-2xl font-bold text-primary">${totalSessions}</p>
            </div>
            <div class="bg-white dark:bg-[#1c2630] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg Session</p>
                <p class="text-2xl font-bold text-primary">${this.formatDuration(avgSessionMinutes)}</p>
            </div>
        </div>
        
        <div class="bg-white dark:bg-[#1c2630] p-5 rounded-xl border border-slate-100 dark:border-slate-800/50 mb-8">
            <h3 class="text-lg font-bold mb-4">Time by Project</h3>
            <div class="space-y-3">
                ${Object.keys(projectStats).map(name => {
        const stat = projectStats[name];
        const percentage = Math.round((stat.minutes / totalMinutes) * 100);
        return `
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class="text-sm font-bold">${name}</span>
                                <span class="text-sm text-slate-500">${this.formatDuration(stat.minutes)} (${percentage}%)</span>
                            </div>
                            <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full bg-primary rounded-full" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    `;
    }).join('') || '<p class="text-center text-slate-400 py-4">No data yet</p>'}
            </div>
        </div>
        
        <div class="bg-white dark:bg-[#1c2630] p-5 rounded-xl border border-slate-100 dark:border-slate-800/50">
            <h3 class="text-lg font-bold mb-4">Last 7 Days</h3>
            <div id="weekChart" class="h-48 flex items-end justify-between gap-2"></div>
        </div>
    `;

    this.renderWeekChart();
}

renderWeekChart() {
    const container = document.getElementById('weekChart');
    if (!container) return;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        last7Days.push(date);
    }

    const dayData = last7Days.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dayMinutes = this.sessions.reduce((sum, s) => {
            if (s.status === 'completed') {
                const sessionDate = new Date(s.startTime).toISOString().split('T')[0];
                if (sessionDate === dateStr) return sum + s.durationMinutes;
            }
            return sum;
        }, 0);
        return { date, minutes: dayMinutes };
    });

    const maxMinutes = Math.max(...dayData.map(d => d.minutes), 1);

    container.innerHTML = dayData.map(d => {
        const height = (d.minutes / maxMinutes) * 100;
        const dayName = d.date.toLocaleDateString('en-US', { weekday: 'short' });
        return `
            <div class="flex-1 flex flex-col items-center gap-2">
                <div class="w-full bg-primary rounded-t-lg transition-all" style="height: ${height}%"></div>
                <span class="text-xs text-slate-500">${dayName}</span>
            </div>
        `;
    }).join('');
}

renderProjects() {
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold mb-2">Projects</h2>
                <p class="text-slate-500 dark:text-slate-400">${this.projects.length} projects</p>
            </div>
            <button onclick="app.addProject()" class="px-4 py-2 bg-primary text-white rounded-xl hover:opacity-80 transition-opacity flex items-center gap-2">
                <span class="material-symbols-outlined">add</span>
                <span class="font-bold">New Project</span>
            </button>
        </div>
        
        <div class="grid gap-4">
            ${this.projects.map(project => this.renderProjectCard(project)).join('')}
        </div>
    `;
}

renderProjectCard(project) {
    const projectSessions = this.sessions.filter(s => s.projectId === project.id && s.status === 'completed');
    const totalMinutes = projectSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    const colorMap = {
        'blue': 'bg-primary/10 text-primary border-primary/20',
        'amber': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'purple': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        'green': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'red': 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    const colorClass = colorMap[project.color] || colorMap['blue'];

    return `
        <div class="bg-white dark:bg-[#1c2630] p-5 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-primary transition-colors">
            <div class="flex items-start gap-4">
                <div class="size-12 flex items-center justify-center rounded-xl ${colorClass} border">
                    <span class="material-symbols-outlined text-2xl">${project.icon}</span>
                </div>
                <div class="flex-1">
                    <h3 class="text-lg font-bold mb-1">${project.name}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">${projectSessions.length} sessions · ${this.formatDuration(totalMinutes)}</p>
                    <div class="flex gap-2">
                        <button onclick="app.editProject('${project.id}')" class="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            Edit
                        </button>
                        <button onclick="app.deleteProject('${project.id}')" class="text-xs px-3 py-1 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

editProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    const modal = this.showModal('Edit Project', `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-bold mb-2">Project Name</label>
                <input type="text" id="editProjectName" value="${project.name}" class="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-primary outline-none">
            </div>
            <div>
                <label class="block text-sm font-bold mb-2">Icon</label>
                <select id="editProjectIcon" class="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-primary outline-none">
                    <option value="work" ${project.icon === 'work' ? 'selected' : ''}>Work</option>
                    <option value="code" ${project.icon === 'code' ? 'selected' : ''}>Code</option>
                    <option value="palette" ${project.icon === 'palette' ? 'selected' : ''}>Design</option>
                    <option value="description" ${project.icon === 'description' ? 'selected' : ''}>Documentation</option>
                    <option value="school" ${project.icon === 'school' ? 'selected' : ''}>Learning</option>
                    <option value="fitness_center" ${project.icon === 'fitness_center' ? 'selected' : ''}>Exercise</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-bold mb-2">Color</label>
                <select id="editProjectColor" class="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-primary outline-none">
                    <option value="blue" ${project.color === 'blue' ? 'selected' : ''}>Blue</option>
                    <option value="amber" ${project.color === 'amber' ? 'selected' : ''}>Amber</option>
                    <option value="purple" ${project.color === 'purple' ? 'selected' : ''}>Purple</option>
                    <option value="green" ${project.color === 'green' ? 'selected' : ''}>Green</option>
                    <option value="red" ${project.color === 'red' ? 'selected' : ''}>Red</option>
                </select>
            </div>
        </div>
    `, [
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
