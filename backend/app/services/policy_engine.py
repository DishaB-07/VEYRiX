from typing import Optional, List, Dict, Any
from backend.app.schemas.risk import PolicyCheckResult

CORPORATE_SECURITY_POLICIES = [
    {
        "code": "POL-FIN-01",
        "category": "financial",
        "rule": "External wire transfers exceeding $10,000 require independent dual-authorization callback to a verified corporate directory number.",
        "action_triggers": ["Urgent Money Transfer", "Payment Request", "money", "wire", "transfer"],
        "mitigation": "Hold transaction until out-of-band supervisor dual-key verification is logged."
    },
    {
        "code": "POL-AUTH-02",
        "category": "credential",
        "rule": "Employees and managers must NEVER transmit One-Time Passwords (OTPs), PINs, or device authentication codes over telephone or voice channels.",
        "action_triggers": ["OTP Request", "Password Reset", "otp", "pin", "code", "password"],
        "mitigation": "Refuse code disclosure immediately. Escalate caller to IT Security Incident Response."
    },
    {
        "code": "POL-ACCT-03",
        "category": "routing",
        "rule": "Direct deposit routing numbers and employee bank details cannot be modified via voice call without in-person or cryptographically signed portal request.",
        "action_triggers": ["Account Detail Change", "routing", "deposit", "direct deposit"],
        "mitigation": "Direct caller to enterprise HR portal. Do not process bank modifications verbally."
    },
    {
        "code": "POL-SEC-04",
        "category": "confidential",
        "rule": "Non-public proprietary client lists, merger negotiations, and credentials cannot be verbally divulged over unencrypted public telephone lines.",
        "action_triggers": ["Confidential Information Request", "confidential", "acquisition", "secret"],
        "mitigation": "Instruct caller to submit an authorized internal ticketing request."
    }
]

class PolicyEngine:
    """
    Corporate Security Policy & RAG Retrieval Interface.
    
    Proposed Technology Stack:
    - RAG retrieval via ChromaDB / FAISS vector stores or PostgreSQL with pgvector
    - Semantic similarity matching over corporate compliance & security manuals
    
    Current State:
    - Clean interface with structured enterprise security policies.
    - Matches requested action and transcript keywords to active compliance policies.
    """

    def evaluate_policy(
        self,
        requested_action: str,
        transcript: Optional[str] = None
    ) -> PolicyCheckResult:
        search_corpus = f"{requested_action} {transcript or ''}".lower()

        for policy in CORPORATE_SECURITY_POLICIES:
            for trigger in policy["action_triggers"]:
                if trigger.lower() in search_corpus:
                    return PolicyCheckResult(
                        policy_code=policy["code"],
                        policy_rule=policy["rule"],
                        is_violated=True,
                        recommended_mitigation=policy["mitigation"]
                    )

        # Default safe policy baseline
        return PolicyCheckResult(
            policy_code="POL-GEN-00",
            policy_rule="Standard telephonic interaction policy applies; verify unknown requests.",
            is_violated=False,
            recommended_mitigation="Maintain standard security awareness."
        )

policy_engine = PolicyEngine()
