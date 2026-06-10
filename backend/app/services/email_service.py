"""Monday Morning Email digest — Kai-Fu Lee retention loop principle."""
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.models import User, Report, Insight
from app.core.config import settings

logger = logging.getLogger(__name__)


def _digest_html(user_name: str, high_risk: int, total: int, top_pain: str, industry: str, app_url: str) -> str:
    week_label = datetime.utcnow().strftime("%B %d, %Y")
    risk_color = "#ef4444" if high_risk > 0 else "#10b981"
    risk_label = f"{high_risk} HIGH-RISK" if high_risk > 0 else "0 high-risk"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>OpsOracle Weekly Risk Brief</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
  <tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;">
      <!-- Header -->
      <tr>
        <td style="padding:32px 40px 24px;border-bottom:1px solid #222;">
          <p style="margin:0 0 4px;font-size:12px;color:#10b981;letter-spacing:2px;text-transform:uppercase;">OpsOracle AI</p>
          <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700;">Monday Morning Risk Brief</h1>
          <p style="margin:6px 0 0;font-size:13px;color:#666;">Week of {week_label}</p>
        </td>
      </tr>

      <!-- Greeting -->
      <tr>
        <td style="padding:28px 40px 20px;">
          <p style="margin:0;font-size:15px;color:#aaa;">Hi {user_name},</p>
          <p style="margin:12px 0 0;font-size:15px;color:#aaa;line-height:1.6;">
            Here's your weekly operations risk brief. Your AI has been watching your{" "}
            <strong style="color:#fff;">{industry}</strong> data — here's what needs your attention this week.
          </p>
        </td>
      </tr>

      <!-- Risk Summary -->
      <tr>
        <td style="padding:0 40px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="48%" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;vertical-align:top;">
                <p style="margin:0 0 4px;font-size:11px;color:#666;letter-spacing:1px;text-transform:uppercase;">Reports This Week</p>
                <p style="margin:0;font-size:32px;font-weight:700;color:#fff;">{total}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#555;">operations reports analyzed</p>
              </td>
              <td width="4%">&nbsp;</td>
              <td width="48%" style="background:#1a1a1a;border:1px solid {risk_color}40;border-radius:12px;padding:20px;vertical-align:top;">
                <p style="margin:0 0 4px;font-size:11px;color:{risk_color}99;letter-spacing:1px;text-transform:uppercase;">High Risk Alerts</p>
                <p style="margin:0;font-size:32px;font-weight:700;color:{risk_color};">{risk_label}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#555;">reports above 70% risk threshold</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Top Pain -->
      {f'''<tr>
        <td style="padding:0 40px 28px;">
          <div style="background:#1a1a1a;border:1px solid #333;border-left:3px solid #ef4444;border-radius:12px;padding:20px;">
            <p style="margin:0 0 8px;font-size:11px;color:#ef444480;letter-spacing:1px;text-transform:uppercase;">Top Pain This Week</p>
            <p style="margin:0;font-size:14px;color:#ddd;line-height:1.6;">{top_pain}</p>
          </div>
        </td>
      </tr>''' if top_pain else ""}

      <!-- CTA -->
      <tr>
        <td style="padding:0 40px 32px;text-align:center;">
          <a href="{app_url}/reports" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">
            View Full Risk Reports →
          </a>
          <p style="margin:16px 0 0;font-size:12px;color:#444;">
            Or <a href="{app_url}/upload" style="color:#10b981;text-decoration:none;">upload a new report</a> to analyze this week's data.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:20px 40px;border-top:1px solid #222;text-align:center;">
          <p style="margin:0;font-size:11px;color:#444;">
            OpsOracle AI — Vertical AI for Industrial Operations<br/>
            <a href="{app_url}" style="color:#555;text-decoration:none;">nanoneuron.ai</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>"""


def send_weekly_digest(user: User, db: Session) -> bool:
    """Send Monday Morning Risk Brief to a single user. Returns True if sent."""
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping digest email for %s", user.email)
        return False

    # Get reports from the last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_reports = (
        db.query(Report)
        .filter(Report.user_id == user.id, Report.created_at >= week_ago)
        .all()
    )
    if not recent_reports:
        return False

    # Gather insights for recent reports
    report_ids = [r.id for r in recent_reports]
    recent_insights = (
        db.query(Insight)
        .filter(Insight.report_id.in_(report_ids))
        .order_by(Insight.risk_score.desc())
        .all()
    )

    high_risk = sum(1 for i in recent_insights if i.risk_score >= 70)
    total = len(recent_reports)

    # Top pain from highest risk insight
    top_pain = ""
    if recent_insights:
        top = recent_insights[0]
        if top.executive_summary:
            # First sentence only
            top_pain = top.executive_summary.split(".")[0].strip() + "."

    # Detect dominant industry
    industries = [r.industry for r in recent_reports if r.industry]
    industry = max(set(industries), key=industries.count) if industries else "operations"

    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY

        html = _digest_html(
            user_name=user.company_name or user.email.split("@")[0],
            high_risk=high_risk,
            total=total,
            top_pain=top_pain,
            industry=industry.replace("_", " "),
            app_url=settings.APP_URL,
        )

        resend.Emails.send({
            "from": f"OpsOracle AI <{settings.DIGEST_FROM_EMAIL}>",
            "to": [user.email],
            "subject": f"Your Monday Risk Brief — {high_risk} alert{'s' if high_risk != 1 else ''} this week",
            "html": html,
        })

        user.last_digest_sent_at = datetime.utcnow()
        db.commit()
        logger.info("Digest sent to %s", user.email)
        return True

    except Exception as exc:
        logger.error("Failed to send digest to %s: %s", user.email, exc)
        return False


def send_all_digests(db: Session) -> dict:
    """Send digest to all Pro/trial users who have email_digest=True."""
    eligible = (
        db.query(User)
        .filter(
            User.plan_tier.in_(["pro", "enterprise", "trial"]),
            User.email_digest.is_(True),
        )
        .all()
    )

    sent = 0
    skipped = 0
    for user in eligible:
        if send_weekly_digest(user, db):
            sent += 1
        else:
            skipped += 1

    return {"sent": sent, "skipped": skipped, "total": len(eligible)}
