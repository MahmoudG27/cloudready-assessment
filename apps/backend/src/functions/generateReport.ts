import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainer } from "../lib/cosmosClient";
import { generateReportFromAI } from "../lib/openaiClient";
import { AssessmentDocument, ReportData } from "../types/assessment";
import { ApiResponse } from "../types/api";

async function generateReport(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("generateReport called");

  const id = request.params.id;
  const userId = request.headers.get("x-user-id") ?? "anonymous";
  const container = getContainer();

  try {
    // 1. Get assessment from Cosmos DB
    const { resource: document } = await container
      .item(id, userId)
      .read<AssessmentDocument>();

    if (!document) {
      return {
        status: 404,
        jsonBody: {
          success: false,
          data: null,
          error: "Assessment not found"
        } as ApiResponse<null>
      };
    }

    // 2. Update status to "generating"
    await container.items.upsert({
      ...document,
      status: "generating",
      updatedAt: new Date().toISOString()
    });

    // 3. Call OpenAI
    context.log("Score being sent to AI:", JSON.stringify((document as any).score));
    const reportData = await generateReportFromAI(
      document.answers,
      (document as any).score ?? {
        total: 0,
        infrastructure: 0,
        security: 0,
        teamReadiness: 0
      }
    ) as ReportData;
    context.log("Score from AI:", JSON.stringify(reportData.readinessScore));
    context.log("AI Response structure:", JSON.stringify(Object.keys(reportData)));

    // 4. Build UI layer
    const topRisk = reportData.riskAssessment?.find(r => r.level === "High");
    const scoreTotal = reportData.readinessScore?.total ?? 0;

    const uiVerdict = scoreTotal < 60
      ? `${document.companyName} is not cloud ready — critical gaps detected`
      : scoreTotal < 75
      ? `${document.companyName} is partially cloud ready — improvements needed`
      : `${document.companyName} is cloud ready — migration can begin`;

    const ctaPrimary = scoreTotal < 60
      ? "Start your pilot migration plan"
      : scoreTotal < 75
      ? "Request detailed architecture"
      : "Start full migration";

    // 5. Save completed report
    const now = new Date().toISOString();
    await container.items.upsert({
      ...document,
      status: "completed",
      updatedAt: now,
      meta: {
        ...document.meta,
        generatedAt: now,
        confidenceScore: 82
      },
      insights: {
        topRisk: topRisk?.risk ?? "",
        topOpportunity: "Azure migration",
        priority: reportData.riskAssessment[0]?.level.toLowerCase() ?? "medium",
        level: reportData.readinessScore.level
      },
      report: {
        data: reportData,
        ui: {
          hero: {
            verdict: uiVerdict,
            subtext: `Your score is ${scoreTotal}/100`,
            ctaPrimary,
            ctaSecondary: "Fix critical security gaps"
          },
          highlights: [
            reportData.keyFindings.find(f => f.type === "risk")?.text ?? "",
            reportData.keyFindings.find(f => f.type === "strength")?.text ?? ""
          ],
          labels: {
            scoreLevel: reportData.readinessScore.level,
            topRiskBadge: topRisk?.risk ?? "",
            industryBenchmark: reportData.cloudMaturityPosition
          }
        }
      },
      error: {
        message: null,
        code: null,
        retryable: null,
        retryCount: 0,
        failedAt: null
      }
    });

    context.log(`Report generated: ${id}`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: { id, status: "completed" },
        error: null
      } as ApiResponse<{ id: string; status: string }>
    };

  } catch (error) {
    context.error(error);

    // Update status to failed
    try {
      const { resource: document } = await container
        .item(id, userId)
        .read<AssessmentDocument>();

      if (document) {
        await container.items.upsert({
          ...document,
          status: "failed",
          updatedAt: new Date().toISOString(),
          error: {
            message: error instanceof Error ? error.message : "Unknown error",
            code: "GENERATION_FAILED",
            retryable: true,
            retryCount: document.error.retryCount + 1,
            failedAt: new Date().toISOString()
          }
        });
      }
    } catch (updateError) {
      context.error(updateError);
    }

    return {
      status: 500,
      jsonBody: {
        success: false,
        data: null,
        error: "Failed to generate report"
      } as ApiResponse<null>
    };
  }
}

app.http("generateReport", {
  methods: ["POST"],
  authLevel: "function",
  route: "assessment/{id}/generate",
  handler: generateReport
});