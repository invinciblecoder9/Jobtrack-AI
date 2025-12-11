import os
import base64
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env! Add it and restart.")

# Updated 2025 setup: Use stable v1 API + modern model (avoids v1beta deprecations)
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash-001",  # Stable 2025 alias (fast, supports generateContent)
    google_api_key=GEMINI_API_KEY,
    temperature=0.7,
    convert_system_message_to_human=True,
    # Explicitly use stable v1 (not beta) to avoid 404s on old models
    api_version="v1"  # Add this line—fixes the core issue!
)

def analyze_jd(job_desc: str) -> str:
    prompt = f"""
    Analyze this job description and extract:
    - Required skills
    - Nice-to-have skills
    - Experience level
    - Salary hints (if any)
    - Company culture/vibe

    Job Description:
    {job_desc}

    Respond in clear bullet points.
    """
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        return response.content.strip()
    except Exception as e:
        error_msg = f"AI Error: {str(e)}. Try updating to 'gemini-2.0-flash-exp' model or check API key."
        print(f"JD Analysis Error: {error_msg}")  # Log for debugging
        return error_msg

def tailor_resume(resume: str, jd_analysis: str = "") -> str:
    # If no JD analysis, skip or use a quick local parse (no API call)
    if not jd_analysis:
        return "No JD analysis available. Paste the full JD first for better tailoring."
    
    prompt = f"""
    FIRST: Quickly analyze this JD if needed: {jd_analysis}
    
    SECOND: Tailor this resume to match. Suggest keywords, rewrite 3 bullets, add cover letter.
    
    Resume: {resume}
    
    Output: Bullet-point suggestions + short cover letter only.
    """
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        return response.content.strip()
    except Exception as e:
        return f"AI Error: {str(e)}. Quota tip: Try again tomorrow or enable billing."


def analyze_rejection(email: str) -> str:
    prompt = f"""
    This is a job rejection email:
    {email}

    Analyze the tone and extract:
    - Real reason for rejection (if implied)
    - Positive feedback (if any)
    - Actionable advice for the candidate

    Respond with empathy and encouragement.
    """
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        return response.content.strip()
    except Exception as e:
        error_msg = f"AI Error: {str(e)}. Try updating to 'gemini-2.0-flash-exp' model or check API key."
        print(f"Rejection Analysis Error: {error_msg}")
        return error_msg

def suggest_jobs(skills: str) -> str:
    prompt = f"""
    Based on these skills: {skills}
    Suggest 3 realistic job titles and companies that would hire this person in 2025.
    Keep it short.
    """
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        return response.content.strip()
    except Exception as e:
        error_msg = f"AI Error: {str(e)}. Try updating to 'gemini-2.0-flash-exp' model or check API key."
        print(f"Job Suggest Error: {error_msg}")
        return error_msg

def generate_pdf(content: str, filename: str = "resume.pdf") -> dict:
    """Generate PDF and return base64 for frontend download (matches router expectation)."""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    text = c.beginText(40, height - 40)
    text.setFont("Helvetica", 12)
    for line in content.split('\n'):
        text.textLine(line[:80])  # Wrap long lines
    c.drawText(text)
    c.showPage()
    c.save()
    buffer.seek(0)
    
    # Convert to base64 for router response
    pdf_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    buffer.close()
    
    return {
        "filename": filename,
        "base64": pdf_base64
    }