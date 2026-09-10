package com.careflow.service;

import com.careflow.dto.*;
import com.careflow.entity.Patient;
import com.careflow.entity.enums.FollowUpStatus;
import com.careflow.entity.enums.Role;
import com.careflow.entity.enums.TaskStatus;
import com.careflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private FollowUpRepository followUpRepository;

    @Autowired
    private AIAnalysisRepository aiAnalysisRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientService patientService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private FollowUpService followUpService;

    public DashboardDto getDashboardMetrics() {
        return getAdminDashboard("Admin");
    }

    public DashboardDto getDashboardForRole(String userName, String userRole) {
        if (userRole == null) {
            return getAdminDashboard("Admin");
        }
        switch (userRole) {
            case "ADMIN":
                return getAdminDashboard(userName);
            case "DOCTOR":
                return getDoctorDashboard(userName);
            case "NURSE":
            case "STAFF":
                return getNurseDashboard(userName);
            default:
                return getAdminDashboard(userName);
        }
    }

    private DashboardDto getAdminDashboard(String userName) {
        DashboardDto dto = new DashboardDto();
        dto.setDashboardType("ADMIN");
        dto.setUserName(userName);
        dto.setUserRole("ADMIN");

        dto.setTotalPatients(patientRepository.count());
        dto.setPendingTasks(taskRepository.countByStatus(TaskStatus.PENDING));
        dto.setCompletedTasks(taskRepository.countByStatus(TaskStatus.COMPLETED));
        dto.setInProgressTasks(taskRepository.countByStatus(TaskStatus.IN_PROGRESS));

        dto.setFollowUpsToday(followUpRepository.countByScheduledDate(LocalDate.now())
                + followUpRepository.countByStatus(FollowUpStatus.DUE_TODAY));
        dto.setAiAnalysesCount(aiAnalysisRepository.count());

        // Staff metrics
        dto.setTotalStaff(userRepository.count());
        dto.setDoctorCount(userRepository.countByRole(Role.DOCTOR));
        dto.setNurseCount(userRepository.countByRole(Role.NURSE));

        // Staff list
        dto.setStaffList(userRepository.findAll().stream()
                .map(UserDto::new)
                .collect(Collectors.toList()));

        dto.setRecentPatients(patientService.getAllPatients().stream()
                .limit(5).collect(Collectors.toList()));

        dto.setPendingTaskList(taskService.getAllTasks().stream()
                .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS)
                .limit(10).collect(Collectors.toList()));

        dto.setUpcomingFollowUps(followUpService.getAllFollowUps().stream()
                .filter(f -> f.getStatus() != FollowUpStatus.COMPLETED)
                .limit(5).collect(Collectors.toList()));

        return dto;
    }

    private DashboardDto getDoctorDashboard(String userName) {
        DashboardDto dto = new DashboardDto();
        dto.setDashboardType("DOCTOR");
        dto.setUserName(userName);
        dto.setUserRole("DOCTOR");

        // Doctor's assigned patients
        List<Patient> myPatients = patientRepository.findByDoctor(userName);
        List<Long> myPatientIds = myPatients.stream().map(Patient::getId).collect(Collectors.toList());

        dto.setTotalPatients(myPatients.size());

        if (!myPatientIds.isEmpty()) {
            dto.setPendingTasks(taskRepository.countByStatusAndPatientIdIn(TaskStatus.PENDING, myPatientIds));
            dto.setCompletedTasks(taskRepository.countByStatusAndPatientIdIn(TaskStatus.COMPLETED, myPatientIds));
            dto.setInProgressTasks(taskRepository.countByStatusAndPatientIdIn(TaskStatus.IN_PROGRESS, myPatientIds));
        } else {
            dto.setPendingTasks(0);
            dto.setCompletedTasks(0);
            dto.setInProgressTasks(0);
        }

        // Doctor's follow-ups
        dto.setFollowUpsToday(followUpRepository.countByScheduledDateAndDoctor(LocalDate.now(), userName)
                + followUpRepository.countByStatusAndDoctor(FollowUpStatus.DUE_TODAY, userName));

        dto.setAiAnalysesCount(aiAnalysisRepository.count());

        dto.setRecentPatients(myPatients.stream()
                .map(p -> patientService.convertToDto(p))
                .limit(5).collect(Collectors.toList()));

        if (!myPatientIds.isEmpty()) {
            dto.setPendingTaskList(taskRepository.findByPatientIdIn(myPatientIds).stream()
                    .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS)
                    .map(t -> taskService.convertToDto(t))
                    .limit(10).collect(Collectors.toList()));
        } else {
            dto.setPendingTaskList(Collections.emptyList());
        }

        dto.setUpcomingFollowUps(followUpRepository.findByDoctor(userName).stream()
                .filter(f -> f.getStatus() != FollowUpStatus.COMPLETED)
                .map(f -> followUpService.convertToDto(f))
                .limit(5).collect(Collectors.toList()));

        return dto;
    }

    private DashboardDto getNurseDashboard(String userName) {
        DashboardDto dto = new DashboardDto();
        dto.setDashboardType("NURSE");
        dto.setUserName(userName);
        dto.setUserRole("NURSE");

        // Nurse's assigned tasks
        dto.setPendingTasks(taskRepository.countByStatusAndAssignedTo(TaskStatus.PENDING, userName));
        dto.setCompletedTasks(taskRepository.countByStatusAndAssignedTo(TaskStatus.COMPLETED, userName));
        dto.setInProgressTasks(taskRepository.countByStatusAndAssignedTo(TaskStatus.IN_PROGRESS, userName));

        // Get patient IDs from nurse's tasks to show assigned patients
        List<Long> taskPatientIds = taskRepository.findByAssignedTo(userName).stream()
                .map(com.careflow.entity.Task::getPatientId)
                .distinct()
                .collect(Collectors.toList());

        dto.setTotalPatients(taskPatientIds.size());

        if (!taskPatientIds.isEmpty()) {
            dto.setRecentPatients(taskPatientIds.stream()
                    .map(pid -> patientRepository.findById(pid).orElse(null))
                    .filter(p -> p != null)
                    .map(p -> patientService.convertToDto(p))
                    .limit(5).collect(Collectors.toList()));

            dto.setFollowUpsToday(followUpRepository.countByScheduledDateAndPatientIdIn(LocalDate.now(), taskPatientIds)
                    + followUpRepository.countByStatusAndPatientIdIn(FollowUpStatus.DUE_TODAY, taskPatientIds));

            dto.setUpcomingFollowUps(followUpRepository.findByPatientIdIn(taskPatientIds).stream()
                    .filter(f -> f.getStatus() != FollowUpStatus.COMPLETED)
                    .map(f -> followUpService.convertToDto(f))
                    .limit(5).collect(Collectors.toList()));
        } else {
            dto.setRecentPatients(Collections.emptyList());
            dto.setUpcomingFollowUps(Collections.emptyList());
        }

        dto.setPendingTaskList(taskRepository.findByAssignedTo(userName).stream()
                .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS)
                .map(t -> taskService.convertToDto(t))
                .limit(10).collect(Collectors.toList()));

        dto.setAiAnalysesCount(0);

        return dto;
    }
}
