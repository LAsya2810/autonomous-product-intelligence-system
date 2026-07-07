import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from knowledge import ingest_text_document, CATEGORIES

SAMPLES = [
    {
        "category": "Support Tickets",
        "title": "Invoice export fails for enterprise accounts",
        "content": "Customer ticket 4821 reported that exporting invoices as CSV from the admin portal fails after selecting a date range longer than 90 days. The user repeatedly mentioned the same problem across three separate messages and said the failure blocks month-end reporting. The support team observed the same error pattern in our internal logs and linked it to a stale export job configuration. The recurring complaint was that the export button appears to work, but the file never downloads after the request is submitted.",
    },
    {
        "category": "Support Tickets",
        "title": "Mobile notifications arrive late at night",
        "content": "A recurring complaint from the mobile app users is that notifications for approvals arrive with a delay of several minutes, especially during high-traffic periods. The support queue has seen this issue in tickets from sales, finance, and operations teams. The team also noted that the app requests permission to send notifications at onboarding, but users often dismiss the prompt and later ask why no alerts appear. The suggested fix is to add a reminder banner inside the app and improve mobile push reliability.",
    },
    {
        "category": "Support Tickets",
        "title": "Search filters reset after page refresh",
        "content": "Customers are frustrated that saved search filters disappear after the page refreshes. The issue appears most often when users apply multiple facet filters and then navigate away from the search results view. Support teams have seen this on both desktop and tablet devices. The bug seems tied to the persisted search state and is being tracked alongside a ticket that mentions the need for a clearer filter summary panel.",
    },
    {
        "category": "Meeting Notes",
        "title": "Product sync with operations team",
        "content": "During the weekly product sync, the operations lead highlighted that the team needs a better way to see release readiness across support and services. The discussion covered the idea of a dedicated launch checklist, improving the handoff between engineering and customer success, and tracking known issues from support tickets. We also agreed to add a feature request for a consolidated dashboard that combines customer health and incident trends.",
    },
    {
        "category": "Meeting Notes",
        "title": "Roadmap planning for analytics improvements",
        "content": "The roadmap review mentioned that analytics and reporting should surface the top recurring support complaints and link them to the ongoing roadmap. The team discussed making the AI analyst more transparent by showing evidence from tickets, release notes, and PRDs. There was also interest in highlighting the most common escalation patterns so the PM team can triage the work before it becomes a customer issue.",
    },
    {
        "category": "PRDs",
        "title": "PRD: AI analyst evidence panel",
        "content": "This PRD proposes an evidence panel in the AI analyst experience that groups supporting material from support tickets, meeting notes, PRDs, and release notes. The goal is to make every recommendation traceable and easier for product managers to review before acting. The feature should surface recurring themes, define confidence levels, and allow users to filter evidence by product area or customer segment. The design includes a summary card, related evidence list, and a citation view for each insight.",
    },
    {
        "category": "PRDs",
        "title": "PRD: unified release readiness workspace",
        "content": "The unified release readiness workspace will aggregate feature requests, launch blockers, and release notes into a single view. The workspace should help stakeholders understand whether a release is at risk and what evidence exists for outstanding issues. Users will be able to sort by severity, region, or customer tier. The first milestone includes support ticket trends, a simple timeline, and an export action for executive summaries.",
    },
    {
        "category": "Feature Requests",
        "title": "Request: saved dashboards for weekly summaries",
        "content": "Several customers asked for a saved dashboard that provides a weekly summary of support impact, release readiness, and open escalations. The request appears across several feature requests and has recurring language around wanting a one-click view for leadership. The proposed solution is a templated dashboard that can be pinned to the home page and shared with a team.",
    },
    {
        "category": "Feature Requests",
        "title": "Request: export to PowerPoint",
        "content": "The product team has received repeated requests for an export flow that turns analytics snapshots into a PowerPoint-ready summary. This would help field teams share progress and customer narratives in meetings. The feature request also mentions that the current CSV export is useful, but not enough for executive reviews.",
    },
    {
        "category": "Release Notes",
        "title": "Release note: improved search performance",
        "content": "The latest release improves search speed across the knowledge base and analytics experience. The update reduces empty-state noise and makes filters more resilient when a user changes facets quickly. It also improves the logging around failed searches so support teams can better understand recurring friction. This release is tied to a cluster of support tickets about search behavior and a related feature request for saved views.",
    },
    {
        "category": "Release Notes",
        "title": "Release note: onboarding reminder banners",
        "content": "We shipped onboarding reminder banners for new users who have not completed key setup steps. The reminder appears when the user first opens the app after a missed notification permission prompt. This change addresses recurring support tickets related to delayed mobile notifications and helps users discover the configuration path before they open a support case.",
    },
    {
        "category": "Support Tickets",
        "title": "Dark mode request during evening work",
        "content": "An increasing number of support tickets mention that customers prefer dark mode when reviewing long reports after hours. The requests describe the current UI as harsh on the eyes and say the experience is especially difficult during late-night support review. This issue overlaps with a feature request for a more customizable workspace and a meeting note about product accessibility improvements.",
    },
    {
        "category": "Support Tickets",
        "title": "Analytics dashboard columns feel crowded",
        "content": "Users continue to flag that the analytics dashboard feels crowded when multiple widgets are enabled. The complaint is that the current layout makes it hard to find the most important KPIs quickly, especially in the weekly review view. Support notes connect this pattern to the feature request for saved dashboards and the PRD for more focused summaries.",
    },
    {
        "category": "Meeting Notes",
        "title": "Customer success review of recurring complaints",
        "content": "During the latest customer success review, the team discussed the repeated complaints about delayed notifications, export issues, and the confusing search filters. The meeting notes call for a stronger feedback loop from support to product and suggest that release notes should mention which recurring issues the team is tackling next. The group wants the AI analyst to summarize themes from support tickets and release notes in one place.",
    },
    {
        "category": "Meeting Notes",
        "title": "Design review for evidence-backed recommendations",
        "content": "The design review focused on how to make AI recommendations more trustworthy. The discussion centered on showing evidence from ticket history, PRDs, and meeting notes before a recommendation is surfaced. The team also discussed making it easier to collapse and expand evidence sources so the product experience stays compact while still answering questions with context.",
    },
    {
        "category": "PRDs",
        "title": "PRD: recurring issue clustering",
        "content": "The recurring issue clustering feature will identify repeated complaints across support tickets and surface them as themes in a dedicated panel. This capability will tie into the AI analyst so users can see the trend over time and review related evidence objects. Each cluster will include a summary, representative examples, and links to related release notes and feature requests.",
    },
    {
        "category": "PRDs",
        "title": "PRD: workspace customization",
        "content": "This PRD outlines a workspace customization experience that lets users choose preferred widgets, hide less relevant sections, and save their layout for later. The proposal is informed by support tickets about cluttered analytics views, early requests for dashboard personalization, and meeting notes around making the experience easier to navigate during weekly reviews.",
    },
    {
        "category": "Feature Requests",
        "title": "Request: earlier notification previews",
        "content": "A cluster of feature requests asks for an earlier notification preview before a user is fully onboarded. The rationale is that people need to understand the value of notifications before they dismiss the prompt. This request also overlaps with the release note around reminder banners and support tickets that mention delayed notifications.",
    },
    {
        "category": "Feature Requests",
        "title": "Request: clearer incident summaries",
        "content": "Customers and internal teams want a clearer incident summary during service outages, especially one that groups relevant release notes and customer-impacting events. The ask is to make the information easier to scan and share with leadership, and several notes point to the same need for a more polished executive summary export.",
    },
    {
        "category": "Release Notes",
        "title": "Release note: support context in AI analyst",
        "content": "This release adds support context to the AI analyst so insights can reference the most relevant ticket themes, recurring complaints, and recent release notes. The feature is intended to improve trust and reduce time spent hunting for evidence across the product suite. It has strong overlap with the PRD for evidence panels and the meeting notes about transparency.",
    },
    {
        "category": "Release Notes",
        "title": "Release note: saved view reliability",
        "content": "We improved the reliability of saved views for dashboards and analytics pages. The update fixes a class of cache and persistence issues that caused some users to lose their filters after refresh. It also reduces the chance of empty dashboards when users return to a previous session, which has been a recurring theme in support tickets and feature requests.",
    },
    {
        "category": "Support Tickets",
        "title": "CSV export includes empty rows",
        "content": "Several support tickets report that exported CSV files include empty rows and inconsistent column spacing. The customers say the files are still usable, but the formatting is confusing and takes extra cleanup time. The team traced the issue to an edge case in the export formatter and connected it to the broader export quality improvement work noted in release notes.",
    },
    {
        "category": "Support Tickets",
        "title": "Weekly report takes too long to load",
        "content": "Customers report that weekly report pages can take noticeably longer to load when multiple widgets are present. The support queue has seen repeated complaints about delayed report loads and dashboard clutter at the same time. Product and engineering aligned this with the roadmap around analytics performance and a feature request for saved dashboards.",
    },
    {
        "category": "Meeting Notes",
        "title": "Executive summary review",
        "content": "In the executive summary review, the team agreed that the product should better connect support ticket insights to the roadmap. The discussion highlighted the need for a concise executive narrative that combines customer impact, recurring product issues, and planned work. The recommendation was to build a reusable summary template that uses evidence from release notes and support tickets.",
    },
    {
        "category": "Meeting Notes",
        "title": "Infrastructure review of data freshness",
        "content": "The infrastructure review focused on keeping analytics and release data fresh enough for a trustworthy product intelligence experience. The team discussed background refresh timing, caching, and how the platform should present stale data to users. The notes mention that this issue affects both the analytics experience and the AI analyst because they often rely on the same underlying data.",
    },
    {
        "category": "PRDs",
        "title": "PRD: executive summary exports",
        "content": "The executive summary exports feature will support one-click export of product health narratives into a polished PDF or PowerPoint-friendly format. It should summarize support ticket trends, feature request activity, and recent release notes in a concise narrative. The design calls for three templates: executive, operational, and customer-facing.",
    },
    {
        "category": "PRDs",
        "title": "PRD: customer health timeline",
        "content": "The customer health timeline will show the lifecycle of major support issues and product changes over time. The experience will help product managers understand which tickets led to a feature request and which release notes addressed the issue. The timeline is intended to make it easier to see recurring themes without reading each document manually.",
    },
    {
        "category": "Feature Requests",
        "title": "Request: easier sharing of analytics snapshots",
        "content": "Multiple customers have asked for a better way to share analytics snapshots with team members. The ask is to reduce the manual steps required to bring a dashboard into a meeting and make it easier for non-technical users to understand the context. The recurring idea is that sharing should be one click and preserve the same filters the user had applied.",
    },
    {
        "category": "Feature Requests",
        "title": "Request: visible release blockers",
        "content": "The product team has heard repeated requests for visible release blockers inside the roadmap planner. The ask is for a lightweight view that shows whether a release is impacted by support tickets, open incidents, or unresolved feature requests. The team sees this as an extension of the release readiness workspace.",
    },
    {
        "category": "Release Notes",
        "title": "Release note: better incident context",
        "content": "We improved the way incident context is displayed in the product experience. Customers can now see linked support tickets and relevant release notes from the incident view, reducing the need to navigate between tools. This release also improves the confidence score shown next to AI analyst recommendations when related evidence is available.",
    },
]


def main() -> None:
    random.seed(7)
    for index, sample in enumerate(SAMPLES, start=1):
        ingest_text_document(
            text=f"{sample['title']}\n\n{sample['content']}",
            filename=f"sample-{index:02d}-{sample['category'].lower().replace(' ', '-')}.txt",
            category=sample["category"],
            source_type="synthetic",
            metadata={"title": sample["title"]},
        )
    print(f"Imported {len(SAMPLES)} synthetic documents into the knowledge base.")


if __name__ == "__main__":
    main()
