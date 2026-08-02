# Incident response plan

Owner: Durga Ghimeray (incident commander for all severities at current scale).

## Severities

- **SEV-1**: confirmed or suspected taxpayer-data exposure, key compromise, unauthorized filing, audit-chain integrity failure.
- **SEV-2**: authentication bypass attempt, malware detection past quarantine, provider-boundary anomaly, sustained brute force.
- **SEV-3**: vulnerability reports, dependency CVEs in scope, single-account lockout anomalies.

## Playbook

1. **Detect & triage** — sources: security events (`SecurityEvent`), audit anomalies, `GET /audit/verify` failures, CI scanner alerts, provider notifications. Assign severity; start a timestamped incident log immediately.
2. **Contain** — revoke affected sessions (all sessions for SEV-1); disable implicated accounts; rotate credentials/keys per docs/backup-recovery.md; if filing integrity is in question, halt transmissions by setting the provider to `mock` and freeze affected returns (no transitions).
3. **Assess** — use the hash-chained audit log to reconstruct actor, scope, and timeline; audit immutability makes the record trustworthy. Identify exactly which clients' data classes were touched.
4. **Eradicate & recover** — patch the vector, redeploy from clean images, restore data if needed (backup-recovery.md), re-verify the audit chain, resume filing only after a written all-clear in the incident log.
5. **Notify** — SEV-1 with taxpayer data involved: notify affected clients promptly and honestly; evaluate IRS obligations for preparers (data-theft reporting to the IRS stakeholder liaison and state requirements, including Pennsylvania breach-notification law) with counsel. If identity-theft filing is suspected, assist clients with Form 14039.
6. **Post-incident** — within one week: written post-mortem (timeline, root cause, blast radius, what worked/failed), threat-model update, and tracked remediation items.

## Preparedness

Keys escrowed offline under dual control; restore drills quarterly; this plan reviewed each filing season; test the session-revocation and provider-freeze paths in staging annually.
