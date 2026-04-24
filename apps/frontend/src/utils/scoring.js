// src/utils/scoring.ts
export function calculateScore(answers) {
    let infrastructure = 0;
    let security = 0;
    let teamReadiness = 0;
    // ===== Infrastructure (40%) =====
    // Q4 - Where is infrastructure hosted?
    const infraMap = {
        "no existing infrastructure": 100,
        "partially on cloud (hybrid)": 80,
        "third-party hosting": 50,
        "on-premises (own servers)": 30,
    };
    infrastructure += infraMap[answers.infrastructure.toLowerCase()] ?? 40;
    // Q5 - Age of infrastructure
    const ageMap = {
        "less than 2 years": 100,
        "2-5 years": 70,
        "more than 5 years": 30,
        "not sure": 40,
    };
    infrastructure += ageMap[answers.infraAge.toLowerCase()] ?? 40;
    // Q6 - Microsoft products
    const msMap = {
        "both": 100,
        "microsoft 365": 80,
        "windows server": 60,
        "none": 20,
    };
    infrastructure += msMap[answers.microsoftProducts.toLowerCase()] ?? 40;
    // Q12b - Backup solution
    const backupMap = {
        "yes, fully implemented": 100,
        "partial solution": 60,
        "no": 0,
        "not sure": 20,
    };
    infrastructure += backupMap[answers.backupSolution.toLowerCase()] ?? 20;
    infrastructure = Math.round(infrastructure / 4);
    // ===== Security (35%) =====
    // Q10 - Sensitive data
    const sensitiveMap = {
        "no": 100,
        "not sure": 60,
        "yes": 30,
    };
    security += sensitiveMap[answers.sensitiveData.toLowerCase()] ?? 50;
    // Q11 - Security incidents
    const incidentsMap = {
        "no": 100,
        "prefer not to say": 50,
        "yes": 10,
    };
    security += incidentsMap[answers.securityIncidents.toLowerCase()] ?? 50;
    // Q12 - Compliance
    const complianceMap = {
        "yes (e.g., gdpr, iso)": 80,
        "not sure": 40,
        "no": 60,
    };
    security += complianceMap[answers.compliance.toLowerCase()] ?? 40;
    security = Math.round(security / 3);
    // ===== Team Readiness (25%) =====
    // Q3 - IT team
    const itTeamMap = {
        "yes, a full it team": 100,
        "yes, 1-2 it personnel": 60,
        "no in-house it team": 10,
    };
    teamReadiness += itTeamMap[answers.itTeam.toLowerCase()] ?? 40;
    // Q9 - New apps
    const newAppsMap = {
        "yes": 80,
        "not sure": 50,
        "no": 30,
    };
    teamReadiness += newAppsMap[answers.newApps.toLowerCase()] ?? 40;
    teamReadiness = Math.round(teamReadiness / 2);
    // ===== Total =====
    const total = Math.round(infrastructure * 0.4 +
        security * 0.35 +
        teamReadiness * 0.25);
    return { total, infrastructure, security, teamReadiness };
}
