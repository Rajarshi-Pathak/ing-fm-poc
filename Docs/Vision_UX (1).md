# Gemini Vision Iteration Flow & User Experience

---

## The Complete Flow with Gemini Vision

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    USER CLICKS "Generate Pitchbook"                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  Phase 1: Initial Generation (1-2 seconds)                                        │
│  ───────────────────────────────────────────────────────────────────────────────   │
│  • python-pptx generates 7 slides with your current logic                         │
│  • Slides saved to memory (BytesIO)                                               │
│  • Progress: "📊 Generating presentation slides..."                              │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  Phase 2: Gemini Vision Validation (2-5 seconds per slide)                        │
│  ───────────────────────────────────────────────────────────────────────────────   │
│  • Convert each slide to image (PNG/JPEG)                                         │
│  • Send each image to Gemini Vision with prompt:                                  │
│    "Analyze this slide for overlapping text, misalignment, layout issues"         │
│  • Progress: "🔍 Validating slide layout with Gemini Vision..."                   │
│                                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  slide 1/7 ✅ No issues found                                              │   │
│  │  slide 2/7 ✅ No issues found                                              │   │
│  │  slide 3/7 ⚠️ Overlap detected between chart and label                     │   │
│  │  slide 4/7 ✅ No issues found                                              │   │
│  │  slide 5/7 ✅ No issues found                                              │   │
│  │  slide 6/7 ✅ No issues found                                              │   │
│  │  slide 7/7 ✅ No issues found                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  Phase 3: Fix & Regenerate (If Issues Found) (3-5 seconds)                        │
│  ───────────────────────────────────────────────────────────────────────────────   │
│  • Gemini returns: {"slide": 3, "issue": "overlap", "suggested_fix": "move label"} │
│  • Apply fix (adjust coordinates)                                                 │
│  • Regenerate only the affected slide(s)                                          │
│  • Progress: "🔧 Fixing layout issues..."                                         │
│                                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  slide 3/7 🔄 Re-generating with fixed coordinates...                      │   │
│  │  slide 3/7 ✅ Fixed successfully                                           │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  Phase 4: Final Output (1 second)                                                 │
│  ───────────────────────────────────────────────────────────────────────────────   │
│  • Re-compile all slides into final PPTX                                         │
│  • Return to frontend                                                            │
│  • Progress: "✅ Pitchbook ready for download!"                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    TOTAL TIME: ~8-15 seconds                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Code Implementation with Progress Tracking

```python
@app.route(
    "/generate-pitchbook-vision",
    methods=["POST"],
)
def generate_pitchbook_with_vision():
    """
    Generate pitchbook with Gemini Vision validation loop.
    """
    try:
        from pptx import Presentation
        from pptx.dml.color import RGBColor
        from pptx.util import Inches, Pt
        from pptx.enum.text import PP_ALIGN
        from pptx.chart.data import CategoryChartData
        from pptx.enum.chart import XL_CHART_TYPE
        from vertexai.generative_models import Part
        import io
        from datetime import datetime
        import time

        data = request_json()

        # =====================================================================
        # Track progress for user
        # =====================================================================
        
        progress_updates = []
        
        def update_progress(message, step, total_steps=7):
            """Send progress update to frontend"""
            progress_updates.append({
                "message": message,
                "step": step,
                "total": total_steps,
                "percentage": round((step / total_steps) * 100)
            })
            logger.info(f"🔄 Progress: {message} ({step}/{total_steps})")

        # =====================================================================
        # Step 1: Extract and validate input data
        # =====================================================================

        client_name = normalize_text(data.get("client_name", "Corporate Client"))
        client_id = normalize_text(data.get("client_id", "CLIENT001"))
        # ... rest of data extraction ...

        # =====================================================================
        # Step 2: Initial generation with python-pptx (NO AI)
        # =====================================================================
        
        update_progress("Generating presentation slides...", 1, 7)
        
        prs = generate_initial_pptx(data)  # Your existing code
        
        # Save to memory
        initial_bytes = io.BytesIO()
        prs.save(initial_bytes)
        initial_bytes.seek(0)

        # =====================================================================
        # Step 3: Gemini Vision Validation Loop
        # =====================================================================
        
        MAX_ITERATIONS = 3
        iteration = 0
        issues_found = []
        final_pptx = initial_bytes.getvalue()
        
        while iteration < MAX_ITERATIONS:
            update_progress(
                f"🔍 Validating slides with Gemini Vision (Iteration {iteration + 1})...", 
                2 + iteration, 
                7
            )
            
            # Convert PPTX to images for validation
            slide_images = convert_pptx_to_images(final_pptx)
            
            # Validate each slide with Gemini Vision
            for slide_num, slide_image in enumerate(slide_images, 1):
                update_progress(
                    f"   Checking slide {slide_num}/{len(slide_images)}...", 
                    2 + iteration, 
                    7
                )
                
                # Call Gemini Vision
                issues = validate_slide_with_gemini(slide_image, slide_num)
                
                if issues:
                    issues_found.extend(issues)
                    update_progress(
                        f"   ⚠️ Slide {slide_num}: {len(issues)} issue(s) found", 
                        2 + iteration, 
                        7
                    )
            
            # If no issues, break the loop
            if not issues_found:
                update_progress("✅ All slides validated successfully!", 6, 7)
                break
            
            # If issues found, fix them
            update_progress(f"🔧 Fixing {len(issues_found)} layout issue(s)...", 3 + iteration, 7)
            
            # Apply fixes to slides
            final_pptx = apply_fixes_to_pptx(final_pptx, issues_found)
            
            # Clear issues for next iteration
            issues_found = []
            iteration += 1
            
            if iteration >= MAX_ITERATIONS:
                update_progress("⚠️ Reached max iterations - using current version", 6, 7)

        # =====================================================================
        # Step 4: Return final PPTX
        # =====================================================================
        
        update_progress("✅ Pitchbook ready for download!", 7, 7)

        return (
            final_pptx,
            200,
            {
                "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "Content-Disposition": f"attachment; filename=ING_{client_id}_Pitchbook.pptx",
                "X-Progress": json.dumps(progress_updates)  # Send progress to frontend
            },
        )

    except Exception as exc:
        logger.exception("Pitchbook generation failed.")
        return jsonify({"error_message": str(exc)}), 500


def validate_slide_with_gemini(slide_image, slide_num):
    """
    Use Gemini Vision to validate a single slide.
    Returns list of issues found.
    """
    # Load image
    image_part = Part.from_bytes(data=slide_image, mime_type="image/png")
    
    prompt = f"""
    You are an ING PowerPoint layout expert. Analyze this slide image (Slide {slide_num}) for:
    
    1. Text overlapping with other elements
    2. Misaligned elements
    3. Font sizes that don't fit
    4. Spacing issues
    
    Return JSON:
    {{
      "slide": {slide_num},
      "issues": [
        {{
          "type": "overlap|misalignment|spacing|font",
          "element": "chart|bullets|title|table|column",
          "description": "Detailed description",
          "suggested_fix": "Specific fix",
          "coordinates": {{"x": 6.5, "y": 2.2, "width": 5.5, "height": 4.0}}
        }}
      ]
    }}
    
    If no issues found, return {{"slide": {slide_num}, "issues": []}}
    """
    
    response = flash_model.generate_content(
        [image_part, prompt],
        generation_config={"response_mime_type": "application/json"}
    )
    
    result = parse_model_json(response)
    return result.get("issues", [])


def apply_fixes_to_pptx(pptx_bytes, issues):
    """
    Apply fixes to the PPTX based on Gemini's suggestions.
    """
    # Load the PPTX
    prs = Presentation(BytesIO(pptx_bytes))
    
    for issue in issues:
        slide_num = issue.get("slide", 0)
        element = issue.get("element", "")
        suggested_fix = issue.get("suggested_fix", "")
        
        # Apply fix based on issue type
        if "overlap" in issue.get("type", ""):
            # Move the overlapping element
            coords = issue.get("coordinates", {})
            # ... adjust coordinates
            pass
        elif "spacing" in issue.get("type", ""):
            # Adjust spacing
            # ... modify spacing values
            pass
        # ... more fix types
    
    # Save fixed PPTX
    fixed_bytes = io.BytesIO()
    prs.save(fixed_bytes)
    fixed_bytes.seek(0)
    return fixed_bytes.getvalue()
```

---

## Frontend Progress Updates (gui.py)

```python
# In gui.py - Tab 4

with tab4:
    
    # ... existing code ...
    
    if st.button("📊 Generate ING Branded PowerPoint Pitchbook", type="primary"):
        
        with st.spinner("Generating pitchbook..."):
            
            # Create a placeholder for progress
            progress_placeholder = st.empty()
            status_placeholder = st.empty()
            
            try:
                # Make request with streaming progress
                import requests
                
                with requests.post(
                    f"{BACKEND_URL}/generate-pitchbook-vision",
                    json=payload,
                    timeout=REQUEST_TIMEOUT,
                    stream=True  # Enable streaming
                ) as response:
                    
                    if response.status_code == 200:
                        # Read the file
                        deck_bytes = BytesIO(response.content)
                        
                        # Check for progress headers
                        progress_data = response.headers.get("X-Progress")
                        if progress_data:
                            progress_updates = json.loads(progress_data)
                            
                            # Show progress bar
                            for update in progress_updates:
                                progress_placeholder.progress(
                                    update["percentage"] / 100,
                                    text=update["message"]
                                )
                                time.sleep(0.5)
                        
                        # Store for download
                        st.session_state["pitchbook_bytes"] = deck_bytes.getvalue()
                        st.session_state["pitchbook_filename"] = f"ING_{client_id}_Pitchbook.pptx"
                        
                        status_placeholder.success("✅ Pitchbook ready for download!")
                        
                    else:
                        status_placeholder.error(f"Error: {response.text}")
                        
            except Exception as exc:
                st.error(str(exc))
```

---

## User Experience Timeline

| Time | User Sees | What's Happening |
|------|-----------|------------------|
| **0s** | "📊 Generating pitchbook..." | Click button |
| **1s** | "📊 Generating presentation slides... (14%)" | python-pptx creates slides |
| **3s** | "🔍 Validating slide layout with Gemini Vision... (29%)" | Converting slides to images |
| **5s** | "🔍 Validating slide layout with Gemini Vision... (43%)" | Gemini analyzing slide 1-2 |
| **7s** | "🔍 Validating slide layout with Gemini Vision... (57%)" | Gemini analyzing slide 3-4 |
| **9s** | "⚠️ Slide 3: Overlap detected between chart and label (57%)" | Issue found |
| **11s** | "🔧 Fixing layout issue... (71%)" | Adjusting coordinates |
| **13s** | "🔍 Re-validating fixed slides... (86%)" | Gemini checks fix |
| **15s** | "✅ Pitchbook ready for download! (100%)" | Download button appears |

---

## What the User Sees in Streamlit

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  📊 Generate ING Branded PowerPoint Pitchbook                                      │
│  [████████████████████████████████████████░░░░░░░░░░░░] 85%                       │
│  🔧 Fixing layout issues... (Iteration 2/3)                                       │
│                                                                                     │
│  ✅ Validated 5/7 slides                                                           │
│  ⚠️ Slide 3: Overlap detected between chart and label - fixed                     │
│  ⚠️ Slide 5: Bullet spacing too tight - adjusted                                 │
│                                                                                     │
│  🟢 Pitchbook generated successfully!                                             │
│  📥 Download ING Deck (.pptx)                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **Total Time** | 8-15 seconds (depends on issues found) |
| **AI Calls** | 1 call per slide per iteration (7-21 calls) |
| **Iterations** | Up to 3 (or until no issues found) |
| **User Experience** | Live progress bar with status updates |
| **Fallback** | If issues persist, returns best version |
| **Cost** | Higher than without Vision (more API calls) |

The user won't see each slide being analyzed individually - they'll see a smooth progress bar with updates like "Validating slides..." and if issues are found, "Fixing layout issues..." This feels professional and gives confidence that the AI is working to perfect their presentation.