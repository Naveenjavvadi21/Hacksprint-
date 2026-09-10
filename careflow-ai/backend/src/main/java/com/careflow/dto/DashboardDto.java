package com.careflow.dto;

import java.util.List;

public class DashboardDto {
    private long totalPatients;
    private long pendingTasks;
    private long completedTasks;
    private long inProgressTasks;
    private long followUpsToday;
    private long aiAnalysesCount;

    // Role context
    private String dashboardType;  // ADMIN, DOCTOR, NURSE, COORDINATOR
    private String userName;
    private String userRole;

    // Staff metrics (admin only)
    private long totalStaff;
    private long doctorCount;
    private long nurseCount;
    private long coordinatorCount;

    private List<PatientDto> recentPatients;
    private List<TaskDto> pendingTaskList;
    private List<FollowUpDto> upcomingFollowUps;
    private List<UserDto> staffList;  // admin only

    public DashboardDto() {}

    public DashboardDto(long totalPatients, long pendingTasks, long completedTasks, long followUpsToday, long aiAnalysesCount, List<PatientDto> recentPatients, List<TaskDto> pendingTaskList, List<FollowUpDto> upcomingFollowUps) {
        this.totalPatients = totalPatients;
        this.pendingTasks = pendingTasks;
        this.completedTasks = completedTasks;
        this.followUpsToday = followUpsToday;
        this.aiAnalysesCount = aiAnalysesCount;
        this.recentPatients = recentPatients;
        this.pendingTaskList = pendingTaskList;
        this.upcomingFollowUps = upcomingFollowUps;
    }

    public long getTotalPatients() { return totalPatients; }
    public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }

    public long getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(long pendingTasks) { this.pendingTasks = pendingTasks; }

    public long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(long completedTasks) { this.completedTasks = completedTasks; }

    public long getInProgressTasks() { return inProgressTasks; }
    public void setInProgressTasks(long inProgressTasks) { this.inProgressTasks = inProgressTasks; }

    public long getFollowUpsToday() { return followUpsToday; }
    public void setFollowUpsToday(long followUpsToday) { this.followUpsToday = followUpsToday; }

    public long getAiAnalysesCount() { return aiAnalysesCount; }
    public void setAiAnalysesCount(long aiAnalysesCount) { this.aiAnalysesCount = aiAnalysesCount; }

    public String getDashboardType() { return dashboardType; }
    public void setDashboardType(String dashboardType) { this.dashboardType = dashboardType; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public long getTotalStaff() { return totalStaff; }
    public void setTotalStaff(long totalStaff) { this.totalStaff = totalStaff; }

    public long getDoctorCount() { return doctorCount; }
    public void setDoctorCount(long doctorCount) { this.doctorCount = doctorCount; }

    public long getNurseCount() { return nurseCount; }
    public void setNurseCount(long nurseCount) { this.nurseCount = nurseCount; }

    public long getCoordinatorCount() { return coordinatorCount; }
    public void setCoordinatorCount(long coordinatorCount) { this.coordinatorCount = coordinatorCount; }

    public List<PatientDto> getRecentPatients() { return recentPatients; }
    public void setRecentPatients(List<PatientDto> recentPatients) { this.recentPatients = recentPatients; }

    public List<TaskDto> getPendingTaskList() { return pendingTaskList; }
    public void setPendingTaskList(List<TaskDto> pendingTaskList) { this.pendingTaskList = pendingTaskList; }

    public List<FollowUpDto> getUpcomingFollowUps() { return upcomingFollowUps; }
    public void setUpcomingFollowUps(List<FollowUpDto> upcomingFollowUps) { this.upcomingFollowUps = upcomingFollowUps; }

    public List<UserDto> getStaffList() { return staffList; }
    public void setStaffList(List<UserDto> staffList) { this.staffList = staffList; }
}
