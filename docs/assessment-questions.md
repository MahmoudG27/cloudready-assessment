# CloudReady Assessment — Questions

## Overview

15 questions across 5 sections + 1 optional question.
Score is calculated on the frontend before sending to the API.

---

## Section 1: Company Profile

**Q1.** What is your company's primary industry?
- Retail
- Healthcare
- Fintech
- SaaS
- Manufacturing
- Other

**Q2.** How many employees does your company have?
- 1–10
- 11–50
- 51–200
- 200+

**Q3.** Do you have a dedicated IT team?
- Yes, a full IT team
- Yes, 1–2 IT personnel
- No in-house IT team

---

## Section 2: Current Infrastructure

**Q4.** Where is your current IT infrastructure hosted?
- On-premises (own servers)
- Third-party hosting
- Partially on cloud (hybrid)
- No existing infrastructure

**Q5.** How would you describe the age of your infrastructure?
- Less than 2 years
- 2–5 years
- More than 5 years
- Not sure

**Q6.** Which Microsoft technologies are you currently using?
- Microsoft 365
- Windows Server
- Both
- None

---

## Section 3: Applications & Workloads

**Q7.** Which of the following systems do you currently use? *(multi-select)*
- ERP system
- CRM system
- Company website
- Email server
- File storage
- Custom-built applications

**Q8.** How critical is application downtime to your business operations?
- Mission-critical (no downtime acceptable)
- Moderate (a few hours acceptable)
- Low impact

**Q9.** Are you planning to develop new applications in the near future?
- Yes
- No
- Not sure

---

## Section 4: Security & Compliance

**Q10.** Do you handle sensitive customer data (e.g., financial, medical, personal)?
- Yes
- No
- Not sure

**Q11.** Have you experienced any security incidents in the past 2 years?
- Yes
- No
- Prefer not to say

**Q12.** Do you have regulatory or compliance requirements?
- Yes (e.g., GDPR, ISO)
- No
- Not sure

**Q12b.** *(Optional)* Do you currently have a backup or disaster recovery solution?
- Yes, fully implemented
- Partial solution
- No
- Not sure

---

## Section 5: Budget & Timeline

**Q13.** What is your estimated monthly budget for cloud services?
- Less than $500
- $500 – $2,000
- $2,000 – $5,000
- More than $5,000

**Q14.** When are you planning to start your cloud adoption journey?
- Immediately
- Within 3 months
- Within 6 months
- Just exploring

**Q15.** What is your primary objective for moving to the cloud?
- Cost optimization
- Security improvement
- Scalability
- Remote work enablement
- All of the above

---

## Scoring Logic

Score is calculated on the frontend. Each answer maps to a point value.
Total score is out of 100, broken into 3 categories:

| Category | Weight | Questions |
|---|---|---|
| Infrastructure | 40% | Q4, Q5, Q6, Q12b |
| Security | 35% | Q10, Q11, Q12 |
| Team Readiness | 25% | Q3, Q9 |

### Readiness Levels

| Score | Level |
|---|---|
| 0 – 40 | Beginner |
| 41 – 70 | Developing |
| 71 – 100 | Advanced |