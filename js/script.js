// Global state management
let currentUser = null
let currentTab = "dashboard"
let isDesktop = false
let notifications = []
let employees = []
const schedules = {}
let shiftSwapRequests = []
const selectedDate = new Date()

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized")
  initializeData()
  initializeApp()
  handleResize()
  window.addEventListener("resize", handleResize)
  initializeInteractiveElements()
})

function initializeData() {
  // Initialize fake employee data
  employees = [
    {
      id: "ADM01",
      name: "Budi Santoso",
      gender: "male",
      position: "Kasir Senior",
      department: "Front Store Operations",
      store: "Toko ITC Depok - Depok",
      joinDate: "15 Maret 2020",
      status: "Aktif",
      avatar: "BS",
      contact: {
        phone: "081234567890",
        email: "budi.santoso@lawson.id",
        address: "Jl. Margonda Raya No. 45, Depok",
      },
      performance: {
        rating: 4.8,
        attendance: 98,
        productivity: 95,
      },
      preferences: {
        preferredShifts: ["morning", "evening"],
        unavailableDays: [0], // Sunday
        maxConsecutiveDays: 5,
      },
    },
    {
      id: "ADM02",
      name: "Dida Fatmawati",
      gender: "female",
      position: "Supervisor",
      department: "Store Management",
      store: "Toko ITC Depok - Depok",
      joinDate: "3 Januari 2019",
      status: "Aktif",
      avatar: "DF",
      contact: {
        phone: "081298765432",
        email: "dida.fatmawati@lawson.id",
        address: "Jl. Cinere Raya No. 12, Depok",
      },
      performance: {
        rating: 4.9,
        attendance: 99,
        productivity: 97,
      },
      preferences: {
        preferredShifts: ["evening", "night"],
        unavailableDays: [6], // Saturday
        maxConsecutiveDays: 6,
      },
    },
    {
      id: "ADM03",
      name: "Ahmad Rizki",
      gender: "male",
      position: "Stock Keeper",
      department: "Inventory Management",
      store: "Toko ITC Depok - Depok",
      joinDate: "20 April 2021",
      status: "Aktif",
      avatar: "AR",
      contact: {
        phone: "081387654321",
        email: "ahmad.rizki@lawson.id",
        address: "Jl. Raya Bogor Km. 30, Jakarta Timur",
      },
      performance: {
        rating: 4.5,
        attendance: 95,
        productivity: 92,
      },
      preferences: {
        preferredShifts: ["night", "morning"],
        unavailableDays: [5], // Friday
        maxConsecutiveDays: 4,
      },
    },
    {
      id: "ADM04",
      name: "Siti Nurhaliza",
      gender: "female",
      position: "Kasir",
      department: "Front Store Operations",
      store: "Toko ITC Depok - Depok",
      joinDate: "10 Juni 2022",
      status: "Aktif",
      avatar: "SN",
      contact: {
        phone: "081512345678",
        email: "siti.nurhaliza@lawson.id",
        address: "Jl. Lenteng Agung No. 56, Jakarta Selatan",
      },
      performance: {
        rating: 4.6,
        attendance: 97,
        productivity: 94,
      },
      preferences: {
        preferredShifts: ["morning", "evening"],
        unavailableDays: [0, 6], // Sunday, Saturday
        maxConsecutiveDays: 5,
      },
    },
    {
      id: "ADM05",
      name: "Rudi Hermawan",
      gender: "male",
      position: "Maintenance Staff",
      department: "Facilities Management",
      store: "Toko ITC Depok - Depok",
      joinDate: "5 Februari 2021",
      status: "Aktif",
      avatar: "RH",
      contact: {
        phone: "081623456789",
        email: "rudi.hermawan@lawson.id",
        address: "Jl. Raya Pasar Minggu No. 78, Jakarta Selatan",
      },
      performance: {
        rating: 4.3,
        attendance: 92,
        productivity: 90,
      },
      preferences: {
        preferredShifts: ["morning", "night"],
        unavailableDays: [1], // Monday
        maxConsecutiveDays: 6,
      },
    },
    {
      id: "ADM06",
      name: "Dewi Lestari",
      gender: "female",
      position: "Customer Service",
      department: "Front Store Operations",
      store: "Toko ITC Depok - Depok",
      joinDate: "15 September 2022",
      status: "Aktif",
      avatar: "DL",
      contact: {
        phone: "081734567890",
        email: "dewi.lestari@lawson.id",
        address: "Jl. Merdeka No. 34, Depok",
      },
      performance: {
        rating: 4.7,
        attendance: 96,
        productivity: 93,
      },
      preferences: {
        preferredShifts: ["evening", "morning"],
        unavailableDays: [2], // Tuesday
        maxConsecutiveDays: 5,
      },
    },
  ]

  // Generate fair schedules using improved algorithm
  generateFairSchedules()

  // Initialize notifications with more realistic data
  const today = new Date()
  notifications = [
    {
      id: 1,
      type: "info",
      title: "Jadwal Baru",
      message: "Jadwal bulan depan telah dipublikasikan",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      read: false,
    },
    {
      id: 2,
      type: "success",
      title: "Permintaan Disetujui",
      message: "Permintaan tukar shift dengan Siti Nurhaliza telah disetujui",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
      read: true,
    },
    {
      id: 3,
      type: "warning",
      title: "Pengingat Shift",
      message: "Shift Anda besok dimulai pukul 08:00 WIB",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      read: false,
    },
  ]

  // Initialize shift swap requests with proper data structure
  shiftSwapRequests = []

  // Initialize shift change requests
  window.shiftChangeRequests = []

  // Save initial data to localStorage
  saveDataToStorage()
}

// Fair scheduling algorithm
function generateFairSchedules() {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Shift types with requirements
  const shifts = [
    { type: "morning", label: "08:00-16:00", class: "primary", minStaff: 2, maxStaff: 3 },
    { type: "evening", label: "16:00-24:00", class: "secondary", minStaff: 2, maxStaff: 3 },
    { type: "night", label: "00:00-08:00", class: "night", minStaff: 1, maxStaff: 2 },
    { type: "off", label: "OFF", class: "off", minStaff: 0, maxStaff: 6 },
  ]

  // Initialize schedules
  employees.forEach((employee) => {
    schedules[employee.id] = []
  })

  // Track employee work statistics
  const employeeStats = {}
  employees.forEach((employee) => {
    employeeStats[employee.id] = {
      totalShifts: 0,
      consecutiveDays: 0,
      lastShift: null,
      shiftCounts: { morning: 0, evening: 0, night: 0, off: 0 },
      weeklyHours: 0,
    }
  })

  // Generate schedule day by day
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const dayOfWeek = date.getDay()

    // Determine daily shift requirements
    const dailyRequirements = {
      morning: dayOfWeek === 0 || dayOfWeek === 6 ? 2 : 3, // Weekend: 2, Weekday: 3
      evening: dayOfWeek === 0 || dayOfWeek === 6 ? 2 : 3,
      night: 1,
    }

    // Assign shifts for this day
    const dayAssignments = assignDailyShifts(date, dailyRequirements, employeeStats)

    // Update employee schedules and stats
    dayAssignments.forEach((assignment) => {
      const shift = shifts.find((s) => s.type === assignment.shift)
      schedules[assignment.employeeId].push({
        date: new Date(date),
        shift: assignment.shift,
        label: shift.label,
        class: shift.class,
      })

      // Update stats
      const stats = employeeStats[assignment.employeeId]
      stats.shiftCounts[assignment.shift]++
      if (assignment.shift !== "off") {
        stats.totalShifts++
        stats.consecutiveDays++
        stats.weeklyHours += 8
      } else {
        stats.consecutiveDays = 0
      }
      stats.lastShift = assignment.shift
    })

    // Reset weekly hours every Sunday
    if (dayOfWeek === 0) {
      Object.values(employeeStats).forEach((stats) => {
        stats.weeklyHours = 0
      })
    }
  }
}

function assignDailyShifts(date, requirements, employeeStats) {
  const dayOfWeek = date.getDay()
  const assignments = []
  const availableEmployees = [...employees]

  // Sort employees by priority (least worked, preferences, etc.)
  availableEmployees.sort((a, b) => {
    const statsA = employeeStats[a.id]
    const statsB = employeeStats[b.id]

    // Priority factors
    const workloadA = statsA.totalShifts + statsA.consecutiveDays * 0.5
    const workloadB = statsB.totalShifts + statsB.consecutiveDays * 0.5

    return workloadA - workloadB
  })

  // Assign morning shifts
  const morningStaff = assignShiftType("morning", requirements.morning, availableEmployees, dayOfWeek, employeeStats)
  morningStaff.forEach((emp) => {
    assignments.push({ employeeId: emp.id, shift: "morning" })
    availableEmployees.splice(
      availableEmployees.findIndex((e) => e.id === emp.id),
      1,
    )
  })

  // Assign evening shifts
  const eveningStaff = assignShiftType("evening", requirements.evening, availableEmployees, dayOfWeek, employeeStats)
  eveningStaff.forEach((emp) => {
    assignments.push({ employeeId: emp.id, shift: "evening" })
    availableEmployees.splice(
      availableEmployees.findIndex((e) => e.id === emp.id),
      1,
    )
  })

  // Assign night shifts
  const nightStaff = assignShiftType("night", requirements.night, availableEmployees, dayOfWeek, employeeStats)
  nightStaff.forEach((emp) => {
    assignments.push({ employeeId: emp.id, shift: "night" })
    availableEmployees.splice(
      availableEmployees.findIndex((e) => e.id === emp.id),
      1,
    )
  })

  // Assign remaining employees to off
  availableEmployees.forEach((emp) => {
    assignments.push({ employeeId: emp.id, shift: "off" })
  })

  return assignments
}

function assignShiftType(shiftType, required, availableEmployees, dayOfWeek, employeeStats) {
  const assigned = []
  const candidates = availableEmployees.filter((emp) => {
    const stats = employeeStats[emp.id]
    const prefs = emp.preferences

    // Check availability
    if (prefs.unavailableDays.includes(dayOfWeek)) return false

    // Check consecutive days limit
    if (stats.consecutiveDays >= prefs.maxConsecutiveDays) return false

    // Check weekly hours limit (max 40 hours)
    if (stats.weeklyHours >= 40) return false

    return true
  })

  // Sort candidates by preference and workload
  candidates.sort((a, b) => {
    const statsA = employeeStats[a.id]
    const statsB = employeeStats[b.id]

    const prefA = a.preferences.preferredShifts.includes(shiftType) ? 1 : 0
    const prefB = b.preferences.preferredShifts.includes(shiftType) ? 1 : 0

    if (prefA !== prefB) return prefB - prefA

    return statsA.totalShifts - statsB.totalShifts
  })

  // Assign required number of staff
  for (let i = 0; i < Math.min(required, candidates.length); i++) {
    assigned.push(candidates[i])
  }

  return assigned
}

function initializeApp() {
  // Setup event listeners
  setupEventListeners()

  // Load saved data
  loadDataFromStorage()

  // Check if user is already logged in (from localStorage)
  const savedUser = localStorage.getItem("lawsonUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    showMainApp()
  } else {
    showLoginScreen()
  }
}

function handleResize() {
  const wasDesktop = isDesktop
  isDesktop = window.innerWidth >= 1024

  if (wasDesktop !== isDesktop) {
    updateLayoutForScreenSize()
  }
}

function updateLayoutForScreenSize() {
  const sidebar = document.getElementById("sidebar")
  const desktopTopbar = document.getElementById("desktopTopbar")
  const mobileHeader = document.getElementById("mobileHeader")
  const mainContent = document.getElementById("mainContent")
  const bottomNav = document.getElementById("bottomNav")
  const content = document.getElementById("content")
  const desktopGrid = document.getElementById("desktopGrid")
  const mobileLayout = document.getElementById("mobileLayout")

  if (isDesktop) {
    // Desktop layout
    sidebar.classList.add("desktop-visible")
    desktopTopbar.classList.add("desktop-visible")
    mobileHeader.classList.add("desktop-hidden")
    mainContent.classList.add("with-sidebar")
    bottomNav.style.display = "none"
    content.classList.add("desktop-content")
    if (desktopGrid) desktopGrid.classList.add("desktop-visible")
    if (mobileLayout) mobileLayout.style.display = "none"
  } else {
    // Mobile layout
    sidebar.classList.remove("desktop-visible")
    desktopTopbar.classList.remove("desktop-visible")
    mobileHeader.classList.remove("desktop-hidden")
    mainContent.classList.remove("with-sidebar")
    bottomNav.style.display = "grid"
    content.classList.remove("desktop-content")
    if (desktopGrid) desktopGrid.classList.remove("desktop-visible")
    if (mobileLayout) mobileLayout.style.display = "block"
  }
}

function setupEventListeners() {
  // Login button
  const loginButton = document.getElementById("loginButton")
  if (loginButton) {
    loginButton.addEventListener("click", login)
  }

  // Logout button
  const logoutButton = document.getElementById("logoutButton")
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      if (confirm("Apakah Anda yakin ingin keluar?")) {
        logout()
      }
    })
  }

  // Password input - Enter key
  const passwordInput = document.getElementById("password")
  if (passwordInput) {
    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        login()
      }
    })
  }

  // Bottom navigation (mobile)
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const tab = this.getAttribute("data-tab")
      switchTab(tab)
    })
  })

  // Sidebar navigation (desktop)
  const sidebarNavItems = document.querySelectorAll(".sidebar-nav-item")
  sidebarNavItems.forEach((item) => {
    item.addEventListener("click", function () {
      const tab = this.getAttribute("data-tab")
      if (tab) {
        switchTab(tab)
      }
    })
  })

  // Month navigation in calendar
  const prevMonthBtn = document.getElementById("prevMonth")
  const nextMonthBtn = document.getElementById("nextMonth")
  if (prevMonthBtn) prevMonthBtn.addEventListener("click", () => changeMonth(-1))
  if (nextMonthBtn) nextMonthBtn.addEventListener("click", () => changeMonth(1))

  // Employee filter in schedule
  const employeeFilter = document.getElementById("employeeFilter")
  if (employeeFilter) {
    employeeFilter.addEventListener("change", filterScheduleByEmployee)
  }

  // Settings items
  const settingItems = document.querySelectorAll(".setting-item")
  settingItems.forEach((item) => {
    item.addEventListener("click", function () {
      const settingType = this.getAttribute("data-setting")
      handleSetting(settingType)
    })
  })
}

// Setup notification listeners after main app is shown
function setupNotificationListeners() {
  // Notification icon click - setup after elements are available
  const notificationIcons = document.querySelectorAll(".notification-icon")
  console.log("Found notification icons:", notificationIcons.length)

  notificationIcons.forEach((icon, index) => {
    console.log(`Setting up listener for notification icon ${index}`)
    icon.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log("Notification icon clicked!")
      toggleNotifications()
    })
  })
}

// Authentication functions
function login() {
  console.log("Login attempt")
  const employeeId = document.getElementById("employeeId").value
  const password = document.getElementById("password").value

  if (!employeeId || !password) {
    showAlert("Mohon isi semua field", "error")
    return
  }

  // Find employee by ID
  const employee = employees.find((emp) => emp.id === employeeId)

  // For demo purposes, any employee can login with password "admin"
  if (employee && password === "admin") {
    currentUser = employee

    // Save to localStorage
    localStorage.setItem("lawsonUser", JSON.stringify(currentUser))

    showMainApp()
    showAlert(`Login berhasil! Selamat datang, ${employee.name}`, "success")
  } else {
    showAlert("ID Karyawan atau Password salah", "error")
  }
}

function logout() {
  currentUser = null
  localStorage.removeItem("lawsonUser")
  showLoginScreen()
  showAlert("Anda telah keluar dari sistem", "info")
}

// Screen management
function showLoginScreen() {
  document.getElementById("loginScreen").classList.add("active")
  document.getElementById("mainApp").classList.remove("active")
}

function showMainApp() {
  document.getElementById("loginScreen").classList.remove("active")
  document.getElementById("mainApp").classList.add("active")
  updateLayoutForScreenSize()
  updateUserInfo()
  loadDashboard()
  switchTab("dashboard")

  // Setup notification listeners after DOM is ready
  setTimeout(() => {
    setupNotificationListeners()
  }, 100)
}

// Update user information across the app
function updateUserInfo() {
  if (!currentUser) return

  // Update desktop topbar
  const topbarAvatar = document.querySelector(".topbar-avatar")
  const topbarName = document.querySelector(".topbar-user-info h4")
  const topbarPosition = document.querySelector(".topbar-user-info p")

  if (topbarAvatar) topbarAvatar.textContent = currentUser.avatar
  if (topbarName) topbarName.textContent = currentUser.name
  if (topbarPosition) topbarPosition.textContent = currentUser.position

  // Update welcome section
  const welcomeAvatar = document.querySelector(".welcome-section .avatar")
  const welcomeName = document.querySelector(".welcome-info h3")

  if (welcomeAvatar) welcomeAvatar.textContent = currentUser.avatar
  if (welcomeName) {
    const greeting = getGreeting()
    welcomeName.textContent = `${greeting}, ${currentUser.name}`
  }

  // Update profile tab
  const profileAvatar = document.querySelector(".profile-header .avatar")
  const profileName = document.querySelector(".profile-header h3")
  const profileId = document.querySelector(".profile-header p")

  if (profileAvatar) profileAvatar.textContent = currentUser.avatar
  if (profileName) profileName.textContent = currentUser.name
  if (profileId) profileId.textContent = `ID Karyawan: ${currentUser.id}`

  // Update profile info
  updateProfileInfo()

  // Update notification badge
  updateNotificationBadge()
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Selamat Pagi"
  if (hour < 15) return "Selamat Siang"
  if (hour < 19) return "Selamat Sore"
  return "Selamat Malam"
}

function updateProfileInfo() {
  if (!currentUser) return

  const profileInfoRows = document.querySelectorAll(".profile-info .info-row")
  if (profileInfoRows.length === 0) return

  // Map profile data to rows
  const profileData = [
    { label: "Posisi Jabatan", value: currentUser.position },
    { label: "Departemen", value: currentUser.department },
    { label: "Tanggal Bergabung", value: currentUser.joinDate },
    { label: "Status Karyawan", value: `<div class="badge active">${currentUser.status}</div>` },
    { label: "Jam Kerja/Minggu", value: "40 Jam" },
    { label: "Rating Performa", value: `⭐⭐⭐⭐⭐ (${currentUser.performance?.rating || 4.5}/5.0)` },
    { label: "Email", value: currentUser.contact?.email || "-" },
    { label: "Telepon", value: currentUser.contact?.phone || "-" },
  ]

  profileInfoRows.forEach((row, index) => {
    if (index < profileData.length) {
      const labelSpan = row.querySelector("span:first-child")
      const valueContainer = row.querySelector("span:last-child") || row.querySelector("div:last-child")

      if (labelSpan) labelSpan.textContent = profileData[index].label
      if (valueContainer) {
        if (profileData[index].label === "Status Karyawan") {
          valueContainer.outerHTML = profileData[index].value
        } else {
          valueContainer.textContent = profileData[index].value
        }
      }
    }
  })
}

// Tab management
function switchTab(tabName) {
  // Update current tab
  currentTab = tabName

  // Hide all tab contents
  const tabContents = document.querySelectorAll(".tab-content")
  tabContents.forEach((tab) => {
    tab.classList.remove("active")
  })

  // Show selected tab content
  const selectedTab = document.getElementById(tabName + "Tab")
  if (selectedTab) {
    selectedTab.classList.add("active")
  }

  // Update mobile navigation
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.classList.remove("active")
    if (item.getAttribute("data-tab") === tabName) {
      item.classList.add("active")
    }
  })

  // Update desktop sidebar navigation
  const sidebarNavItems = document.querySelectorAll(".sidebar-nav-item")
  sidebarNavItems.forEach((item) => {
    item.classList.remove("active")
    if (item.getAttribute("data-tab") === tabName) {
      item.classList.add("active")
    }
  })

  // Update desktop topbar title
  const topbarTitle = document.getElementById("topbarTitle")
  if (topbarTitle) {
    const titles = {
      dashboard: "Dashboard",
      schedule: "Jadwal Kerja",
      profile: "Profil Karyawan",
      employees: "Daftar Karyawan",
      reports: "Laporan & Analitik",
    }
    topbarTitle.textContent = titles[tabName] || "Dashboard"
  }

  // Load tab-specific content
  switch (tabName) {
    case "dashboard":
      loadDashboard()
      break
    case "schedule":
      loadSchedule()
      break
    case "employees":
      loadEmployees()
      break
    case "reports":
      loadReports()
      break
  }
}

// Dashboard functions
function loadDashboard() {
  updateTodaySchedule()
  updateShiftInfo()
  updateStats()
  updateActionItems()
}

function updateTodaySchedule() {
  const scheduleList = document.querySelector(".schedule-list")
  if (!scheduleList) return

  // Clear existing schedule
  scheduleList.innerHTML = ""

  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find employees working today
  const todayEmployees = employees.filter((employee) => {
    const employeeSchedule = schedules[employee.id]
    if (!employeeSchedule) return false

    const todaySchedule = employeeSchedule.find((schedule) => {
      const scheduleDate = new Date(schedule.date)
      scheduleDate.setHours(0, 0, 0, 0)
      return scheduleDate.getTime() === today.getTime()
    })

    return todaySchedule && todaySchedule.shift !== "off"
  })

  // Update badge count
  const scheduleBadge = document.querySelector(".card-header .badge")
  if (scheduleBadge) {
    scheduleBadge.textContent = `${todayEmployees.length} Karyawan`
  }

  // Add employees to schedule list
  todayEmployees.forEach((employee) => {
    const employeeSchedule = schedules[employee.id]
    const todaySchedule = employeeSchedule.find((schedule) => {
      const scheduleDate = new Date(schedule.date)
      scheduleDate.setHours(0, 0, 0, 0)
      return scheduleDate.getTime() === today.getTime()
    })

    const isCurrentUser = employee.id === currentUser.id

    const scheduleItem = document.createElement("div")
    scheduleItem.className = `schedule-item${isCurrentUser ? " active" : ""}`
    scheduleItem.innerHTML = `
      <div class="schedule-info">
        <div class="avatar small">${employee.avatar}</div>
        <div>
          <div class="name">${employee.name}</div>
          <div class="position">${employee.position}</div>
        </div>
      </div>
      <div class="badge ${todaySchedule.class}">${todaySchedule.label}</div>
    `

    scheduleList.appendChild(scheduleItem)
  })

  // If no employees are working today
  if (todayEmployees.length === 0) {
    scheduleList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-xmark"></i>
        <p>Tidak ada jadwal kerja hari ini</p>
      </div>
    `
  }
}

function updateShiftInfo() {
  const shiftInfo = document.querySelector(".welcome-info p")
  if (!shiftInfo || !currentUser) return

  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find current user's schedule for today
  const userSchedule = schedules[currentUser.id]
  if (!userSchedule) return

  const todaySchedule = userSchedule.find((schedule) => {
    const scheduleDate = new Date(schedule.date)
    scheduleDate.setHours(0, 0, 0, 0)
    return scheduleDate.getTime() === today.getTime()
  })

  if (todaySchedule) {
    if (todaySchedule.shift === "off") {
      shiftInfo.textContent = "Hari Ini: Libur"
    } else {
      shiftInfo.textContent = `Shift Hari Ini: ${todaySchedule.label} WIB`
    }
  } else {
    shiftInfo.textContent = "Tidak ada jadwal hari ini"
  }
}

function updateStats() {
  // Update weekly hours
  const weeklyHoursElement = document.querySelector(".stat-card:nth-child(1) .stat-number")
  if (weeklyHoursElement) {
    const weeklyHours = calculateWeeklyHours()
    weeklyHoursElement.textContent = weeklyHours
  }

  // Update active employees count
  const activeEmployeesElement = document.querySelector(".stat-card:nth-child(2) .stat-number")
  if (activeEmployeesElement) {
    const activeEmployees = employees.filter((emp) => emp.status === "Aktif").length
    activeEmployeesElement.textContent = activeEmployees
  }

  // Update attendance rate (desktop only)
  const attendanceElement = document.querySelector(".desktop-stats .stat-card:nth-child(3) .stat-number")
  if (attendanceElement && currentUser.performance) {
    attendanceElement.textContent = `${currentUser.performance.attendance}%`
  }

  // Update overtime hours (desktop only)
  const overtimeElement = document.querySelector(".desktop-stats .stat-card:nth-child(4) .stat-number")
  if (overtimeElement) {
    // Calculate overtime based on schedule
    const overtime = calculateOvertime()
    overtimeElement.textContent = overtime
  }
}

function calculateWeeklyHours() {
  if (!currentUser || !schedules[currentUser.id]) return "0"

  // Get current week dates
  const today = new Date()
  const dayOfWeek = today.getDay()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)) // Monday
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday
  endOfWeek.setHours(23, 59, 59, 999)

  // Count hours based on shifts
  let totalHours = 0

  schedules[currentUser.id].forEach((schedule) => {
    const scheduleDate = new Date(schedule.date)
    if (scheduleDate >= startOfWeek && scheduleDate <= endOfWeek) {
      if (schedule.shift === "morning" || schedule.shift === "evening") {
        totalHours += 8 // 8-hour shift
      } else if (schedule.shift === "night") {
        totalHours += 8 // 8-hour night shift
      }
    }
  })

  return totalHours.toString()
}

function calculateOvertime() {
  if (!currentUser || !schedules[currentUser.id]) return "0"

  // Get current month dates
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  // Count overtime shifts (for demo, we'll consider any weekend shift as overtime)
  let overtimeShifts = 0

  schedules[currentUser.id].forEach((schedule) => {
    const scheduleDate = new Date(schedule.date)
    if (scheduleDate >= startOfMonth && scheduleDate <= endOfMonth) {
      const dayOfWeek = scheduleDate.getDay()
      if ((dayOfWeek === 0 || dayOfWeek === 6) && schedule.shift !== "off") {
        overtimeShifts++
      }
    }
  })

  return overtimeShifts.toString()
}

function updateActionItems() {
  // Add functionality to action items
  const actionItems = document.querySelectorAll(".action-item")

  actionItems.forEach((item) => {
    item.addEventListener("click", function () {
      const actionText = this.querySelector("span").textContent.trim()

      if (actionText.includes("Request Perubahan")) {
        showAddShiftModal()
      } else if (actionText.includes("Jadwal Mingguan")) {
        switchTab("schedule")
      } else if (actionText.includes("Tukar Shift")) {
        showSwapShiftModal()
      } else if (actionText.includes("Laporan Kehadiran")) {
        switchTab("reports")
      }
    })
  })
}

// Schedule functions
function loadSchedule() {
  updateCalendar()
  updateScheduleDetails()
  setupScheduleFilters()
}

function updateCalendar() {
  const calendarDates = document.querySelector(".calendar-dates")
  const monthYearLabel = document.getElementById("monthYearLabel")
  if (!calendarDates || !monthYearLabel) return

  // Clear existing calendar
  calendarDates.innerHTML = ""

  // Set month and year in header
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]
  monthYearLabel.textContent = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`

  // Get first day of month and number of days
  const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
  const daysInMonth = lastDay.getDate()

  // Get user schedule for the month
  const userSchedule = schedules[currentUser.id] || []

  // Create calendar dates
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i)

    // Find schedule for this date
    const daySchedule = userSchedule.find((schedule) => {
      const scheduleDate = new Date(schedule.date)
      return (
        scheduleDate.getDate() === i &&
        scheduleDate.getMonth() === selectedDate.getMonth() &&
        scheduleDate.getFullYear() === selectedDate.getFullYear()
      )
    })

    // Create date element
    const dateElement = document.createElement("div")
    dateElement.className = "calendar-date"
    dateElement.setAttribute("data-date", date.toISOString())

    // Check if it's today
    const today = new Date()
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    if (isToday) {
      dateElement.classList.add("today")
    }

    // Add shift info
    let shiftClass = "off"
    let shiftLabel = "OFF"

    if (daySchedule) {
      shiftClass = daySchedule.class
      shiftLabel = daySchedule.label
    }

    dateElement.innerHTML = `
      <div class="date-number">${i}</div>
      <div class="date-shift ${shiftClass}">${shiftLabel}</div>
    `

    // Add click event
    dateElement.addEventListener("click", function () {
      selectDate(this)
    })

    calendarDates.appendChild(dateElement)
  }
}

function changeMonth(delta) {
  selectedDate.setMonth(selectedDate.getMonth() + delta)
  updateCalendar()
  updateScheduleDetails()
}

function selectDate(dateElement) {
  // Remove previous selection
  document.querySelectorAll(".calendar-date").forEach((date) => {
    date.classList.remove("selected")
  })

  // Add selection to clicked date
  dateElement.classList.add("selected")

  // Get selected date
  const dateString = dateElement.getAttribute("data-date")
  const selectedDate = new Date(dateString)

  // Update schedule details for this date
  updateScheduleDetailsForDate(selectedDate)
}

function updateScheduleDetails() {
  // By default, show current month's schedule
  const scheduleDetails = document.querySelector(".schedule-details")
  if (!scheduleDetails) return

  // Clear existing details
  scheduleDetails.innerHTML = ""

  // Get user schedule for the selected month
  const userSchedule = schedules[currentUser.id] || []
  const monthSchedule = userSchedule.filter((schedule) => {
    const scheduleDate = new Date(schedule.date)
    return (
      scheduleDate.getMonth() === selectedDate.getMonth() && scheduleDate.getFullYear() === selectedDate.getFullYear()
    )
  })

  // Sort by date
  monthSchedule.sort((a, b) => new Date(a.date) - new Date(b.date))

  // Update badge count
  const scheduleBadge = document.querySelector(".card-header .badge")
  if (scheduleBadge) {
    scheduleBadge.textContent = `${monthSchedule.length} Hari`
  }

  // Add schedule details
  monthSchedule.forEach((schedule) => {
    const scheduleDate = new Date(schedule.date)
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ]

    const formattedDate = `${dayNames[scheduleDate.getDay()]}, ${scheduleDate.getDate()} ${monthNames[scheduleDate.getMonth()]} ${scheduleDate.getFullYear()}`

    let shiftDescription = ""
    if (schedule.shift === "morning") {
      shiftDescription = "Shift Pagi - " + currentUser.position
    } else if (schedule.shift === "evening") {
      shiftDescription = "Shift Sore - " + currentUser.position
    } else if (schedule.shift === "night") {
      shiftDescription = "Shift Malam - " + currentUser.position
    } else {
      shiftDescription = "Hari Libur"
    }

    const detailItem = document.createElement("div")
    detailItem.className = "detail-item"
    detailItem.innerHTML = `
      <div class="detail-info">
        <div class="detail-date">${formattedDate}</div>
        <div class="detail-shift">${shiftDescription}</div>
      </div>
      <div class="badge ${schedule.class}">${schedule.label}</div>
    `

    scheduleDetails.appendChild(detailItem)
  })

  // If no schedule for this month
  if (monthSchedule.length === 0) {
    scheduleDetails.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-xmark"></i>
        <p>Tidak ada jadwal untuk bulan ini</p>
      </div>
    `
  }
}

function updateScheduleDetailsForDate(date) {
  // Show schedule details for the selected date
  const scheduleDetails = document.querySelector(".schedule-details")
  if (!scheduleDetails) return

  // Clear existing details
  scheduleDetails.innerHTML = ""

  // Format date
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]
  const formattedDate = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`

  // Update title
  const detailTitle = document.querySelector(".card-header h3")
  if (detailTitle) {
    detailTitle.innerHTML = `<i class="fas fa-list-alt"></i> Detail Jadwal: ${formattedDate}`
  }

  // Get all employees' schedules for this date
  const employeesOnDuty = []

  employees.forEach((employee) => {
    const employeeSchedule = schedules[employee.id] || []
    const daySchedule = employeeSchedule.find((schedule) => {
      const scheduleDate = new Date(schedule.date)
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      )
    })

    if (daySchedule && daySchedule.shift !== "off") {
      employeesOnDuty.push({
        employee: employee,
        schedule: daySchedule,
      })
    }
  })

  // Update badge count
  const scheduleBadge = document.querySelector(".card-header .badge")
  if (scheduleBadge) {
    scheduleBadge.textContent = `${employeesOnDuty.length} Karyawan`
    scheduleBadge.className = "badge primary"
  }

  // Add employee schedules
  employeesOnDuty.forEach((item) => {
    let shiftDescription = ""
    if (item.schedule.shift === "morning") {
      shiftDescription = "Shift Pagi - " + item.employee.position
    } else if (item.schedule.shift === "evening") {
      shiftDescription = "Shift Sore - " + item.employee.position
    } else if (item.schedule.shift === "night") {
      shiftDescription = "Shift Malam - " + item.employee.position
    }

    const detailItem = document.createElement("div")
    detailItem.className = "detail-item"
    detailItem.innerHTML = `
      <div class="detail-info">
        <div class="detail-date">${item.employee.name}</div>
        <div class="detail-shift">${shiftDescription}</div>
      </div>
      <div class="badge ${item.schedule.class}">${item.schedule.label}</div>
    `

    scheduleDetails.appendChild(detailItem)
  })

  // If no employees on duty
  if (employeesOnDuty.length === 0) {
    scheduleDetails.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users-slash"></i>
        <p>Tidak ada karyawan yang bertugas pada tanggal ini</p>
      </div>
    `
  }
}

function setupScheduleFilters() {
  const employeeFilter = document.getElementById("employeeFilter")
  if (!employeeFilter) return

  // Clear existing options
  employeeFilter.innerHTML = ""

  // Add default option
  const defaultOption = document.createElement("option")
  defaultOption.value = "current"
  defaultOption.textContent = "Jadwal Saya"
  employeeFilter.appendChild(defaultOption)

  // Add all employees
  employees.forEach((employee) => {
    if (employee.id !== currentUser.id) {
      const option = document.createElement("option")
      option.value = employee.id
      option.textContent = employee.name
      employeeFilter.appendChild(option)
    }
  })

  // Add "all" option
  const allOption = document.createElement("option")
  allOption.value = "all"
  allOption.textContent = "Semua Karyawan"
  employeeFilter.appendChild(allOption)
}

function filterScheduleByEmployee() {
  const employeeFilter = document.getElementById("employeeFilter")
  if (!employeeFilter) return

  const selectedEmployeeId = employeeFilter.value

  if (selectedEmployeeId === "current") {
    // Show current user's schedule
    updateCalendar()
    updateScheduleDetails()
  } else if (selectedEmployeeId === "all") {
    // Show all employees' schedule
    showAllEmployeesSchedule()
  } else {
    // Show selected employee's schedule
    showEmployeeSchedule(selectedEmployeeId)
  }
}

function showEmployeeSchedule(employeeId) {
  const employee = employees.find((emp) => emp.id === employeeId)
  if (!employee) return

  // Update calendar to show employee's schedule
  const calendarDates = document.querySelector(".calendar-dates")
  if (!calendarDates) return

  // Clear existing calendar
  calendarDates.innerHTML = ""

  // Get first day of month and number of days
  const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
  const daysInMonth = lastDay.getDate()

  // Get employee schedule for the month
  const employeeSchedule = schedules[employeeId] || []

  // Create calendar dates
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i)

    // Find schedule for this date
    const daySchedule = employeeSchedule.find((schedule) => {
      const scheduleDate = new Date(schedule.date)
      return (
        scheduleDate.getDate() === i &&
        scheduleDate.getMonth() === selectedDate.getMonth() &&
        scheduleDate.getFullYear() === selectedDate.getFullYear()
      )
    })

    // Create date element
    const dateElement = document.createElement("div")
    dateElement.className = "calendar-date"
    dateElement.setAttribute("data-date", date.toISOString())
    dateElement.setAttribute("data-employee", employeeId)

    // Check if it's today
    const today = new Date()
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    if (isToday) {
      dateElement.classList.add("today")
    }

    // Add shift info
    let shiftClass = "off"
    let shiftLabel = "OFF"

    if (daySchedule) {
      shiftClass = daySchedule.class
      shiftLabel = daySchedule.label
    }

    dateElement.innerHTML = `
      <div class="date-number">${i}</div>
      <div class="date-shift ${shiftClass}">${shiftLabel}</div>
    `

    // Add click event
    dateElement.addEventListener("click", function () {
      selectEmployeeDate(this, employeeId)
    })

    calendarDates.appendChild(dateElement)
  }

  // Update schedule details
  updateEmployeeScheduleDetails(employeeId)
}

function selectEmployeeDate(dateElement, employeeId) {
  // Remove previous selection
  document.querySelectorAll(".calendar-date").forEach((date) => {
    date.classList.remove("selected")
  })

  // Add selection to clicked date
  dateElement.classList.add("selected")

  // Get selected date
  const dateString = dateElement.getAttribute("data-date")
  const selectedDate = new Date(dateString)

  // Update schedule details for this employee and date
  updateScheduleDetailsForEmployeeDate(employeeId, selectedDate)
}

function updateEmployeeScheduleDetails(employeeId) {
  const employee = employees.find((emp) => emp.id === employeeId)
  if (!employee) return

  // Show employee's schedule for the selected month
  const scheduleDetails = document.querySelector(".schedule-details")
  if (!scheduleDetails) return

  // Clear existing details
  scheduleDetails.innerHTML = ""

  // Update title
  const detailTitle = document.querySelector(".card-header h3")
  if (detailTitle) {
    detailTitle.innerHTML = `<i class="fas fa-list-alt"></i> Jadwal: ${employee.name}`
  }

  // Get employee schedule for the selected month
  const employeeSchedule = schedules[employeeId] || []
  const monthSchedule = employeeSchedule.filter((schedule) => {
    const scheduleDate = new Date(schedule.date)
    return (
      scheduleDate.getMonth() === selectedDate.getMonth() && scheduleDate.getFullYear() === selectedDate.getFullYear()
    )
  })

  // Sort by date
  monthSchedule.sort((a, b) => new Date(a.date) - new Date(b.date))

  // Update badge count
  const scheduleBadge = document.querySelector(".card-header .badge")
  if (scheduleBadge) {
    scheduleBadge.textContent = `${monthSchedule.length} Hari`
  }

  // Add schedule details
  monthSchedule.forEach((schedule) => {
    const scheduleDate = new Date(schedule.date)
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ]

    const formattedDate = `${dayNames[scheduleDate.getDay()]}, ${scheduleDate.getDate()} ${monthNames[scheduleDate.getMonth()]} ${scheduleDate.getFullYear()}`

    let shiftDescription = ""
    if (schedule.shift === "morning") {
      shiftDescription = "Shift Pagi - " + employee.position
    } else if (schedule.shift === "evening") {
      shiftDescription = "Shift Sore - " + employee.position
    } else if (schedule.shift === "night") {
      shiftDescription = "Shift Malam - " + employee.position
    } else {
      shiftDescription = "Hari Libur"
    }

    const detailItem = document.createElement("div")
    detailItem.className = "detail-item"
    detailItem.innerHTML = `
      <div class="detail-info">
        <div class="detail-date">${formattedDate}</div>
        <div class="detail-shift">${shiftDescription}</div>
      </div>
      <div class="badge ${schedule.class}">${schedule.label}</div>
    `

    scheduleDetails.appendChild(detailItem)
  })
}

function updateScheduleDetailsForEmployeeDate(employeeId, date) {
  const employee = employees.find((emp) => emp.id === employeeId)
  if (!employee) return

  // Show schedule details for the selected employee and date
  const scheduleDetails = document.querySelector(".schedule-details")
  if (!scheduleDetails) return

  // Clear existing details
  scheduleDetails.innerHTML = ""

  // Format date
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]
  const formattedDate = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`

  // Update title
  const detailTitle = document.querySelector(".card-header h3")
  if (detailTitle) {
    detailTitle.innerHTML = `<i class="fas fa-list-alt"></i> ${employee.name}: ${formattedDate}`
  }

  // Get employee schedule for this date
  const employeeSchedule = schedules[employeeId] || []
  const daySchedule = employeeSchedule.find((schedule) => {
    const scheduleDate = new Date(schedule.date)
    return (
      scheduleDate.getDate() === date.getDate() &&
      scheduleDate.getMonth() === date.getMonth() &&
      scheduleDate.getFullYear() === date.getFullYear()
    )
  })

  if (daySchedule) {
    let shiftDescription = ""
    if (daySchedule.shift === "morning") {
      shiftDescription = "Shift Pagi - " + employee.position
    } else if (daySchedule.shift === "evening") {
      shiftDescription = "Shift Sore - " + employee.position
    } else if (daySchedule.shift === "night") {
      shiftDescription = "Shift Malam - " + employee.position
    } else {
      shiftDescription = "Hari Libur"
    }

    const detailItem = document.createElement("div")
    detailItem.className = "detail-item"
    detailItem.innerHTML = `
      <div class="detail-info">
        <div class="detail-date">${employee.name}</div>
        <div class="detail-shift">${shiftDescription}</div>
      </div>
      <div class="badge ${daySchedule.class}">${daySchedule.label}</div>
    `

    scheduleDetails.appendChild(detailItem)

    // Add swap shift button if not a day off
    if (daySchedule.shift !== "off" && employeeId !== currentUser.id) {
      const swapButton = document.createElement("button")
      swapButton.className = "btn-outline swap-btn"
      swapButton.innerHTML = `<i class="fas fa-exchange-alt"></i> Request Tukar Shift`
      swapButton.addEventListener("click", () => {
        showSwapShiftModal(employeeId, date)
      })

      scheduleDetails.appendChild(swapButton)
    }
  } else {
    scheduleDetails.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-xmark"></i>
        <p>Tidak ada jadwal untuk tanggal ini</p>
      </div>
    `
  }
}

function showAllEmployeesSchedule() {
  // Show all employees' schedule for today
  const today = new Date()
  showAllEmployeesScheduleForDate(today)
}

function showAllEmployeesScheduleForDate(date) {
  // Show all employees' schedule for the selected date
  const scheduleDetails = document.querySelector(".schedule-details")
  if (!scheduleDetails) return

  // Clear existing details
  scheduleDetails.innerHTML = ""

  // Format date
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]
  const formattedDate = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`

  // Update title
  const detailTitle = document.querySelector(".card-header h3")
  if (detailTitle) {
    detailTitle.innerHTML = `<i class="fas fa-list-alt"></i> Semua Jadwal: ${formattedDate}`
  }

  // Get all employees' schedules for this date
  const employeesSchedules = []

  employees.forEach((employee) => {
    const employeeSchedule = schedules[employee.id] || []
    const daySchedule = employeeSchedule.find((schedule) => {
      const scheduleDate = new Date(schedule.date)
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      )
    })

    if (daySchedule) {
      employeesSchedules.push({
        employee: employee,
        schedule: daySchedule,
      })
    }
  })

  // Sort by shift type: morning, evening, night, off
  employeesSchedules.sort((a, b) => {
    const shiftOrder = { morning: 1, evening: 2, night: 3, off: 4 }
    return shiftOrder[a.schedule.shift] - shiftOrder[b.schedule.shift]
  })

  // Update badge count
  const scheduleBadge = document.querySelector(".card-header .badge")
  if (scheduleBadge) {
    scheduleBadge.textContent = `${employeesSchedules.length} Karyawan`
  }

  // Add schedule details
  employeesSchedules.forEach((item) => {
    let shiftDescription = ""
    if (item.schedule.shift === "morning") {
      shiftDescription = "Shift Pagi - " + item.employee.position
    } else if (item.schedule.shift === "evening") {
      shiftDescription = "Shift Sore - " + item.employee.position
    } else if (item.schedule.shift === "night") {
      shiftDescription = "Shift Malam - " + item.employee.position
    } else {
      shiftDescription = "Hari Libur"
    }

    const isCurrentUser = item.employee.id === currentUser.id

    const detailItem = document.createElement("div")
    detailItem.className = `detail-item${isCurrentUser ? " current-user" : ""}`
    detailItem.innerHTML = `
      <div class="detail-info">
        <div class="detail-date">${item.employee.name}${isCurrentUser ? " (Anda)" : ""}</div>
        <div class="detail-shift">${shiftDescription}</div>
      </div>
      <div class="badge ${item.schedule.class}">${item.schedule.label}</div>
    `

    scheduleDetails.appendChild(detailItem)
  })
}

// Shift management functions
function showAddShiftModal() {
  // Create modal for adding/changing shift
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.id = "addShiftModal"

  // Get today's date and format it
  const today = new Date()
  const formattedDate = today.toISOString().split("T")[0]

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Request Perubahan Jadwal</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="shiftChangeForm">
          <div class="form-group">
            <label for="shiftDate">Tanggal</label>
            <input type="date" id="shiftDate" min="${formattedDate}" required>
          </div>
          <div class="form-group">
            <label for="shiftType">Jenis Shift</label>
            <select id="shiftType" required>
              <option value="">Pilih Shift</option>
              <option value="morning">Pagi (08:00-16:00)</option>
              <option value="evening">Sore (16:00-24:00)</option>
              <option value="night">Malam (00:00-08:00)</option>
              <option value="off">Libur</option>
            </select>
          </div>
          <div class="form-group">
            <label for="shiftReason">Alasan</label>
            <textarea id="shiftReason" rows="3" placeholder="Berikan alasan perubahan jadwal" required></textarea>
          </div>
          <button type="submit" class="btn-primary">Kirim Request</button>
        </form>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add("show")
  }, 10)

  // Close modal on click outside or close button
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close-modal")) {
      closeModal(modal)
    }
  })

  // Handle form submission
  const form = document.getElementById("shiftChangeForm")
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const shiftDate = document.getElementById("shiftDate").value
    const shiftType = document.getElementById("shiftType").value
    const shiftReason = document.getElementById("shiftReason").value

    // Process the request (in a real app, this would be sent to a server)
    processShiftChangeRequest(shiftDate, shiftType, shiftReason)

    // Close modal
    closeModal(modal)
  })
}

function showSwapShiftModal(targetEmployeeId, targetDate) {
  // Create modal for swapping shifts
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.id = "swapShiftModal"

  // Get target employee
  let targetEmployee = null
  let targetDateObj = null
  let targetShift = null

  if (targetEmployeeId && targetDate) {
    targetEmployee = employees.find((emp) => emp.id === targetEmployeeId)
    targetDateObj = new Date(targetDate)

    // Get target employee's shift for the selected date
    const employeeSchedule = schedules[targetEmployeeId] || []
    const daySchedule = employeeSchedule.find((schedule) => {
      const scheduleDate = new Date(schedule.date)
      return (
        scheduleDate.getDate() === targetDateObj.getDate() &&
        scheduleDate.getMonth() === targetDateObj.getMonth() &&
        scheduleDate.getFullYear() === targetDateObj.getFullYear()
      )
    })

    if (daySchedule) {
      targetShift = daySchedule
    }
  }

  // Format date if available
  let formattedTargetDate = ""
  if (targetDateObj) {
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ]
    formattedTargetDate = `${dayNames[targetDateObj.getDay()]}, ${targetDateObj.getDate()} ${monthNames[targetDateObj.getMonth()]} ${targetDateObj.getFullYear()}`
  }

  // Get today's date and format it
  const today = new Date()
  const minDate = today.toISOString().split("T")[0]

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Request Tukar Shift</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="shiftSwapForm">
          ${
            targetEmployee
              ? `
            <div class="swap-info">
              <h4>Shift yang Diminta:</h4>
              <div class="swap-details">
                <p><strong>Karyawan:</strong> ${targetEmployee.name}</p>
                <p><strong>Tanggal:</strong> ${formattedTargetDate}</p>
                <p><strong>Shift:</strong> <span class="badge ${targetShift.class}">${targetShift.label}</span></p>
              </div>
            </div>
          `
              : `
            <div class="form-group">
              <label for="targetEmployee">Karyawan</label>
              <select id="targetEmployee" required>
                <option value="">Pilih Karyawan</option>
                ${employees
                  .filter((emp) => emp.id !== currentUser.id)
                  .map(
                    (emp) => `
                  <option value="${emp.id}">${emp.name}</option>
                `,
                  )
                  .join("")}
              </select>
            </div>
            <div class="form-group">
              <label for="targetDate">Tanggal Shift yang Diminta</label>
              <input type="date" id="targetDate" min="${minDate}" required>
            </div>
          `
          }
          
          <div class="form-group">
            <label for="myDate">Tanggal Shift Anda</label>
            <input type="date" id="myDate" min="${minDate}" required>
          </div>
          <div class="form-group">
            <label for="swapReason">Alasan</label>
            <textarea id="swapReason" rows="3" placeholder="Berikan alasan tukar shift" required></textarea>
          </div>
          <button type="submit" class="btn-primary">Kirim Request</button>
        </form>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add("show")
  }, 10)

  // Close modal on click outside or close button
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close-modal")) {
      closeModal(modal)
    }
  })

  // Handle form submission
  const form = document.getElementById("shiftSwapForm")
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    let targetEmpId = targetEmployeeId
    let targetDateValue = targetDate ? targetDate.toISOString().split("T")[0] : null

    if (!targetEmployee) {
      targetEmpId = document.getElementById("targetEmployee").value
      targetDateValue = document.getElementById("targetDate").value
    }

    const myDate = document.getElementById("myDate").value
    const swapReason = document.getElementById("swapReason").value

    // Process the swap request
    processShiftSwapRequest(targetEmpId, targetDateValue, myDate, swapReason)

    // Close modal
    closeModal(modal)
  })
}

function closeModal(modal) {
  modal.classList.remove("show")
  setTimeout(() => {
    modal.remove()
  }, 300)
}

// Data persistence functions
function saveDataToStorage() {
  localStorage.setItem("lawsonSchedules", JSON.stringify(schedules))
  localStorage.setItem("lawsonNotifications", JSON.stringify(notifications))
  localStorage.setItem("lawsonShiftSwapRequests", JSON.stringify(shiftSwapRequests))
  localStorage.setItem("lawsonShiftChangeRequests", JSON.stringify(window.shiftChangeRequests || []))
}

function loadDataFromStorage() {
  const savedSchedules = localStorage.getItem("lawsonSchedules")
  const savedNotifications = localStorage.getItem("lawsonNotifications")
  const savedSwapRequests = localStorage.getItem("lawsonShiftSwapRequests")
  const savedChangeRequests = localStorage.getItem("lawsonShiftChangeRequests")

  if (savedSchedules) {
    const parsedSchedules = JSON.parse(savedSchedules)
    // Convert date strings back to Date objects
    Object.keys(parsedSchedules).forEach((employeeId) => {
      parsedSchedules[employeeId].forEach((schedule) => {
        schedule.date = new Date(schedule.date)
      })
    })
    Object.assign(schedules, parsedSchedules)
  }

  if (savedNotifications) {
    const parsedNotifications = JSON.parse(savedNotifications)
    // Convert date strings back to Date objects
    parsedNotifications.forEach((notification) => {
      notification.date = new Date(notification.date)
    })
    notifications = parsedNotifications
  }

  if (savedSwapRequests) {
    const parsedSwapRequests = JSON.parse(savedSwapRequests)
    // Convert date strings back to Date objects
    parsedSwapRequests.forEach((request) => {
      if (request.createdAt) request.createdAt = new Date(request.createdAt)
      if (request.requesterDate) request.requesterDate = new Date(request.requesterDate)
      if (request.targetDate) request.targetDate = new Date(request.targetDate)
      if (request.approvedDate) request.approvedDate = new Date(request.approvedDate)
    })
    shiftSwapRequests = parsedSwapRequests
  }

  if (savedChangeRequests) {
    const parsedChangeRequests = JSON.parse(savedChangeRequests)
    // Convert date strings back to Date objects
    parsedChangeRequests.forEach((request) => {
      if (request.requestDate) request.requestDate = new Date(request.requestDate)
      if (request.shiftDate) request.shiftDate = new Date(request.shiftDate)
      if (request.approvedDate) request.approvedDate = new Date(request.approvedDate)
    })
    window.shiftChangeRequests = parsedChangeRequests
  }
}

// Enhanced shift change request processing
function processShiftChangeRequest(shiftDate, shiftType, shiftReason) {
  const request = {
    id: (window.shiftChangeRequests?.length || 0) + 1,
    employeeId: currentUser.id,
    employeeName: currentUser.name,
    requestDate: new Date(),
    shiftDate: new Date(shiftDate),
    currentShift: getCurrentShiftForDate(currentUser.id, new Date(shiftDate)),
    requestedShift: shiftType,
    reason: shiftReason,
    status: "pending",
    approvedBy: null,
    approvedDate: null,
  }

  if (!window.shiftChangeRequests) {
    window.shiftChangeRequests = []
  }
  window.shiftChangeRequests.push(request)

  // Add notification
  const notification = {
    id: notifications.length + 1,
    type: "info",
    title: "Request Dikirim",
    message: `Request perubahan jadwal untuk tanggal ${formatDate(new Date(shiftDate))} telah dikirim`,
    date: new Date(),
    read: false,
  }

  notifications.unshift(notification)
  updateNotificationBadge()
  saveDataToStorage()

  // Auto-approve for demo (in real app, this would go to supervisor)
  setTimeout(() => {
    approveShiftChangeRequest(request.id)
  }, 2000)

  showAlert("Request perubahan jadwal berhasil dikirim!", "success")
}

function approveShiftChangeRequest(requestId) {
  const request = window.shiftChangeRequests?.find((r) => r.id === requestId)
  if (!request) return

  request.status = "approved"
  request.approvedBy = "Supervisor"
  request.approvedDate = new Date()

  // Update the actual schedule
  updateEmployeeSchedule(request.employeeId, request.shiftDate, request.requestedShift)

  // Add approval notification
  const notification = {
    id: notifications.length + 1,
    type: "success",
    title: "Request Disetujui",
    message: `Request perubahan jadwal Anda untuk tanggal ${formatDate(request.shiftDate)} telah disetujui`,
    date: new Date(),
    read: false,
  }

  notifications.unshift(notification)
  updateNotificationBadge()
  saveDataToStorage()

  // Refresh current view if needed
  if (currentTab === "schedule") {
    loadSchedule()
  }
}

// Enhanced shift swap request processing
function processShiftSwapRequest(targetEmployeeId, targetDate, myDate, swapReason) {
  const targetEmployee = employees.find((emp) => emp.id === targetEmployeeId)

  const request = {
    id: shiftSwapRequests.length + 1,
    requesterId: currentUser.id,
    requesterName: currentUser.name,
    targetId: targetEmployeeId,
    targetName: targetEmployee.name,
    requesterDate: new Date(myDate),
    targetDate: new Date(targetDate),
    requesterShift: getCurrentShiftForDate(currentUser.id, new Date(myDate)),
    targetShift: getCurrentShiftForDate(targetEmployeeId, new Date(targetDate)),
    reason: swapReason,
    status: "pending",
    createdAt: new Date(),
    approvedBy: null,
    approvedDate: null,
  }

  shiftSwapRequests.push(request)

  // Add notification for requester
  const notification = {
    id: notifications.length + 1,
    type: "info",
    title: "Request Tukar Shift",
    message: `Request tukar shift dengan ${targetEmployee.name} telah dikirim`,
    date: new Date(),
    read: false,
  }

  notifications.unshift(notification)
  updateNotificationBadge()
  saveDataToStorage()

  // Auto-approve for demo (in real app, target employee would approve)
  setTimeout(() => {
    approveShiftSwapRequest(request.id)
  }, 3000)

  showAlert(`Request tukar shift dengan ${targetEmployee.name} berhasil dikirim!`, "success")
}

function approveShiftSwapRequest(requestId) {
  const request = shiftSwapRequests.find((r) => r.id === requestId)
  if (!request) return

  request.status = "approved"
  request.approvedBy = request.targetName
  request.approvedDate = new Date()

  // Swap the shifts in the schedule
  swapEmployeeShifts(request.requesterId, request.requesterDate, request.targetId, request.targetDate)

  // Add approval notification
  const notification = {
    id: notifications.length + 1,
    type: "success",
    title: "Tukar Shift Disetujui",
    message: `Tukar shift dengan ${request.targetName} telah disetujui`,
    date: new Date(),
    read: false,
  }

  notifications.unshift(notification)
  updateNotificationBadge()
  saveDataToStorage()

  // Refresh current view if needed
  if (currentTab === "schedule") {
    loadSchedule()
  }
}

// Helper functions
function getCurrentShiftForDate(employeeId, date) {
  const employeeSchedule = schedules[employeeId] || []
  const daySchedule = employeeSchedule.find((schedule) => {
    const scheduleDate = new Date(schedule.date)
    return (
      scheduleDate.getDate() === date.getDate() &&
      scheduleDate.getMonth() === date.getMonth() &&
      scheduleDate.getFullYear() === date.getFullYear()
    )
  })
  return daySchedule ? daySchedule.shift : "off"
}

function updateEmployeeSchedule(employeeId, date, newShift) {
  const employeeSchedule = schedules[employeeId] || []
  const scheduleIndex = employeeSchedule.findIndex((schedule) => {
    const scheduleDate = new Date(schedule.date)
    return (
      scheduleDate.getDate() === date.getDate() &&
      scheduleDate.getMonth() === date.getMonth() &&
      scheduleDate.getFullYear() === date.getFullYear()
    )
  })

  if (scheduleIndex !== -1) {
    const shifts = [
      { type: "morning", label: "08:00-16:00", class: "primary" },
      { type: "evening", label: "16:00-24:00", class: "secondary" },
      { type: "night", label: "00:00-08:00", class: "night" },
      { type: "off", label: "OFF", class: "off" },
    ]

    const shift = shifts.find((s) => s.type === newShift)
    employeeSchedule[scheduleIndex] = {
      date: new Date(date),
      shift: newShift,
      label: shift.label,
      class: shift.class,
    }
  }
}

function swapEmployeeShifts(emp1Id, date1, emp2Id, date2) {
  const emp1Shift = getCurrentShiftForDate(emp1Id, date1)
  const emp2Shift = getCurrentShiftForDate(emp2Id, date2)

  updateEmployeeSchedule(emp1Id, date1, emp2Shift)
  updateEmployeeSchedule(emp2Id, date2, emp1Shift)
}

function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  return date.toLocaleDateString("id-ID", options)
}

// Enhanced reports functionality
function loadReports() {
  console.log("Loading reports...")
  const reportsContent = document.getElementById("reportsContent")
  if (!reportsContent) return

  reportsContent.innerHTML = `
    <div class="reports-grid">
      <div class="report-card">
        <div class="report-header">
          <h4><i class="fas fa-chart-bar"></i> Statistik Kehadiran</h4>
        </div>
        <div class="report-content">
          ${generateAttendanceReport()}
        </div>
      </div>
      
      <div class="report-card">
        <div class="report-header">
          <h4><i class="fas fa-clock"></i> Distribusi Shift</h4>
        </div>
        <div class="report-content">
          ${generateShiftDistributionReport()}
        </div>
      </div>
      
      <div class="report-card">
        <div class="report-header">
          <h4><i class="fas fa-exchange-alt"></i> Request & Tukar Shift</h4>
        </div>
        <div class="report-content">
          ${generateRequestsReport()}
        </div>
      </div>
      
      <div class="report-card">
        <div class="report-header">
          <h4><i class="fas fa-users"></i> Performa Karyawan</h4>
        </div>
        <div class="report-content">
          ${generatePerformanceReport()}
        </div>
      </div>
    </div>
  `
}

function generateAttendanceReport() {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  let html = '<div class="attendance-stats">'

  employees.forEach((employee) => {
    const employeeSchedule = schedules[employee.id] || []
    const monthSchedule = employeeSchedule.filter((schedule) => {
      const scheduleDate = new Date(schedule.date)
      return scheduleDate.getMonth() === currentMonth && scheduleDate.getFullYear() === currentYear
    })

    const workDays = monthSchedule.filter((s) => s.shift !== "off").length
    const totalDays = monthSchedule.length
    const attendanceRate = totalDays > 0 ? Math.round((workDays / totalDays) * 100) : 0

    html += `
      <div class="employee-attendance">
        <div class="employee-info">
          <div class="avatar small ${employee.gender === "female" ? "avatar-female" : "avatar-male"}">${employee.avatar}</div>
          <div>
            <div class="name">${employee.name}</div>
            <div class="position">${employee.position}</div>
          </div>
        </div>
        <div class="attendance-metrics">
          <div class="metric">
            <span class="metric-value">${workDays}</span>
            <span class="metric-label">Hari Kerja</span>
          </div>
          <div class="metric">
            <span class="metric-value">${attendanceRate}%</span>
            <span class="metric-label">Kehadiran</span>
          </div>
        </div>
      </div>
    `
  })

  html += "</div>"
  return html
}

function generateShiftDistributionReport() {
  const shiftCounts = { morning: 0, evening: 0, night: 0, off: 0 }

  employees.forEach((employee) => {
    const employeeSchedule = schedules[employee.id] || []
    employeeSchedule.forEach((schedule) => {
      shiftCounts[schedule.shift]++
    })
  })

  const total = Object.values(shiftCounts).reduce((a, b) => a + b, 0)

  return `
    <div class="shift-distribution">
      <div class="shift-stat">
        <div class="shift-info">
          <span class="badge primary">Pagi (08:00-16:00)</span>
        </div>
        <div class="shift-count">
          <span>${shiftCounts.morning}</span>
          <small>${total > 0 ? Math.round((shiftCounts.morning / total) * 100) : 0}%</small>
        </div>
      </div>
      <div class="shift-stat">
        <div class="shift-info">
          <span class="badge secondary">Sore (16:00-24:00)</span>
        </div>
        <div class="shift-count">
          <span>${shiftCounts.evening}</span>
          <small>${total > 0 ? Math.round((shiftCounts.evening / total) * 100) : 0}%</small>
        </div>
      </div>
      <div class="shift-stat">
        <div class="shift-info">
          <span class="badge night">Malam (00:00-08:00)</span>
        </div>
        <div class="shift-count">
          <span>${shiftCounts.night}</span>
          <small>${total > 0 ? Math.round((shiftCounts.night / total) * 100) : 0}%</small>
        </div>
      </div>
      <div class="shift-stat">
        <div class="shift-info">
          <span class="badge off">Libur</span>
        </div>
        <div class="shift-count">
          <span>${shiftCounts.off}</span>
          <small>${total > 0 ? Math.round((shiftCounts.off / total) * 100) : 0}%</small>
        </div>
      </div>
    </div>
  `
}

function generateRequestsReport() {
  const changeRequests = window.shiftChangeRequests || []
  const swapRequests = shiftSwapRequests || []

  const totalRequests = changeRequests.length + swapRequests.length
  const approvedRequests =
    changeRequests.filter((r) => r.status === "approved").length +
    swapRequests.filter((r) => r.status === "approved").length
  const pendingRequests = totalRequests - approvedRequests

  return `
    <div class="requests-summary">
      <div class="request-stat">
        <div class="stat-number">${totalRequests}</div>
        <div class="stat-label">Total Request</div>
      </div>
      <div class="request-stat">
        <div class="stat-number">${approvedRequests}</div>
        <div class="stat-label">Disetujui</div>
      </div>
      <div class="request-stat">
        <div class="stat-number">${pendingRequests}</div>
        <div class="stat-label">Pending</div>
      </div>
    </div>
    
    <div class="recent-requests">
      <h5>Request Terbaru:</h5>
      ${generateRecentRequestsList()}
    </div>
  `
}

function generateRecentRequestsList() {
  const changeRequests = (window.shiftChangeRequests || []).map((r) => ({ ...r, type: "change" }))
  const swapRequests = (shiftSwapRequests || []).map((r) => ({ ...r, type: "swap" }))

  const allRequests = [...changeRequests, ...swapRequests]
    .sort((a, b) => new Date(b.createdAt || b.requestDate) - new Date(a.createdAt || a.requestDate))
    .slice(0, 5)

  if (allRequests.length === 0) {
    return '<p class="no-requests">Belum ada request</p>'
  }

  return allRequests
    .map((request) => {
      const date = new Date(request.createdAt || request.requestDate)
      const statusClass = request.status === "approved" ? "success" : "warning"
      const statusText = request.status === "approved" ? "Disetujui" : "Pending"

      return `
      <div class="request-item">
        <div class="request-info">
          <div class="request-title">
            ${request.type === "change" ? "Perubahan Jadwal" : "Tukar Shift"}
          </div>
          <div class="request-details">
            ${request.employeeName || request.requesterName} - ${formatDate(date)}
          </div>
        </div>
        <div class="badge ${statusClass}">${statusText}</div>
      </div>
    `
    })
    .join("")
}

function generatePerformanceReport() {
  return employees
    .map((employee) => {
      const rating = employee.performance?.rating || 4.5
      const attendance = employee.performance?.attendance || 95
      const productivity = employee.performance?.productivity || 90

      return `
      <div class="performance-item">
        <div class="employee-info">
          <div class="avatar small ${employee.gender === "female" ? "avatar-female" : "avatar-male"}">${employee.avatar}</div>
          <div>
            <div class="name">${employee.name}</div>
            <div class="position">${employee.position}</div>
          </div>
        </div>
        <div class="performance-metrics">
          <div class="metric">
            <span class="metric-value">⭐ ${rating}</span>
            <span class="metric-label">Rating</span>
          </div>
          <div class="metric">
            <span class="metric-value">${attendance}%</span>
            <span class="metric-label">Kehadiran</span>
          </div>
          <div class="metric">
            <span class="metric-value">${productivity}%</span>
            <span class="metric-label">Produktivitas</span>
          </div>
        </div>
      </div>
    `
    })
    .join("")
}

// Notification functions
function toggleNotifications() {
  console.log("toggleNotifications called")

  // Remove existing panel if it exists
  const existingPanel = document.getElementById("notificationPanel")
  if (existingPanel) {
    console.log("Removing existing panel")
    existingPanel.classList.remove("show")
    setTimeout(() => {
      existingPanel.remove()
    }, 300)
    return
  }

  // Create new panel
  console.log("Creating new notification panel")
  createNotificationPanel()
}

function createNotificationPanel() {
  console.log("Creating notification panel with", notifications.length, "notifications")

  const panel = document.createElement("div")
  panel.className = "notification-panel"
  panel.id = "notificationPanel"

  panel.innerHTML = `
    <div class="notification-header">
      <h3>Notifikasi</h3>
      <button class="mark-all-read">Tandai Semua Dibaca</button>
    </div>
    <div class="notification-list">
      ${
        notifications.length > 0
          ? notifications
              .map(
                (notification) => `
        <div class="notification-item ${notification.read ? "read" : "unread"}" data-id="${notification.id}">
          <div class="notification-icon ${notification.type}">
            <i class="fas ${getNotificationIcon(notification.type)}"></i>
          </div>
          <div class="notification-content">
            <h4>${notification.title}</h4>
            <p>${notification.message}</p>
            <span class="notification-time">${formatNotificationTime(notification.date)}</span>
          </div>
          ${!notification.read ? '<div class="unread-dot"></div>' : ""}
        </div>
      `,
              )
              .join("")
          : '<div class="no-notifications"><p>Tidak ada notifikasi</p></div>'
      }
    </div>
  `

  document.body.appendChild(panel)
  console.log("Panel added to body")

  // Show panel with animation
  setTimeout(() => {
    panel.classList.add("show")
    console.log("Panel shown")
  }, 10)

  // Close panel when clicking outside
  const closeHandler = (e) => {
    if (!panel.contains(e.target) && !e.target.closest(".notification-icon")) {
      console.log("Clicking outside, closing panel")
      panel.classList.remove("show")
      setTimeout(() => {
        panel.remove()
        document.removeEventListener("click", closeHandler)
      }, 300)
    }
  }

  // Add delay before enabling outside click
  setTimeout(() => {
    document.addEventListener("click", closeHandler)
  }, 100)

  // Mark all as read button
  const markAllReadBtn = panel.querySelector(".mark-all-read")
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      markAllNotificationsRead()
    })
  }

  // Mark individual notifications as read when clicked
  const notificationItems = panel.querySelectorAll(".notification-item")
  notificationItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation()
      const notificationId = Number.parseInt(item.getAttribute("data-id"))
      markNotificationRead(notificationId)
      item.classList.add("read")
      item.classList.remove("unread")
      const unreadDot = item.querySelector(".unread-dot")
      if (unreadDot) unreadDot.remove()
      updateNotificationBadge()
    })
  })
}

function getNotificationIcon(type) {
  switch (type) {
    case "success":
      return "fa-check-circle"
    case "warning":
      return "fa-exclamation-triangle"
    case "error":
      return "fa-times-circle"
    default:
      return "fa-info-circle"
  }
}

function formatNotificationTime(date) {
  // Pastikan date adalah objek Date
  const notificationDate = date instanceof Date ? date : new Date(date)

  // Validasi apakah date valid
  if (isNaN(notificationDate.getTime())) {
    return "Waktu tidak valid"
  }

  const now = new Date()
  const diff = now - notificationDate
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Baru saja"
  if (minutes < 60) return `${minutes} menit yang lalu`
  if (hours < 24) return `${hours} jam yang lalu`
  if (days < 7) return `${days} hari yang lalu`

  return notificationDate.toLocaleDateString("id-ID")
}

function markAllNotificationsRead() {
  notifications.forEach((notification) => {
    notification.read = true
  })

  updateNotificationBadge()

  // Update UI
  const notificationItems = document.querySelectorAll(".notification-item")
  notificationItems.forEach((item) => {
    item.classList.add("read")
    item.classList.remove("unread")
    const unreadDot = item.querySelector(".unread-dot")
    if (unreadDot) unreadDot.remove()
  })

  showAlert("Semua notifikasi telah ditandai sebagai dibaca", "success")
}

function markNotificationRead(notificationId) {
  const notification = notifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

function updateNotificationBadge() {
  const unreadCount = notifications.filter((n) => !n.read).length

  // Update notification badges
  const notificationIcons = document.querySelectorAll(".notification-icon")
  notificationIcons.forEach((icon) => {
    // Remove existing badge
    const existingBadge = icon.querySelector(".notification-badge")
    if (existingBadge) {
      existingBadge.remove()
    }

    // Add new badge if there are unread notifications
    if (unreadCount > 0) {
      const badge = document.createElement("span")
      badge.className = "notification-badge"
      badge.textContent = unreadCount > 9 ? "9+" : unreadCount.toString()
      icon.appendChild(badge)
    }
  })
}

// Settings functions
function handleSetting(settingType) {
  switch (settingType) {
    case "notifications":
      showNotificationSettings()
      break
    case "password":
      showPasswordChangeModal()
      break
    case "language":
      showLanguageSettings()
      break
    case "help":
      showHelpModal()
      break
    default:
      showAlert("Pengaturan akan segera tersedia", "info")
  }
}

function showNotificationSettings() {
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.id = "notificationSettingsModal"

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Pengaturan Notifikasi</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="setting-group">
          <div class="setting-item-toggle">
            <span>Notifikasi Jadwal Baru</span>
            <label class="toggle">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item-toggle">
            <span>Notifikasi Tukar Shift</span>
            <label class="toggle">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item-toggle">
            <span>Pengingat Shift</span>
            <label class="toggle">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item-toggle">
            <span>Notifikasi Email</span>
            <label class="toggle">
              <input type="checkbox">
              <span class="slider"></span>
            </label>
          </div>
        </div>
        <button class="btn-primary save-settings">Simpan Pengaturan</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add("show")
  }, 10)

  // Close modal on click outside or close button
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close-modal")) {
      closeModal(modal)
    }
  })

  // Save settings
  const saveBtn = modal.querySelector(".save-settings")
  saveBtn.addEventListener("click", () => {
    showAlert("Pengaturan notifikasi berhasil disimpan", "success")
    closeModal(modal)
  })
}

function showPasswordChangeModal() {
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.id = "passwordChangeModal"

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Ubah Password</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="passwordChangeForm">
          <div class="form-group">
            <label for="currentPassword">Password Saat Ini</label>
            <input type="password" id="currentPassword" required>
          </div>
          <div class="form-group">
            <label for="newPassword">Password Baru</label>
            <input type="password" id="newPassword" minlength="6" required>
          </div>
          <div class="form-group">
            <label for="confirmPassword">Konfirmasi Password Baru</label>
            <input type="password" id="confirmPassword" minlength="6" required>
          </div>
          <button type="submit" class="btn-primary">Ubah Password</button>
        </form>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add("show")
  }, 10)

  // Close modal on click outside or close button
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close-modal")) {
      closeModal(modal)
    }
  })

  // Handle form submission
  const form = document.getElementById("passwordChangeForm")
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = document.getElementById("newPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value

    if (currentPassword !== "admin") {
      showAlert("Password saat ini salah", "error")
      return
    }

    if (newPassword !== confirmPassword) {
      showAlert("Konfirmasi password tidak cocok", "error")
      return
    }

    // In a real app, this would be sent to a server
    showAlert("Password berhasil diubah", "success")
    closeModal(modal)
  })
}

function showLanguageSettings() {
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.id = "languageSettingsModal"

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Pengaturan Bahasa</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="setting-group">
          <div class="language-option">
            <input type="radio" id="lang-id" name="language" value="id" checked>
            <label for="lang-id">
              <span class="flag">🇮🇩</span>
              <span>Bahasa Indonesia</span>
            </label>
          </div>
          <div class="language-option">
            <input type="radio" id="lang-en" name="language" value="en">
            <label for="lang-en">
              <span class="flag">🇺🇸</span>
              <span>English</span>
            </label>
          </div>
        </div>
        <button class="btn-primary save-language">Simpan Pengaturan</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add("show")
  }, 10)

  // Close modal on click outside or close button
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close-modal")) {
      closeModal(modal)
    }
  })

  // Save language
  const saveBtn = modal.querySelector(".save-language")
  saveBtn.addEventListener("click", () => {
    const selectedLanguage = modal.querySelector('input[name="language"]:checked').value
    showAlert(`Bahasa berhasil diubah ke ${selectedLanguage === "id" ? "Bahasa Indonesia" : "English"}`, "success")
    closeModal(modal)
  })
}

function showHelpModal() {
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.id = "helpModal"

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Bantuan & Dukungan</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="help-section">
          <h4>Kontak Dukungan</h4>
          <div class="contact-info">
            <p><i class="fas fa-phone"></i> <strong>Telepon:</strong> 021-1234-5678</p>
            <p><i class="fas fa-envelope"></i> <strong>Email:</strong> support@lawson.id</p>
            <p><i class="fas fa-clock"></i> <strong>Jam Operasional:</strong> 24/7</p>
          </div>
        </div>
        
        <div class="help-section">
          <h4>FAQ</h4>
          <div class="faq-item">
            <h5>Bagaimana cara mengajukan tukar shift?</h5>
            <p>Klik tombol "Tukar Shift" di dashboard atau pilih tanggal di kalender dan klik "Request Tukar Shift".</p>
          </div>
          <div class="faq-item">
            <h5>Bagaimana cara melihat jadwal karyawan lain?</h5>
            <p>Di halaman Jadwal, gunakan filter "Karyawan" untuk memilih karyawan yang ingin dilihat jadwalnya.</p>
          </div>
          <div class="faq-item">
            <h5>Kapan jadwal bulan depan dipublikasikan?</h5>
            <p>Jadwal biasanya dipublikasikan pada tanggal 25 setiap bulan untuk bulan berikutnya.</p>
          </div>
        </div>
        
        <div class="help-section">
          <h4>Versi Aplikasi</h4>
          <p>LAWSON Premium v2.1.0</p>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add("show")
  }, 10)

  // Close modal on click outside or close button
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close-modal")) {
      closeModal(modal)
    }
  })
}

// Notification system
function showAlert(message, type = "info") {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll(".alert")
  existingAlerts.forEach((alert) => {
    alert.remove()
  })

  // Create alert element
  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.textContent = message

  // Add alert styles if not already added
  if (!document.getElementById("alert-styles")) {
    const style = document.createElement("style")
    style.id = "alert-styles"
    style.textContent = `
            .alert {
                position: fixed;
                top: 1rem;
                left: 50%;
                transform: translateX(-50%);
                padding: 1rem 1.5rem;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                z-index: 1001;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
                animation: slideInDown 0.3s ease-out;
                text-align: center;
                max-width: 90%;
                backdrop-filter: blur(10px);
            }
            
            .alert-success { 
                background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .alert-error { 
                background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .alert-info { 
                background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translate(-50%, -30px);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }
            
            @keyframes slideOutUp {
                from {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -30px);
                }
            }
        `
    document.head.appendChild(style)
  }

  document.body.appendChild(alert)

  // Auto remove after 4 seconds with animation
  setTimeout(() => {
    alert.style.animation = "slideOutUp 0.3s ease-out forwards"
    setTimeout(() => {
      alert.remove()
    }, 300)
  }, 4000)
}

// Additional utility functions
function getCurrentTime() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getCurrentDate() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Initialize tooltips and other interactive elements
function initializeInteractiveElements() {
  // Add hover effects for better UX
  const cards = document.querySelectorAll(".card")
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-4px)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
    })
  })
}

function loadEmployees() {
  console.log("Employees tab loaded")
  const employeesGrid = document.getElementById("employeesGrid")
  if (!employeesGrid) return

  // Clear existing content
  employeesGrid.innerHTML = ""

  // Update badge count
  const employeesBadge = document.querySelector("#employeesTab .card-header .badge")
  if (employeesBadge) {
    employeesBadge.textContent = `${employees.length} Karyawan`
  }

  // Create employee cards
  employees.forEach((employee) => {
    const employeeCard = document.createElement("div")
    employeeCard.className = "employee-card"

    // Determine avatar background color based on gender
    const avatarClass = employee.gender === "female" ? "avatar-female" : "avatar-male"

    employeeCard.innerHTML = `
      <div class="employee-header">
        <div class="avatar ${avatarClass}">${employee.avatar}</div>
        <div class="employee-info">
          <h4>${employee.name}</h4>
          <p>${employee.position}</p>
        </div>
      </div>
      <div class="employee-details">
        <div class="detail-row">
          <span>ID Karyawan:</span>
          <span>${employee.id}</span>
        </div>
        <div class="detail-row">
          <span>Departemen:</span>
          <span>${employee.department}</span>
        </div>
        <div class="detail-row">
          <span>Bergabung:</span>
          <span>${employee.joinDate}</span>
        </div>
        <div class="detail-row">
          <span>Rating:</span>
          <span>⭐ ${employee.performance?.rating || 4.5}/5.0</span>
        </div>
      </div>
      <div class="employee-actions">
        <button class="btn-outline" onclick="showEmployeeSchedule('${employee.id}')">
          <i class="fas fa-calendar"></i> Lihat Jadwal
        </button>
        <button class="btn-outline" onclick="showEmployeeDetails('${employee.id}')">
          <i class="fas fa-id-card"></i> Detail
        </button>
      </div>
    `

    employeesGrid.appendChild(employeeCard)
  })
}

// Add this function to show employee details
function showEmployeeDetails(employeeId) {
  const employee = employees.find((emp) => emp.id === employeeId)
  if (!employee) return

  const modal = document.createElement("div")
  modal.className = "modal"
  modal.id = "employeeDetailsModal"

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Detail Karyawan</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="employee-profile">
          <div class="profile-header">
            <div class="avatar large ${employee.gender === "female" ? "avatar-female" : "avatar-male"}">${employee.avatar}</div>
            <h3>${employee.name}</h3>
            <p>ID Karyawan: ${employee.id}</p>
            <div class="location">
              <i class="fas fa-map-marker-alt"></i>
              ${employee.store}
            </div>
          </div>
          
          <div class="profile-info">
            <div class="info-row">
              <span>Posisi Jabatan</span>
              <span>${employee.position}</span>
            </div>
            <div class="info-row">
              <span>Departemen</span>
              <span>${employee.department}</span>
            </div>
            <div class="info-row">
              <span>Tanggal Bergabung</span>
              <span>${employee.joinDate}</span>
            </div>
            <div class="info-row">
              <span>Status Karyawan</span>
              <div class="badge active">${employee.status}</div>
            </div>
            <div class="info-row">
              <span>Jam Kerja/Minggu</span>
              <span>40 Jam</span>
            </div>
            <div class="info-row">
              <span>Rating Performa</span>
              <span>⭐⭐⭐⭐⭐ (${employee.performance?.rating || 4.5}/5.0)</span>
            </div>
            <div class="info-row">
              <span>Email</span>
              <span>${employee.contact?.email || "-"}</span>
            </div>
            <div class="info-row">
              <span>Telepon</span>
              <span>${employee.contact?.phone || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add("show")
  }, 10)

  // Close modal on click outside or close button
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close-modal")) {
      closeModal(modal)
    }
  })
}
