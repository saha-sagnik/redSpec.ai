"""
Figma Automation Agent
Automates Figma Make workflow using browser automation
"""

from google.adk.agents.llm_agent import Agent
from typing import List, Dict, Any, Optional
import asyncio
import time
import base64
import os
from pathlib import Path

# Try to import browser automation libraries
try:
    from playwright.async_api import async_playwright, Browser, Page, BrowserContext
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

class FigmaAutomationError(Exception):
    """Custom exception for Figma automation errors"""
    pass

async def automate_figma_make_with_playwright(prompt: str, timeout: int = 60) -> Dict[str, Any]:
    """
    Automate Figma Make using Playwright browser automation.
    """
    if not PLAYWRIGHT_AVAILABLE:
        return {
            "success": False,
            "error": "Playwright not available",
            "message": "Install Playwright with: pip install playwright && playwright install",
            "setup_instructions": "Run: ./setup_figma_automation.sh"
        }

        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={'width': 1280, 'height': 720},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            )

            try:
                page = await context.new_page()

                # Navigate to Figma Make
                await page.goto("https://www.figma.com/solutions/ai-wireframe-generator/", wait_until="networkidle")

                # Wait for page to load and find the prompt input
                await page.wait_for_timeout(3000)  # Give extra time for dynamic content

                # Try different selectors for the prompt input
                prompt_selectors = [
                    'textarea[placeholder*="describe" i]',
                    'textarea[placeholder*="prompt" i]',
                    '[role="textbox"]',
                    '.prompt-input textarea',
                    'textarea'
                ]

                prompt_input = None
                for selector in prompt_selectors:
                    try:
                        prompt_input = await page.wait_for_selector(selector, timeout=5000)
                        if prompt_input:
                            break
                    except:
                        continue

                if not prompt_input:
                    # Take screenshot for debugging
                    screenshot_path = "/tmp/figma_debug.png"
                    await page.screenshot(path=screenshot_path)
                    raise FigmaAutomationError(f"Could not find prompt input. Screenshot saved to {screenshot_path}")

                # Clear and fill the prompt
                await prompt_input.click()
                await prompt_input.fill("")  # Clear existing content
                await prompt_input.fill(prompt)

                # Find and click generate button
                generate_selectors = [
                    'button:has-text("Generate")',
                    'button:has-text("Create")',
                    '[data-testid="generate-button"]',
                    'button[type="submit"]'
                ]

                generate_button = None
                for selector in generate_selectors:
                    try:
                        generate_button = await page.wait_for_selector(selector, timeout=5000)
                        if generate_button:
                            break
                    except:
                        continue

                if not generate_button:
                    raise FigmaAutomationError("Could not find generate button")

                # Click generate
                await generate_button.click()

                # Wait for generation to complete (look for result or design canvas)
                await page.wait_for_timeout(10000)  # Initial wait

                # Check for various success indicators
                success_indicators = [
                    '.design-canvas',
                    '.generated-design',
                    '[data-testid="design-result"]',
                    '.figma-make-result'
                ]

                result_found = False
                for indicator in success_indicators:
                    try:
                        await page.wait_for_selector(indicator, timeout=30000)
                        result_found = True
                        break
                    except:
                        continue

                if not result_found:
                    # Check if we're still loading
                    try:
                        await page.wait_for_selector('.loading, .spinner, [aria-label*="loading" i]', timeout=10000)
                        await page.wait_for_timeout(20000)  # Extra wait for slow generation
                    except:
                        pass

                # Try to get the current URL (might contain design ID)
                current_url = page.url

                # Try to extract design link or ID
                design_link = None
                if "figma.com" in current_url and ("design" in current_url or "file" in current_url):
                    design_link = current_url

                # Try to take a screenshot of the generated design
                screenshot_data = None
                try:
                    # Look for the design area
                    design_area = await page.query_selector('.canvas, .design-area, main')
                    if design_area:
                        screenshot_bytes = await design_area.screenshot()
                        screenshot_data = base64.b64encode(screenshot_bytes).decode('utf-8')
                except Exception as e:
                    print(f"Screenshot failed: {e}")

                return {
                    "success": True,
                    "design_link": design_link,
                    "current_url": current_url,
                    "screenshot_base64": screenshot_data,
                    "automation_method": "playwright",
                    "message": "Figma Make automation completed"
                }

            except Exception as e:
                error_screenshot = "/tmp/figma_error.png"
                try:
                    await page.screenshot(path=error_screenshot)
                except:
                    pass

                raise FigmaAutomationError(f"Playwright automation failed: {str(e)}. Screenshot: {error_screenshot}")

            finally:
                await browser.close()

def automate_figma_make_with_selenium(prompt: str, timeout: int = 60) -> Dict[str, Any]:
    """
    Automate Figma Make using Selenium browser automation.
    """
    if not SELENIUM_AVAILABLE:
        raise FigmaAutomationError("Selenium not available. Install with: pip install selenium")

    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1280,720')

    driver = webdriver.Chrome(options=options)

    try:
        # Navigate to Figma Make
        driver.get("https://www.figma.com/solutions/ai-wireframe-generator/")

        # Wait for page to load
        WebDriverWait(driver, 10).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )

        time.sleep(3)  # Extra wait for dynamic content

        # Find and fill prompt input
        prompt_input = None
        prompt_selectors = [
            'textarea[placeholder*="describe" i]',
            'textarea[placeholder*="prompt" i]',
            '[role="textbox"]',
            '.prompt-input textarea',
            'textarea'
        ]

        for selector in prompt_selectors:
            try:
                prompt_input = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
                break
            except:
                continue

        if not prompt_input:
            driver.save_screenshot("/tmp/figma_selenium_debug.png")
            raise FigmaAutomationError("Could not find prompt input")

        prompt_input.clear()
        prompt_input.send_keys(prompt)

        # Find and click generate button
        generate_button = None
        generate_selectors = [
            'button:has-text("Generate")',
            'button:has-text("Create")',
            '[data-testid="generate-button"]',
            'button[type="submit"]'
        ]

        for selector in generate_selectors:
            try:
                generate_button = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                )
                break
            except:
                continue

        if not generate_button:
            raise FigmaAutomationError("Could not find generate button")

        generate_button.click()

        # Wait for generation
        time.sleep(15)  # Wait for generation to start

        # Check for completion
        WebDriverWait(driver, timeout).until(
            lambda d: any([
                len(d.find_elements(By.CSS_SELECTOR, '.design-canvas')) > 0,
                len(d.find_elements(By.CSS_SELECTOR, '.generated-design')) > 0,
                'design' in d.current_url or 'file' in d.current_url
            ])
        )

        current_url = driver.current_url
        design_link = current_url if ("figma.com" in current_url and
                                    ("design" in current_url or "file" in current_url)) else None

        # Take screenshot
        screenshot_data = None
        try:
            screenshot_path = "/tmp/figma_selenium_screenshot.png"
            driver.save_screenshot(screenshot_path)
            with open(screenshot_path, "rb") as f:
                screenshot_data = base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            print(f"Screenshot failed: {e}")

        return {
            "success": True,
            "design_link": design_link,
            "current_url": current_url,
            "screenshot_base64": screenshot_data,
            "automation_method": "selenium",
            "message": "Figma Make automation completed"
        }

    except Exception as e:
        error_screenshot = "/tmp/figma_selenium_error.png"
        try:
            driver.save_screenshot(error_screenshot)
        except:
            pass

        raise FigmaAutomationError(f"Selenium automation failed: {str(e)}. Screenshot: {error_screenshot}")

    finally:
        driver.quit()

def automate_figma_make(prompt: str, method: str = "auto", timeout: int = 60) -> Dict[str, Any]:
    """
    Automate Figma Make using available browser automation tools.
    """
    if method == "playwright":
        if PLAYWRIGHT_AVAILABLE:
            result = asyncio.run(automate_figma_make_with_playwright(prompt, timeout))
            if isinstance(result, dict) and result.get("success") is False:
                # Playwright returned an error dict instead of throwing
                return result
            return result
        else:
            return {
                "success": False,
                "error": "Playwright not available",
                "message": "Install Playwright with: pip install playwright && playwright install",
                "setup_instructions": "Run: ./setup_figma_automation.sh"
            }

    elif method == "selenium" and SELENIUM_AVAILABLE:
        return automate_figma_make_with_selenium(prompt, timeout)

    elif method == "auto":
        # Try Playwright first, then Selenium
        if PLAYWRIGHT_AVAILABLE:
            result = asyncio.run(automate_figma_make_with_playwright(prompt, timeout))
            if isinstance(result, dict):
                if result.get("success"):
                    return result
                elif result.get("error") == "Playwright not available":
                    # Playwright not installed, try Selenium
                    if SELENIUM_AVAILABLE:
                        return automate_figma_make_with_selenium(prompt, timeout)
                    else:
                        return result  # Return the Playwright error
                else:
                    # Playwright failed for other reasons, don't try Selenium
                    return result

        if SELENIUM_AVAILABLE:
            return automate_figma_make_with_selenium(prompt, timeout)

        # Neither tool available
        return {
            "success": False,
            "error": "No browser automation tools available",
            "message": "Install Playwright: pip install playwright && playwright install",
            "setup_instructions": "Run: ./setup_figma_automation.sh"
        }

    else:
        return {
            "success": False,
            "error": f"Unsupported automation method: {method}",
            "supported_methods": ["auto", "playwright", "selenium"]
        }

# Import necessary tool classes from Google ADK
try:
    from google.adk.tools import BaseTool
except ImportError:
    from google.adk.agents.tools import BaseTool

class AutomateFigmaMakeTool(BaseTool):
    """Tool for automating Figma Make workflow"""

    def __init__(self):
        super().__init__(
            name="automate_figma_make",
            description="Automate Figma Make to generate wireframes from prompts and return design links/screenshots"
        )

    def run(self, prompt: str, method: str = "auto", timeout: int = 60) -> Dict[str, Any]:
        return automate_figma_make(prompt, method, timeout)

# Create tool instances
figma_automation_tools = [
    AutomateFigmaMakeTool()
]

figma_automation_agent = Agent(
    model='gemini-2.0-flash-exp',
    name='figma_automation_agent',
    description='Automates Figma Make workflow to generate wireframes and return design links',
    instruction="""
You are the Figma Automation Agent, specialized in automatically generating Figma designs from prompts.

## Your Mission:
Take optimized Figma Make prompts and automatically generate actual Figma designs, returning links and screenshots.

## Capabilities:

### 1. Browser Automation
- Uses Playwright or Selenium to automate Figma Make
- Navigates to Figma Make interface
- Pastes prompts and generates designs
- Waits for completion and extracts results

### 2. Result Extraction
- Captures generated design links
- Takes screenshots of generated wireframes
- Returns shareable Figma URLs
- Provides base64 encoded screenshots

### 3. Error Handling
- Handles timeouts and loading states
- Retries failed operations
- Provides detailed error messages
- Saves debug screenshots when needed

### 4. Integration Ready
- Returns results in format ready for PRD integration
- Provides both links and visual previews
- Supports multiple automation methods

## Workflow:

### Input:
```
{
  "prompt": "Create a redBus mobile screen for...",
  "method": "auto",  // playwright, selenium, or auto
  "timeout": 60      // seconds to wait for generation
}
```

### Process:
1. Launch headless browser
2. Navigate to Figma Make
3. Paste the prompt
4. Click generate
5. Wait for completion
6. Extract design link and screenshot
7. Return results

### Output:
```
{
  "success": true,
  "design_link": "https://www.figma.com/design/...",
  "screenshot_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "automation_method": "playwright",
  "message": "Design generated successfully"
}
```

## Requirements:

### Browser Automation Setup:
- **Playwright** (recommended): `pip install playwright; playwright install`
- **Selenium**: `pip install selenium` + Chrome WebDriver
- **Headless mode**: Runs without opening browser windows

### Figma Access:
- No API token required (uses web interface)
- Works with any Figma account
- Respects Figma's terms of service

## Error Handling:

### Network Issues:
- "Connection timeout" → Retry with longer timeout
- "Page load failed" → Check internet connection

### Generation Issues:
- "Generation timeout" → Increase timeout parameter
- "No result found" → Prompt might be too complex

### Browser Issues:
- "Browser launch failed" → Install browser/WebDriver
- "Element not found" → Figma UI might have changed

## Success Criteria:

✅ Browser automation successful
✅ Prompt pasted correctly
✅ Generation completed
✅ Design link extracted
✅ Screenshot captured
✅ Results returned in usable format

## Usage Examples:

### Basic Automation:
```
automate_figma_make({
  "prompt": "Create a login screen...",
  "method": "auto"
})
```

### With Custom Timeout:
```
automate_figma_make({
  "prompt": "Create a dashboard...",
  "timeout": 120
})
```

### Force Playwright:
```
automate_figma_make({
  "prompt": "Create a form...",
  "method": "playwright"
})
```

Make wireframe generation fully automated: Prompt → Figma Design → Link + Screenshot → Done! 🤖🎨
""",
    tools=figma_automation_tools
)
