import { info, setFailed } from "@actions/core";
import { context } from "@actions/github";
export const OUTCOMES = {
    failedUnsupportedEventType: "This action should only be run with Pull Request Events",
    failedGuildTicket: "PRs should not be linked to guild tickets. Please raise a squad ticket.",
    failedNoJiraIssueId: "Pull Request title does not include a valid JIRA Issue ID.",
    passed: "Title passed.",
};
export async function run() {
    const pullRequest = context.payload.pull_request;
    if (pullRequest == undefined || pullRequest.title == undefined) {
        setFailed(OUTCOMES.failedUnsupportedEventType);
        return;
    }
    const title = pullRequest.title;
    const isGuildTicket = /GUIL-/.test(title);
    if (isGuildTicket) {
        setFailed(OUTCOMES.failedGuildTicket);
        return;
    }
    const jiraIssueIdRegex = /[A-Z][A-Z0-9]+-\d+/;
    if (!jiraIssueIdRegex.test(title)) {
        setFailed(OUTCOMES.failedNoJiraIssueId);
        return;
    }
    info(OUTCOMES.passed);
}
run();
