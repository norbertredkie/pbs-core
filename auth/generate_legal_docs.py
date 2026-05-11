#!/usr/bin/env python3
"""
Generate legal documents for PBS products
Applies templates with product-specific customization
"""
import os
import sys
from pathlib import Path
from datetime import datetime

# Product configurations
PRODUCTS_CONFIG = {
    "pbs-prediction": {
        "name": "PBS Prediction",
        "service_description": "AI-powered prediction and forecasting platform",
        "is_financial": True,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 13,
        "contact_email": "support@pbs-prediction.local",
        "contact_address": "PBS Inc., San Francisco, CA",
        "supervisory_authority": "SFDO (San Francisco Data Officer)",
        "governing_law": "California law",
        "jurisdiction_courts": "San Francisco Superior Court",
    },
    "pbs-scholar": {
        "name": "PBS Scholar",
        "service_description": "Academic research and citation management platform",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 13,
        "contact_email": "support@pbs-scholar.local",
        "contact_address": "PBS Inc., San Francisco, CA",
    },
    "support-chatbot": {
        "name": "Support Chatbot",
        "service_description": "AI-powered customer support chatbot",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 13,
        "contact_email": "support@support-chatbot.local",
    },
    "wtf-books": {
        "name": "WTF Books",
        "service_description": "Book discovery and literary discussion platform",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 13,
        "contact_email": "support@wtf-books.local",
    },
    "threadwizard": {
        "name": "ThreadWizard",
        "service_description": "Social media automation and thread management",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 13,
        "contact_email": "support@threadwizard.local",
    },
    "ugc-ads": {
        "name": "UGC Ads",
        "service_description": "User-generated content advertising platform",
        "is_financial": True,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 18,
        "contact_email": "support@ugc-ads.local",
    },
    "claude-ads": {
        "name": "Claude Ads",
        "service_description": "AI-powered advertising and copywriting tool",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 13,
        "contact_email": "support@claude-ads.local",
    },
    "arcade-xyz": {
        "name": "Arcade XYZ",
        "service_description": "Web3 gaming and NFT marketplace",
        "is_financial": True,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 18,
        "contact_email": "support@arcade-xyz.local",
    },
    "hyperframes": {
        "name": "Hyperframes",
        "service_description": "Video creation and editing platform",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 13,
        "contact_email": "support@hyperframes.local",
    },
    "automation-agency": {
        "name": "Automation Agency",
        "service_description": "Business process automation and workflow management",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": False,
        "minimum_age": 18,
        "contact_email": "support@automation-agency.local",
    },
    "legal-doc-review": {
        "name": "Legal Doc Review",
        "service_description": "AI-powered legal document analysis and review",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": False,
        "minimum_age": 18,
        "contact_email": "support@legal-doc-review.local",
    },
    "trading-bot": {
        "name": "Trading Bot",
        "service_description": "Automated cryptocurrency and stock trading bot",
        "is_financial": True,
        "is_adult": False,
        "requires_coppa": False,
        "minimum_age": 18,
        "contact_email": "support@trading-bot.local",
    },
    "agentic-inbox": {
        "name": "Agentic Inbox",
        "service_description": "AI agent for email and inbox management",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 13,
        "contact_email": "support@agentic-inbox.local",
    },
    "ai-sdr": {
        "name": "AI SDR",
        "service_description": "AI-powered sales development representative",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": False,
        "minimum_age": 18,
        "contact_email": "support@ai-sdr.local",
    },
    "autonomy": {
        "name": "Autonomy",
        "service_description": "Autonomous agent orchestration platform",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 13,
        "contact_email": "support@autonomy.local",
    },
    "toprank": {
        "name": "TopRank",
        "service_description": "SEO and digital marketing analytics",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": False,
        "minimum_age": 18,
        "contact_email": "support@toprank.local",
    },
    "churn-predict": {
        "name": "Churn Predict",
        "service_description": "Customer churn prediction and retention platform",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": False,
        "minimum_age": 18,
        "contact_email": "support@churn-predict.local",
    },
    "kalkulator": {
        "name": "Kalkulator",
        "service_description": "Financial calculation and budgeting tool",
        "is_financial": True,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 13,
        "contact_email": "support@kalkulator.local",
    },
    "artykul-naukowy": {
        "name": "Artykuł Naukowy",
        "service_description": "Scientific article writing and research collaboration",
        "is_financial": False,
        "is_adult": False,
        "requires_coppa": True,
        "minimum_age": 13,
        "contact_email": "support@artykul-naukowy.local",
    },
}

# Default values for templates
TEMPLATE_DEFAULTS = {
    "EFFECTIVE_DATE": datetime.now().strftime("%B %d, %Y"),
    "LAST_UPDATED": datetime.now().strftime("%B %d, %Y"),
    "COMPANY_NAME": "PBS Inc.",
    "SUPPORT_URL": "https://support.pbs.local",
    "CONTACT_EMAIL": "support@pbs.local",
    "CONTACT_ADDRESS": "PBS Inc., San Francisco, CA",
    "SUPERVISORY_AUTHORITY": "California Attorney General",
    "DPO_EMAIL": "dpo@pbs.local",
    "REPORT_FORM_URL": "https://pbs.local/report",
    "CHILD_SAFETY_EMAIL": "childsafety@pbs.local",
    "CHILD_SAFETY_REPORT_URL": "https://pbs.local/report-child-safety",
    "NCMEC_CYBERTIPLINE_URL": "https://www.cybertipline.org",
    "FTC_URL": "https://www.ftc.gov/complaint",
    "OPT_OUT_ANALYTICS_URL": "https://pbs.local/privacy/opt-out",
    "COPPA_CONSENT_URL": "https://pbs.local/parent-consent",
    "ANALYTICS_PROVIDER": "Plausible Analytics",
    "LIABILITY_CAP": "$100",
    "REFUND_30_DAY": False,
    "REFUND_NO_REFUND": True,
    "TRANSPARENCY_REPORT": False,
    "PARENTAL_CONTROLS": True,
    "ID_VERIFICATION": True,
    "ID_VERIFICATION_PROVIDER": "Veriff",
    "AGE_VERIFICATION_PROVIDER": "Veriff",
    "SUPPORT_CHAT": "https://pbs.local/chat",
}


def generate_legal_docs(product_key: str, config: dict, template_dir: Path, output_dir: Path):
    """Generate legal documents for a product"""
    
    print(f"Generating docs for {config['name']}...")
    
    # Create product docs directory
    product_docs = output_dir / "docs"
    product_docs.mkdir(parents=True, exist_ok=True)
    
    # Build template variables
    variables = TEMPLATE_DEFAULTS.copy()
    variables.update({
        "PRODUCT_NAME": config["name"],
        "SERVICE_DESCRIPTION": config["service_description"],
        "CONTACT_EMAIL": config["contact_email"],
        "CONTACT_ADDRESS": config.get("contact_address", "PBS Inc., San Francisco, CA"),
        "MINIMUM_AGE": config["minimum_age"],
        "GOVERNING_LAW": config.get("governing_law", "California law"),
        "JURISDICTION_COURTS": config.get("jurisdiction_courts", "California courts"),
        "IF_FINANCIAL": config["is_financial"],
        "IF_ADULT_FEATURES": config["is_adult"],
        "IF_COPPA": config["requires_coppa"],
    })
    
    # Generate each legal document
    templates = [
        ("PRIVACY_POLICY.md", "Privacy Policy"),
        ("TERMS_OF_SERVICE.md", "Terms of Service"),
        ("SAFETY_POLICY.md", "Safety & Acceptable Use Policy"),
        ("AGE_VERIFICATION.md", "Age Verification"),
    ]
    
    for template_file, doc_name in templates:
        template_path = template_dir / template_file
        if not template_path.exists():
            print(f"  ⚠️  Template not found: {template_file}")
            continue
        
        # Read template
        with open(template_path, "r") as f:
            content = f.read()
        
        # Replace variables
        for key, value in variables.items():
            if isinstance(value, bool):
                # For conditional blocks
                placeholder = f"{{{{#{key}}}}}"
                end_placeholder = f"{{{{/{key}}}}}"
                if value:
                    content = content.replace(placeholder, "").replace(end_placeholder, "")
                else:
                    # Remove conditional block
                    start = content.find(placeholder)
                    end = content.find(end_placeholder)
                    if start != -1 and end != -1:
                        content = content[:start] + content[end+len(end_placeholder):]
            else:
                placeholder = f"{{{{ {key} }}}}"
                content = content.replace(placeholder, str(value))
        
        # Write to product docs
        output_file = product_docs / template_file
        with open(output_file, "w") as f:
            f.write(content)
        
        print(f"  ✅ Created {template_file}")


def update_product_readme(output_dir: Path, product_name: str):
    """Add legal doc links to product README"""
    readme_path = output_dir / "README.md"
    
    if not readme_path.exists():
        # Create new README with legal links
        content = f"""# {product_name}

## Legal Documentation

- [Privacy Policy](docs/PRIVACY_POLICY.md)
- [Terms of Service](docs/TERMS_OF_SERVICE.md)
- [Safety & Acceptable Use Policy](docs/SAFETY_POLICY.md)
- [Age Verification & 18+ Disclaimer](docs/AGE_VERIFICATION.md)
"""
    else:
        # Add legal links to existing README
        with open(readme_path, "r") as f:
            content = f.read()
        
        if "Legal" not in content:
            content += f"""

## Legal Documentation

- [Privacy Policy](docs/PRIVACY_POLICY.md)
- [Terms of Service](docs/TERMS_OF_SERVICE.md)
- [Safety & Acceptable Use Policy](docs/SAFETY_POLICY.md)
- [Age Verification & 18+ Disclaimer](docs/AGE_VERIFICATION.md)
"""
    
    with open(readme_path, "w") as f:
        f.write(content)


def main():
    products_dir = Path("/Users/norbertredkie/_pbs/products")
    template_dir = Path("/Users/norbertredkie/_pbs/pbs-core/auth/templates")
    
    if not template_dir.exists():
        print("❌ Template directory not found")
        sys.exit(1)
    
    print(f"🔄 Generating legal documents for {len(PRODUCTS_CONFIG)} products...\n")
    
    for product_key, config in PRODUCTS_CONFIG.items():
        product_dir = products_dir / product_key
        if not product_dir.exists():
            print(f"⚠️  Product directory not found: {product_key}")
            continue
        
        generate_legal_docs(product_key, config, template_dir, product_dir)
        update_product_readme(product_dir, config["name"])
        print()
    
    print("✅ Legal documents generated successfully!")


if __name__ == "__main__":
    main()
